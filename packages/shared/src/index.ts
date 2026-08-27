export const productName = "产业核心学院";

export type ClientKind = "pc" | "mobile";

export const clientLabels: Record<ClientKind, string> = {
  pc: "电脑端",
  mobile: "手机端",
};

export * from "./course-learning";
export * from "./registration-handoff";
export * from "./Dialog";
export * from "./campus-ambassador";
export * from "./campus-ambassador-week";
export * from "./campus-ambassador-state";
