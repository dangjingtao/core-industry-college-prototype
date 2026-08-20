export type WelfareStatus = "upcoming" | "active" | "ended";

export type WelfareRewardType = "creditGrowth" | "creditPoints" | "certificate" | "none";

export type WelfareSponsor = {
  name: string;
  description?: string;
};

export type WelfareProject = {
  id: string;
  title: string;
  summary: string;
  description: string;
  cover: string;
  status: WelfareStatus;
  startAt: string;
  endAt: string;
  /** 目标助力次数 */
  goal: number;
  /** 当前助力次数（种子数据，运行时会由 store 维护） */
  current: number;
  sponsor: WelfareSponsor;
  /** 奖励类型，F04 Decision A 前仅作占位展示 */
  rewardType: WelfareRewardType;
  /** 奖励数值或描述，F04 Decision A 前仅作占位展示 */
  rewardValue?: number;
  rewardDescription?: string;
  /** 是否作为首页主推位展示 */
  featured: boolean;
};

export const welfareProjects: WelfareProject[] = [
  {
    id: "welfare-rural-ai-code",
    title: "乡村儿童 AI 编程启蒙计划",
    summary: "每完成一次助力，即可为乡村儿童解锁一节 AI 编程启蒙课。",
    description: "本项目联合高校志愿者与在线教育平台，为偏远地区中小学生提供零门槛的 AI 与编程启蒙课程。你的每一次助力，都会直接兑换成一节面向乡村儿童的课程内容，帮助他们更早接触数字工具与创意思维。",
    cover: "from-[#2563eb] to-[#06b6d4]",
    status: "active",
    startAt: "2026-08-01",
    endAt: "2026-10-31",
    goal: 5000,
    current: 1246,
    sponsor: { name: "核心产业学院 · 公益创新实验室", description: "聚焦教育公平的长期公益计划" },
    rewardType: "creditGrowth",
    rewardValue: 20,
    rewardDescription: "预计可获得 20 学力值成长值（待 F04 决策确认）",
    featured: true,
  },
  {
    id: "welfare-green-campus",
    title: "大学生绿色消费倡导行动",
    summary: "观看一段公益倡导视频，助力低碳校园理念传播。",
    description: "通过轻量互动与公益视频传播，鼓励大学生关注绿色消费、减少一次性用品使用。项目达标后，将联合合作品牌在校园内投放可循环用品体验站。",
    cover: "from-[#16a34a] to-[#84cc16]",
    status: "active",
    startAt: "2026-08-15",
    endAt: "2026-09-30",
    goal: 3000,
    current: 587,
    sponsor: { name: "绿色未来青年联盟", description: "青年低碳行动倡导组织" },
    rewardType: "creditGrowth",
    rewardValue: 15,
    rewardDescription: "预计可获得 15 学力值成长值（待 F04 决策确认）",
    featured: false,
  },
  {
    id: "welfare-older-digital",
    title: "银发数字助老计划",
    summary: "助力一次，即可为社区老人兑换一节智能手机使用课。",
    description: "面向社区老年人群体，提供智能手机基础操作、防诈骗识别、线上挂号与出行工具使用等课程。你的助力将直接用于课程物料与志愿者补贴。",
    cover: "from-[#f59e0b] to-[#ef4444]",
    status: "upcoming",
    startAt: "2026-09-10",
    endAt: "2026-11-30",
    goal: 2000,
    current: 0,
    sponsor: { name: "社区数字普惠中心", description: "社区助老志愿服务网络" },
    rewardType: "certificate",
    rewardDescription: "累计助力 3 次可获得公益参与电子证书（待 F04 决策确认）",
    featured: false,
  },
];

export function welfareProjectById(id: string): WelfareProject | undefined {
  return welfareProjects.find(project => project.id === id);
}
