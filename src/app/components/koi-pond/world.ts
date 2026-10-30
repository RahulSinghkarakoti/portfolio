import { pickSpecies, SPECIES, type SharkKind } from "./shape";

export const TAU = Math.PI * 2;
export const SHARK_NODES = 20;

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const randInt = (lo: number, hi: number) => Math.floor(rand(lo, hi + 1));

export function smoothstep(e0: number, e1: number, x: number) {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
}

export function angleDiff(a: number, b: number) {
    let d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
}

export function hash3(x: number, y: number, z: number) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
}

const K1 = 1 / 260;
const K2 = 1 / 310;
const K3 = 1 / 190;
const CURRENT_SCALE = 3400;

export function current(x: number, y: number, t: number, out: { x: number; y: number }) {
    const a = x * K1 + t * 0.07;
    const b = y * K2 - t * 0.05;
    const c = (x + y) * K3 + t * 0.11;
    out.x = (-K2 * Math.sin(a) * Math.sin(b) + 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
    out.y = (-K1 * Math.cos(a) * Math.cos(b) - 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
    return out;
}

export type Box = { left: number; top: number; right: number; bottom: number };

const push = { x: 0, y: 0 };

function repel(boxes: Box[], x: number, y: number, margin: number, out: { x: number; y: number }) {
    out.x = 0;
    out.y = 0;
    for (const b of boxes) {
        let ox = x - clamp(x, b.left, b.right);
        let oy = y - clamp(y, b.top, b.bottom);
        let d = Math.hypot(ox, oy);
        if (d > margin) continue;
        if (d < 1e-3) {
            const edges = [b.left - x, x - b.right, b.top - y, y - b.bottom];
            const nearest = edges.indexOf(Math.max(...edges));
            ox = nearest === 0 ? -1 : nearest === 1 ? 1 : 0;
            oy = nearest === 2 ? -1 : nearest === 3 ? 1 : 0;
            d = 0;
        }
        const len = Math.hypot(ox, oy) || 1;
        out.x += (ox / len) * (1 - d / margin);
        out.y += (oy / len) * (1 - d / margin);
    }
    return out;
}

export type SharkSpec = { kind: SharkKind; size: number };

const DEFAULT_SHARKS: SharkSpec[] = [
    { kind: "classic", size: 1 },
    { kind: "classic", size: 0.7 },
    { kind: "classic", size: 0.84 },
    { kind: "classic", size: 0.77 },
    { kind: "classic", size: 0.64 },
    { kind: "classic", size: 0.9 },
];

export interface Fish {
    x: number;
    y: number;
    vx: number;
    vy: number;
    species: number;
    alarm: number;
    alive: boolean;
    respawnAt: number;
    phase: number;
    turn: number;
    depth: number;
    millDir: 1 | -1;
}

export interface Shark {
    id: number;
    kind: SharkKind;
    length: number;
    nodes: Float32Array;
    heading: number;
    speed: number;
    phase: number;
    turn: number;
    hunger: number;
    wander: number;
    orbitDir: 1 | -1;
    orbitRadius: number;
    target: Fish | null;
    retargetAt: number;
    depth: number;
}

export interface WorldEvent {
    kind: "eat" | "splash";
    x: number;
    y: number;
}

const FISH_SEPARATION_K = 420;
const FISH_ALIGN_K = 1.4;
const FISH_COHESION_K = 1;
const FISH_FLEE_K = 1100;
const BLIND_COS = -0.6;

export class World {
    width = 0;
    height = 0;
    time = 0;
    fish: Fish[] = [];
    sharks: Shark[] = [];
    events: WorldEvent[] = [];
    pointer = { x: 0, y: 0, active: false };
    avoid: Box[] = [];
    liveFish = 0;

    private perception = 60;
    private sepX: number[] = [];
    private sepY: number[] = [];
    private foreignSep = 40;
    private bucketCols = 0;
    private bucketRows = 0;
    private bucketHead = new Int32Array(0);
    private bucketCount = new Uint16Array(0);
    private bucketNext = new Int32Array(0);
    private lastSpawn = 0;
    private tmp = { x: 0, y: 0 };

    constructor(
        private sharkSpecs: SharkSpec[] = DEFAULT_SHARKS,
        private fishCount?: number
    ) {}

    resize(width: number, height: number, cellW: number, cellH: number) {
        const first = this.width === 0;
        this.width = width;
        this.height = height;
        this.sepX = SPECIES.map((sp) => sp.spacing[0] * cellW);
        this.sepY = SPECIES.map((sp) => sp.spacing[1] * cellH);
        this.perception = Math.max(cellH * 3, cellW * 5.5);
        this.foreignSep = cellW * 3;

        if (first || this.fish.length === 0) {
            this.seed();
            return;
        }
        for (const f of this.fish) {
            f.x = clamp(f.x, 0, width);
            f.y = clamp(f.y, 0, height);
        }
    }

    seed() {
        const { width: W, height: H } = this;
        const minSide = Math.min(W, H);
        const baseLength = clamp(minSide * 0.44, 170, 430);
        const sharkCount = this.sharkSpecs.length;

        this.sharks = [];
        for (let i = 0; i < sharkCount; i++) {
            const { kind, size } = this.sharkSpecs[i];
            const length = baseLength * size;
            const orbitRadius = minSide * rand(0.28, 0.4);
            const a = (i / sharkCount) * TAU + rand(-0.4, 0.4);
            const orbitDir: 1 | -1 = i % 2 === 0 ? 1 : -1;
            const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.9;
            const y = H / 2 + Math.sin(a) * orbitRadius;
            const heading = a + (orbitDir * Math.PI) / 2;
            const nodes = new Float32Array(SHARK_NODES * 2);
            const seg = length / (SHARK_NODES - 1);
            for (let n = 0; n < SHARK_NODES; n++) {
                nodes[n * 2] = x - Math.cos(heading) * seg * n;
                nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
            }
            this.sharks.push({
                id: i + 1,
                kind,
                length,
                nodes,
                heading,
                speed: 30,
                phase: rand(0, TAU),
                turn: 0,
                hunger: rand(0.45, 0.9),
                wander: 0,
                orbitDir,
                orbitRadius,
                target: null,
                retargetAt: 0,
                depth: size,
            });
        }
        this.sharks.sort((a, b) => a.length - b.length);

        const total = this.fishCount ?? clamp(Math.round((W * H) / 2200), 180, 600);
        this.fish = [];
        while (this.fish.length < total) {
            const species = pickSpecies();
            const sp = SPECIES[species];
            const size = Math.min(randInt(sp.schoolSize[0], sp.schoolSize[1]), total - this.fish.length);
            const millDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
            const cx = rand(W * 0.06, W * 0.94);
            const cy = rand(H * 0.08, H * 0.92);
            const dir = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.5, 0.5);
            for (let k = 0; k < size; k++) {
                this.fish.push({
                    x: cx + rand(-1, 1) * this.sepX[species] * Math.sqrt(size),
                    y: cy + rand(-1, 1) * this.sepY[species] * Math.sqrt(size) * 0.6,
                    vx: Math.cos(dir) * sp.cruise,
                    vy: Math.sin(dir) * sp.cruise,
                    species,
                    alarm: 0,
                    alive: true,
                    respawnAt: 0,
                    phase: rand(0, TAU),
                    turn: 0,
                    depth: rand(0.55, 1),
                    millDir,
                });
            }
        }
        this.liveFish = this.fish.length;
        this.bucketNext = new Int32Array(this.fish.length);
    }

    splash(x: number, y: number) {
        this.events.push({ kind: "splash", x, y });
        const r = 240;
        for (const f of this.fish) {
            if (!f.alive) continue;
            const dx = f.x - x;
            const dy = f.y - y;
            const d = Math.hypot(dx, dy);
            if (d > r || d < 1e-3) continue;
            const k = (1 - d / r) * 260;
            f.vx += (dx / d) * k;
            f.vy += (dy / d) * k;
            f.alarm = 1;
        }
        const species = pickSpecies();
        const sp = SPECIES[species];
        const millDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
        const burst = randInt(10, 18);
        let spawned = 0;
        for (const f of this.fish) {
            if (f.alive) continue;
            const a = rand(0, TAU);
            f.alive = true;
            this.liveFish++;
            f.species = species;
            f.alarm = 0.35;
            f.turn = 0;
            f.millDir = millDir;
            f.x = x + rand(-24, 24);
            f.y = y + rand(-18, 18);
            f.vx = Math.cos(a) * sp.cruise;
            f.vy = Math.sin(a) * sp.cruise;
            if (++spawned >= burst) break;
        }
        while (spawned < burst && this.fish.length < 750) {
            const a = rand(0, TAU);
            this.fish.push({
                x: x + rand(-24, 24),
                y: y + rand(-18, 18),
                vx: Math.cos(a) * sp.cruise,
                vy: Math.sin(a) * sp.cruise,
                species,
                alarm: 0.35,
                alive: true,
                respawnAt: 0,
                phase: rand(0, TAU),
                turn: 0,
                depth: rand(0.55, 1),
                millDir,
            });
            this.liveFish++;
            spawned++;
        }
        for (const sh of this.sharks) {
            sh.hunger = Math.min(1, sh.hunger + 0.25);
            sh.retargetAt = 0;
        }
    }

    step(dt: number) {
        this.time += dt;
        this.rebuildHash();
        this.stepFish(dt);
        this.stepSharks(dt);
        this.respawn();
    }

    private rebuildHash() {
        const size = this.perception;
        const pad = 2;
        this.bucketCols = Math.ceil(this.width / size) + pad * 2;
        this.bucketRows = Math.ceil(this.height / size) + pad * 2;
        const n = this.bucketCols * this.bucketRows;
        if (this.bucketHead.length !== n) {
            this.bucketHead = new Int32Array(n);
            this.bucketCount = new Uint16Array(n);
        }
        this.bucketHead.fill(-1);
        this.bucketCount.fill(0);
        if (this.bucketNext.length !== this.fish.length) {
            this.bucketNext = new Int32Array(this.fish.length);
        }
        for (let i = 0; i < this.fish.length; i++) {
            const f = this.fish[i];
            if (!f.alive) continue;
            const b = this.bucketOf(f.x, f.y);
            this.bucketNext[i] = this.bucketHead[b];
            this.bucketHead[b] = i;
            this.bucketCount[b]++;
        }
    }

    private bucketOf(x: number, y: number) {
        const size = this.perception;
        const c = clamp(Math.floor(x / size) + 2, 0, this.bucketCols - 1);
        const r = clamp(Math.floor(y / size) + 2, 0, this.bucketRows - 1);
        return r * this.bucketCols + c;
    }

    private stepFish(dt: number) {
        const { fish, sharks, pointer, width: W, height: H, time } = this;
        const R = this.perception;
        const R2 = R * R;
        const foreignSep = this.foreignSep;
        const size = this.perception;
        const cols = this.bucketCols;
        const rows = this.bucketRows;
        const head = this.bucketHead;
        const next = this.bucketNext;
        const cur = this.tmp;
        const calmDecay = Math.exp(-dt * 0.7);
        const contagion = Math.min(1, dt * 6);

        for (let i = 0; i < fish.length; i++) {
            const f = fish[i];
            if (!f.alive) continue;
            const sp = SPECIES[f.species];
            const spread = 1 + 1.8 * f.alarm;
            const sepX = this.sepX[f.species] * spread;
            const sepY = this.sepY[f.species] * spread;

            const speed = Math.hypot(f.vx, f.vy) || 1;
            const hx = f.vx / speed;
            const hy = f.vy / speed;

            let ax = 0;
            let ay = 0;
            let sx = 0;
            let sy = 0;
            let avx = 0;
            let avy = 0;
            let cx = 0;
            let cy = 0;
            let n = 0;
            let neighbourAlarm = 0;

            const bc = clamp(Math.floor(f.x / size) + 2, 0, cols - 1);
            const br = clamp(Math.floor(f.y / size) + 2, 0, rows - 1);
            for (let r = Math.max(0, br - 1); r <= Math.min(rows - 1, br + 1); r++) {
                for (let c = Math.max(0, bc - 1); c <= Math.min(cols - 1, bc + 1); c++) {
                    let j = head[r * cols + c];
                    while (j !== -1) {
                        if (j !== i) {
                            const o = fish[j];
                            const dx = o.x - f.x;
                            const dy = o.y - f.y;
                            const d2 = dx * dx + dy * dy;
                            if (d2 < R2 && d2 > 1e-6) {
                                const d = Math.sqrt(d2);
                                if ((dx * hx + dy * hy) / d > BLIND_COS) {
                                    const qx = dx / sepX;
                                    const qy = dy / sepY;
                                    const q2 = qx * qx + qy * qy;
                                    if (q2 < 1) {
                                        const q = Math.sqrt(q2) || 1e-3;
                                        const k = (1 - q) / q;
                                        sx -= qx * k;
                                        sy -= qy * k;
                                    }
                                    if (o.species === f.species) {
                                        avx += o.vx;
                                        avy += o.vy;
                                        cx += dx;
                                        cy += dy;
                                        n++;
                                    } else if (d < foreignSep) {
                                        const k = ((1 - d / foreignSep) / d) * 0.6;
                                        sx -= dx * k;
                                        sy -= dy * k;
                                    }
                                    if (o.alarm > neighbourAlarm) neighbourAlarm = o.alarm;
                                }
                            }
                        }
                        j = next[j];
                    }
                }
            }

            ax += sx * FISH_SEPARATION_K;
            ay += sy * FISH_SEPARATION_K;
            if (n > 0) {
                const alignK = FISH_ALIGN_K * sp.align;
                const cohesionK = FISH_COHESION_K * sp.cohesion * (1 - 0.8 * f.alarm);
                ax += (avx / n - f.vx) * alignK + (cx / n) * cohesionK;
                ay += (avy / n - f.vy) * alignK + (cy / n) * cohesionK;
                if (sp.mill > 0) {
                    const cl = Math.hypot(cx, cy) || 1;
                    ax += (-cy / cl) * f.millDir * sp.mill * (1 - f.alarm);
                    ay += (cx / cl) * f.millDir * sp.mill * (1 - f.alarm);
                }
            }

            let fear = 0;
            for (const sh of sharks) {
                const fearR = sh.length * 0.6 + 60;
                let best = Infinity;
                let bx = 0;
                let by = 0;
                for (let k = 0; k <= 12; k += 3) {
                    const nx = sh.nodes[k * 2];
                    const ny = sh.nodes[k * 2 + 1];
                    const d2 = (f.x - nx) ** 2 + (f.y - ny) ** 2;
                    if (d2 < best) {
                        best = d2;
                        bx = nx;
                        by = ny;
                    }
                }
                const d = Math.sqrt(best);
                if (d >= fearR || d < 1e-3) continue;
                let w = 1 - d / fearR;
                w *= w;
                const awayX = (f.x - bx) / d;
                const awayY = (f.y - by) / d;
                const shx = Math.cos(sh.heading);
                const shy = Math.sin(sh.heading);
                const side = shx * (f.y - sh.nodes[1]) - shy * (f.x - sh.nodes[0]) >= 0 ? 1 : -1;
                ax += (awayX * 0.7 - shy * side * 0.9) * FISH_FLEE_K * w;
                ay += (awayY * 0.7 + shx * side * 0.9) * FISH_FLEE_K * w;
                fear = Math.max(fear, Math.sqrt(w));
            }

            if (pointer.active) {
                const pr = 130;
                const dx = f.x - pointer.x;
                const dy = f.y - pointer.y;
                const d = Math.hypot(dx, dy);
                if (d < pr && d > 1e-3) {
                    const w = (1 - d / pr) ** 2;
                    ax += (dx / d) * FISH_FLEE_K * w;
                    ay += (dy / d) * FISH_FLEE_K * w;
                    fear = Math.max(fear, Math.sqrt(w) * 0.8);
                }
            }

            let alarm = Math.max(f.alarm * calmDecay, fear);
            const relayed = neighbourAlarm * 0.86;
            if (relayed > alarm) alarm += (relayed - alarm) * contagion;
            f.alarm = alarm;

            const m = 36;
            if (f.x < m) ax += (m - f.x) * 7;
            else if (f.x > W - m) ax -= (f.x - (W - m)) * 7;
            if (f.y < m) ay += (m - f.y) * 7;
            else if (f.y > H - m) ay -= (f.y - (H - m)) * 7;

            current(f.x, f.y, time, cur);
            ax += cur.x * 0.5 + (Math.random() - 0.5) * sp.jitter;
            ay += cur.y * 0.5 + (Math.random() - 0.5) * sp.jitter;
            ay -= f.vy * sp.verticalDrag * (1 - 0.7 * f.alarm);

            const preferred = sp.cruise * (1 + 1.3 * f.alarm);
            ax += (preferred - speed) * hx * 1.6;
            ay += (preferred - speed) * hy * 1.6;

            const before = Math.atan2(f.vy, f.vx);
            f.vx += ax * dt;
            f.vy += ay * dt;
            const maxSpeed = sp.maxSpeed * (1 + 1.8 * f.alarm);
            const s = Math.hypot(f.vx, f.vy);
            if (s > maxSpeed) {
                f.vx *= maxSpeed / s;
                f.vy *= maxSpeed / s;
            } else if (s < sp.minSpeed && s > 1e-3) {
                f.vx *= sp.minSpeed / s;
                f.vy *= sp.minSpeed / s;
            }
            f.turn += (angleDiff(before, Math.atan2(f.vy, f.vx)) / dt - f.turn) * Math.min(1, dt * 8);
            f.phase += dt * (7 + Math.hypot(f.vx, f.vy) * 0.12);
            f.x = clamp(f.x + f.vx * dt, -60, W + 60);
            f.y = clamp(f.y + f.vy * dt, -60, H + 60);
        }
    }

    private stepSharks(dt: number) {
        const { sharks, width: W, height: H, time } = this;
        const minSide = Math.min(W, H);
        const cxW = W / 2;
        const cyW = H / 2;

        for (const sh of sharks) {
            const L = sh.length;
            const nodes = sh.nodes;
            const hx = nodes[0];
            const hy = nodes[1];

            sh.hunger = Math.min(1, sh.hunger + dt * 0.08);

            let dx = Math.cos(sh.heading);
            let dy = Math.sin(sh.heading);

            sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 3.2, -1.1, 1.1);
            dx += Math.cos(sh.heading + sh.wander) * 0.45;
            dy += Math.sin(sh.heading + sh.wander) * 0.45;

            if (time >= sh.retargetAt) {
                sh.target = this.findPrey(sh);
                sh.retargetAt = time + 0.35;
            }
            const t = sh.target;
            let hunting = false;
            let closing = 0;
            if (t && t.alive && sh.hunger > 0.15) {
                const tx = t.x + t.vx * 0.35 - hx;
                const ty = t.y + t.vy * 0.35 - hy;
                const d = Math.hypot(tx, ty) || 1;
                const w = 1.4 + 2.6 * sh.hunger;
                dx += (tx / d) * w;
                dy += (ty / d) * w;
                hunting = true;
                closing = clamp(1 - d / (L * 0.9), 0, 1);
            } else {
                const rx = (hx - cxW) / (W / minSide);
                const ry = hy - cyW;
                const r = Math.hypot(rx, ry) || 1;
                const radius = sh.orbitRadius * (1 + 0.15 * Math.sin(time * 0.05 + sh.id));
                const radial = clamp((radius - r) / radius, -1, 1);
                dx += ((-ry / r) * sh.orbitDir + (rx / r) * radial * 0.9) * 0.55;
                dy += ((rx / r) * sh.orbitDir + (ry / r) * radial * 0.9) * 0.55;
            }

            for (const other of sharks) {
                if (other === sh) continue;
                for (let k = 0; k < SHARK_NODES; k += 4) {
                    const ox = hx - other.nodes[k * 2];
                    const oy = hy - other.nodes[k * 2 + 1];
                    const d = Math.hypot(ox, oy);
                    const range = (L + other.length) * 0.45;
                    if (d < range && d > 1e-3) {
                        const w = (1 - d / range) * 3;
                        dx += (ox / d) * w;
                        dy += (oy / d) * w;
                    }
                }
            }

            // Steer around page content blocks.
            repel(this.avoid, hx, hy, L * 0.35, push);
            dx += push.x * (hunting ? 0.6 : 1.8);
            dy += push.y * (hunting ? 0.6 : 1.8);

            const over = Math.max(-hx, hx - W, -hy, hy - H);
            if (over > -L * 0.05) {
                const w = clamp((over + L * 0.05) / (L * 0.35), 0, 1) * 3.5;
                const toX = cxW - hx;
                const toY = cyW - hy;
                const d = Math.hypot(toX, toY) || 1;
                dx += (toX / d) * w;
                dy += (toY / d) * w;
            }

            const desired = Math.atan2(dy, dx);
            const agility = Math.min(hunting ? 1.7 + closing : 0.8, sh.speed / (L * 0.22));
            const maxTurn = agility * dt;
            const turned = clamp(angleDiff(sh.heading, desired), -maxTurn, maxTurn);
            sh.heading += turned;
            sh.turn += (turned / dt - sh.turn) * Math.min(1, dt * 3);

            const cruise = 30 + L * 0.04;
            const targetSpeed = hunting ? cruise * (1.45 + closing * 1.5) : cruise;
            sh.speed += (targetSpeed - sh.speed) * Math.min(1, dt * 1.1);
            sh.phase += dt * (2 + sh.speed / 24);

            nodes[0] += Math.cos(sh.heading) * sh.speed * dt;
            nodes[1] += Math.sin(sh.heading) * sh.speed * dt;

            const seg = L / (SHARK_NODES - 1);
            const maxBend = 0.16;
            let prevAngle = sh.heading + Math.PI;
            for (let k = 1; k < SHARK_NODES; k++) {
                const px = nodes[(k - 1) * 2];
                const py = nodes[(k - 1) * 2 + 1];
                let angle = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
                angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
                nodes[k * 2] = px + Math.cos(angle) * seg;
                nodes[k * 2 + 1] = py + Math.sin(angle) * seg;
                prevAngle = angle;
            }

            if (sh.hunger > 0.1) {
                const mouthR = L * 0.065 + 10;
                const mx = nodes[0];
                const my = nodes[1];
                for (const f of this.fish) {
                    if (!f.alive) continue;
                    if ((f.x - mx) ** 2 + (f.y - my) ** 2 < mouthR * mouthR) {
                        f.alive = false;
                        this.liveFish--;
                        f.respawnAt = time + rand(1.5, 4);
                        sh.hunger = Math.max(0, sh.hunger - 0.07);
                        this.events.push({ kind: "eat", x: f.x, y: f.y });
                    }
                }
            }
        }
    }

    private findPrey(sh: Shark): Fish | null {
        const range = sh.length * 0.9 + 160;
        const hx = sh.nodes[0];
        const hy = sh.nodes[1];
        const fx = Math.cos(sh.heading);
        const fy = Math.sin(sh.heading);
        let best: Fish | null = null;
        let bestScore = Infinity;
        let currentScore = Infinity;

        for (const f of this.fish) {
            if (!f.alive) continue;
            const dx = f.x - hx;
            const dy = f.y - hy;
            const d = Math.hypot(dx, dy);
            if (d > range || d < 1e-3) continue;
            const cos = (dx * fx + dy * fy) / d;
            if (cos < 0.2) continue;
            const crowd = this.bucketCount[this.bucketOf(f.x, f.y)];
            const score = d * (1 + (1 - cos) * 0.8) * (1 + crowd * 0.07);
            if (score < bestScore) {
                bestScore = score;
                best = f;
            }
            if (f === sh.target) currentScore = score;
        }
        if (sh.target && currentScore < bestScore * 1.3) return sh.target;
        return best;
    }

    private respawn() {
        const { time, width: W, height: H } = this;
        const due: Fish[] = [];
        for (const f of this.fish) if (!f.alive && f.respawnAt <= time) due.push(f);
        if (due.length === 0) return;
        if (due.length < 4 && time - this.lastSpawn < 3.5) return;
        this.lastSpawn = time;

        const side = randInt(0, 3);
        const along = rand(0.15, 0.85);
        const x = side === 0 ? -20 : side === 1 ? W + 20 : along * W;
        const y = side === 2 ? -20 : side === 3 ? H + 20 : along * H;
        const inward = Math.atan2(H / 2 - y, W / 2 - x) + rand(-0.5, 0.5);
        const species = pickSpecies();
        const sp = SPECIES[species];
        const millDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
        for (const f of due.slice(0, sp.schoolSize[1])) {
            f.alive = true;
            this.liveFish++;
            f.species = species;
            f.alarm = 0;
            f.turn = 0;
            f.millDir = millDir;
            f.x = x + rand(-1, 1) * this.perception;
            f.y = y + rand(-1, 1) * this.perception;
            f.vx = Math.cos(inward) * sp.cruise * 1.4;
            f.vy = Math.sin(inward) * sp.cruise * 1.4;
        }
    }
}
