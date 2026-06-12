export type EpistemicTag =
  | "established"
  | "theoretical-prediction"
  | "interpretation"
  | "conjecture"
  | "open-question";

export type ModuleId =
  | "relativity"
  | "curvature"
  | "slits"
  | "quantum"
  | "entanglement"
  | "blackhole"
  | "planck"
  | "information"
  | "gravity"
  | "graph";

export interface Panel {
  id: string;
  module: ModuleId;
  tag: EpistemicTag;
  title: string;
  body: string;
}

export type EdgeType = "derives" | "emerges" | "constrains" | "conjecture" | "tension";

export interface GraphNode {
  id: string;
  label: string;
  module?: ModuleId;
  status: EpistemicTag;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
  status: EpistemicTag;
  justification: string;
}

export interface Question {
  id: string;
  text: string;
  routes: ModuleId[];
  nodes: string[];
  status: "established" | "partial" | "open";
}
