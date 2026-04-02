// ─── Implementation Blueprint Types ─────────────────────────────────────────

export interface TechPill {
    label: string;
    color: string; // hex
}

export interface ArchNode {
    id: string;
    label: string;
    description: string;
    icon: string; // SVG path
    color: string;
    x: number; // 0-100 normalized
    y: number; // 0-100 normalized
}

export interface ArchEdge {
    from: string;
    to: string;
    label?: string;
}

export interface Phase {
    title: string;
    description: string;
    color: string;
}

export interface BlueprintData {
    title: string;
    subtitle: string;
    accentColor: string;
    gradient: string; // tailwind gradient classes
    techStack: TechPill[];
    archNodes: ArchNode[];
    archEdges: ArchEdge[];
    phases: Phase[];
    keyInsights: string[];
}
