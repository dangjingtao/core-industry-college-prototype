export type CourseSource =
  | { type: "platform"; label: string }
  | { type: "competition"; label: string; competitionId: string }
  | { type: "company"; label: string; companyId: string };

export type CourseCategory =
  | "all"
  | "opc"
  | "beauty-retail"
  | "rural-revitalization"
  | "ai-ecommerce"
  | "data-analytics"
  | "business-project"
  | "onboarding";

export type CourseEntitlement = "free" | "creditRequired" | "benefitRequired";

export type Course = {
  id: string;
  title: string;
  summary: string;
  description: string;
  source: CourseSource;
  duration: string;
  chapterCount: number;
  lessons: string[];
  entitlement: CourseEntitlement;
  cost: number;
  unlockBenefitId?: string;
  certificateId?: string;
  category: Exclude<CourseCategory, "all">;
  cover: string;
};

export type BenefitSource =
  | { type: "platform"; label: string }
  | { type: "competition"; label: string; competitionId: string }
  | { type: "company"; label: string; companyId: string }
  | { type: "activity"; label: string };

export type BenefitStatus = "eligible" | "ineligible" | "claimed" | "used" | "expired";

export type Benefit = {
  id: string;
  title: string;
  summary: string;
  source: BenefitSource;
  reason: string;
  expiresAt?: string;
  initialStatus: BenefitStatus;
  requiresCompetitionId?: string;
  externalUrl?: string;
  claimHint?: string;
  /** 是否通过后台绑定用户手机号，领取时无需再次输入 */
  bindPhone?: boolean;
  /** 券有效期（天），自领取之日起算 */
  couponValidityDays?: number;
  /** 同一账号/手机号每天限领次数 */
  dailyClaimLimit?: number;
};

export type CertificateRecord = {
  id: string;
  title: string;
  issuer: string;
  sourceType: "competition" | "course";
  competitionId?: string;
  courseId?: string;
  resultId?: string;
  verificationCode: string;
  status: "claimable" | "claimed" | "pending" | "revoked";
  issuedAt?: string;
};

export type CompetitionResultRecord = {
  id: string;
  competitionId: string;
  resultId?: string;
  grade: string;
  status: "pending" | "trusted" | "archived";
  certificateId?: string;
};

export type EducationIdentityStatus = "notBound" | "claimable" | "claimed" | "revoked";

export type EducationIdentityRecord = {
  id: string;
  name: string;
  school: string;
  major: string;
  studentId: string;
  verifiedBy: string;
  verificationCode: string;
  status: EducationIdentityStatus;
  issuedAt?: string;
};

export const courses: Course[] = [
  {
    id: "data-analytics",
    title: "商业数据分析基础",
    summary: "用真实业务指标完成从问题拆解、数据整理到复盘表达的基础训练。",
    description: "本课程围绕电商业务场景，教授如何提出正确的问题、整理多源数据、使用漏斗与留存模型定位关键节点，并用简洁的表达完成复盘。适合希望用数据驱动决策的参赛学生与职场新人。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "6 课时",
    chapterCount: 6,
    lessons: ["指标与问题", "数据整理", "漏斗分析", "复盘表达", "练习与考试", "成果确认"],
    entitlement: "free",
    cost: 0,
    certificateId: "cert-course-data-analytics",
    category: "data-analytics",
    cover: "from-[#6366f1] to-[#a855f7]",
  },
  {
    id: "brand-ecommerce",
    title: "品牌电商实战课",
    summary: "围绕三创赛美妆电商赛道，把用户洞察、内容运营和经营复盘串成一条实践链。",
    description: "以三创赛美妆电商赛道为背景，系统讲解用户洞察、商品表达、内容运营、直播转化与数据复盘。课程结束后可掌握一套可复用的品牌电商实践方法。",
    source: { type: "competition", label: "三创赛 · 美妆电商赛道", competitionId: "sanchuang-16" },
    duration: "8 课时",
    chapterCount: 8,
    lessons: ["赛道导入", "用户洞察", "商品表达", "内容运营", "直播与转化", "数据复盘", "项目复盘", "课程考试"],
    entitlement: "free",
    cost: 0,
    certificateId: "cert-course-brand-ecommerce",
    category: "beauty-retail",
    cover: "from-[#ec4899] to-[#f97316]",
  },
  {
    id: "retail-project-lab",
    title: "零售项目协作课",
    summary: "企业案例驱动的轻量项目课，训练需求澄清、协作与阶段汇报。",
    description: "云栖零售实验室联合打造的项目课，以真实零售场景为案例，训练需求澄清、协作记录、阶段汇报与成果复盘能力。完成课程可获得企业认证的项目经历证明。",
    source: { type: "company", label: "云栖零售实验室", companyId: "cloud-retail" },
    duration: "4 课时",
    chapterCount: 4,
    lessons: ["项目拆解", "协作记录", "阶段汇报", "成果复盘"],
    entitlement: "benefitRequired",
    cost: 0,
    unlockBenefitId: "benefit-cloud-lab",
    category: "business-project",
    cover: "from-[#0ea5e9] to-[#14b8a6]",
  },
  {
    id: "opc-methodology",
    title: "OPC 创新创业方法论",
    summary: "OPC 赛事通用能力课：从机会识别、产品构想到商业模式验证。",
    description: "OPC 赛事官方方法论课程，系统讲授机会识别、需求验证、产品原型、商业模式与路演表达。适用于准备参加 O'Campus、三创赛等创新创业赛事的学生。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "5 课时",
    chapterCount: 5,
    lessons: ["机会识别", "需求验证", "产品原型", "商业模式", "路演表达"],
    entitlement: "creditRequired",
    cost: 150,
    certificateId: "cert-course-opc-methodology",
    category: "opc",
    cover: "from-[#8b5cf6] to-[#6366f1]",
  },
  {
    id: "rural-ecommerce",
    title: "乡村振兴电商运营",
    summary: "农产品上行与乡村品牌打造的实战运营课程。",
    description: "聚焦农产品上行、乡村品牌打造与直播助农运营，讲解供应链组织、内容策划、社群运营与平台投放。帮助学生在乡村振兴赛道做出可落地的项目成果。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "6 课时",
    chapterCount: 6,
    lessons: ["农产品上行逻辑", "乡村品牌定位", "内容策划", "直播助农", "社群运营", "项目复盘"],
    entitlement: "creditRequired",
    cost: 120,
    certificateId: "cert-course-rural-ecommerce",
    category: "rural-revitalization",
    cover: "from-[#22c55e] to-[#16a34a]",
  },
  {
    id: "ai-ecommerce-agent",
    title: "AI 电商智能体实战",
    summary: "用大模型与智能体工具提升电商内容生产、客服与投放效率。",
    description: "系统讲解如何把 AI 大模型与智能体工具应用到电商场景，包括商品文案生成、智能客服、投放素材自动化与数据洞察助手。适合希望用 AI 提效的电商从业者。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "7 课时",
    chapterCount: 7,
    lessons: ["AI 电商概览", "内容生成", "智能客服", "投放助手", "数据洞察", "工作流搭建", "综合实战"],
    entitlement: "creditRequired",
    cost: 250,
    certificateId: "cert-course-ai-ecommerce-agent",
    category: "ai-ecommerce",
    cover: "from-[#06b6d4] to-[#3b82f6]",
  },
  {
    id: "app-guide",
    title: "App 使用指南",
    summary: "5 分钟带你熟悉首页、赛事、机会、学院与个人中心的核心动线。",
    description: "面向首次使用核心产业学院 App 的学生，快速介绍首页任务专区、赛事发现与报名、机会投递、学院学习、创赛福利与个人资产等一级能力，帮助你建立清晰的产品地图。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "3 课时",
    chapterCount: 3,
    lessons: ["认识首页", "参赛与就业主线", "学院与权益"],
    entitlement: "free",
    cost: 0,
    category: "onboarding",
    cover: "from-[#f59e0b] to-[#f97316]",
  },
  {
    id: "ai-tools-quickstart",
    title: "AI 工具快速入门",
    summary: "学会用 AI 辅助调研、文案、数据分析与路演准备。",
    description: "从学生真实参赛场景出发，演示如何用 AI 工具快速完成用户调研、商品文案、数据洞察与路演 PPT 准备，重点在于把 AI 当成协作助手，而不是替代思考。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "4 课时",
    chapterCount: 4,
    lessons: ["AI 能帮你做什么", "调研与文案", "数据与可视化", "路演材料准备"],
    entitlement: "free",
    cost: 0,
    category: "onboarding",
    cover: "from-[#8b5cf6] to-[#ec4899]",
  },
  {
    id: "first-competition-guide",
    title: "如何报名我的第一场创赛",
    summary: "从选赛、组队到提交报名的完整流程与常见注意事项。",
    description: "针对第一次参加创新创业比赛的学生，系统讲解如何选择合适的赛事、准备报名材料、组建团队、完成学校审核，以及报名后如何进入赛事工作区继续推进项目。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "3 课时",
    chapterCount: 3,
    lessons: ["选赛与组队", "报名与审核", "进入赛事工作区"],
    entitlement: "free",
    cost: 0,
    category: "onboarding",
    cover: "from-[#10b981] to-[#06b6d4]",
  },
];

export const benefits: Benefit[] = [
  {
    id: "benefit-tencent-map-ride",
    title: "腾讯地图出行打车券",
    summary: "腾讯地图合作出行券，领取后可在腾讯地图 App 内使用。",
    source: { type: "platform", label: "腾讯地图" },
    reason: "平台公共学生福利，登录后即可领取。",
    expiresAt: "2026-09-30",
    initialStatus: "eligible",
    externalUrl: "https://map.qq.com/?_wv=1027&coupon=student-ride",
    claimHint: "后台已绑定手机号，点击即可跳转 H5 领取。",
    bindPhone: true,
    couponValidityDays: 7,
    dailyClaimLimit: 1,
  },
  {
    id: "benefit-taobao-flash-takeout",
    title: "淘宝闪购无门槛外卖券",
    summary: "淘宝闪购合作外卖券，无门槛抵扣，领取后可在淘宝闪购使用。",
    source: { type: "platform", label: "淘宝闪购" },
    reason: "平台公共学生福利，登录后即可领取。",
    expiresAt: "2026-09-15",
    initialStatus: "eligible",
    externalUrl: "https://s.click.taobao.com/t?e=m%3D2%26s%3Dflash-takeout-coupon",
    claimHint: "后台已绑定手机号，点击即可跳转 H5 领取。",
    bindPhone: true,
    couponValidityDays: 7,
    dailyClaimLimit: 1,
  },
  {
    id: "benefit-luckin-coffee",
    title: "瑞幸咖啡饮品券",
    summary: "瑞幸咖啡合作饮品券，领取后可在瑞幸咖啡 App/小程序使用。",
    source: { type: "platform", label: "瑞幸咖啡" },
    reason: "平台公共学生福利，登录后即可领取。",
    expiresAt: "2026-09-30",
    initialStatus: "eligible",
    externalUrl: "https://www.luckincoffee.com/coupon?student=2026",
    claimHint: "后台已绑定手机号，点击即可跳转 H5 领取。",
    bindPhone: true,
    couponValidityDays: 7,
    dailyClaimLimit: 1,
  },
  {
    id: "benefit-cotti-coffee",
    title: "库迪咖啡饮品券",
    summary: "库迪咖啡合作饮品券，领取后可在库迪咖啡 App/小程序使用。",
    source: { type: "platform", label: "库迪咖啡" },
    reason: "平台公共学生福利，登录后即可领取。",
    expiresAt: "2026-09-30",
    initialStatus: "eligible",
    externalUrl: "https://www.cotticoffee.com/coupon?student=2026",
    claimHint: "后台已绑定手机号，点击即可跳转 H5 领取。",
    bindPhone: true,
    couponValidityDays: 7,
    dailyClaimLimit: 1,
  },
  {
    id: "benefit-campus-video",
    title: "校园视频会员月卡",
    summary: "平台合作权益，领取后在有效期内兑换使用。",
    source: { type: "platform", label: "核心产业学院" },
    reason: "完成账号资料后开放的通用学生权益。",
    expiresAt: "2026-09-30",
    initialStatus: "eligible",
  },
  {
    id: "benefit-beauty-sample",
    title: "北辰美妆校园体验权益",
    summary: "赛事合作品牌提供的校园体验资格。",
    source: { type: "company", label: "北辰美妆", companyId: "northstar-beauty" },
    reason: "当前账号具备三创赛相关学生身份，且符合合作活动资格。",
    expiresAt: "2026-08-31",
    initialStatus: "claimed",
    requiresCompetitionId: "sanchuang-16",
  },
  {
    id: "benefit-cloud-lab",
    title: "云栖零售项目课学习资格",
    summary: "企业共建项目课的学习兑换资格。",
    source: { type: "company", label: "云栖零售实验室", companyId: "cloud-retail" },
    reason: "由企业合作项目开放，领取后解锁对应项目课。",
    expiresAt: "2026-10-31",
    initialStatus: "eligible",
  },
  {
    id: "benefit-sanchuang-course",
    title: "赛道路演课学习资格",
    summary: "三创赛参赛期提供的赛事学习权益；领取记录长期保留。",
    source: { type: "competition", label: "第十六届三创赛", competitionId: "sanchuang-16" },
    reason: "由赛事身份授予，不等同赛事 workspace 权限。",
    expiresAt: "2026-10-15",
    initialStatus: "eligible",
    requiresCompetitionId: "sanchuang-16",
  },
  {
    id: "benefit-activity-ride",
    title: "青年创新日出行券",
    summary: "线下活动现场发放的出行权益。",
    source: { type: "activity", label: "青年创新日" },
    reason: "仅面向已完成活动签到的学生。",
    expiresAt: "2026-08-20",
    initialStatus: "ineligible",
  },
  {
    id: "benefit-history",
    title: "历史赛事资料兑换权益",
    summary: "历史权益保留状态，不再允许使用。",
    source: { type: "competition", label: "第十五届三创赛", competitionId: "sanchuang-15" },
    reason: "赛事与权益有效期均已结束。",
    expiresAt: "2025-09-01",
    initialStatus: "expired",
    requiresCompetitionId: "sanchuang-15",
  },
];

export const initialCertificates: CertificateRecord[] = [
  {
    id: "cert-sanchuang-15",
    title: "第十五届三创赛参赛与项目成果证书",
    issuer: "三创赛组委会",
    sourceType: "competition",
    competitionId: "sanchuang-15",
    resultId: "result-s5-score-precheck",
    verificationCode: "SC15-TOMZ-24001",
    status: "claimed",
    issuedAt: "2025-08-28",
  },
  {
    id: "cert-course-data-analytics",
    title: "商业数据分析基础课程证书",
    issuer: "核心产业学院",
    sourceType: "course",
    courseId: "data-analytics",
    verificationCode: "COURSE-DA-26001",
    status: "claimable",
  },
];

export const initialCompetitionResults: CompetitionResultRecord[] = [
  {
    id: "competition-result-sanchuang-15",
    competitionId: "sanchuang-15",
    resultId: "result-s5-score-precheck",
    grade: "校赛一等奖",
    status: "trusted",
    certificateId: "cert-sanchuang-15",
  },
  {
    id: "competition-result-sanchuang-16",
    competitionId: "sanchuang-16",
    resultId: "result-s1-product-score",
    grade: "赛事进行中 · 阶段成果",
    status: "pending",
  },
];

export const initialEducationIdentity: EducationIdentityRecord = {
  id: "edu-identity-001",
  name: "陈同学",
  school: "华南商贸学院",
  major: "电子商务",
  studentId: "2022010847",
  verifiedBy: "学信网",
  verificationCode: "CHSI-2022010847-26001",
  status: "claimable",
};

export type ExchangeCategory = "all" | "course" | "ticket" | "virtual";

export type ExchangeItem = {
  id: string;
  title: string;
  summary: string;
  category: Exclude<ExchangeCategory, "all">;
  courseId?: string;
  cost: number;
  claimedCount: number;
  status: "available" | "outOfStock" | "exchanged";
};

export const exchangeItems: ExchangeItem[] = [
  { id: "exchange-course-data", title: "商业数据分析基础课", summary: "平台公共课程兑换资格", category: "course", courseId: "data-analytics", cost: 200, claimedCount: 342, status: "available" },
  { id: "exchange-course-brand", title: "品牌电商实战课", summary: "三创赛美妆电商赛道课程", category: "course", courseId: "brand-ecommerce", cost: 300, claimedCount: 189, status: "available" },
  { id: "exchange-lab-cloud", title: "云栖零售项目课", summary: "企业共建项目课学习资格", category: "course", courseId: "retail-project-lab", cost: 400, claimedCount: 76, status: "available" },
  { id: "exchange-ride", title: "青年创新日出行券", summary: "线下活动现场出行权益", category: "ticket", cost: 50, claimedCount: 512, status: "outOfStock" },
  { id: "exchange-video", title: "校园视频会员月卡", summary: "平台合作视频会员权益", category: "virtual", cost: 150, claimedCount: 1205, status: "available" },
  { id: "exchange-cloud-storage", title: "云笔记年度会员", summary: "在线云笔记与文档协作权益", category: "virtual", cost: 120, claimedCount: 890, status: "available" },
  { id: "exchange-music-vip", title: "音乐平台月度会员", summary: "主流音乐平台月度畅听权益", category: "virtual", cost: 100, claimedCount: 567, status: "available" },
  { id: "exchange-mock-exam", title: "商业分析模拟考", summary: "在线模拟考试与能力测评", category: "ticket", cost: 80, claimedCount: 230, status: "available" },
];

export type LearningCreditRecord = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  time: string;
};

export const learningCreditRecords: LearningCreditRecord[] = [
  { id: "credit-1", title: "完善学生资料", amount: 100, type: "income", time: "2026-08-01 10:23" },
  { id: "credit-2", title: "报名第十五届三创赛", amount: 200, type: "income", time: "2026-08-03 14:05" },
  { id: "credit-3", title: "完成商业数据分析基础课", amount: 150, type: "income", time: "2026-08-08 16:40" },
  { id: "credit-4", title: "兑换品牌电商实战课", amount: -300, type: "expense", time: "2026-08-10 09:12" },
  { id: "credit-5", title: "参与创赛工坊任务", amount: 80, type: "income", time: "2026-08-12 11:30" },
];

export const courseById = (id?: string) => courses.find(item => item.id === id);
export const benefitById = (id?: string) => benefits.find(item => item.id === id);
export const exchangeItemById = (id?: string) => exchangeItems.find(item => item.id === id);
