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
  "local-life-coupon": {
    id: "local-life-coupon",
    version: "1.0.0",
    title: "本地生活券运营体验",
    description: "设计团购券、选投放人群并做好到店核销，看三个决策带来什么结果。",
    provider: "产业核心学院平台组",
    entryKind: "iframe",
    entry: "/modules/local-life-coupon/index.html",
    supportedModes: ["demo"],
    capabilities: [],
    minHostProtocolVersion: "1.0",
  },
  "campus-drinks": {
    id: "campus-drinks",
    version: "1.0.0",
    title: "校园饮品店经营体验",
    description: "在校园开一家饮品店，从菜单、活动到高峰履约做三次关键决策。",
    provider: "产业核心学院平台组",
    entryKind: "iframe",
    entry: "/modules/campus-drinks/index.html",
    supportedModes: ["demo"],
    capabilities: [],
    minHostProtocolVersion: "1.0",
  },
  "live-commerce": {
    id: "live-commerce",
    version: "1.0.0",
    title: "直播间运营体验",
    description: "运营一场校园直播带货，在选品、投流与转化节奏上做选择。",
    provider: "产业核心学院平台组",
    entryKind: "iframe",
    entry: "/modules/live-commerce/index.html",
    supportedModes: ["demo"],
    capabilities: [],
    minHostProtocolVersion: "1.0",
  },
  "cross-border-selection": {
    id: "cross-border-selection",
    version: "1.0.0",
    title: "跨境小铺选品体验",
    description: "从选品到供应链再到营销定价，走一遍跨境电商的选品决策。",
    provider: "产业核心学院平台组",
    entryKind: "iframe",
    entry: "/modules/cross-border-selection/index.html",
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
  "activity-local-life-coupon": {
    assignmentId: "activity-local-life-coupon",
    moduleId: "local-life-coupon",
    host: { type: "activity", id: "activity-local-life-coupon" },
    mode: "demo",
    enabled: true,
    availability: {},
    launchPolicy: { allowResume: false },
    resultPolicy: { persist: false, countTowardHostResult: false },
    returnTo: "/apps",
  },
  "activity-campus-drinks": {
    assignmentId: "activity-campus-drinks",
    moduleId: "campus-drinks",
    host: { type: "activity", id: "activity-campus-drinks" },
    mode: "demo",
    enabled: true,
    availability: {},
    launchPolicy: { allowResume: false },
    resultPolicy: { persist: false, countTowardHostResult: false },
    returnTo: "/apps",
  },
  "activity-live-commerce": {
    assignmentId: "activity-live-commerce",
    moduleId: "live-commerce",
    host: { type: "activity", id: "activity-live-commerce" },
    mode: "demo",
    enabled: true,
    availability: {},
    launchPolicy: { allowResume: false },
    resultPolicy: { persist: false, countTowardHostResult: false },
    returnTo: "/apps",
  },
  "activity-cross-border-selection": {
    assignmentId: "activity-cross-border-selection",
    moduleId: "cross-border-selection",
    host: { type: "activity", id: "activity-cross-border-selection" },
    mode: "demo",
    enabled: true,
    availability: {},
    launchPolicy: { allowResume: false },
    resultPolicy: { persist: false, countTowardHostResult: false },
    returnTo: "/apps",
  },
};
