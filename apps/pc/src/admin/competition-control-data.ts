export type CompetitionControlSource = "平台配置" | "API 同步" | "文件导入" | "人工修正" | "Runtime";
export type RegistrationMode = "platformPortal" | "externalUrl" | "thirdPartyApi" | "offline";
export type PlatformReviewStatus = "pending" | "approved" | "rejected";
export type OfficialQualificationStatus = "pending" | "confirmed" | "rejected" | "notRequired";

export type CompetitionControlRecord = {
  id: string;
  name: string;
  status: "upcoming" | "registrationOpen" | "inProgress" | "ended";
  source: CompetitionControlSource;
  sourceDetail: string;
  organizer: string;
  organizerId?: string;
  authorityMode: "externalAuthority" | "platformConfigured";
  tracks: { id: string; name: string; group: string }[];
  registration: {
    mode: RegistrationMode;
    label: string;
    detail: string;
    portalPath?: string;
  };
  sync: {
    state: "healthy" | "attention" | "notRequired";
    lastSync: string;
    priority: string;
    fallback: string;
    conflictPolicy: string;
  };
  qualification: {
    platformReview: PlatformReviewStatus;
    officialQualification: OfficialQualificationStatus;
    workspaceRule: string;
  };
  windows: {
    official: { label: string; value: string; owner: string }[];
    local: { id: string; label: string; value: string; owner: string; scope: string }[];
  };
  schoolScope: {
    reviewOwnerRule: string;
    authorizedSchools: string[];
    note: string;
  };
  team: {
    id: string;
    name: string;
    captainSchool: string;
    members: { id: string; name: string; role: string; school: string }[];
  };
  project: {
    id: string;
    name: string;
    track: string;
    summary: string;
    stage: string;
  };
  resources: { id: string; title: string; category: string; source: CompetitionControlSource; updatedAt: string }[];
  services: {
    courses: { id: string; name: string }[];
    benefits: { id: string; name: string }[];
    activities: { id: string; name: string }[];
  };
  workshop: {
    enabled: boolean;
    scope: string;
    lifecycle: string;
    skillPack: string[];
    privacy: string;
  };
  teacherScope: {
    allowed: string[];
    denied: string[];
  };
  appConsumers: string[];
  relations: { label: string; stableId: string; to?: string }[];
};

export const registrationModeLabels: Record<RegistrationMode, string> = {
  platformPortal: "平台承接门户",
  externalUrl: "外部 URL",
  thirdPartyApi: "API / 第三方系统",
  offline: "无线上报名",
};

export const competitionControlRecords: CompetitionControlRecord[] = [
  {
    id: "sanchuang-16",
    name: "第十六届全国大学生电子商务“创新、创意及创业”挑战赛",
    status: "registrationOpen",
    source: "API 同步",
    sourceDetail: "外部权威赛事事实以官方 API 为优先来源；平台承接报名流程与学院叠加服务分别保留自己的责任边界。",
    organizer: "全国大学生电子商务“创新、创意及创业”挑战赛竞赛组织委员会",
    authorityMode: "externalAuthority",
    tracks: [
      { id: "track-ecommerce", name: "常规赛", group: "电子商务" },
      { id: "track-industry", name: "实战赛", group: "产教融合" },
    ],
    registration: {
      mode: "platformPortal",
      label: "当前响应式三创赛报名门户",
      detail: "沿用 /registration-portal/*，PC02 不在 /admin 重建报名表。",
      portalPath: "/registration-portal/start",
    },
    sync: {
      state: "healthy",
      lastSync: "2026-08-18 10:40",
      priority: "官方 API",
      fallback: "文件导入 → 人工校对",
      conflictPolicy: "API 默认权威；人工覆盖必须填写原因并进入审计，后续同步冲突必须显式提示。",
    },
    qualification: {
      platformReview: "pending",
      officialQualification: "pending",
      workspaceRule: "学校审核通过只代表平台流程完成；必须等待外部权威资格 confirmed 后才能进入正式 Workspace。",
    },
    windows: {
      official: [
        { label: "官方统一报名窗口", value: "2026-08-01 → 2026-09-30", owner: "外部权威赛事源" },
        { label: "官方赛事阶段", value: "报名阶段", owner: "外部权威赛事源" },
      ],
      local: [
        { id: "node-south-campus", label: "华南商贸学院校赛材料截止", value: "2026-09-18 18:00", owner: "平台运营代录", scope: "华南商贸学院" },
      ],
    },
    schoolScope: {
      reviewOwnerRule: "跨校团队由队长所在学校统一审核整个团队",
      authorizedSchools: ["华南商贸学院"],
      note: "学校老师只获得当前赛事 + 当前授权学校的数据 Scope；不因队员跨校而扩张到其它学校长期数据。",
    },
    team: {
      id: "team-1",
      name: "山城新零售队",
      captainSchool: "华南商贸学院",
      members: [
        { id: "member-linxiao", name: "林晓", role: "队长 / 项目统筹", school: "华南商贸学院" },
        { id: "member-chenyu", name: "陈语", role: "内容运营", school: "岭南科技学院" },
        { id: "member-zhouyue", name: "周越", role: "数据分析", school: "华南商贸学院" },
      ],
    },
    project: {
      id: "project-1",
      name: "岭南植物精粹校园新零售计划",
      track: "美妆电商 / 新零售",
      summary: "赛事期 CompetitionProject，用于承接报名材料、团队工作区与赛事成果，不升级为跨赛事长期 Project 主数据。",
      stage: "项目诊断与运营验证",
    },
    resources: [
      { id: "rules-2026", title: "第十六届三创赛参赛规则", category: "规则", source: "API 同步", updatedAt: "2026-08-12" },
      { id: "pitch-template", title: "路演 PPT 结构模板", category: "模板", source: "平台配置", updatedAt: "2026-08-15" },
      { id: "beauty-research", title: "美妆新零售赛道资料包", category: "资料", source: "平台配置", updatedAt: "2026-08-16" },
    ],
    services: {
      courses: [{ id: "brand-ecommerce", name: "品牌电商实战课" }],
      benefits: [{ id: "benefit-beauty-sample", name: "北辰美妆校园体验权益" }],
      activities: [{ id: "activity-roadshow", name: "校赛路演训练营" }],
    },
    workshop: {
      enabled: true,
      scope: "competitionId=sanchuang-16",
      lifecycle: "inProgress",
      skillPack: ["S1 项目洞察", "S2 项目诊断", "S3 平台运营", "S4 数据复盘", "S5 项目冲刺", "S6 职业规划"],
      privacy: "PC 只配置赛事 scope、能力包与生命周期；学校老师和赛事运营默认不可读取学生的 Workshop 私人回答 / AI 内容。",
    },
    teacherScope: {
      allowed: ["当前赛事报名资料", "当前授权学校的团队与成员", "CompetitionProject 材料", "必要联系方式", "学校审核状态", "被授权赛事变更事项"],
      denied: ["学生其它赛事", "长期问卷 / 画像", "求职简历", "投递记录", "权益消费记录", "Workshop 私人回答 / AI 内容", "与审核无关的长期账号数据"],
    },
    appConsumers: [
      "/competitions",
      "/competitions/sanchuang-16",
      "/registration → /registration-portal/*",
      "/competitions/sanchuang-16/workspace",
      "/competitions/sanchuang-16/workspace/team",
      "/competitions/sanchuang-16/workspace/resources",
      "/competitions/sanchuang-16/workshop",
    ],
    relations: [
      { label: "北辰美妆", stableId: "northstar-beauty", to: "/admin/organizations/objects/northstar-beauty" },
      { label: "品牌电商实战课", stableId: "brand-ecommerce" },
      { label: "北辰美妆校园体验权益", stableId: "benefit-beauty-sample" },
    ],
  },
  {
    id: "innovation-cup-2026",
    name: "2026 青年品牌创新挑战赛",
    status: "upcoming",
    source: "平台配置",
    sourceDetail: "普通合作赛事由平台赛事运营直接配置；仍使用同一 Competition 控制面与 stable id 规则。",
    organizer: "青年品牌创新联盟",
    authorityMode: "platformConfigured",
    tracks: [
      { id: "track-brand", name: "品牌创新赛道", group: "综合组" },
    ],
    registration: {
      mode: "platformPortal",
      label: "平台承接报名",
      detail: "复用平台报名接入能力；该赛事不依赖三创赛专属字段。",
    },
    sync: {
      state: "notRequired",
      lastSync: "—",
      priority: "平台配置",
      fallback: "文件导入可作为批量运营入口",
      conflictPolicy: "不存在外部权威 API 冲突；人工修正仍需保留原因与审计。",
    },
    qualification: {
      platformReview: "approved",
      officialQualification: "notRequired",
      workspaceRule: "该合作赛事不要求外部权威资格回流；平台资格规则满足后即可按赛事生命周期开放 Workspace。",
    },
    windows: {
      official: [
        { label: "平台报名窗口", value: "2026-09-01 → 2026-10-15", owner: "平台赛事运营" },
      ],
      local: [],
    },
    schoolScope: {
      reviewOwnerRule: "按赛事配置学校 Scope；如出现跨校团队，仍由队长学校统一审核",
      authorizedSchools: ["华南商贸学院", "岭南科技学院"],
      note: "同一 SchoolScope 模型适用于普通合作赛事，不建立三创赛专属学校权限表。",
    },
    team: {
      id: "team-brand-lab",
      name: "校园品牌实验室",
      captainSchool: "岭南科技学院",
      members: [
        { id: "member-yiran", name: "易然", role: "队长", school: "岭南科技学院" },
        { id: "member-xiaoyu", name: "肖宇", role: "产品", school: "岭南科技学院" },
      ],
    },
    project: {
      id: "project-brand-2026",
      name: "校园轻运动品牌验证计划",
      track: "品牌创新",
      summary: "同样是赛事期 CompetitionProject；赛事结束后仅把摘要、经历、团队角色与可信成果 handoff 到长期资产。",
      stage: "报名准备",
    },
    resources: [
      { id: "brand-cup-guide", title: "赛事说明与提交规范", category: "规则", source: "平台配置", updatedAt: "2026-08-18" },
    ],
    services: {
      courses: [{ id: "course-brand-basics", name: "品牌验证基础课" }],
      benefits: [],
      activities: [{ id: "activity-brand-clinic", name: "品牌诊断开放日" }],
    },
    workshop: {
      enabled: true,
      scope: "competitionId=innovation-cup-2026",
      lifecycle: "notStarted",
      skillPack: ["S1 项目洞察", "S2 项目诊断", "S5 项目冲刺"],
      privacy: "复用赛事 scope 的 Workshop 配置；不开放学生私人回答和 AI 内容给学校或赛事组织方。",
    },
    teacherScope: {
      allowed: ["当前赛事报名资料", "授权学校团队与成员", "CompetitionProject 材料", "审核状态"],
      denied: ["学生其它赛事", "长期画像", "求职简历与投递", "权益消费记录", "Workshop 私人回答 / AI 内容"],
    },
    appConsumers: [
      "/competitions",
      "/competitions/innovation-cup-2026",
      "/registration",
      "/competitions/innovation-cup-2026/workspace",
      "/competitions/innovation-cup-2026/workshop",
    ],
    relations: [
      { label: "品牌验证基础课", stableId: "course-brand-basics" },
      { label: "品牌诊断开放日", stableId: "activity-brand-clinic" },
    ],
  },
];

export function competitionControlById(competitionId: string | undefined) {
  return competitionControlRecords.find(record => record.id === competitionId);
}
