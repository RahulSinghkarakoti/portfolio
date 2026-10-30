/** Sources for the landing page's @-mentions: what the hover card shows, plus where a click lands. */

export type Source = {
    key: string;
    /** Shown beside the mark in the card header. */
    name: string;
    /**
     * Optical size correction, default 1. A circular plate covers ~79% of the
     * area a square one does, so it reads small at the same dimensions.
     */
    iconScale?: number;
    /** Vendored favicon in /public/logos. Omit and the card falls back to a monogram. */
    icon?: string;
    /** Prominent line in the card — the title slot. */
    role: string;
    /** Leads the body line, the way a publication date does in a real citation. */
    dates: string;
    /** One line on the work itself. */
    summary: string;
    /** Where a click lands: an in-app path or an external URL. */
    href?: string;
    /** Keys of other sources this one rolls up; the card lists each of them instead of one role. */
    group?: string[];
};

export const SOURCES: Record<string, Source> = {
    siteguru: {
        key: "siteguru",
        name: "Site Guru",
        role: "Full Stack Developer",
        dates: "Oct 2025–Present",
        summary:
            "Promoted from intern. Owning feature architecture, RBAC, banking integrations, and end-to-end delivery across ERP and LMS products.",
        href: "/projects",
    },
    siteguruIntern: {
        key: "siteguruIntern",
        name: "Site Guru",
        role: "Full Stack Developer Intern",
        dates: "Jun–Oct 2025",
        summary:
            "Built REST APIs, reusable Vuetify UI modules, MariaDB schemas, and led initial architecture of BestPrep LMS.",
        href: "/projects",
    },
    indicava: {
        key: "indicava",
        name: "Indicava ERP",
        role: "School SaaS ERP",
        dates: "2025–Present",
        summary:
            "Multi-tenant school ERP with ICICI Bank API reconciliation, entity-specific RBAC, IndexedDB offline sync, and AI insights.",
        href: "/projects",
    },
    bestprep: {
        key: "bestprep",
        name: "BestPrep LMS",
        role: "LMS for Coaching & Schools",
        dates: "2025",
        summary:
            "End-to-end learning & assessment platform with live classes, test/quiz engines, leaderboards, and Razorpay billing.",
        href: "/projects",
    },
    saasProducts: {
        key: "saasProducts",
        name: "SaaS Platforms",
        role: "Indicava ERP & BestPrep LMS",
        dates: "2025–Present",
        summary: "Production multi-tenant platforms built at Site Guru.",
        group: ["indicava", "bestprep"],
    },
    rag: {
        key: "rag",
        name: "RAG Lab",
        role: "RAG & AI Engineering",
        dates: "2026–Present",
        summary:
            "Workbench for experimenting with chunking, embedding models, dense/hybrid retrieval, reranking, and grounded generation.",
        href: "/projects",
    },
    rootspace: {
        key: "rootspace",
        name: "RootSpace",
        role: "Family Tree Visualizer & Collaborator",
        dates: "2025",
        summary: "Interactive lineage graph where family members map, explore, and collaborate on their family tree.",
        href: "/projects",
    },
    vips: {
        key: "vips",
        name: "VIPS, GGSIPU",
        role: "Bachelor of Computer Applications (BCA)",
        dates: "New Delhi",
        summary: "Vivekananda Institute of Professional Studies, Guru Gobind Singh Indraprastha University.",
        href: "https://vips.edu/",
    },
};
