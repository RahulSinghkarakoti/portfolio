export type Project = {
    slug: string;
    index: string;
    name: string;
    tagline: string;
    description: string;
    tech: string[];
    year: string;
    github?: string;
    live?: string;
};

export const projects: Project[] = [
    {
        index: "01",
        slug: "rag-lab",
        name: "RAG Lab",
        tagline: "Experiment with every stage of the RAG pipeline side by side.",
        description:
            "Interactive AI engineering workbench for testing, comparing, and benchmarking every stage of the Retrieval-Augmented Generation pipeline—chunking boundaries, embedding models, dense/sparse/hybrid retrieval, cross-encoder reranking, and LLM generation—on the same dataset and query.",
        tech: ["Next.js", "TypeScript", "Embeddings", "Vector Search", "Reranking", "LLMs"],
        year: "Spring 2026",
        github: "https://github.com/rahulSinghkarakoti",
        live: "https://github.com/rahulSinghkarakoti",
    },
    {
        index: "02",
        slug: "indicava",
        name: "Indicava ERP",
        tagline: "Multi-tenant School SaaS ERP built for real-world school operations.",
        description:
            "Production multi-tenant School SaaS ERP covering admissions, academics, attendance, timetabling, ICICI Bank API & Razorpay automated fee reconciliation, entity-specific RBAC hierarchy, IndexedDB offline-first data sync, WebSockets live updates, and AI insights.",
        tech: ["Nuxt 2", "Vue.js 2", "Vuetify 2", "Express.js", "MariaDB", "WebSockets", "ICICI Bank API"],
        year: "Fall 2025",
        github: "https://github.com/rahulSinghkarakoti",
        live: "https://indicava.com",
    },
    {
        index: "03",
        slug: "rootspace",
        name: "RootSpace",
        tagline: "Map, visualize, and collaborate on your family lineage.",
        description:
            "Interactive family tree visualizer and collaborative workspace where relatives map, pan, zoom, trace kinship paths, and co-edit multi-generational lineage graphs together.",
        tech: ["React.js", "Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
        year: "Summer 2025",
        github: "https://github.com/rahulSinghkarakoti",
        live: "https://github.com/rahulSinghkarakoti",
    },
    {
        index: "04",
        slug: "bestprep",
        name: "BestPrep LMS",
        tagline: "Complete learning, live class, and assessment platform for coaching institutes and schools.",
        description:
            "End-to-end Learning Management System featuring courses, test & quiz series engines with scheduled windows, automated evaluation, rank lists and leaderboards, live classes with attendance tracking, multi-role RBAC, and Razorpay billing.",
        tech: ["Nuxt 2", "Vue.js 2", "Vuetify 2", "Express.js", "MariaDB", "WebSockets", "Razorpay"],
        year: "Spring 2025",
        github: "https://github.com/rahulSinghkarakoti",
        live: "https://github.com/rahulSinghkarakoti",
    },
];
