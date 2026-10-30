"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, Github } from "lucide-react";
import MobileNav from "../components/mobile-nav";
import TopNav from "../components/top-nav";
import Container from "../components/container";
import { projects, type Project } from "../data/projects";

const BORDER = "color-mix(in srgb, var(--foreground-color) 10%, transparent)";
const ICON_BTN =
    "inline-flex h-8 w-8 items-center justify-center rounded-md opacity-45 transition-[opacity,background-color] duration-150 hover:bg-[color-mix(in_srgb,var(--foreground-color)_8%,transparent)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground";

export default function ProjectsRoute() {
    const [activeSlug, setActiveSlug] = useState<string | null>(null);

    useEffect(() => {
        if (!activeSlug) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveSlug(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [activeSlug]);

    const toggle = (slug: string) => setActiveSlug((prev) => (prev === slug ? null : slug));

    return (
        <div className="min-h-[100dvh] w-full bg-background font-geistMono text-foreground">
            <MobileNav />
            <TopNav />
            <Container
                as="main"
                className="flex min-h-[100dvh] flex-col justify-center pb-16 pt-28 lg:pb-24 lg:pt-28"
            >
                <div className="max-w-[54rem]">
                    <div
                        className="divide-y"
                        style={{
                            borderTop: `1px solid ${BORDER}`,
                            borderBottom: `1px solid ${BORDER}`,
                            borderColor: BORDER,
                        }}
                    >
                        {projects.map((project) => (
                            <ProjectRow
                                key={project.slug}
                                project={project}
                                open={activeSlug === project.slug}
                                onToggle={() => toggle(project.slug)}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}

function ProjectRow({
    project,
    open,
    onToggle,
}: {
    project: Project;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div style={{ borderColor: BORDER }}>
            <div
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                className="group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left outline-none focus-visible:underline"
            >
                <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
                    <span className="shrink-0 text-[12px] tabular-nums opacity-40">{project.index}</span>
                    <span
                        className={`truncate text-[15px] transition-opacity duration-150 ${
                            open ? "opacity-100" : "opacity-85 group-hover:opacity-100"
                        }`}
                    >
                        {project.name}
                    </span>
                    <span className="hidden truncate text-[12px] opacity-40 md:inline">{project.tagline}</span>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-[12px] tabular-nums opacity-40 sm:inline">{project.year}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${project.name} GitHub repository`}
                                title="GitHub"
                                className={ICON_BTN}
                            >
                                <Github size={15} strokeWidth={1.75} />
                            </a>
                        )}
                        {project.live && (
                            <a
                                href={project.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${project.name} live link`}
                                title="Live link"
                                className={ICON_BTN}
                            >
                                <ExternalLink size={15} strokeWidth={1.75} />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className=" pb-5 pl-7 pr-2 sm:pl-8">
                            <p className="text-[13.5px] leading-[1.7] opacity-70">{project.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                {project.tech.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded px-2 py-0.5 text-[11px] opacity-60"
                                        style={{
                                            background: "color-mix(in srgb, var(--foreground-color) 7%, transparent)",
                                        }}
                                    >
                                        {t}
                                    </span>
                                ))}
                                <span className="ml-auto text-[11px] tabular-nums opacity-40 sm:hidden">
                                    {project.year}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
