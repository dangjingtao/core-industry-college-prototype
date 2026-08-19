export type SimulationModuleManifest = {
  id: string;
  version: string;
  title: string;
  description: string;
  provider: string;
  entryKind: "native" | "iframe";
  entry: string;
  supportedModes: Array<"demo" | "practice" | "assessment" | "competition">;
  capabilities: Array<"pause" | "resume" | "result" | "processLog">;
  minHostProtocolVersion: string;
};

export type SimulationAssignment = {
  assignmentId: string;
  moduleId: string;
  host: {
    type: "competition" | "course" | "activity";
    id: string;
  };
  mode: "demo" | "practice" | "assessment" | "competition";
  enabled: boolean;
  availability: {
    startsAt?: string;
    endsAt?: string;
    requiredPermission?: string;
  };
  launchPolicy: {
    maxAttempts?: number;
    allowResume: boolean;
  };
  resultPolicy: {
    persist: boolean;
    countTowardHostResult: boolean;
  };
  returnTo: string;
};

export const simulationProtocol = {
  version: "1.0",
  namespace: "CORE_INDUSTRY_SIM",
} as const;

export type DemoHostCommand =
  | { type: "HOST_INIT"; activityId: string; locale: "zh-CN" }
  | { type: "HOST_TERMINATE" };

export type DemoModuleEvent =
  | { type: "MODULE_READY" }
  | { type: "DEMO_STARTED" }
  | { type: "DEMO_COMPLETED" }
  | { type: "DEMO_EXIT_REQUESTED" }
  | { type: "MODULE_ERROR"; code: string };

export type SimulationMessage = {
  source: typeof simulationProtocol.namespace;
  payload: DemoHostCommand | DemoModuleEvent;
};

export const simulationModuleManifests: Record<string, SimulationModuleManifest> = {
  "community-commerce": {
    id: "community-commerce",
    version: "1.0.0",
    title: "经营决策体验",
    description: "扮演一家社区团购店的经营者，在几个备选方案中做选择，并查看选择带来的结果。",
    provider: "产业核心学院平台组",
    entryKind: "iframe",
    entry: "/modules/community-commerce/index.html",
    supportedModes: ["demo"],
    capabilities: [],
    minHostProtocolVersion: "1.0",
  },
};

export const simulationAssignments: Record<string, SimulationAssignment> = {
  "activity-business-decision-2026": {
    assignmentId: "activity-business-decision-2026",
    moduleId: "community-commerce",
    host: { type: "activity", id: "activity-business-decision-2026" },
    mode: "demo",
    enabled: true,
    availability: {},
    launchPolicy: { allowResume: false },
    resultPolicy: { persist: false, countTowardHostResult: false },
    returnTo: "/apps",
  },
};
