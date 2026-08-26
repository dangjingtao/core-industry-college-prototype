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

/** 关卡小测节点：固定学习进程处发放小测，通过后可触发对应高级徽章。 */
export type CourseCheckpoint = {
  id: string;
  title: string;
  /** 触发该关卡对应的学习进程比例（0-1），用于判断是否解锁。 */
  unlockAt: number;
  /** 简易题库：3 道题，每题 1 分，及格分 2 */
  questions: { id: string; prompt: string; options: string[]; answer: number }[];
};

/** 结业小考：学完全部内容后的综合考试，通过后可获得证书类徽章。 */
export type CourseFinalExam = {
  id: string;
  totalQuestions: number;
  passingScore: number;
  status: "draft" | "open" | "closed";
  /** 真实题库：单选，每题 1 分 */
  questions?: { id: string; prompt: string; options: string[]; answer: number }[];
};

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
  /** 关卡小测节点：每个学习节点对应一个小测，通过后获得对应高级徽章 */
  checkpoints?: CourseCheckpoint[];
  /** 结业小考：学完全部内容后的综合考试，通过后获得结业高级徽章 */
  finalExam?: CourseFinalExam;
  /** 可信证书兑换门槛：需要达到的高级/低级徽章数量 */
  certBadgeRequirement?: {
    /** 需要的高级徽章数量（含课程节点 + 结业，可来自任意课程） */
    highBadgeCount: number;
    /** 需要的低级徽章数量（可来自任意方面：签到、公益、广告等） */
    lowBadgeCount: number;
  };
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
  /** 是否通过接口直接发放到已绑定手机号（替代外部 H5 跳转领取） */
  apiIssued?: boolean;
  /** apiIssued 时提示用户前往使用的目标 App 名称 */
  useInApp?: string;
  /** 是否通过后台绑定用户手机号，领取时无需再次输入 */
  bindPhone?: boolean;
  /** 券有效期（天），自领取之日起算 */
  couponValidityDays?: number;
  /** 同一账号/手机号每天限领次数 */
  dailyClaimLimit?: number;
  /** 是否为徽章门槛大礼包（运营后台动态配置） */
  isGiftPack?: boolean;
  /** 徽章门槛：需要的高级 / 低级徽章数量 */
  badgeRequirement?: {
    highBadgeCount: number;
    lowBadgeCount: number;
  };
  /** 大礼包内容描述（运营配置的福利明细） */
  giftPackContent?: string[];
  /** 大礼包封面色（渐变 from-to） */
  giftPackCover?: string;
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
    checkpoints: [
      {
        id: "data-analytics-cp-1",
        title: "关卡一 · 指标与问题",
        unlockAt: 0.17,
        questions: [
          { id: "q1", prompt: "在电商业务中，「转化率」最常被定义为？", options: ["访客数 ÷ 下单数", "下单数 ÷ 访客数", "支付数 ÷ 访客数", "加购数 ÷ 访客数"], answer: 1 },
          { id: "q2", prompt: "拆解业务问题时，下列哪个优先级最低？", options: ["北极星指标", "一级漏斗", "二级漏斗", "页面按钮颜色"], answer: 3 },
          { id: "q3", prompt: "下面哪个指标最适合作为「复盘」切入点？", options: ["UV", "GMV", "退款率", "跳出率"], answer: 1 },
        ],
      },
      {
        id: "data-analytics-cp-2",
        title: "关卡二 · 数据整理",
        unlockAt: 0.34,
        questions: [
          { id: "q1", prompt: "数据清洗中，「去重」最核心的目的是？", options: ["减少文件体积", "避免同一用户被重复计算", "让数据更好看", "减少列数"], answer: 1 },
          { id: "q2", prompt: "下列哪种数据源属于「行为数据」？", options: ["用户注册信息", "商品价格", "页面点击记录", "库存数量"], answer: 2 },
          { id: "q3", prompt: "多源数据整合时，最重要的第一步是？", options: ["直接合并", "确认统一的用户标识 key", "挑最大的表做主表", "先做可视化"], answer: 1 },
        ],
      },
      {
        id: "data-analytics-cp-3",
        title: "关卡三 · 漏斗分析",
        unlockAt: 0.5,
        questions: [
          { id: "q1", prompt: "漏斗分析的核心目的是？", options: ["找到最大流失环节", "看绝对数值大小", "看 ROI", "对比行业均值"], answer: 0 },
          { id: "q2", prompt: "一个典型电商转化漏斗的正确顺序是？", options: ["支付 → 下单 → 加购 → 浏览", "浏览 → 加购 → 下单 → 支付", "加购 → 浏览 → 下单 → 支付", "下单 → 浏览 → 加购 → 支付"], answer: 1 },
          { id: "q3", prompt: "某环节转化率异常低，首先应该？", options: ["立刻优化该环节 UI", "确认数据口径是否变化", "直接加大投放", "怀疑系统 bug"], answer: 1 },
        ],
      },
      {
        id: "data-analytics-cp-4",
        title: "关卡四 · 复盘表达",
        unlockAt: 0.67,
        questions: [
          { id: "q1", prompt: "复盘时，下列哪种说法更可取？", options: ["凭印象总结", "用具体数字 + 假设 + 验证", "只看结果", "只挑好的一面"], answer: 1 },
          { id: "q2", prompt: "一份好的数据复盘报告，最重要的是？", options: ["图表多", "结论可落地行动", "页数多", "术语专业"], answer: 1 },
          { id: "q3", prompt: "「归因」指的是？", options: ["把数据归档", "找到结果背后的关键原因", "给数据起名字", "数据备份"], answer: 1 },
        ],
      },
      {
        id: "data-analytics-cp-5",
        title: "关卡五 · 练习与考试",
        unlockAt: 0.84,
        questions: [
          { id: "q1", prompt: "GMV 突增后，下列哪个验证最有价值？", options: ["是不是单次活动", "看 UV 是否同步涨", "看客服投诉", "看广告占比"], answer: 0 },
          { id: "q2", prompt: "A/B 实验的核心前提是？", options: ["两组用户数量完全相等", "两组用户随机分配，除变量外其他条件一致", "必须在同一天完成", "必须有 10 万以上用户"], answer: 1 },
          { id: "q3", prompt: "下列哪个维度最适合用于「用户分层」？", options: ["用户头像颜色", "用户注册渠道 + 消费频次", "用户手机型号", "用户昵称长度"], answer: 1 },
        ],
      },
      {
        id: "data-analytics-cp-6",
        title: "关卡六 · 成果确认",
        unlockAt: 1.0,
        questions: [
          { id: "q1", prompt: "「数据驱动」最准确的理解是？", options: ["只看数字做决策", "用数据验证假设、辅助判断，而非替代思考", "数据越多越好", "只有拿到完美数据才能行动"], answer: 1 },
          { id: "q2", prompt: "留存分析最关注的是？", options: ["新用户总量", "用户在一段时间后的回访比例", "用户地域分布", "用户设备类型"], answer: 1 },
          { id: "q3", prompt: "课程结束后，学习成果会保存在哪里？", options: ["只在本课程内", "可信空间的长期学习记录", "本地缓存，清理就没了", "只在赛事里"], answer: 1 },
        ],
      },
    ],
    finalExam: {
      id: "data-analytics-final",
      totalQuestions: 8,
      passingScore: 6,
      status: "open",
      questions: [
        { id: "q1", prompt: "在电商业务漏斗分析中，「转化率」最核心的定义是？", options: ["支付用户数 ÷ 访客数", "下单用户数 ÷ 访客数", "加购用户数 ÷ 访客数", "收藏用户数 ÷ 访客数"], answer: 1 },
        { id: "q2", prompt: "拆解业务问题时，以下哪个指标通常作为「北极星指标」？", options: ["页面浏览量 PV", "总成交额 GMV", "按钮点击率 CTR", "页面加载时长"], answer: 1 },
        { id: "q3", prompt: "留存分析最关注的是？", options: ["新用户总量", "用户在一段时间后的回访比例", "用户地域分布", "用户设备类型"], answer: 1 },
        { id: "q4", prompt: "做数据复盘时，下列哪种做法最稳妥？", options: ["只看结果数字，凭经验总结", "用数据 + 假设 + 验证三步法", "只挑增长的指标汇报", "直接归因到单一因素"], answer: 1 },
        { id: "q5", prompt: "GMV 突然下降，第一步应该做什么？", options: ["立刻加大广告投放", "拆解 GMV = 流量 × 转化 × 客单价，看哪段掉最多", "直接换产品", "怀疑数据出错"], answer: 1 },
        { id: "q6", prompt: "下列哪个维度最适合用于「用户分层」？", options: ["用户头像颜色", "用户注册渠道 + 消费频次", "用户手机型号", "用户昵称长度"], answer: 1 },
        { id: "q7", prompt: "A/B 实验的核心前提是？", options: ["两组用户数量完全相等", "两组用户随机分配，除变量外其他条件一致", "必须在同一天完成", "必须有 10 万以上用户"], answer: 1 },
        { id: "q8", prompt: "「数据驱动」最准确的理解是？", options: ["只看数字做决策", "用数据验证假设、辅助判断，而非替代思考", "数据越多越好", "只有拿到完美数据才能行动"], answer: 1 },
      ],
    },
    certBadgeRequirement: {
      highBadgeCount: 5,
      lowBadgeCount: 3,
    },
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
    finalExam: { id: "brand-ecommerce-final", totalQuestions: 10, passingScore: 7, status: "draft" },
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
    finalExam: { id: "retail-project-lab-final", totalQuestions: 6, passingScore: 4, status: "draft" },
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
    finalExam: { id: "opc-methodology-final", totalQuestions: 8, passingScore: 5, status: "draft" },
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
    finalExam: { id: "rural-ecommerce-final", totalQuestions: 8, passingScore: 5, status: "draft" },
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
    finalExam: { id: "ai-ecommerce-agent-final", totalQuestions: 10, passingScore: 6, status: "draft" },
  },
  {
    id: "newbie-essential",
    title: "创赛新手必修课",
    summary: "App 使用、AI 工具与创赛报名，3 大目录带你快速上手平台。",
    description: "面向首次使用核心产业学院 App 的学生，通过「App 使用指南」「AI 工具快速入门」「如何报名我的第一场创赛」三个目录，帮你建立产品地图、掌握 AI 协作方法，并顺利完成第一次创赛报名。",
    source: { type: "platform", label: "平台公共课程" },
    duration: "3 目录",
    chapterCount: 3,
    lessons: ["App 使用指南", "AI 工具快速入门", "如何报名我的第一场创赛"],
    entitlement: "free",
    cost: 0,
    certificateId: "cert-course-newbie-essential",
    category: "onboarding",
    cover: "from-[#f59e0b] via-[#ec4899] to-[#06b6d4]",
    checkpoints: [
      {
        id: "newbie-essential-cp-1",
        title: "关卡一 · App 使用指南",
        unlockAt: 0.34,
        questions: [
          { id: "q1", prompt: "学生主档和长期资产在 App 的哪一类入口下管理？", options: ["首页", "赛事", "我的", "机会"], answer: 2 },
          { id: "q2", prompt: "关于创赛工坊，下列哪种说法是正确的？", options: ["它是全局 AI 工具箱，任何地方都能用", "它属于具体赛事上下文，在赛事 workspace 内使用", "它只用来做海报生成", "它可以直接替你报名比赛"], answer: 1 },
          { id: "q3", prompt: "下列哪一项属于「长期资产」？", options: ["每日打卡记录", "赛事身份、证书、学习记录、简历", "临时购物车", "未保存的草稿"], answer: 1 },
        ],
      },
      {
        id: "newbie-essential-cp-2",
        title: "关卡二 · AI 工具快速入门",
        unlockAt: 0.67,
        questions: [
          { id: "q1", prompt: "使用 AI 辅助写作时，最关键的一步是？", options: ["让 AI 直接写完全文", "先明确自己的目标和观点，再让 AI 辅助", "完全照搬 AI 输出", "只用 AI 凑字数"], answer: 1 },
          { id: "q2", prompt: "下列哪种场景最适合用 AI 图片生成？", options: ["需要精确品牌 logo 时", "需要手绘风格的创意草图时", "需要真实证件照时", "需要精确的工程图纸时"], answer: 1 },
          { id: "q3", prompt: "AI 生成内容的正确态度是？", options: ["AI 说的都是对的", "AI 是辅助工具，需要人来判断和把关", "AI 可以替代所有思考", "AI 没有任何价值"], answer: 1 },
        ],
      },
      {
        id: "newbie-essential-cp-3",
        title: "关卡三 · 报名第一场创赛",
        unlockAt: 1.0,
        questions: [
          { id: "q1", prompt: "关于一个账号与多个赛事身份的关系，正确的是？", options: ["一个账号只能有一场赛事身份", "一个账号可以关联多个赛事身份，赛事结束后资产仍然保留", "赛事结束后账号就注销了", "赛事身份等同于账号本身"], answer: 1 },
          { id: "q2", prompt: "「报名结果回流」指的是什么？", options: ["PC 报名与 App 完全独立，互不关联", "报名后状态自动写入 identities[]，App 侧可查看赛事身份", "App 上有一份完整报名表需要重新填", "报名只保留在 PC 端"], answer: 1 },
          { id: "q3", prompt: "三创赛报名成功后，在哪里查看赛事身份？", options: ["只在 PC 端", "App「我的」→ 赛事身份 / 创赛工坊入口", "只在短信通知里", "需要联系客服查询"], answer: 1 },
        ],
      },
    ],
    finalExam: {
      id: "newbie-essential-final",
      totalQuestions: 6,
      passingScore: 4,
      status: "open",
      questions: [
        { id: "q1", prompt: "学生主档和长期资产在 App 的哪一类入口下管理？", options: ["首页", "赛事", "我的", "机会"], answer: 2 },
        { id: "q2", prompt: "关于创赛工坊，下列哪种说法是正确的？", options: ["它是全局 AI 工具箱，任何地方都能用", "它属于具体赛事上下文，在赛事 workspace 内使用", "它只用来做海报生成", "它可以直接替你报名比赛"], answer: 1 },
        { id: "q3", prompt: "下列哪一项属于「长期资产」？", options: ["每日打卡记录", "赛事身份、证书、学习记录、简历", "临时购物车", "未保存的草稿"], answer: 1 },
        { id: "q4", prompt: "可信证书的可解释规则包含以下哪些要素？", options: ["只看 AI 综合评分", "必修课程 + 多枚徽章 + 小测通过", "只看校内成绩", "只看企业打分"], answer: 1 },
        { id: "q5", prompt: "关于一个账号与多个赛事身份的关系，正确的是？", options: ["一个账号只能有一场赛事身份", "一个账号可以关联多个赛事身份，赛事结束后资产仍然保留", "赛事结束后账号就注销了", "赛事身份等同于账号本身"], answer: 1 },
        { id: "q6", prompt: "「报名结果回流」指的是什么？", options: ["PC 报名与 App 完全独立，互不关联", "报名后状态自动写入 identities[]，App 侧可查看赛事身份", "App 上有一份完整报名表需要重新填", "报名只保留在 PC 端"], answer: 1 },
      ],
    },
    certBadgeRequirement: {
      highBadgeCount: 3,
      lowBadgeCount: 2,
    },
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
    claimHint: "领取后将通过接口发放到你绑定的手机号，请在「腾讯地图」App 内使用相同手机号登录查看/使用。",
    apiIssued: true,
    useInApp: "腾讯地图",
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
    claimHint: "领取后将通过接口发放到你绑定的手机号，请在「淘宝闪购」App 内使用相同手机号登录查看/使用。",
    apiIssued: true,
    useInApp: "淘宝闪购",
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

  // -------- 大礼包福利（徽章门槛，运营后台动态配置） --------
  {
    id: "giftpack-student-deluxe",
    title: "学生豪华大礼包",
    summary: "咖啡券 + 视频会员 + 出行券 + 数据分析课程，徽章达标的学生专属。",
    source: { type: "platform", label: "运营大礼包" },
    reason: "平台运营大礼包：徽章达标即可领取，鼓励持续学习与日常活跃。",
    expiresAt: "2026-12-31",
    initialStatus: "eligible",
    isGiftPack: true,
    badgeRequirement: { highBadgeCount: 4, lowBadgeCount: 3 },
    giftPackContent: [
      "瑞幸咖啡饮品券 × 2",
      "校园视频会员月卡 × 1",
      "腾讯地图出行打车券 × 3",
      "商业数据分析基础课程兑换码 × 1",
      "专属成长档案徽章标识",
    ],
    giftPackCover: "from-[#f59e0b] to-[#ef4444]",
    claimHint: "徽章达标后即可一键领取，券码将发放至你绑定的手机号。",
    bindPhone: true,
  },
  {
    id: "giftpack-newcomer-welcome",
    title: "新人欢迎大礼包",
    summary: "新人专享：咖啡券 + 外卖券 + 新手必修课程，低门槛快速上手。",
    source: { type: "platform", label: "运营大礼包" },
    reason: "面向新用户的第一份大礼包，帮助快速建立平台使用习惯。",
    expiresAt: "2026-12-31",
    initialStatus: "eligible",
    isGiftPack: true,
    badgeRequirement: { highBadgeCount: 1, lowBadgeCount: 2 },
    giftPackContent: [
      "库迪咖啡饮品券 × 1",
      "淘宝闪购外卖券 × 2",
      "创赛新手必修课学习资格 × 1",
      "新手任务加速卡",
    ],
    giftPackCover: "from-[#8b5cf6] to-[#06b6d4]",
    claimHint: "完成新手任务和日常打卡即可快速达标，领取后券码发放至绑定手机号。",
    bindPhone: true,
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
