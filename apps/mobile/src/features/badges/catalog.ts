// 徽章目录（运营可配置；研发只提供基座）
// 模型（PRD 19 §3.1）：来源类型 sourceType（为什么获得，事实性质）× 品相 grade（获得有多难）。
// 两个维度互相独立：sourceType 不描述高低，grade 不描述可信度 / 能力等级 / 证书等级。
// G1-G4 为内部占位命名，最终视觉命名待产品收口（PRD 19 §11.1）。
// 说明：徽章规则由 catalog 配置，不在组件里硬编码。组件只读取 catalog 渲染，并调用规则引擎判定。

export type BadgeGrade = "G1" | "G2" | "G3" | "G4";

export type BadgeSourceType =
  | "app-behavior" // App 行为：打卡、资料、简历、模拟经营等
  | "learning" // 学习 / 课程：完成课程章节等
  | "assessment" // 小测 / 考核：关卡小测、结业考试等
  | "competition" // 赛事身份 / 赛事成果
  | "progress" // 进度：赛事节点 / 项目推进
  | "operation"; // 运营活动：激励广告、公益助力等

/**
 * 品相分组（内部约定，待产品收口）：
 * G3 / G4 计为「高品相」，G1 / G2 计为「低品相」。
 * 用于可信证书资格与运营礼包门槛的数量判断；品相本身不代表可信程度。
 */
export const isHighGrade = (grade: BadgeGrade): boolean => grade === "G3" || grade === "G4";

export type BadgeRule =
  // APP 行为
  | { type: "checkin.streak"; min: number }
  | { type: "checkin.today" }
  | { type: "newbie.completed" }
  | { type: "ad.watched"; min: number }
  | { type: "welfare.helped"; min: number }
  | { type: "profile.complete" }
  | { type: "resume.firstEdit" }
  // 课程学习
  | { type: "course.completed"; courseId: string }
  | { type: "course.completedCount"; min: number }
  | { type: "course.checkpointPassed"; courseId: string }
  | { type: "course.checkpointPassedCount"; min: number }
  | { type: "course.checkpointSinglePassed"; courseId: string; checkpointId: string }
  // 赛事
  | { type: "competition.registered" }
  | { type: "competition.ended" }
  | { type: "competition.team" }
  | { type: "competition.materialsReady" }
  | { type: "competition.workshopTasksCompleted" }
  | { type: "competition.resultsAccepted"; min: number }
  // 模拟经营
  | { type: "simulation.level"; min: number }
  | { type: "simulation.stockAndTraffic" }
  // 权益
  | { type: "benefit.claimed"; min: number }
  // 组合
  | { type: "anyOf"; rules: BadgeRule[] }
  | { type: "allOf"; rules: BadgeRule[] };

export type BadgeCatalogEntry = {
  id: string;
  name: string;
  description: string;
  /** 品相：获取难度占位（G1-G4），不代表可信程度 */
  grade: BadgeGrade;
  /** 来源类型：事实性质，不描述高低 */
  sourceType: BadgeSourceType;
  iconColor: string; // 徽章底色
  iconKey: string; // 简单标识字符（避免对 icon 库产生强依赖）
  rule: BadgeRule;
  /** 展示用：达成该徽章后可获得什么（标注待 F04 Decision A 暂定） */
  rewardHint: string;
  /** 课程相关徽章：关联的课程 ID，用于在徽章墙按课程分组 */
  courseId?: string;
  /** 课程相关徽章：在课程内的序号（1, 2, 3...），用于排序 */
  courseOrder?: number;
};

export const badgeCatalog: BadgeCatalogEntry[] = [
  // -------- 低品相（G1 / G2）：App 行为 / 运营活动 / 日常小任务 --------
  {
    id: "badge.checkin.first",
    name: "初次打卡",
    description: "完成第一次每日打卡",
    grade: "G1",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "✓",
    rule: { type: "checkin.today" },
    rewardHint: "",
  },
  {
    id: "badge.checkin.streak3",
    name: "坚持 3 天",
    description: "连续打卡 3 天",
    grade: "G1",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "3",
    rule: { type: "checkin.streak", min: 3 },
    rewardHint: "",
  },
  {
    id: "badge.checkin.streak7",
    name: "坚持 7 天",
    description: "连续打卡 7 天",
    grade: "G2",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "7",
    rule: { type: "checkin.streak", min: 7 },
    rewardHint: "",
  },
  {
    id: "badge.ad.watched1",
    name: "广告体验官",
    description: "完成 1 次激励视频广告观看",
    grade: "G1",
    sourceType: "operation",
    iconColor: "bg-[#fff7df] text-[#946218]",
    iconKey: "▶",
    rule: { type: "ad.watched", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.profile.complete",
    name: "有头有脸",
    description: "完善学生基础资料",
    grade: "G1",
    sourceType: "app-behavior",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "ID",
    rule: { type: "profile.complete" },
    rewardHint: "",
  },
  {
    id: "badge.welfare.helped1",
    name: "温暖传递",
    description: "完成 1 次公益助力",
    grade: "G1",
    sourceType: "operation",
    iconColor: "bg-[#ffe9e9] text-[#c0392b]",
    iconKey: "♥",
    rule: { type: "welfare.helped", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.benefit.claimed1",
    name: "福利首领取",
    description: "领取第 1 份创赛福利",
    grade: "G1",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff7df] text-[#946218]",
    iconKey: "★",
    rule: { type: "benefit.claimed", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.resume.firstEdit",
    name: "履历开启",
    description: "完成长期简历首次编辑",
    grade: "G2",
    sourceType: "app-behavior",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "✎",
    rule: { type: "resume.firstEdit" },
    rewardHint: "",
  },

  // -------- 高品相（G3 / G4）：深度投入与可验证成就 --------
  {
    id: "badge.newbie.completed",
    name: "新生上路",
    description: "完成全部新手任务",
    grade: "G3",
    sourceType: "app-behavior",
    iconColor: "bg-[#e9f6f1] text-[#247456]",
    iconKey: "★",
    rule: { type: "newbie.completed" },
    rewardHint: "",
  },
  {
    id: "badge.course.first",
    name: "学有所成",
    description: "通过 1 门课程的所有关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "C1",
    rule: { type: "course.checkpointPassedCount", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.course.three",
    name: "进阶学习者",
    description: "累计通过 3 门课程的所有关卡小测",
    grade: "G4",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "C3",
    rule: { type: "course.checkpointPassedCount", min: 3 },
    rewardHint: "",
  },

  // -------- 数据分析基础：课程考核节点徽章（6 枚）+ 结业徽章（1 枚） --------
  {
    id: "badge.course.da.cp1",
    name: "数据分析 · 指标与问题",
    description: "通过「指标与问题」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D1",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-1" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 1,
  },
  {
    id: "badge.course.da.cp2",
    name: "数据分析 · 数据整理",
    description: "通过「数据整理」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D2",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-2" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 2,
  },
  {
    id: "badge.course.da.cp3",
    name: "数据分析 · 漏斗分析",
    description: "通过「漏斗分析」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D3",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-3" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 3,
  },
  {
    id: "badge.course.da.cp4",
    name: "数据分析 · 复盘表达",
    description: "通过「复盘表达」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D4",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-4" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 4,
  },
  {
    id: "badge.course.da.cp5",
    name: "数据分析 · 练习与考试",
    description: "通过「练习与考试」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D5",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-5" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 5,
  },
  {
    id: "badge.course.da.cp6",
    name: "数据分析 · 成果确认",
    description: "通过「成果确认」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "D6",
    rule: { type: "course.checkpointSinglePassed", courseId: "data-analytics", checkpointId: "data-analytics-cp-6" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 6,
  },
  {
    id: "badge.course.da.final",
    name: "数据分析 · 结业认证",
    description: "通过「商业数据分析基础」结业小考",
    grade: "G4",
    sourceType: "assessment",
    iconColor: "bg-[#dbeafe] text-[#1d4ed8]",
    iconKey: "DF",
    rule: { type: "course.completed", courseId: "data-analytics" },
    rewardHint: "",
    courseId: "data-analytics",
    courseOrder: 7,
  },

  // -------- 创赛新手必修课：课程考核节点徽章（3 枚）+ 结业徽章（1 枚） --------
  {
    id: "badge.course.ne.cp1",
    name: "新手必修 · App 使用指南",
    description: "通过「App 使用指南」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#fef3c7] text-[#92400e]",
    iconKey: "N1",
    rule: { type: "course.checkpointSinglePassed", courseId: "newbie-essential", checkpointId: "newbie-essential-cp-1" },
    rewardHint: "",
    courseId: "newbie-essential",
    courseOrder: 1,
  },
  {
    id: "badge.course.ne.cp2",
    name: "新手必修 · AI 工具入门",
    description: "通过「AI 工具快速入门」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#fef3c7] text-[#92400e]",
    iconKey: "N2",
    rule: { type: "course.checkpointSinglePassed", courseId: "newbie-essential", checkpointId: "newbie-essential-cp-2" },
    rewardHint: "",
    courseId: "newbie-essential",
    courseOrder: 2,
  },
  {
    id: "badge.course.ne.cp3",
    name: "新手必修 · 报名创赛",
    description: "通过「报名第一场创赛」关卡小测",
    grade: "G3",
    sourceType: "assessment",
    iconColor: "bg-[#fef3c7] text-[#92400e]",
    iconKey: "N3",
    rule: { type: "course.checkpointSinglePassed", courseId: "newbie-essential", checkpointId: "newbie-essential-cp-3" },
    rewardHint: "",
    courseId: "newbie-essential",
    courseOrder: 3,
  },
  {
    id: "badge.course.ne.final",
    name: "新手必修 · 结业认证",
    description: "通过「创赛新手必修课」结业小考",
    grade: "G4",
    sourceType: "assessment",
    iconColor: "bg-[#fde68a] text-[#78350f]",
    iconKey: "NF",
    rule: { type: "course.completed", courseId: "newbie-essential" },
    rewardHint: "",
    courseId: "newbie-essential",
    courseOrder: 4,
  },

  // -------- 赛事身份 / 成果（competition）与赛事进度（progress） --------
  {
    id: "badge.competition.registered",
    name: "赛场启程",
    description: "成功报名一场赛事",
    grade: "G3",
    sourceType: "competition",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "S",
    rule: { type: "competition.registered" },
    rewardHint: "",
  },
  {
    id: "badge.competition.ended",
    name: "完成一场赛事",
    description: "经历至少一场赛事至结束",
    grade: "G3",
    sourceType: "competition",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "🏁",
    rule: { type: "competition.ended" },
    rewardHint: "",
  },
  {
    id: "badge.competition.team",
    name: "并肩作战",
    description: "在一场赛事中组建或加入完整团队",
    grade: "G3",
    sourceType: "progress",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "T",
    rule: { type: "competition.team" },
    rewardHint: "",
  },
  {
    id: "badge.competition.materials",
    name: "兵马未动",
    description: "把一场赛事的项目材料全部备齐",
    grade: "G3",
    sourceType: "progress",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "M",
    rule: { type: "competition.materialsReady" },
    rewardHint: "",
  },
  {
    id: "badge.competition.workshop",
    name: "工坊全勤",
    description: "完成一场赛事的创赛工坊全部任务",
    grade: "G4",
    sourceType: "progress",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "W",
    rule: { type: "competition.workshopTasksCompleted" },
    rewardHint: "",
  },
  {
    id: "badge.competition.results",
    name: "成果沉淀",
    description: "接受并归档至少 1 份工坊成果",
    grade: "G3",
    sourceType: "progress",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "R",
    rule: { type: "competition.resultsAccepted", min: 1 },
    rewardHint: "",
  },

  // -------- 模拟经营：App 行为（应用中心） --------
  {
    id: "badge.simulation.level2",
    name: "亮灯小店",
    description: "应用中心「我的创业小店」升级到 Lv.2",
    grade: "G3",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "Lv2",
    rule: { type: "simulation.level", min: 2 },
    rewardHint: "",
  },
  {
    id: "badge.simulation.level3",
    name: "人气店长",
    description: "应用中心「我的创业小店」升级到 Lv.3（人气小店）",
    grade: "G4",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "Lv3",
    rule: { type: "simulation.level", min: 3 },
    rewardHint: "",
  },
  {
    id: "badge.simulation.stockAndTraffic",
    name: "双线达人",
    description: "小店同时完成进货与拉客",
    grade: "G3",
    sourceType: "app-behavior",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "↻",
    rule: { type: "simulation.stockAndTraffic" },
    rewardHint: "",
  },
];

// 注意：可信证书不是徽章目录中的一个 tier，而是独立可信资产。
// 其资格定义见 ./certificates.ts（可信课程硬门槛 + 品相徽章组合 + 考核）。

// 便捷按 id 查
export const badgeById = (id: string) => badgeCatalog.find(item => item.id === id);
