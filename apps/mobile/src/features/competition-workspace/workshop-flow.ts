import type { WorkshopSkill } from "./data";

export type WorkshopQuestion = {
  id: string;
  title: string;
  description?: string;
  type: "single" | "multi";
  options: string[];
};

export type WorkshopFlowSpec = {
  taskId: string;
  skillLabel: string;
  instanceTitle: string;
  dynamicHint: string;
  questions: WorkshopQuestion[];
  focusOptions: string[];
  notePlaceholder: string;
  extractedInfo: string[];
  computeRange: string;
  availableCompute: number;
  freezeCompute: number;
};

export type WorkshopReportDimension = {
  label: string;
  score: number;
};

export type WorkshopReportSpec = {
  resultId: string;
  skillLabel: string;
  title: string;
  finding: string;
  weakness: string;
  risks?: string[];
  actions: string[];
  detail: string;
  score: number;
  grade: string;
  scoreCopy: string;
  dimensions: WorkshopReportDimension[];
};

export type WorkshopSkillPresentation = {
  skillId: WorkshopSkill["id"];
  purpose: string;
  who: string;
  output: string;
  compute: string;
};

export const skillPresentation: Record<WorkshopSkill["id"], WorkshopSkillPresentation> = {
  s1: { skillId: "s1", purpose: "找方向", who: "全员作答，队长汇总", output: "项目洞察各维度报告书", compute: "60–80" },
  s2: { skillId: "s2", purpose: "做项目", who: "队长触发诊断，成员补证据", output: "诊断结论报告书 + 雷达图评分", compute: "60–100" },
  s3: { skillId: "s3", purpose: "跑运营", who: "运营成员选择，队长审核", output: "标题 / 详情 / 脚本 / 话术 / 配图", compute: "80–140" },
  s4: { skillId: "s4", purpose: "看数据", who: "数据成员选择，队长确认", output: "指标 / 漏斗 / 异常 / 画像 / 建议", compute: "60–120" },
  s5: { skillId: "s5", purpose: "打比赛", who: "队长触发，全员演练", output: "评分 / PPT 结构 / 路演稿 / 答辩详情", compute: "80–160" },
  s6: { skillId: "s6", purpose: "赛后规划", who: "每位成员独立完成", output: "参赛画像 / 能力评估 / 发展路径", compute: "40–80" },
};

export const workshopFlowSpecs: Record<string, WorkshopFlowSpec> = {
  "s1-product-score": {
    taskId: "s1-product-score",
    skillLabel: "项目洞察",
    instanceTitle: "选品评分",
    dynamicHint: "动态问答 · AI 将根据你的回答动态调整后续问题",
    questions: [
      {
        id: "price",
        title: "核心单品的定价区间？",
        type: "single",
        options: ["29元以下", "30-59元", "60-99元", "100元以上"],
      },
      {
        id: "advantages",
        title: "你的选品比较突出的优势是？",
        description: "可多选",
        type: "multi",
        options: ["成分差异化", "包装颜值", "性价比", "品牌故事"],
      },
    ],
    focusOptions: ["市场可行性", "用户需求", "竞争分析", "资源评估"],
    notePlaceholder: "可补充你希望项目洞察重点关注的方向，例如：我们不确定定价策略是否合理",
    extractedInfo: ["洗护赛道", "头皮修护定位", "美妆新零售", "包装精美", "性价比高", "目标18-28年轻女性"],
    computeRange: "60-100",
    availableCompute: 820,
    freezeCompute: 100,
  },
  "s2-market-feasibility": {
    taskId: "s2-market-feasibility",
    skillLabel: "项目诊断",
    instanceTitle: "市场可行性分析",
    dynamicHint: "动态问答 · AI 将根据你的回答动态调整后续问题",
    questions: [
      {
        id: "channels",
        title: "你的 DearSeed 洗发水目前主要通过哪些渠道销售？",
        description: "选择所有适用的渠道，可以多选",
        type: "multi",
        options: ["抖音小店", "快团团", "三创好物"],
      },
      {
        id: "sellingPoints",
        title: "洗发水的核心卖点是什么？",
        description: "选择所有适用的卖点，可以多选",
        type: "multi",
        options: ["植物萃取/无硅油", "头皮修护", "控油蓬松", "成分安全", "性价比"],
      },
    ],
    focusOptions: ["市场可行性", "用户需求", "竞争分析", "资源评估"],
    notePlaceholder: "可补充你希望诊断重点关注的方向，例如：我们不确定定价策略是否合理",
    extractedInfo: ["抖音小店", "快团团", "植物萃取/无硅油", "创新成分", "性价比高", "目标18-28年轻女性"],
    computeRange: "60-100",
    availableCompute: 820,
    freezeCompute: 100,
  },
};

export const workshopReportSpecs: Record<string, WorkshopReportSpec> = {
  "result-s1-product-score": {
    resultId: "result-s1-product-score",
    skillLabel: "项目洞察",
    title: "选品评分小报告",
    finding: "洗护发赛道中「头皮修护」概念线上增速较快，核心品牌差异化定位清晰，但竞争品牌密集，需继续验证成分与渠道是否能形成真实购买理由。",
    weakness: "「落地可行性」维度最弱，供应链与渠道资源尚不明朗，需要补充产能与分销验证。",
    actions: [
      "补充 2-3 个同价位竞品的成分与渠道对比，明确差异化抓手",
      "验证供应链与首单产能，提升「落地可行性」维度可信度",
    ],
    detail: "当前目标用户、价格带和产品卖点已经形成初步假设。下一轮应把“植物萃取 / 头皮修护”等概念转成可观察的用户选择证据，并补足同价位竞品、渠道效率与首单产能信息。AI 建议仅用于团队判断，不替代赛事事实。",
    score: 78,
    grade: "B+ 良好",
    scoreCopy: "项目洞察综合评分 78 分。评分由下方 6 个维度的原型示例构成，建议重点提升「落地可行性」与「竞争差异」维度。",
    dimensions: [
      { label: "市场空间", score: 84 },
      { label: "用户需求", score: 82 },
      { label: "竞争差异", score: 72 },
      { label: "产品匹配", score: 80 },
      { label: "渠道机会", score: 76 },
      { label: "落地可行性", score: 70 },
    ],
  },
  "result-s2-market-feasibility": {
    resultId: "result-s2-market-feasibility",
    skillLabel: "项目诊断",
    title: "市场可行性分析小报告",
    finding: "项目具有中等市场可行性，核心用户需求较明确，但获客渠道与转化效率仍需数据验证。",
    weakness: "「达人种草到直播转化」链路缺少 ROI 验证，商业模式维度偏弱，变现路径的证据不足。",
    risks: ["缺少近 30 天投放数据，暂时无法评估获客成本", "直接竞品的价格与渠道证据仍不完整"],
    actions: [
      "上传近 30 天投放数据，完成获客成本分析",
      "补充 2-3 个直接竞品的定价策略与渠道对比",
    ],
    detail: "现有回答说明团队已经具备渠道和卖点假设，但市场可行性仍取决于真实流量、转化、复购和竞品数据。建议先补齐缺失证据，再决定扩大投放或调整渠道。AI 诊断不改写团队档案中的可信事实。",
    score: 78,
    grade: "B+ 良好",
    scoreCopy: "市场可行性综合评分 78 分。评分由下方 6 个维度的原型示例构成，建议重点提升「商业模式」与「落地风险」维度。",
    dimensions: [
      { label: "市场需求", score: 84 },
      { label: "目标用户", score: 82 },
      { label: "竞争位置", score: 76 },
      { label: "商业模式", score: 70 },
      { label: "团队资源", score: 80 },
      { label: "落地风险", score: 74 },
    ],
  },
};

export const computePrototype = {
  available: 8240,
  usedThisWeek: 1760,
  frozenBase: 120,
  ledger: [
    { label: "项目诊断报告 v3", meta: "2小时前 · 任务实际消耗", value: "-72" },
    { label: "项目诊断报告 v3", meta: "2小时前 · 释放冻结差额", value: "+28" },
    { label: "赛事评分预检", meta: "2小时前 · 任务冻结", value: "-50" },
    { label: "经营周报-第1期", meta: "昨天 · 任务实际消耗", value: "-35" },
    { label: "用户画像分析（失败）", meta: "昨天 · 失败退回", value: "+40" },
    { label: "OPC赛事赞助发放", meta: "3天前 · 领取", value: "+1000" },
  ],
};

export function flowSpecForTask(taskId?: string) {
  return taskId ? workshopFlowSpecs[taskId] : undefined;
}

export function reportSpecForResult(resultId?: string) {
  return resultId ? workshopReportSpecs[resultId] : undefined;
}
