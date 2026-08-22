export type WorkshopLifecycle = "notStarted" | "inProgress" | "ended";
export type MaterialKey = "projectBrief" | "competitorScreens" | "operationData" | "brandAssets" | "pitchDraft";

export type CompetitionTeam = {
  id: string;
  name: string;
  role: string;
  members: { name: string; role: string; school: string }[];
};

export type CompetitionProject = {
  id: string;
  name: string;
  track: string;
  summary: string;
  currentStage: string;
  mentor: string;
};

export type CompetitionResource = {
  id: string;
  title: string;
  category: "规则" | "模板" | "资料";
  description: string;
  updatedAt: string;
};

export type WorkshopSkill = {
  id: "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
  code: string;
  name: string;
  summary: string;
  capabilities: string[];
  taskIds: string[];
};

export type WorkshopTask = {
  id: string;
  skillId: WorkshopSkill["id"];
  title: string;
  summary: string;
  prompt: string;
  helper: string;
  computeCost: number;
  requiredMaterials: MaterialKey[];
  resultId: string;
};

export type WorkshopQuestion = {
  id: string;
  label: string;
  type: "single" | "multiple" | "scale";
  options: string[];
  required?: boolean;
  helper?: string;
};

export type WorkshopComputePolicy = {
  estimateMin: number;
  estimateMax: number;
  actual: number;
};

export type WorkshopResultDetail = {
  finding: string;
  weakness: string;
  risks: string[];
  actions: string[];
  score: number;
  rating: string;
  dimensions: { label: string; score: number }[];
};

export type WorkshopResultTemplate = {
  id: string;
  taskId: string;
  title: string;
  summary: string;
  highlights: string[];
  nextSuggestion: string;
};

export type CompetitionWorkspaceData = {
  competitionId: string;
  team: CompetitionTeam;
  project: CompetitionProject;
  resources: CompetitionResource[];
};

export const materialLabels: Record<MaterialKey, string> = {
  projectBrief: "项目简介",
  competitorScreens: "竞品截图 / 链接",
  operationData: "近 7 天经营数据",
  brandAssets: "品牌与商品素材",
  pitchDraft: "现有路演稿",
};

export const workspaceData: Record<string, CompetitionWorkspaceData> = {
  "sanchuang-16": {
    competitionId: "sanchuang-16",
    team: {
      id: "team-1",
      name: "山城新零售队",
      role: "队长",
      members: [
        { name: "林晓", role: "队长 / 项目统筹", school: "华南商贸学院" },
        { name: "陈语", role: "内容运营", school: "华南商贸学院" },
        { name: "周越", role: "数据分析", school: "华南商贸学院" },
      ],
    },
    project: {
      id: "project-1",
      name: "岭南植物精粹校园新零售计划",
      track: "美妆电商 / 新零售",
      summary: "围绕岭南植物成分、校园内容种草与私域复购，验证年轻消费者的产品与渠道组合。",
      currentStage: "项目诊断与运营验证",
      mentor: "许老师",
    },
    resources: [
      { id: "rules-2026", title: "第十六届三创赛参赛规则", category: "规则", description: "报名、团队、赛道、材料与评审基础规则。", updatedAt: "2026-08-12" },
      { id: "pitch-template", title: "路演 PPT 结构模板", category: "模板", description: "问题、方案、市场、运营、财务与团队的基础路演结构。", updatedAt: "2026-08-15" },
      { id: "beauty-research", title: "美妆新零售赛道资料包", category: "资料", description: "赛道背景、用户趋势、内容电商与案例资料。", updatedAt: "2026-08-16" },
    ],
  },
  "sanchuang-15": {
    competitionId: "sanchuang-15",
    team: {
      id: "team-archive",
      name: "历史参赛团队",
      role: "成员",
      members: [{ name: "林晓", role: "运营", school: "华南商贸学院" }],
    },
    project: {
      id: "project-archive",
      name: "历史项目摘要",
      track: "电子商务",
      summary: "赛事已结束，仅保留历史信息用于赛后 handoff。",
      currentStage: "赛事已结束",
      mentor: "—",
    },
    resources: [{ id: "archive-rules", title: "历史赛事规则", category: "规则", description: "赛事期资料只读。", updatedAt: "2025-08-20" }],
  },
};

export const workshopSkills: WorkshopSkill[] = [
  {
    id: "s1",
    code: "S1",
    name: "项目洞察",
    summary: "先判断产品和方向值不值得继续投入。",
    capabilities: ["选品评分", "方向研判", "竞品分析", "用户需求洞察"],
    taskIds: ["s1-product-score"],
  },
  {
    id: "s2",
    code: "S2",
    name: "项目诊断",
    summary: "用结构化问题检查项目真实性、市场与商业模式。",
    capabilities: ["真实性自测", "用户画像", "市场可行性", "商业模式", "竞争分析"],
    taskIds: ["s2-market-feasibility"],
  },
  {
    id: "s3",
    code: "S3",
    name: "平台运营",
    summary: "把定位转成文案、图文、短视频、直播和客服表达。",
    capabilities: ["账号定位", "文案", "图文", "短视频", "直播", "客服话术"],
    taskIds: ["s3-copy-kit", "s3-visual-kit"],
  },
  {
    id: "s4",
    code: "S4",
    name: "数据复盘",
    summary: "从经营结果里找原因和下一轮增长动作。",
    capabilities: ["经营周报", "转化漏斗", "投放复盘", "用户行为", "增长机会"],
    taskIds: ["s4-weekly-review"],
  },
  {
    id: "s5",
    code: "S5",
    name: "项目冲刺",
    summary: "按赛事评分标准预检项目并准备路演。",
    capabilities: ["评分预检", "材料补缺", "路演 PPT", "答辩准备"],
    taskIds: ["s5-score-precheck", "s5-pitch-ppt"],
  },
  {
    id: "s6",
    code: "S6",
    name: "职业发展",
    summary: "把赛事表现转成能力画像、求职表达与机会匹配。",
    capabilities: ["职业顾问", "岗位推荐", "经历转化", "素养测评"],
    taskIds: ["s6-career-advisor", "s6-job-recommend", "s6-experience-transform", "s6-quality-test"],
  },
];

export const workshopTasks: WorkshopTask[] = [
  {
    id: "s1-product-score",
    skillId: "s1",
    title: "完成选品评分与方向研判",
    summary: "对核心产品、目标用户和竞品差异做一轮基础判断。",
    prompt: "请补充你们当前最想验证的产品、目标用户和核心差异。",
    helper: "可直接写团队当前真实判断，不需要完整商业计划书。",
    computeCost: 8,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s1-product-score",
  },
  {
    id: "s2-market-feasibility",
    skillId: "s2",
    title: "完成市场可行性诊断",
    summary: "检查需求真实性、目标人群、竞争和商业模式是否站得住。",
    prompt: "目前有哪些真实用户反馈、竞品证据和成交/咨询信号？",
    helper: "优先写已经发生的事实；没有数据的地方可以明确写“尚未验证”。",
    computeCost: 12,
    requiredMaterials: ["projectBrief", "competitorScreens"],
    resultId: "result-s2-market-feasibility",
  },
  {
    id: "s3-copy-kit",
    skillId: "s3",
    title: "生成平台运营文案包",
    summary: "围绕账号定位生成标题、详情页、短视频、直播与客服话术。",
    prompt: "这轮内容最重要的运营目标是什么？请说明平台、产品和希望用户采取的动作。",
    helper: "例如：小红书种草、抖音短视频转化、直播间首购。",
    computeCost: 10,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s3-copy-kit",
  },
  {
    id: "s3-visual-kit",
    skillId: "s3",
    title: "准备图文 / 视频内容方案",
    summary: "根据已有品牌与商品素材生成内容镜头和视觉方向。",
    prompt: "请说明现有素材、不可修改元素和希望生成的内容形式。",
    helper: "需要先补齐品牌与商品素材。",
    computeCost: 18,
    requiredMaterials: ["brandAssets"],
    resultId: "result-s3-visual-kit",
  },
  {
    id: "s4-weekly-review",
    skillId: "s4",
    title: "生成经营周报与增长复盘",
    summary: "把流量、转化、投放和用户行为合并成可执行周报。",
    prompt: "请补充本周关键数据变化，以及团队认为最异常的一个指标。",
    helper: "需要先上传或录入近 7 天经营数据。",
    computeCost: 14,
    requiredMaterials: ["operationData"],
    resultId: "result-s4-weekly-review",
  },
  {
    id: "s5-score-precheck",
    skillId: "s5",
    title: "按赛事评分标准做预检",
    summary: "提前发现创新性、真实性、商业性和现场表达的明显缺口。",
    prompt: "你最担心评委质疑哪一项？请写出目前团队的回答。",
    helper: "预检只用于团队准备，不替代正式赛事评审。",
    computeCost: 9,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s5-score-precheck",
  },
  {
    id: "s5-pitch-ppt",
    skillId: "s5",
    title: "整理路演 PPT 结构",
    summary: "根据路演时长和现有材料整理答辩叙事。",
    prompt: "请说明预计路演时长、现有 PPT 情况和最想强化的部分。",
    helper: "若已有初稿，补齐后可获得更具体的改稿建议。",
    computeCost: 16,
    requiredMaterials: ["pitchDraft"],
    resultId: "result-s5-pitch-ppt",
  },
  {
    id: "s6-career-advisor",
    skillId: "s6",
    title: "生成职业画像与岗位建议",
    summary: "基于专业、兴趣、能力与城市行业偏好，生成职业画像、推荐岗位与发展路径。",
    prompt: "请说明所在阶段、专业、兴趣方向、能力优势与期望城市行业。",
    helper: "画像与岗位仅为职业探索建议，不构成人才评分或就业承诺。",
    computeCost: 6,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s6-career-advisor",
  },
  {
    id: "s6-job-recommend",
    skillId: "s6",
    title: "生成企业岗位推荐",
    summary: "基于职业方向、城市与技能偏好，匹配企业及其热门岗位，并支持模拟投递。",
    prompt: "请说明期望的职业方向、城市、掌握技能与薪资规模偏好。",
    helper: "企业与岗位仅为求职探索建议，是否投递由学生自己决定。",
    computeCost: 6,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s6-job-recommend",
  },
  {
    id: "s6-experience-transform",
    skillId: "s6",
    title: "生成简历与面试表达",
    summary: "把比赛经历按 STAR 法则转成简历语言、面试话术与作品集证明。",
    prompt: "请说明赛事级别、角色、成果与锻炼的能力，并补充项目与职责描述。",
    helper: "转化结果仅为求职表达建议，不构成获奖事实或人才评分。",
    computeCost: 6,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s6-experience-transform",
  },
  {
    id: "s6-quality-test",
    skillId: "s6",
    title: "生成职业素养画像",
    summary: "从兴趣、性格、能力与价值取向四维测评，生成能力雷达与职业倾向建议。",
    prompt: "请按四个维度逐题自评，AI 会汇总成素养画像与职业倾向。",
    helper: "测评结果仅为自我探索参考，不构成能力评分或录取结论。",
    computeCost: 6,
    requiredMaterials: ["projectBrief"],
    resultId: "result-s6-quality-test",
  },
];

export const workshopQuestions: Record<string, WorkshopQuestion[]> = {
  "s1-product-score": [
    { id: "price", label: "核心单品的定价区间？", type: "single", options: ["29 元以下", "30–59 元", "60–99 元", "100 元以上"], required: true },
    { id: "advantages", label: "选品比较突出的优势是？", type: "multiple", options: ["成分差异化", "包装颜值", "性价比", "品牌故事"], required: true },
    { id: "audience", label: "优先验证的目标用户？", type: "multiple", options: ["校园女性", "敏感头皮人群", "国货成分党", "内容电商用户"], required: true },
    { id: "focus", label: "本次洞察重点", type: "single", options: ["市场可行性", "用户需求", "竞争分析", "资源评估"], required: true },
  ],
  "s2-market-feasibility": [
    { id: "channels", label: "目前主要通过哪些渠道销售？", type: "multiple", options: ["抖音小店", "快团团", "三创好物", "校园私域"], required: true },
    { id: "sellingPoints", label: "产品的核心卖点是什么？", type: "multiple", options: ["植物萃取 / 无硅油", "头皮修护", "控油蓬松", "成分安全", "性价比"], required: true },
    { id: "evidence", label: "目前已有的真实性证据", type: "multiple", options: ["用户访谈", "试用反馈", "成交记录", "供应链证明", "尚未形成"], required: true },
    { id: "model", label: "当前商业模式清晰度", type: "scale", options: ["1", "2", "3", "4", "5"], required: true, helper: "1 表示仍在探索，5 表示已完成真实验证。" },
  ],
  "s3-copy-kit": [
    { id: "platform", label: "本轮优先运营的平台", type: "single", options: ["小红书", "抖音", "视频号", "校园社群"], required: true },
    { id: "goal", label: "最重要的运营目标", type: "single", options: ["品牌认知", "种草互动", "首购转化", "复购召回"], required: true },
    { id: "sellingPointOrder", label: "希望优先表达的卖点", type: "multiple", options: ["真实成分", "使用场景", "价格利益", "校园试用", "品牌故事"], required: true },
    { id: "tone", label: "内容风格", type: "single", options: ["真实体验", "专业测评", "轻松种草", "直播转化"], required: true },
  ],
  "s3-visual-kit": [
    { id: "format", label: "希望生成的内容形式", type: "multiple", options: ["商品主图", "图文笔记", "短视频分镜", "直播间贴片"], required: true },
    { id: "scene", label: "优先使用的场景", type: "multiple", options: ["宿舍", "校园户外", "实验室 / 成分", "直播间"], required: true },
    { id: "style", label: "视觉风格", type: "single", options: ["清爽自然", "成分专业", "年轻活力", "电商转化"], required: true },
  ],
  "s4-weekly-review": [
    { id: "metrics", label: "本周重点指标", type: "multiple", options: ["曝光", "点击率", "加购率", "成交率", "复购率", "投放 ROI"], required: true },
    { id: "anomaly", label: "团队认为最异常的环节", type: "single", options: ["流量下降", "点击偏低", "加购流失", "成交流失", "复购不足"], required: true },
    { id: "goal", label: "下期最想验证的目标", type: "single", options: ["提升首购", "优化详情页", "降低获客成本", "验证复购", "扩大有效流量"], required: true },
  ],
  "s5-score-precheck": [
    { id: "weakness", label: "最担心评委质疑的部分", type: "multiple", options: ["创新性", "真实性", "商业闭环", "团队分工", "社会价值"], required: true },
    { id: "materials", label: "已经具备的比赛材料", type: "multiple", options: ["项目计划书", "交易证据", "用户调研", "财务测算", "路演 PPT"], required: true },
    { id: "confidence", label: "团队当前准备程度", type: "scale", options: ["1", "2", "3", "4", "5"], required: true },
  ],
  "s5-pitch-ppt": [
    { id: "duration", label: "路演时长", type: "single", options: ["5 分钟", "8 分钟", "10 分钟", "15 分钟"], required: true },
    { id: "focus", label: "最需要强化的部分", type: "multiple", options: ["开场问题", "市场证据", "运营数据", "商业模式", "团队优势", "结尾诉求"], required: true },
    { id: "qa", label: "模拟问答重点", type: "multiple", options: ["竞品差异", "数据真实性", "盈利方式", "规模化路径", "团队能力"], required: true },
  ],
};

export const workshopComputePolicies: Record<string, WorkshopComputePolicy> = {
  "s1-product-score": { estimateMin: 60, estimateMax: 100, actual: 72 },
  "s2-market-feasibility": { estimateMin: 60, estimateMax: 100, actual: 72 },
  "s3-copy-kit": { estimateMin: 50, estimateMax: 80, actual: 58 },
  "s3-visual-kit": { estimateMin: 90, estimateMax: 140, actual: 116 },
  "s4-weekly-review": { estimateMin: 40, estimateMax: 70, actual: 35 },
  "s5-score-precheck": { estimateMin: 40, estimateMax: 60, actual: 50 },
  "s5-pitch-ppt": { estimateMin: 90, estimateMax: 150, actual: 128 },
  "s6-career-advisor": { estimateMin: 50, estimateMax: 80, actual: 62 },
  "s6-job-recommend": { estimateMin: 50, estimateMax: 80, actual: 60 },
  "s6-experience-transform": { estimateMin: 50, estimateMax: 80, actual: 58 },
  "s6-quality-test": { estimateMin: 40, estimateMax: 70, actual: 52 },
};

export const workshopResultDetails: Record<string, WorkshopResultDetail> = {
  "result-s1-product-score": { finding: "头皮修护方向增长较快，校园内容场景与产品试用天然匹配。", weakness: "供应链与渠道资源尚未形成可验证证据。", risks: ["竞品差异仍偏概念", "定价区间需要真实样本验证"], actions: ["补充 2–3 个同价位竞品对比", "验证首单产能与校园试用转化"], score: 78, rating: "B+ 良好", dimensions: [{ label: "需求", score: 82 }, { label: "差异", score: 74 }, { label: "落地", score: 70 }] },
  "result-s2-market-feasibility": { finding: "项目具有中等市场可行性，核心用户需求明确，但获客链路仍需验证。", weakness: "达人种草到直播转化缺少 ROI 数据。", risks: ["缺少近 30 天投放记录", "竞品定价证据不足"], actions: ["上传近 30 天投放数据", "补充直接竞品定价与渠道对比"], score: 78, rating: "B+ 良好", dimensions: [{ label: "需求", score: 84 }, { label: "模式", score: 70 }, { label: "证据", score: 68 }] },
  "result-s3-copy-kit": { finding: "内容应先表达真实使用问题，再补充植物成分依据。", weakness: "当前表达过度依赖成分概念。", risks: ["平台内容同质化", "缺少真实试用素材"], actions: ["生成三组标题并小流量测试", "将校园试用反馈写入脚本"], score: 81, rating: "A- 可执行", dimensions: [{ label: "定位", score: 86 }, { label: "表达", score: 82 }, { label: "转化", score: 75 }] },
  "result-s3-visual-kit": { finding: "产品近景、校园场景和真实试用可组成三套内容镜头。", weakness: "现有品牌素材缺少统一视觉规范。", risks: ["生成图片与实物不一致", "成分表达可能过度承诺"], actions: ["锁定不可修改的包装元素", "先采用一套分镜进入人工制作"], score: 80, rating: "A- 可执行", dimensions: [{ label: "一致性", score: 76 }, { label: "场景", score: 86 }, { label: "转化", score: 78 }] },
  "result-s4-weekly-review": { finding: "曝光增长没有同步带来成交，主要损耗发生在详情页到加购。", weakness: "首购利益点不清晰。", risks: ["扩大投放会放大当前漏斗损耗", "复购样本仍然不足"], actions: ["先调整首购利益点", "下期仅验证详情页到加购转化"], score: 73, rating: "B 需验证", dimensions: [{ label: "流量", score: 88 }, { label: "加购", score: 64 }, { label: "成交", score: 68 }] },
  "result-s5-score-precheck": { finding: "创新表达较清楚，真实性证据和商业闭环最可能被追问。", weakness: "交易证据与规模化路径不够完整。", risks: ["答辩时把预测当成事实", "竞品差异解释过于抽象"], actions: ["整理事实证据附录", "完成一轮全员模拟问答"], score: 76, rating: "B+ 可冲刺", dimensions: [{ label: "创新", score: 84 }, { label: "真实", score: 67 }, { label: "表达", score: 78 }] },
  "result-s5-pitch-ppt": { finding: "8 分钟路演建议压缩为 9 页主叙事，证据页集中回答真实性与增长逻辑。", weakness: "中段数据页信息密度过高。", risks: ["超时导致结尾诉求丢失", "关键证据没有来源标注"], actions: ["前 90 秒讲问题与用户", "完成一次计时演练并记录追问"], score: 82, rating: "A- 可演练", dimensions: [{ label: "结构", score: 88 }, { label: "证据", score: 76 }, { label: "节奏", score: 82 }] },
  "result-s6-career-advisor": { finding: "职业方向应优先从兴趣与能力的交集出发，再结合城市行业偏好收敛。", weakness: "岗位匹配基于自评能力，缺少真实项目佐证。", risks: ["职业建议不能替代本人选择", "自评能力需要赛事与项目经历验证"], actions: ["用赛事经历补一段可验证项目描述", "针对推荐岗位补齐 1-2 项核心能力"], score: 78, rating: "方向可探索", dimensions: [{ label: "兴趣", score: 80 }, { label: "能力", score: 75 }, { label: "匹配", score: 72 }] },
  "result-s6-job-recommend": { finding: "职业方向与城市偏好清晰时，企业匹配主要受技能与规模偏好影响。", weakness: "推荐基于自评偏好，缺少真实投递与面试反馈。", risks: ["企业建议不能替代本人选择", "薪资与岗位信息为原型模拟数据"], actions: ["用赛事经历补充一段可验证项目描述", "针对推荐岗位补齐核心技能后尝试投递"], score: 77, rating: "方向可探索", dimensions: [{ label: "方向", score: 82 }, { label: "技能", score: 74 }, { label: "匹配", score: 75 }] },
};

export const resultTemplates: WorkshopResultTemplate[] = [
  {
    id: "result-s1-product-score",
    taskId: "s1-product-score",
    title: "选品评分与方向研判",
    summary: "核心方向可以继续验证，但“植物成分”需要从概念差异转成用户可感知的购买理由。",
    highlights: ["目标人群相对清晰：18–24 岁校园女性", "内容场景与校园试用天然匹配", "竞品差异目前仍偏叙事，需要真实样本验证"],
    nextSuggestion: "进入 S2 市场可行性诊断，补足竞品证据和真实用户反馈。",
  },
  {
    id: "result-s2-market-feasibility",
    taskId: "s2-market-feasibility",
    title: "市场可行性诊断报告",
    summary: "用户需求存在，但目前证据主要来自定性访谈，建议把首购与复购拆开验证。",
    highlights: ["需求真实性：中", "竞争强度：高", "团队执行基础：较好", "下一轮优先动作：补 20 个真实用户样本"],
    nextSuggestion: "选择 S3 平台运营任务，把当前价值主张转成可测试内容。",
  },
  {
    id: "result-s3-copy-kit",
    taskId: "s3-copy-kit",
    title: "平台运营文案包",
    summary: "已生成账号定位、标题方向、详情页结构、短视频脚本、直播开场与客服话术。",
    highlights: ["账号定位：成分真实 + 校园试用", "短视频首句优先展示使用场景", "直播话术避免只讲植物概念，先讲具体肤感问题"],
    nextSuggestion: "补齐品牌素材后，可继续生成 S3 图文 / 视频内容方案。",
  },
  {
    id: "result-s3-visual-kit",
    taskId: "s3-visual-kit",
    title: "图文 / 视频内容方案",
    summary: "围绕产品质地、校园场景和成分证据组织 3 套内容镜头。",
    highlights: ["产品近景用于建立质感", "宿舍 / 校园环境强化真实使用", "成分证据只作为辅助，不单独做大段科普"],
    nextSuggestion: "执行一轮内容测试后，进入 S4 数据复盘。",
  },
  {
    id: "result-s4-weekly-review",
    taskId: "s4-weekly-review",
    title: "经营周报与数据复盘",
    summary: "流量增长没有同步带来成交，主要损耗发生在详情页到加购。",
    highlights: ["曝光 +32%", "加购率下降 18%", "新客首购比复购更弱", "建议先调整首购利益点，再扩大投放"],
    nextSuggestion: "完成调整后再跑一周数据，避免一次性改太多变量。",
  },
  {
    id: "result-s5-score-precheck",
    taskId: "s5-score-precheck",
    title: "赛事评分预检",
    summary: "真实性证据和商业闭环仍是最可能被追问的部分。",
    highlights: ["创新表达：较清楚", "真实交易证据：偏弱", "团队分工：完整", "答辩风险：竞品差异解释过于抽象"],
    nextSuggestion: "补齐证据后，继续整理路演 PPT。",
  },
  {
    id: "result-s5-pitch-ppt",
    taskId: "s5-pitch-ppt",
    title: "路演 PPT 结构建议",
    summary: "建议把 8 分钟路演压缩为 9 页主叙事，证据页集中回答真实性与增长逻辑。",
    highlights: ["前 90 秒讲问题与用户", "中段用真实数据证明执行", "结尾明确下一阶段资源需求"],
    nextSuggestion: "按结构修改后再做一次计时演练。",
  },
  {
    id: "result-s6-career-advisor",
    taskId: "s6-career-advisor",
    title: "职业画像与岗位建议",
    summary: "结合专业、兴趣、能力与城市行业偏好，形成可进一步验证的职业探索方向。",
    highlights: ["画像标签基于兴趣与能力组合生成", "岗位推荐标注 AI 建议，非人才评分", "发展路径按近期 / 中期 / 长期拆分"],
    nextSuggestion: "完成职业画像后，可继续使用岗位推荐或比赛经验转化生成求职表达。",
  },
  {
    id: "result-s6-job-recommend",
    taskId: "s6-job-recommend",
    title: "企业岗位推荐",
    summary: "结合职业方向、城市与技能偏好，匹配可探索的企业及其热门岗位。",
    highlights: ["企业与岗位标注 AI 建议，非人才评分", "支持原型模拟投递与已投递标记", "岗位信息为模拟数据，不构成真实录用承诺"],
    nextSuggestion: "针对推荐岗位补齐核心技能后，可结合职业顾问的发展路径逐步推进。",
  },
  {
    id: "result-s6-experience-transform",
    taskId: "s6-experience-transform",
    title: "简历与面试表达包",
    summary: "基于比赛经历生成多版本简历语言、面试话术与作品集证明。",
    highlights: ["简历按量化成果 / 精炼概述 / 岗位导向三版本组织", "面试话术覆盖自我介绍、职责、挑战、协作与收获", "作品集证明标注 AI 生成，获奖信息需本人核验"],
    nextSuggestion: "结合职业顾问的发展路径，把转化出的表达放进个人求职材料。",
  },
  {
    id: "result-s6-quality-test",
    taskId: "s6-quality-test",
    title: "职业素养画像",
    summary: "四维测评生成能力雷达与职业倾向建议，帮助你更了解自己。",
    highlights: ["雷达覆盖兴趣 / 性格 / 能力 / 价值四维", "职业倾向标注 AI 建议，非人才评分", "提升建议按薄弱维度给出可执行动作"],
    nextSuggestion: "结合素养画像进入职业顾问，收敛更具体的岗位方向。",
  },
];

export const skillById = (id?: string) => workshopSkills.find(item => item.id === id);
export const taskById = (id?: string) => workshopTasks.find(item => item.id === id);
export const resultById = (id?: string) => resultTemplates.find(item => item.id === id);
export const questionsForTask = (id?: string) => workshopQuestions[id ?? ""] ?? [];
export const computePolicyForTask = (id?: string) => workshopComputePolicies[id ?? ""] ?? { estimateMin: 40, estimateMax: 80, actual: 60 };
export const resultDetailById = (id?: string) => workshopResultDetails[id ?? ""];
export const resourceById = (competitionId?: string, resourceId?: string) => workspaceData[competitionId ?? ""]?.resources.find(item => item.id === resourceId);
