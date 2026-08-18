import { isCourseCompleted } from "@core/shared";

export type CourseRuntimeStatus = "notStarted" | "inProgress" | "completed";
export type AssessmentStatus = "idle" | "passed" | "failed";
export type BenefitRuntimeStatus = "eligible" | "ineligible" | "claimed" | "used" | "expired";
export type CertificateClaimStatus = "claimable" | "claimed" | "pending" | "revoked";
export type IssuanceStatus = "notTriggered" | "requested" | "processing" | "issued" | "failed" | "revoked";
export type FulfillmentType = "code" | "externalLink" | "manual";

export type CourseChapter = {
  id: string;
  title: string;
  type: "video" | "quiz";
  requirement: string;
};

export type CourseAdminRecord = {
  id: string;
  title: string;
  summary: string;
  sourceLabel: string;
  competitionId?: string;
  organizationId?: string;
  duration: string;
  chapters: CourseChapter[];
  videoCompletionPercent: number;
  quizPassScore: number;
  certificateId?: string;
  unlockBenefitId?: string;
  runtime: { status: CourseRuntimeStatus; progress: number; assessment: AssessmentStatus };
};

export type BenefitEligibilityRule = {
  label: string;
  fact: "profileComplete" | "competitionIdentityActive" | "courseCompleted" | "partnerGrant" | "activityAttendance" | "historicalRecord";
  referenceId?: string;
};

export type BenefitAdminRecord = {
  id: string;
  title: string;
  summary: string;
  providerLabel: string;
  organizationId?: string;
  competitionId?: string;
  expiresAt?: string;
  fulfillment: FulfillmentType;
  fulfillmentDetail: string;
  eligibility: BenefitEligibilityRule[];
  runtimeStatus: BenefitRuntimeStatus;
};

export type CertificateAdminRecord = {
  id: string;
  title: string;
  certificateType: "course" | "competition" | "practice" | "activity";
  actualIssuer: string;
  sourceId: string;
  triggerRule: string;
  triggerMode: "automatic" | "operatorInitiated";
  channel: string;
  issuanceStatus: IssuanceStatus;
  claimStatus?: CertificateClaimStatus;
  certificateNumber: string;
  credential: string;
  verification: string;
  requestTrail: string[];
  relatedCourseId?: string;
  relatedCompetitionId?: string;
};

const videoChapter = (id: string, title: string): CourseChapter => ({
  id,
  title,
  type: "video",
  requirement: "视频学习进度计入 Course Completed 判定",
});

const quizChapter = (id: string, title: string): CourseChapter => ({
  id,
  title,
  type: "quiz",
  requirement: "小测试通过后计入 Course Completed 判定",
});

export const fulfillmentLabels: Record<FulfillmentType, string> = {
  code: "兑换码 / 卡码",
  externalLink: "外部领取链接",
  manual: "线下核销 / 人工履约",
};

export const fulfillmentDetailByType: Record<FulfillmentType, string> = {
  code: "领取后分配单人兑换码 / 卡码；码库存属于履约配置，不改变个人 claimed / used 状态语义。",
  externalLink: "领取后进入已配置的外部领取链接；第三方领取结果按实际对接能力回流。",
  manual: "线下工作人员核销 / 人工履约；核销结果回写既有个人权益 Runtime。",
};

export const pc04Courses: CourseAdminRecord[] = [
  {
    id: "data-analytics",
    title: "商业数据分析基础",
    summary: "用真实业务指标完成从问题拆解、数据整理到复盘表达的基础训练。",
    sourceLabel: "平台公共课程",
    duration: "6 课时",
    chapters: [
      videoChapter("da-01", "指标与问题"),
      videoChapter("da-02", "数据整理"),
      videoChapter("da-03", "漏斗分析"),
      videoChapter("da-04", "复盘表达"),
      videoChapter("da-05", "练习与考试"),
      quizChapter("da-06", "成果确认"),
    ],
    videoCompletionPercent: 100,
    quizPassScore: 80,
    certificateId: "cert-course-data-analytics",
    runtime: { status: "completed", progress: 100, assessment: "passed" },
  },
  {
    id: "brand-ecommerce",
    title: "品牌电商实战课",
    summary: "围绕三创赛美妆电商赛道，把用户洞察、内容运营和经营复盘串成一条实践链。",
    sourceLabel: "三创赛 · 美妆电商赛道",
    competitionId: "sanchuang-16",
    organizationId: "northstar-beauty",
    duration: "8 课时",
    chapters: [
      videoChapter("be-01", "赛道导入"),
      videoChapter("be-02", "用户洞察"),
      videoChapter("be-03", "商品表达"),
      videoChapter("be-04", "内容运营"),
      videoChapter("be-05", "直播与转化"),
      videoChapter("be-06", "数据复盘"),
      videoChapter("be-07", "项目复盘"),
      quizChapter("be-08", "课程考试"),
    ],
    videoCompletionPercent: 100,
    quizPassScore: 80,
    certificateId: "cert-course-brand-ecommerce",
    runtime: { status: "inProgress", progress: 38, assessment: "idle" },
  },
  {
    id: "retail-project-lab",
    title: "零售项目协作课",
    summary: "企业案例驱动的轻量项目课，训练需求澄清、协作与阶段汇报。",
    sourceLabel: "云栖零售实验室",
    organizationId: "cloud-retail",
    duration: "4 课时",
    chapters: [
      videoChapter("rp-01", "项目拆解"),
      videoChapter("rp-02", "协作记录"),
      videoChapter("rp-03", "阶段汇报"),
      quizChapter("rp-04", "成果复盘"),
    ],
    videoCompletionPercent: 100,
    quizPassScore: 80,
    unlockBenefitId: "benefit-cloud-lab",
    runtime: { status: "notStarted", progress: 0, assessment: "idle" },
  },
];

export const pc04Benefits: BenefitAdminRecord[] = [
  {
    id: "benefit-campus-video",
    title: "校园视频会员月卡",
    summary: "平台合作权益，领取后在有效期内兑换使用。",
    providerLabel: "核心产业学院",
    expiresAt: "2026-09-30",
    fulfillment: "code",
    fulfillmentDetail: fulfillmentDetailByType.code,
    eligibility: [{ label: "账号资料已完成", fact: "profileComplete" }],
    runtimeStatus: "eligible",
  },
  {
    id: "benefit-beauty-sample",
    title: "北辰美妆校园体验权益",
    summary: "赛事合作品牌提供的校园体验资格。",
    providerLabel: "北辰美妆",
    organizationId: "northstar-beauty",
    competitionId: "sanchuang-16",
    expiresAt: "2026-08-31",
    fulfillment: "manual",
    fulfillmentDetail: fulfillmentDetailByType.manual,
    eligibility: [{ label: "第十六届三创赛身份为 active", fact: "competitionIdentityActive", referenceId: "sanchuang-16" }],
    runtimeStatus: "claimed",
  },
  {
    id: "benefit-cloud-lab",
    title: "云栖零售项目课学习资格",
    summary: "企业共建项目课的学习兑换资格。",
    providerLabel: "云栖零售实验室",
    organizationId: "cloud-retail",
    expiresAt: "2026-10-31",
    fulfillment: "code",
    fulfillmentDetail: fulfillmentDetailByType.code,
    eligibility: [{ label: "云栖零售合作项目开放资格", fact: "partnerGrant", referenceId: "cloud-retail" }],
    runtimeStatus: "eligible",
  },
  {
    id: "benefit-sanchuang-course",
    title: "赛道路演课学习资格",
    summary: "三创赛参赛期提供的赛事学习权益；领取记录长期保留。",
    providerLabel: "第十六届三创赛",
    competitionId: "sanchuang-16",
    expiresAt: "2026-10-15",
    fulfillment: "externalLink",
    fulfillmentDetail: fulfillmentDetailByType.externalLink,
    eligibility: [{ label: "第十六届三创赛身份为 active", fact: "competitionIdentityActive", referenceId: "sanchuang-16" }],
    runtimeStatus: "eligible",
  },
  {
    id: "benefit-activity-ride",
    title: "青年创新日出行券",
    summary: "线下活动现场发放的出行权益。",
    providerLabel: "青年创新日",
    expiresAt: "2026-08-20",
    fulfillment: "code",
    fulfillmentDetail: fulfillmentDetailByType.code,
    eligibility: [{ label: "青年创新日活动签到完成", fact: "activityAttendance", referenceId: "青年创新日" }],
    runtimeStatus: "ineligible",
  },
  {
    id: "benefit-history",
    title: "历史赛事资料兑换权益",
    summary: "历史权益保留状态，不再允许使用。",
    providerLabel: "第十五届三创赛",
    competitionId: "sanchuang-15",
    expiresAt: "2025-09-01",
    fulfillment: "code",
    fulfillmentDetail: fulfillmentDetailByType.code,
    eligibility: [{ label: "历史赛事权益记录", fact: "historicalRecord", referenceId: "sanchuang-15" }],
    runtimeStatus: "expired",
  },
];

export const pc04Certificates: CertificateAdminRecord[] = [
  {
    id: "cert-course-data-analytics",
    title: "商业数据分析基础课程证书",
    certificateType: "course",
    actualIssuer: "核心产业学院",
    sourceId: "data-analytics",
    triggerRule: "个人视频学习进度达到配置阈值且 assessment = passed",
    triggerMode: "automatic",
    channel: "当前 App 原型为平台签发；接入外部权威渠道后必须记录真实 issuer 与回流结果",
    issuanceStatus: "issued",
    claimStatus: "claimable",
    certificateNumber: "App 当前未单列签发编号",
    credential: "已形成签发记录；App 当前未提供证书文件 URL",
    verification: "verificationCode: COURSE-DA-26001",
    requestTrail: [
      "正式 Course Completed 条件已满足",
      "系统自动触发签发流程，不要求运营逐张点击发证",
      "签发记录已形成；App Runtime 当前为 claimable，等待学生领取",
    ],
    relatedCourseId: "data-analytics",
  },
  {
    id: "cert-course-brand-ecommerce",
    title: "品牌电商实战课课程证书",
    certificateType: "course",
    actualIssuer: "核心产业学院",
    sourceId: "brand-ecommerce",
    triggerRule: "个人视频学习进度达到配置阈值且 assessment = passed",
    triggerMode: "automatic",
    channel: "课程完成后自动触发；当前学生尚未满足条件，因此尚无个人 Certificate Runtime 记录",
    issuanceStatus: "notTriggered",
    certificateNumber: "未生成",
    credential: "未生成",
    verification: "未生成",
    requestTrail: [
      "课程证书规则已配置",
      "当前学习进度 38%，assessment = idle",
      "条件满足后才进入签发流程并生成学生 claim state",
    ],
    relatedCourseId: "brand-ecommerce",
  },
  {
    id: "cert-sanchuang-15",
    title: "第十五届三创赛参赛与项目成果证书",
    certificateType: "competition",
    actualIssuer: "三创赛组委会",
    sourceId: "sanchuang-15",
    triggerRule: "赛事成果由真实赛事结果 / 签发回流确认",
    triggerMode: "operatorInitiated",
    channel: "外部权威结果 / 签发回流",
    issuanceStatus: "issued",
    claimStatus: "claimed",
    certificateNumber: "App 当前未单列签发编号",
    credential: "已形成外部权威签发记录；App 当前未提供证书文件 URL",
    verification: "verificationCode: SC15-TOMZ-24001",
    requestTrail: [
      "2025-08-28 · 外部权威结果回流",
      "issuanceStatus：issued",
      "App claimStatus：claimed；撤销时长期记录保留并显式标记 revoked",
    ],
    relatedCompetitionId: "sanchuang-15",
  },
];

export const certificateTypeLabels: Record<CertificateAdminRecord["certificateType"], string> = {
  course: "课程证书",
  competition: "赛事成果证书",
  practice: "项目实践证书",
  activity: "活动证书",
};

export function courseCompleted(record: CourseAdminRecord) {
  return isCourseCompleted(record.runtime, record.videoCompletionPercent);
}
