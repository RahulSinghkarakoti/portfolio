import { inTriangle, KINDS, SHAPES } from "./shape";
import { clamp, hash3, SHARK_NODES, smoothstep, type Box, type Shark, type World } from "./world";

const ALPHA_LEVELS = 6;
const FISH_ALPHAS = [0.28, 0.42, 0.58, 0.74, 0.9];
const DIM_UNDER_CONTENT = 0.15;

const DOT_RGB_DARK: [number, number, number][] = [
    [48, 52, 235],
    [52, 205, 60],
    [228, 50, 44],
    [190, 212, 255],
    [110, 230, 255],
];

const DOT_RGB_LIGHT: [number, number, number][] = [
    [48, 52, 200],
    [32, 150, 44],
    [200, 40, 36],
    [90, 110, 145],
    [20, 145, 185],
];

const WAKE = DOT_RGB_DARK.length - 1;

const ACCENTS = ["#e0892c", "#e03a32", "#b44ae0", "#33c8cc", "#3cb54a", "#3150e8", "#d9c14a"];

// Smaller, finer ASCII characters from light to shadow.
const SKIN_RAMP = ".,:;~+*x%#";
const FIN_GLYPHS = ".,:;~";
const RIDGE_GLYPHS = "+*x";
const EDGE_HEAVY = ",:;";
const EDGE_LIGHT = ".·'";

const FLAG_BODY = 1;
const FLAG_EDGE = 2;
const FLAG_FIN = 3;
const FLAG_RIDGE = 4;
const FLAG_MARK = 6;
const MARK_GLYPHS = "*x%";

const SUBSAMPLES = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];

export class KoiRenderer {
    private ctx: CanvasRenderingContext2D;
    private dpr = 1;
    private cw = 7;
    private ch = 9;
    private cols = 0;
    private rows = 0;
    private isLight = false;
    private fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";

    private dotKind = new Uint8Array(0);
    private dotPhase = new Float32Array(0);
    private dotFreq = new Float32Array(0);
    private energy = new Float32Array(0);
    private energyTmp = new Float32Array(0);
    private heat = new Float32Array(0);
    private bucketOf = new Uint8Array(0);
    private bucketOrder = new Int32Array(0);
    private bucketCounts = new Int32Array(DOT_RGB_DARK.length * ALPHA_LEVELS + 1);
    private dotStyles: string[] = [];
    private cellDim = new Float32Array(0);

    private sharkFlag = new Uint8Array(0);
    private sharkShade = new Float32Array(0);
    private sharkKey = new Uint32Array(0);
    private sharkDepth = new Float32Array(0);
    private sharkKind = new Uint8Array(0);
    private sharkShadow = new Uint8Array(0);
    private spine = new Float32Array(SHARK_NODES * 2);
    private arc = new Float32Array(SHARK_NODES);
    private arcTotal = 1;
    private shape = SHAPES.classic;
    private sharkId = 0;
    private finTipLeft = 0;
    private finTipRight = 0;
    private hitFlag = 0;
    private hitShade = 0;
    private hitS = 0;
    private hitV = 0;
    private hitDist = 0;

    private fishStamp = new Uint32Array(0);
    private frameId = 0;
    private fishBuckets: number[][] = FISH_ALPHAS.map(() => []);

    constructor(private canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D canvas unavailable");
        this.ctx = ctx;
        this.rebuildDotStyles();
    }

    get cellWidth() {
        return this.cw;
    }

    get cellHeight() {
        return this.ch;
    }

    setTheme(isLight: boolean) {
        if (this.isLight === isLight) return;
        this.isLight = isLight;
        this.rebuildDotStyles();
    }

    private rebuildDotStyles() {
        const palette = this.isLight ? DOT_RGB_LIGHT : DOT_RGB_DARK;
        this.dotStyles = [];
        for (let c = 0; c < palette.length; c++) {
            const [r, g, b] = palette[c];
            for (let l = 0; l < ALPHA_LEVELS; l++) {
                const a = (l + 1) / ALPHA_LEVELS;
                this.dotStyles.push(`rgba(${r},${g},${b},${a.toFixed(3)})`);
            }
        }
    }

    resize(width: number, height: number, dpr: number) {
        const prevCols = this.cols;
        const prevRows = this.rows;
        this.dpr = dpr;
        // Smaller cells for higher-resolution shark contours and finer ASCII glyphs.
        this.cw = clamp(Math.round(width / 200), 6, 9);
        this.ch = Math.round(this.cw * 1.25);
        this.cols = Math.ceil(width / this.cw);
        this.rows = Math.ceil(height / this.ch);

        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);

        const n = this.cols * this.rows;
        if (this.cols !== prevCols || this.rows !== prevRows) {
            this.dotKind = new Uint8Array(n);
            this.dotPhase = new Float32Array(n);
            this.dotFreq = new Float32Array(n);
            this.energy = new Float32Array(n);
            this.energyTmp = new Float32Array(n);
            this.heat = new Float32Array(n);
            this.bucketOf = new Uint8Array(n);
            this.bucketOrder = new Int32Array(n);
            this.sharkFlag = new Uint8Array(n);
            this.sharkShade = new Float32Array(n);
            this.sharkKey = new Uint32Array(n);
            this.sharkDepth = new Float32Array(n);
            this.sharkKind = new Uint8Array(n);
            this.sharkShadow = new Uint8Array(n);
            this.fishStamp = new Uint32Array(n);
            this.cellDim = new Float32Array(n).fill(1);
        }

        for (let i = 0; i < n; i++) {
            const col = i % this.cols;
            const row = (i / this.cols) | 0;
            this.dotKind[i] = 0;
            this.dotPhase[i] = hash3(col, row, 23) * Math.PI * 2;
            this.dotFreq[i] = 0.3 + hash3(col, row, 37) * 1.1;
        }
    }

    setDimBoxes(boxes: Box[]) {
        const { cols, rows, cw, ch, cellDim } = this;
        if (!cellDim.length) return;
        cellDim.fill(1);
        const pad = cw * 6;
        for (const b of boxes) {
            const c0 = Math.max(0, Math.floor((b.left - pad) / cw));
            const c1 = Math.min(cols - 1, Math.floor((b.right + pad) / cw));
            const r0 = Math.max(0, Math.floor((b.top - pad) / ch));
            const r1 = Math.min(rows - 1, Math.floor((b.bottom + pad) / ch));
            for (let r = r0; r <= r1; r++) {
                for (let c = c0; c <= c1; c++) {
                    const x = c * cw + cw / 2;
                    const y = r * ch + ch / 2;
                    const d = Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
                    const i = r * cols + c;
                    cellDim[i] = Math.min(
                        cellDim[i],
                        DIM_UNDER_CONTENT + (1 - DIM_UNDER_CONTENT) * smoothstep(0, pad, d)
                    );
                }
            }
        }
    }

    render(world: World, dt: number) {
        const { ctx, dpr, cols, ch } = this;
        if (cols === 0) return;
        const t = world.time;

        this.consumeEvents(world);
        this.rasterizeSharks(world.sharks, t);
        this.depositWake(world);
        this.diffuse(dt);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.markFish(world);
        this.drawDots(t);

        ctx.font = `500 ${Math.round(ch * 0.68)}px ${this.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        this.drawHeat();
        this.drawFish();
        this.drawSharks(t);
        ctx.globalAlpha = 1;
    }

    private cellIndex(x: number, y: number) {
        const c = Math.floor(x / this.cw);
        const r = Math.floor(y / this.ch);
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
        return r * this.cols + c;
    }

    private stamp(field: Float32Array, x: number, y: number, radius: number, amount: number) {
        const c0 = Math.floor(x / this.cw);
        const r0 = Math.floor(y / this.ch);
        for (let r = r0 - radius; r <= r0 + radius; r++) {
            for (let c = c0 - radius; c <= c0 + radius; c++) {
                if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) continue;
                const d = Math.hypot(c - c0, (r - r0) * 1.4);
                if (d > radius + 0.5) continue;
                const i = r * this.cols + c;
                field[i] = Math.min(1.6, field[i] + amount * (1 - d / (radius + 1)));
            }
        }
    }

    private consumeEvents(world: World) {
        for (const e of world.events) {
            if (e.kind === "eat") {
                this.stamp(this.heat, e.x, e.y, 2, 1);
                this.stamp(this.energy, e.x, e.y, 3, 0.9);
            } else {
                this.stamp(this.energy, e.x, e.y, 6, 1.4);
            }
        }
        world.events.length = 0;
    }

    private depositWake(world: World) {
        const { energy } = this;
        for (const f of world.fish) {
            if (!f.alive) continue;
            const i = this.cellIndex(f.x, f.y);
            if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.012 + f.alarm * 0.03);
        }
        for (const sh of world.sharks) {
            for (let k = SHARK_NODES - 6; k < SHARK_NODES; k++) {
                const i = this.cellIndex(sh.nodes[k * 2], sh.nodes[k * 2 + 1]);
                if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.05 + sh.speed * 0.0012);
            }
        }
        if (world.pointer.active) {
            this.stamp(energy, world.pointer.x, world.pointer.y, 1, 0.08);
        }
    }

    private diffuse(dt: number) {
        const { cols, rows, energy, energyTmp: tmp, heat } = this;
        const decay = Math.exp(-dt * 1.5);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                const l = c > 0 ? energy[i - 1] : energy[i];
                const rt = c < cols - 1 ? energy[i + 1] : energy[i];
                const u = r > 0 ? energy[i - cols] : energy[i];
                const d = r < rows - 1 ? energy[i + cols] : energy[i];
                tmp[i] = (energy[i] * 4 + l + rt + u + d) * 0.125 * decay;
            }
        }
        this.energy = tmp;
        this.energyTmp = energy;
        const heatDecay = Math.exp(-dt * 2.2);
        for (let i = 0; i < heat.length; i++) heat[i] *= heatDecay;
    }

    private sampleShark(px: number, py: number, L: number) {
        const { spine, arc } = this;
        const N = SHARK_NODES;
        let best = Infinity;
        let bestS = 0;
        let bestSign = 1;
        let bestNx = 0;
        let bestNy = 0;
        for (let k = 0; k < N - 1; k++) {
            const ax = spine[k * 2];
            const ay = spine[k * 2 + 1];
            const sx = spine[(k + 1) * 2] - ax;
            const sy = spine[(k + 1) * 2 + 1] - ay;
            const len2 = sx * sx + sy * sy || 1;
            const u = clamp(((px - ax) * sx + (py - ay) * sy) / len2, 0, 1);
            const qx = ax + sx * u;
            const qy = ay + sy * u;
            const d2 = (px - qx) ** 2 + (py - qy) ** 2;
            if (d2 < best) {
                best = d2;
                const len = Math.sqrt(len2);
                bestS = (arc[k] + u * len) / this.arcTotal;
                bestSign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1;
                bestNx = (-sy / len) * bestSign;
                bestNy = (sx / len) * bestSign;
            }
        }

        const a = Math.sqrt(best);
        const s = bestS;
        const u = s * L;
        const shape = this.shape;
        const w = shape.halfWidth(s) * L;
        this.hitDist = a;
        this.hitS = s;
        this.hitV = a * bestSign;

        const head = this.shape.head;
        if (head && u < L * (head.sweep + head.depth + head.notch)) {
            const span = L * head.span;
            const r = a / span;
            const front = L * head.sweep * r * r + L * head.notch * Math.max(0, 1 - r / 0.14);
            const depth = L * head.depth * (1 - 0.2 * r * r * r * r);
            if (r <= 1 && u >= front && u <= front + depth) {
                this.hitFlag = FLAG_BODY;
                this.hitShade = 0.62 - 0.2 * r + (u < front + L * 0.012 ? 0.1 : 0);
                return true;
            }
        }

        if (a <= w) {
            const across = a / (w || 1);
            const facing = (bestNx * -0.6 + bestNy * -0.8) * across;
            let shade = 0.58 - across * across * 0.42 + facing * 0.26;
            let flag = FLAG_BODY;
            if (s > shape.dorsal[0] && s < shape.dorsal[1] && across < 0.3) {
                flag = FLAG_RIDGE;
                shade = 1;
            } else if (s > shape.secondDorsal[0] && s < shape.secondDorsal[1] && across < 0.4) {
                shade = Math.max(shade, 0.82);
            } else if (s > shape.gills[0] && s < shape.gills[1] && across > 0.58) {
                if (Math.floor(((s - shape.gills[0]) / (shape.gills[1] - shape.gills[0])) * 5) % 2 === 0) shade *= 0.45;
            } else if (s < 0.05) {
                shade = Math.max(shade, 0.7);
            } else if (
                shape === SHAPES.zebra &&
                s > 0.08 &&
                s < 0.55 &&
                (across < 0.1 || Math.abs(across - 0.6) < 0.08)
            ) {
                shade = Math.max(shade, 0.8);
            } else if (this.marked(s, a * bestSign, L, across)) {
                flag = FLAG_MARK;
            }
            this.hitFlag = flag;
            this.hitShade = shade;
            return true;
        }

        const tip = bestSign > 0 ? this.finTipRight : this.finTipLeft;
        const [p0, p1, p2] = shape.pectoral;
        if (
            inTriangle(u, a, L * p0, 0, L * p1, 0, L * p2, tip) &&
            !(shape.falcate && inTriangle(u, a, L * p1, 0, L * (p1 + (p2 - p1) * 0.33), tip * 0.55, L * p2, tip))
        ) {
            this.hitFlag = this.marked(s, a * bestSign, L, 0) ? FLAG_MARK : FLAG_FIN;
            this.hitShade = 0.38 + 0.22 * (1 - clamp(a / tip, 0, 1));
            return true;
        }
        const [v0, v1, v2, vr] = shape.pelvic;
        if (
            inTriangle(u, a, L * v0, 0, L * v1, 0, L * v2, L * vr) ||
            (shape.caudal > 0 && inTriangle(u, a, L * 0.86, 0, L * 0.95, 0, L, L * shape.caudal))
        ) {
            this.hitFlag = FLAG_FIN;
            this.hitShade = 0.36;
            return true;
        }
        return false;
    }

    private marked(s: number, v: number, L: number, across: number) {
        if (this.shape === SHAPES.tiger) {
            if (s < 0.2 || s > 0.9 || across > 0.85) return false;
            const wobble = 0.35 * Math.sin((v / L) * 25 + s * 5);
            const bar = Math.sin(s * Math.PI * 2 * 9 + wobble);
            return bar > 0.65 - 0.5 * smoothstep(0.2, 0.42, s) + 0.4 * smoothstep(0.8, 0.9, s);
        }
        if (this.shape === SHAPES.zebra) {
            if (s < 0.07) return false;
            const gu = (s * L) / (L * 0.06);
            const gv = v / (L * 0.045);
            const cu = Math.floor(gu);
            const cv = Math.floor(gv);
            const jx = hash3(cu, cv, this.sharkId) * 0.5 + 0.25;
            const jy = hash3(cu, cv, this.sharkId + 11) * 0.5 + 0.25;
            return (gu - cu - jx) ** 2 + (gv - cv - jy) ** 2 < 0.08;
        }
        return false;
    }

    private rasterizeSharks(sharks: Shark[], t: number) {
        const {
            sharkFlag,
            sharkShade,
            sharkKey,
            sharkDepth,
            sharkKind,
            sharkShadow,
            spine,
            arc,
            cw,
            ch,
            cols,
            rows,
        } = this;
        sharkFlag.fill(0);
        sharkShadow.fill(0);

        for (const sh of sharks) {
            const L = sh.length;
            const N = SHARK_NODES;
            const n = sh.nodes;
            const swim = clamp(sh.speed / 60, 0.4, 1.4);
            this.shape = SHAPES[sh.kind];
            this.sharkId = sh.id;
            const kindIndex = KINDS.indexOf(sh.kind);

            for (let k = 0; k < N; k++) {
                const s = k / (N - 1);
                const a = Math.max(0, k - 1);
                const b = Math.min(N - 1, k + 1);
                let tx = n[a * 2] - n[b * 2];
                let ty = n[a * 2 + 1] - n[b * 2 + 1];
                const tl = Math.hypot(tx, ty) || 1;
                tx /= tl;
                ty /= tl;
                const amp = L * 0.05 * (0.1 + 0.9 * Math.pow(s, 1.8)) * swim;
                const off = amp * Math.sin(sh.phase - s * 5.2);
                spine[k * 2] = n[k * 2] - ty * off;
                spine[k * 2 + 1] = n[k * 2 + 1] + tx * off;
            }
            arc[0] = 0;
            for (let k = 1; k < N; k++) {
                arc[k] =
                    arc[k - 1] +
                    Math.hypot(spine[k * 2] - spine[(k - 1) * 2], spine[k * 2 + 1] - spine[(k - 1) * 2 + 1]);
            }
            this.arcTotal = arc[N - 1] || 1;

            const bank = clamp(sh.turn * 0.45, -0.35, 0.35);
            const flex = 1 + 0.06 * Math.sin(sh.phase * 0.5);
            const reachFin = this.shape.pectoral[3];
            this.finTipRight = L * reachFin * flex * (1 - bank);
            this.finTipLeft = L * reachFin * flex * (1 + bank);

            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            for (let k = 0; k < N; k++) {
                minX = Math.min(minX, spine[k * 2]);
                maxX = Math.max(maxX, spine[k * 2]);
                minY = Math.min(minY, spine[k * 2 + 1]);
                maxY = Math.max(maxY, spine[k * 2 + 1]);
            }
            const reach = L * 0.36;
            const c0 = Math.max(0, Math.floor((minX - reach) / cw));
            const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
            const r0 = Math.max(0, Math.floor((minY - reach) / ch));
            const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
            if (c0 > c1 || r0 > r1) continue;

            const skipBeyond = reach + Math.hypot(cw, ch);
            const shadowDc = Math.round((L * 0.035) / cw) + 1;
            const shadowDr = Math.round((L * 0.02) / ch) + 1;

            for (let r = r0; r <= r1; r++) {
                for (let c = c0; c <= c1; c++) {
                    const x = c * cw;
                    const y = r * ch;
                    const centerHit = this.sampleShark(x + cw / 2, y + ch / 2, L);
                    if (!centerHit && this.hitDist > skipBeyond) continue;
                    const flag = this.hitFlag;
                    const shade = this.hitShade;
                    const s = this.hitS;
                    const v = this.hitV;

                    let hits = centerHit ? 1 : 0;
                    for (let k = 0; k < SUBSAMPLES.length; k += 2) {
                        if (this.sampleShark(x + SUBSAMPLES[k] * cw, y + SUBSAMPLES[k + 1] * ch, L)) hits++;
                    }
                    if (hits === 0) continue;
                    const coverage = hits / 5;

                    const i = r * cols + c;
                    const key = (hash3(Math.round(s * 95), Math.round(v / (cw * 0.85)), sh.id) * 4294967295) >>> 0;
                    sharkKey[i] = key;
                    sharkDepth[i] = sh.depth;
                    sharkKind[i] = kindIndex;

                    if (centerHit && coverage >= 0.6) {
                        sharkFlag[i] = flag;
                        const flicker = (hash3(c, r, Math.floor(t * 6)) - 0.5) * 0.06;
                        sharkShade[i] = clamp(shade + flicker, 0, 1);
                        const sc = c + shadowDc;
                        const sr = r + shadowDr;
                        if (sc < cols && sr < rows) sharkShadow[sr * cols + sc] = 1;
                    } else {
                        sharkFlag[i] = FLAG_EDGE;
                        sharkShade[i] = coverage;
                    }
                }
            }
        }
    }

    private drawSharks(t: number) {
        const { ctx, cols, rows, cw, ch, sharkFlag, sharkShade, sharkKey, sharkDepth, sharkKind, cellDim, isLight } =
            this;
        const n = cols * rows;
        for (let i = 0; i < n; i++) {
            const flag = sharkFlag[i];
            if (!flag) continue;
            const col = i % cols;
            const row = (i / cols) | 0;
            const x = col * cw;
            const y = row * ch;
            const key = sharkKey[i];
            const shade = sharkShade[i];
            const dim = 0.7 + 0.3 * sharkDepth[i];
            const [tr, tg, tb] = SHAPES[KINDS[sharkKind[i]]].tint;
            ctx.globalAlpha = cellDim[i];

            const tick = Math.floor(t * 2.4 + (key % 997) / 97);
            const roll = hash3(key, tick, 7);

            if (flag === FLAG_EDGE) {
                const set = shade >= 0.5 ? EDGE_HEAVY : EDGE_LIGHT;
                const g = isLight ? 210 - (40 + shade * 80) * dim : (70 + shade * 80) * dim;
                ctx.fillStyle =
                    roll < 0.07
                        ? ACCENTS[key % ACCENTS.length]
                        : `rgb(${Math.round(g * tr)},${Math.round(g * tg)},${Math.min(255, Math.round(g * tb + 6))})`;
                ctx.fillText(set[(key >>> 8) % set.length], x + cw / 2, y + ch / 2 + 1);
                continue;
            }

            let level: number;
            let glyph: string;
            if (flag === FLAG_RIDGE) {
                level = 226;
                glyph = RIDGE_GLYPHS[(key >>> 8) % RIDGE_GLYPHS.length];
            } else if (flag === FLAG_MARK) {
                level = 24 + shade * 22;
                glyph = MARK_GLYPHS[(key >>> 8) % MARK_GLYPHS.length];
            } else if (flag === FLAG_FIN) {
                level = 40 + shade * 120;
                glyph = FIN_GLYPHS[(key >>> 8) % FIN_GLYPHS.length];
            } else {
                level = 46 + shade * 160;
                const jitter = ((key >>> 4) % 3) - 1;
                glyph =
                    SKIN_RAMP[
                        clamp(Math.floor((1 - shade) * (SKIN_RAMP.length - 0.01)) + jitter, 0, SKIN_RAMP.length - 1)
                    ];
            }
            level *= dim;

            if (isLight) {
                const lr = clamp(Math.round(238 - (220 - level * tr) * 0.52), 40, 238);
                const lg = clamp(Math.round(237 - (220 - level * tg) * 0.52), 40, 237);
                const lb = clamp(Math.round(234 - (220 - level * tb) * 0.52), 40, 234);
                ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
            } else {
                ctx.fillStyle = `rgb(${Math.min(255, Math.round(level * tr))},${Math.min(255, Math.round(level * tg))},${Math.min(255, Math.round(level * tb + 4))})`;
            }
            ctx.fillRect(x, y, cw, ch);

            let color: string;
            if (flag === FLAG_MARK)
                color = `rgb(${Math.round(70 * tr)},${Math.round(70 * tg)},${Math.round(70 * tb)})`;
            else if (roll < 0.09) color = ACCENTS[key % ACCENTS.length];
            else if (roll < 0.13) color = isLight ? "#1a1921" : "#ffffff";
            else color = isLight ? (shade > 0.55 ? "#22252e" : "#3a3e4c") : shade > 0.55 ? "#0e0f13" : "#1b1d24";
            ctx.fillStyle = color;
            ctx.fillText(glyph, x + cw / 2, y + ch / 2 + 1);
        }
    }

    private markFish(world: World) {
        const { fishStamp, fishBuckets, sharkFlag } = this;
        const frame = ++this.frameId;
        for (const bucket of fishBuckets) bucket.length = 0;
        for (let pass = 0; pass < 2; pass++) {
            for (const f of world.fish) {
                if (!f.alive || (f.depth > 0.78 ? 0 : 1) !== pass) continue;
                const i = this.cellIndex(f.x, f.y);
                if (i < 0 || fishStamp[i] === frame || sharkFlag[i]) continue;
                fishStamp[i] = frame;
                const glint = clamp(Math.abs(f.turn) / 3.5, 0, 1);
                const v = 0.3 + (0.4 * (f.depth - 0.55)) / 0.45 + 0.3 * Math.max(glint, f.alarm);
                fishBuckets[clamp(Math.floor(v * FISH_ALPHAS.length), 0, FISH_ALPHAS.length - 1)].push(i);
            }
        }
    }

    private drawFish() {
        const { ctx, cw, ch, cols, fishBuckets, cellDim, isLight } = this;
        ctx.fillStyle = isLight ? "rgb(45,52,68)" : "rgb(230,238,255)";
        for (let b = 0; b < fishBuckets.length; b++) {
            const bucket = fishBuckets[b];
            if (!bucket.length) continue;
            const baseAlpha = FISH_ALPHAS[b];
            for (const i of bucket) {
                ctx.globalAlpha = baseAlpha * cellDim[i];
                ctx.fillText("-", (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2 + 1);
            }
        }
    }

    private drawHeat() {
        const { ctx, heat, cols, cw, ch, cellDim } = this;
        for (let i = 0; i < heat.length; i++) {
            const h = heat[i];
            if (h < 0.08) continue;
            const col = i % cols;
            const row = (i / cols) | 0;
            ctx.globalAlpha = cellDim[i];
            ctx.fillStyle = h > 0.5 ? `rgba(255,120,60,${h.toFixed(2)})` : `rgba(220,40,40,${(h * 1.6).toFixed(2)})`;
            ctx.fillText(h > 0.6 ? "*" : "·", col * cw + cw / 2, row * ch + ch / 2 + 1);
        }
    }

    private drawDots(t: number) {
        const {
            ctx,
            cols,
            rows,
            cw,
            ch,
            dotKind,
            dotPhase,
            dotFreq,
            energy,
            sharkFlag,
            sharkShadow,
            fishStamp,
            frameId,
            cellDim,
        } = this;
        const { bucketOf, bucketOrder, bucketCounts } = this;
        const n = cols * rows;
        const SKIP = bucketCounts.length - 1;
        bucketCounts.fill(0);

        for (let i = 0; i < n; i++) {
            const e = energy[i] * cellDim[i];
            const kind = dotKind[i];
            if (sharkFlag[i] || fishStamp[i] === frameId || (kind === 0 && e < 0.45)) {
                bucketOf[i] = SKIP;
                continue;
            }
            let bucket: number;
            if (e > 0.45) {
                const level = clamp(Math.floor((e - 0.45) * 5), 0, ALPHA_LEVELS - 1);
                bucket = WAKE * ALPHA_LEVELS + level;
            } else {
                const col = i % cols;
                const row = (i / cols) | 0;
                const twinkle = 0.5 + 0.5 * Math.sin(t * dotFreq[i] + dotPhase[i]);
                const caustic = 0.85 + 0.15 * Math.sin(col * 0.11 + t * 0.35) * Math.sin(row * 0.17 - t * 0.27);
                let v = clamp((0.55 + 0.45 * twinkle) * caustic + e * 2, 0, 1);
                if (sharkShadow[i]) v *= 0.2;
                bucket = (kind - 1) * ALPHA_LEVELS + clamp(Math.floor(v * ALPHA_LEVELS), 0, ALPHA_LEVELS - 1);
            }
            bucketOf[i] = bucket;
            bucketCounts[bucket]++;
        }

        const starts = new Int32Array(bucketCounts.length);
        for (let b = 1; b < bucketCounts.length; b++) starts[b] = starts[b - 1] + bucketCounts[b - 1];
        const cursor = starts.slice();
        for (let i = 0; i < n; i++) {
            const b = bucketOf[i];
            if (b !== SKIP) bucketOrder[cursor[b]++] = i;
        }

        const small = Math.max(1, Math.round(cw * 0.2));
        const large = small + 1;
        ctx.globalAlpha = 1;
        for (let b = 0; b < SKIP; b++) {
            const count = bucketCounts[b];
            if (!count) continue;
            ctx.fillStyle = this.dotStyles[b];
            const size = b >= WAKE * ALPHA_LEVELS ? large : small;
            const start = starts[b];
            for (let k = start; k < start + count; k++) {
                const i = bucketOrder[k];
                const col = i % cols;
                const row = (i / cols) | 0;
                ctx.fillRect(
                    Math.round(col * cw + cw * 0.66 - size / 2),
                    Math.round(row * ch + ch * 0.64 - size / 2),
                    size,
                    size
                );
            }
        }
    }
}
