export type OperatorRoleKey = "operator" | "superAdmin";
export type AccountStatus = "active" | "frozen";
export type ApprovalStatus = "pending" | "executed";
export type ApprovalKind = "accountFreeze" | "accountUnfreeze" | "certificateBatchRevoke" | "identityBatchChange" | "permissionElevation";

export type PermissionRole = {
  key: OperatorRoleKey;
  label: string;
  modulePermissions: string[];
  dataScope: string;
  scopeDetail: string;
  canManageAdmins: boolean;
  canExecuteHighRisk: boolean;
};

export type ApprovalRequest = {
  id: string;
  kind: ApprovalKind;
  title: string;
  object: string;
  applicant: string;
  approver: string;
  reason: string;
  status: ApprovalStatus;
  requestedAt: string;
};

export type AuditLogEntry = {
  id: string;
  operator: string;
  time: string;
  object: string;
  before: string;
  after: string;
  reason: string;
  approvalId?: string;
};

export const permissionRoles: PermissionRole[] = [
  {
    key: "superAdmin",
    label: "超级管理员",
    modulePermissions: ["后台管理员", "全部业务模块", "权限提升", "高风险治理执行"],
    dataScope: "全平台",
    scopeDetail: "global",
    canManageAdmins: true,
    canExecuteHighRisk: true,
  },
  {
    key: "operator",
    label: "普通运营",
    modulePermissions: ["学生治理", "赛事", "合作主体", "课程 / 权益 / 证书", "机会 / 内容"],
    dataScope: "第十六届三创赛 + 北辰美妆合作范围",
    scopeDetail: "competitionId=sanchuang-16 · organizationId=northstar-beauty",
    canManageAdmins: false,
    canExecuteHighRisk: false,
  },
];

export const studentAccountSeed = {
  accountId: "—（Mobile session 尚未显式接入）",
  name: "林晓",
  school: "华南商贸学院",
  major: "电子商务",
  city: "广州",
  phone: "138****8000",
  status: "active" as AccountStatus,
  profileOwner: "学生本人",
  identities: [
    {
      competitionId: "sanchuang-16",
      competitionStatus: "registrationOpen",
      identityStatus: "active",
      registrationStatus: "approved",
      source: "Mobile shared identities[]",
    },
    {
      competitionId: "innovation-cup-2026",
      competitionStatus: "upcoming",
      identityStatus: "pending",
      registrationStatus: "pending",
      source: "Mobile shared identities[]",
    },
    {
      competitionId: "sanchuang-15",
      competitionStatus: "ended",
      identityStatus: "revoked",
      registrationStatus: "approved",
      source: "Mobile shared identities[]",
    },
  ],
  registration: {
    registrationId: "报名门户 Runtime（独立 registrationId 待真实后台接入）",
    competitionId: "sanchuang-16",
    status: "approved",
    source: "响应式报名门户",
  },
  team: {
    teamId: "team-1",
    role: "当前赛事团队成员",
    captainSchool: "以报名门户 / PC02 审核事实为准",
    memberCount: 0,
  },
  application: {
    opportunityId: "intern-1",
    organizationId: "northstar-beauty",
    status: "statusUnknown",
    source: "App Application；不创建 CandidateRecord",
  },
} as const;

export const longTermAssetsSeed = [
  {
    id: "competitionId=sanchuang-15（独立 experienceId 尚未接入）",
    kind: "Experience",
    title: "第十五届三创赛参赛经历",
    state: "archived",
    source: "Competition sanchuang-15",
    relation: "competitionId=sanchuang-15 · teamRole 来自赛事 Workspace",
    appConsumer: "/assets/experiences · /me/resume",
    retention: "赛事结束后仍作为历史经历长期保留",
  },
  {
    id: "competition-result-sanchuang-15",
    kind: "Result",
    title: "第十五届三创赛 · 校赛一等奖",
    state: "trusted",
    source: "赛事可信结果",
    relation: "resultId=result-s5-score-precheck · competitionId=sanchuang-15",
    appConsumer: "/assets/results · /me/resume",
    retention: "长期保留；异常只进入 archived / invalid",
  },
  {
    id: "cert-sanchuang-15",
    kind: "Certificate",
    title: "第十五届三创赛参赛与项目成果证书",
    state: "claimed",
    source: "三创赛组委会",
    relation: "certificateId=cert-sanchuang-15 · resultId=result-s5-score-precheck",
    appConsumer: "/assets/certificates · /assets/verification",
    retention: "长期保留；撤销只变为 revoked，不物理删除",
  },
  {
    id: "courseId=data-analytics（CourseLearning 事实）",
    kind: "CourseAchievement",
    title: "商业数据分析基础 · 已完成",
    state: "completed",
    source: "CourseLearning Runtime",
    relation: "courseId=data-analytics · progress=100 · assessment=passed",
    appConsumer: "/courses/data-analytics/achievement · /me/resume",
    retention: "课程下架后完成事实继续保留",
  },
  {
    id: "verificationCode=SC15-TOMZ-24001",
    kind: "VerificationRecord",
    title: "证书验真记录 · SC15-TOMZ-24001",
    state: "valid",
    source: "Verification Runtime",
    relation: "certificateId=cert-sanchuang-15",
    appConsumer: "/assets/verification",
    retention: "按审计规则保留；证书 revoked 时同步显示 invalid",
  },
] as const;

export const highRiskCategories = [
  "批量证书签发 / 撤销",
  "官方参赛状态人工修正",
  "批量赛事身份修改",
  "权限提升",
  "学生账号冻结 / 解冻",
] as const;

export const consistencyAuditRows = [
  {
    object: "学生赛事身份",
    app: "identityStatus=active",
    pc: "identityStatus=active；官方资格沿用 PC02 独立事实",
    mapping: "registrationStatus=approved 仅代表平台报名流程；不得把它等同 active / 官方资格",
  },
  {
    object: "投递记录",
    app: "statusUnknown",
    pc: "statusUnknown",
    mapping: "继续使用同一 Application；不创建 CandidateRecord",
  },
  {
    object: "课程成果",
    app: "completed = progress 100 + assessment passed",
    pc: "completed（运行事实只读）",
    mapping: "不建立“培训通过”第二状态",
  },
  {
    object: "证书",
    app: "claimable / claimed / pending / revoked",
    pc: "claimable / claimed / pending / revoked",
    mapping: "revoked 保留历史对象与验真记录",
  },
  {
    object: "赛事结束 / 身份撤销",
    app: "Workspace 权限关闭；长期资产仍可读",
    pc: "赛事身份历史保留；经历 / 成绩 / 证书继续存在",
    mapping: "赛事期能力与长期资产明确分层",
  },
] as const;

export const crossDomainChain = [
  { label: "赛事", name: "第十六届三创赛", id: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
  { label: "合作主体", name: "北辰美妆", id: "northstar-beauty", to: "/admin/organizations/northstar-beauty" },
  { label: "课程", name: "品牌电商实战课", id: "brand-ecommerce", to: "/admin/pc04/courses/brand-ecommerce" },
  { label: "权益", name: "北辰美妆校园体验权益", id: "benefit-beauty-sample", to: "/admin/pc04/benefits/benefit-beauty-sample" },
  { label: "机会", name: "北辰美妆实习机会", id: "intern-1", to: "/admin/opportunities/intern-1" },
  { label: "学生", name: "林晓", id: "accountId 待账号层接入", to: "/admin/students" },
  { label: "长期资产", name: "第十五届三创赛证书", id: "cert-sanchuang-15", to: "/admin/assets" },
] as const;

export const pcRegressionMatrix = [
  { card: "PC01", scope: "统一后台壳、数据来源与对象关系", state: "PASS" },
  { card: "PC02", scope: "赛事、报名资格、学校审核、创赛工坊", state: "PASS" },
  { card: "PC03", scope: "合作主体、机会、内容运营", state: "PASS" },
  { card: "PC04", scope: "课程、权益、可信证书", state: "PASS" },
  { card: "PC05", scope: "学生、长期资产、权限、审计、高风险审批、跨端一致性", state: "待独立评审" },
] as const;
