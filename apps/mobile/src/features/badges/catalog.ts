// 徽章目录（运营可配置；研发只提供基座）
// 类型：徽章定义、达成条件、来源与品相
// 说明：徽章规则由 catalog 配置，不在组件里硬编码。组件只读取 catalog 渲染，并调用规则引擎判定。

export type BadgeTier = "low" | "high" | "cert";

export type BadgeSource =
  | "app-behavior"
  | "checkin"
  | "newbie"
  | "ad-watch"
  | "course"
  | "competition"
  | "simulation"
  | "benefit"
  | "welfare"
  | "profile"
  | "resume";

export type BadgeRule =
  // APP 行为
  | { type: "checkin.streak"; min: number }
  | { type: "checkin.today" }
  | { type: "newbie.completed" }
  | { type: "ad.watched"; min: number }
  | { type: "welfare.helped"; min: number }
  | { type: "profile.complete" }
  | { type: "resume.firstEdit" }
  // 课程
  | { type: "course.completed"; courseId: string }
  | { type: "course.completedCount"; min: number }
  | { type: "course.checkpointPassed"; courseId: string }
  | { type: "course.checkpointPassedCount"; min: number }
  // 赛事
  | { type: "competition.registered" }
  | { type: "competition.ended" }
  // 模拟经营
  | { type: "simulation.level"; min: number }
  | { type: "simulation.stockAndTraffic" }
  // 权益
  | { type: "benefit.claimed"; min: number }
  // 组合
  | { type: "anyOf"; rules: BadgeRule[] };

export type BadgeCatalogEntry = {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  source: BadgeSource;
  iconColor: string; // 徽章底色
  iconKey: string; // 简单标识字符（避免对 icon 库产生强依赖）
  rule: BadgeRule;
  /** 展示用：达成该徽章后可获得什么（标注待 F04 Decision A 暂定） */
  rewardHint: string;
};

export const badgeCatalog: BadgeCatalogEntry[] = [
  // -------- 低级徽章：APP 行为 / 日常小任务 --------
  {
    id: "badge.checkin.first",
    name: "初次打卡",
    description: "完成第一次每日打卡",
    tier: "low",
    source: "checkin",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "✓",
    rule: { type: "checkin.today" },
    rewardHint: "",
  },
  {
    id: "badge.checkin.streak3",
    name: "坚持 3 天",
    description: "连续打卡 3 天",
    tier: "low",
    source: "checkin",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "3",
    rule: { type: "checkin.streak", min: 3 },
    rewardHint: "",
  },
  {
    id: "badge.checkin.streak7",
    name: "坚持 7 天",
    description: "连续打卡 7 天",
    tier: "low",
    source: "checkin",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "7",
    rule: { type: "checkin.streak", min: 7 },
    rewardHint: "",
  },
  {
    id: "badge.ad.watched1",
    name: "广告体验官",
    description: "完成 1 次激励视频广告观看",
    tier: "low",
    source: "ad-watch",
    iconColor: "bg-[#fff7df] text-[#946218]",
    iconKey: "▶",
    rule: { type: "ad.watched", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.profile.complete",
    name: "有头有脸",
    description: "完善学生基础资料",
    tier: "low",
    source: "profile",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "ID",
    rule: { type: "profile.complete" },
    rewardHint: "",
  },
  {
    id: "badge.welfare.helped1",
    name: "温暖传递",
    description: "完成 1 次公益助力",
    tier: "low",
    source: "welfare",
    iconColor: "bg-[#ffe9e9] text-[#c0392b]",
    iconKey: "♥",
    rule: { type: "welfare.helped", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.benefit.claimed1",
    name: "福利首领取",
    description: "领取第 1 份创赛福利",
    tier: "low",
    source: "benefit",
    iconColor: "bg-[#fff7df] text-[#946218]",
    iconKey: "★",
    rule: { type: "benefit.claimed", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.resume.firstEdit",
    name: "履历开启",
    description: "完成长期简历首次编辑",
    tier: "low",
    source: "resume",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "✎",
    rule: { type: "resume.firstEdit" },
    rewardHint: "",
  },

  // -------- 高级徽章：课程 / 赛事 / 模拟经营（深度能力证明） --------
  {
    id: "badge.newbie.completed",
    name: "新生上路",
    description: "完成全部新手任务",
    tier: "high",
    source: "newbie",
    iconColor: "bg-[#e9f6f1] text-[#247456]",
    iconKey: "★",
    rule: { type: "newbie.completed" },
    rewardHint: "",
  },
  {
    id: "badge.course.first",
    name: "学有所成",
    description: "通过 1 门课程的所有关卡小测",
    tier: "high",
    source: "course",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "C1",
    rule: { type: "course.checkpointPassedCount", min: 1 },
    rewardHint: "",
  },
  {
    id: "badge.course.three",
    name: "进阶学习者",
    description: "累计通过 3 门课程的所有关卡小测",
    tier: "high",
    source: "course",
    iconColor: "bg-[#eaf5ff] text-[#2879d0]",
    iconKey: "C3",
    rule: { type: "course.checkpointPassedCount", min: 3 },
    rewardHint: "",
  },
  {
    id: "badge.competition.registered",
    name: "赛场启程",
    description: "成功报名一场赛事",
    tier: "high",
    source: "competition",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "S",
    rule: { type: "competition.registered" },
    rewardHint: "",
  },
  {
    id: "badge.competition.ended",
    name: "完成一场赛事",
    description: "经历至少一场赛事至结束",
    tier: "high",
    source: "competition",
    iconColor: "bg-[#f3efff] text-[#6f4bc2]",
    iconKey: "🏁",
    rule: { type: "competition.ended" },
    rewardHint: "",
  },
  {
    id: "badge.simulation.level2",
    name: "亮灯小店",
    description: "应用中心「我的创业小店」升级到 Lv.2",
    tier: "high",
    source: "simulation",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "Lv2",
    rule: { type: "simulation.level", min: 2 },
    rewardHint: "",
  },
  {
    id: "badge.simulation.level3",
    name: "人气店长",
    description: "应用中心「我的创业小店」升级到 Lv.3（人气小店）",
    tier: "high",
    source: "simulation",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "Lv3",
    rule: { type: "simulation.level", min: 3 },
    rewardHint: "",
  },
  {
    id: "badge.simulation.stockAndTraffic",
    name: "双线达人",
    description: "小店同时完成进货与拉客",
    tier: "high",
    source: "simulation",
    iconColor: "bg-[#fff2e8] text-[#c45b1b]",
    iconKey: "↻",
    rule: { type: "simulation.stockAndTraffic" },
    rewardHint: "",
  },
];

// 便捷按 id 查
export const badgeById = (id: string) => badgeCatalog.find(item => item.id === id);
