export type DomainStatus = "existing" | "partial" | "missing";

export type DataEntity = {
  name: string;
  kind: "主数据" | "关系" | "运营配置" | "交易状态" | "长期资产";
  description: string;
  writeBy: string;
  mobileConsumers: string[];
  status: DomainStatus;
};

export type AdminDomain = {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  responsibility: string;
  entities: DataEntity[];
  relations: string[];
  minimumActions: string[];
};

export const adminDomains: AdminDomain[] = [
  {
    id: "competitions",
    label: "赛事中心",
    eyebrow: "Competition Control Plane",
    description: "维护赛事、赛道、生命周期、学校范围、资料与报名入口，是赛事上下文的配置源。",
    responsibility: "PC 定义赛事是什么、何时发生、谁可参与；报名门户只负责具体报名流程。",
    entities: [
      { name: "Competition", kind: "主数据", description: "赛事名称、主办方、状态、报名窗口与工作区可用性。", writeBy: "运营", mobileConsumers: ["赛事发现", "赛事详情", "我的赛事"], status: "partial" },
      { name: "CompetitionTrack", kind: "主数据", description: "赛道、组别与赛事内分类，不写死三创赛专属。", writeBy: "运营", mobileConsumers: ["报名", "赛事工作区", "创赛工坊"], status: "missing" },
      { name: "CompetitionLifecycle", kind: "运营配置", description: "报名、进行中、结束及可选精确节点。", writeBy: "赛事运营", mobileConsumers: ["赛事状态", "工作区权限", "赛后出口"], status: "partial" },
      { name: "CompetitionResource", kind: "主数据", description: "规则、模板、赛道资料与更新记录。", writeBy: "运营", mobileConsumers: ["赛事资料"], status: "missing" },
    ],
    relations: ["Competition ↔ Track", "Competition ↔ School scope", "Competition ↔ ResourceProvider", "Competition ↔ Course / Benefit / Activity"],
    minimumActions: ["新建 / 编辑 / 归档赛事", "配置生命周期与报名窗口", "维护赛道与学校范围", "上传并发布赛事资料"],
  },
  {
    id: "organizations",
    label: "主体与学校",
    eyebrow: "Organizations & Trust",
    description: "维护企业、学校、品牌/资源提供方及可信基础信息，为跨业务资源建立统一主体 ID。",
    responsibility: "企业首先是资源主体；学校首先是运营与审核范围主体。不要把主体等同于手机端的主体管理页面。",
    entities: [
      { name: "Organization", kind: "主数据", description: "企业、学校、合作机构的统一主体记录。", writeBy: "平台运营", mobileConsumers: ["企业详情", "赛事主办方", "资源来源"], status: "missing" },
      { name: "CompanyTrustProfile", kind: "主数据", description: "工商可信信息、认证状态与资料来源。", writeBy: "运营 / 审核", mobileConsumers: ["企业可信信息"], status: "missing" },
      { name: "SchoolScope", kind: "关系", description: "学校在指定赛事中的运营、传播和审核范围。", writeBy: "赛事运营", mobileConsumers: ["报名审核结果"], status: "partial" },
      { name: "ResourceProviderRole", kind: "关系", description: "主体可作为赛事、课程、权益、活动或机会的提供方。", writeBy: "运营", mobileConsumers: ["企业资源关系"], status: "missing" },
    ],
    relations: ["Organization ↔ Competition", "Organization ↔ Resource", "School ↔ Competition scope", "Company ↔ trusted profile"],
    minimumActions: ["维护主体主档", "维护企业可信资料", "配置学校赛事范围", "查看主体提供的全部资源"],
  },
  {
    id: "resources",
    label: "资源运营",
    eyebrow: "Courses · Benefits · Opportunities",
    description: "用统一资源关系承接课程、权益、机会与活动，避免每个手机模块各自维护企业和来源。",
    responsibility: "资源类型可以不同，但来源主体、发布状态、有效期、适用范围和关联关系应复用同一套语义。",
    entities: [
      { name: "Opportunity", kind: "主数据", description: "实习、校招、项目实践及开放状态。", writeBy: "运营", mobileConsumers: ["机会列表", "机会详情", "投递"], status: "missing" },
      { name: "Course", kind: "主数据", description: "课程、章节、来源、证书与解锁条件。", writeBy: "课程运营", mobileConsumers: ["课程", "长期学习资产"], status: "missing" },
      { name: "Benefit", kind: "主数据", description: "权益内容、供应方、有效期与领取/使用语义。", writeBy: "权益运营", mobileConsumers: ["权益", "任务聚合"], status: "missing" },
      { name: "Activity", kind: "主数据", description: "线下/线上活动，可作为权益和本地运营的载体。", writeBy: "活动运营", mobileConsumers: ["后续创域", "活动权益"], status: "missing" },
      { name: "ResourceRelation", kind: "关系", description: "主体、赛事、课程、权益、活动、岗位之间的稳定引用关系。", writeBy: "运营", mobileConsumers: ["企业资源关系", "首页推荐"], status: "missing" },
      { name: "EligibilityRule", kind: "运营配置", description: "按赛事身份、学校、地区或活动签到决定资格。", writeBy: "运营", mobileConsumers: ["权益资格", "课程解锁"], status: "missing" },
    ],
    relations: ["Provider ↔ Resource", "Resource ↔ Competition", "Benefit ↔ EligibilityRule", "Course ↔ unlock Benefit"],
    minimumActions: ["发布 / 下架资源", "配置来源主体", "建立跨资源关系", "配置资格、有效期与使用范围"],
  },
  {
    id: "students",
    label: "学生与赛事身份",
    eyebrow: "Accounts · Identity · Team",
    description: "查看长期学生主档、赛事身份、团队与投递事实；PC 不重新复制一套学生账号。",
    responsibility: "StudentProfile 是长期人，CompetitionIdentity 是某场赛事中的身份，Team/Project 是赛事期对象。",
    entities: [
      { name: "StudentProfile", kind: "主数据", description: "长期学生主档与问卷采集结果。", writeBy: "学生 + 授权运营", mobileConsumers: ["Onboarding", "个人资料", "简历"], status: "partial" },
      { name: "CompetitionIdentity", kind: "交易状态", description: "账号在每场赛事中的报名、审核、身份与权限状态。", writeBy: "报名回流 / 学校审核", mobileConsumers: ["我的赛事", "赛事工作区", "权益资格"], status: "partial" },
      { name: "CompetitionTeam", kind: "交易状态", description: "赛事团队、成员、角色及变更申请。", writeBy: "学生 + 审核方", mobileConsumers: ["赛事团队", "创赛工坊"], status: "partial" },
      { name: "Application", kind: "交易状态", description: "长期账号的机会投递及外部状态回流。", writeBy: "学生 / 招聘回流", mobileConsumers: ["投递记录", "任务聚合"], status: "partial" },
    ],
    relations: ["Account ↔ StudentProfile", "Account ↔ CompetitionIdentity[]", "CompetitionIdentity ↔ Team", "Account ↔ Application[]"],
    minimumActions: ["搜索学生与主档", "按赛事查看身份状态", "审核/查看团队变更", "查看投递和状态回流"],
  },
  {
    id: "assets",
    label: "资产与可信凭证",
    eyebrow: "Results · Certificates · Verification",
    description: "管理比赛、课程结束后仍然存在的经历、成绩、证书和可信凭证。",
    responsibility: "赛事权限可以回收，但可信事实和长期资产不能随着赛事页面消失。",
    entities: [
      { name: "Experience", kind: "长期资产", description: "参赛经历、项目摘要、团队角色。", writeBy: "赛事归档", mobileConsumers: ["长期资产", "简历"], status: "missing" },
      { name: "Result", kind: "长期资产", description: "赛事/课程成绩、可信状态及来源。", writeBy: "赛事 / 课程运营", mobileConsumers: ["成绩与成果", "简历"], status: "missing" },
      { name: "Certificate", kind: "长期资产", description: "证书、签发状态、文件与验真码。", writeBy: "签发方", mobileConsumers: ["证书", "验真"], status: "missing" },
      { name: "VerificationRecord", kind: "交易状态", description: "验真码、扫码、文件验真及撤销记录。", writeBy: "验证服务", mobileConsumers: ["可信凭证验真"], status: "missing" },
    ],
    relations: ["Experience ↔ Competition / Project", "Result ↔ Competition / Course", "Certificate ↔ Result", "Verification ↔ Certificate"],
    minimumActions: ["导入 / 确认成绩", "签发 / 撤销证书", "查看验真状态", "按学生查看长期资产"],
  },
  {
    id: "content",
    label: "内容与活动",
    eyebrow: "Content · Local Operations",
    description: "统一配置公告、赛友内容、活动及客服出口，为后续本地化运营留出位置。",
    responsibility: "内容与活动是平台支撑层，不把它们提升成新的学生主轴。",
    entities: [
      { name: "ContentItem", kind: "主数据", description: "公告、资讯、赛友内容及外部原文。", writeBy: "内容运营", mobileConsumers: ["资讯", "赛友风采"], status: "missing" },
      { name: "Activity", kind: "主数据", description: "活动时间、地域、主办主体、签到方式。", writeBy: "活动运营", mobileConsumers: ["未来创域", "活动权益"], status: "missing" },
      { name: "Placement", kind: "运营配置", description: "首页推荐位、Banner、精选内容与生效时间。", writeBy: "运营", mobileConsumers: ["首页"], status: "missing" },
      { name: "SupportChannel", kind: "运营配置", description: "人工客服、企业微信等真实 handoff 出口。", writeBy: "客服运营", mobileConsumers: ["客服"], status: "missing" },
    ],
    relations: ["Content ↔ Organization / Competition", "Activity ↔ Organization / Region", "Placement ↔ Resource / Content"],
    minimumActions: ["发布内容", "配置首页推荐位", "创建活动和地域范围", "配置人工客服出口"],
  },
  {
    id: "workshop",
    label: "创赛工坊配置",
    eyebrow: "Competition-scoped AI Runtime",
    description: "管理赛事上下文里的 Skill、Task、材料、Prompt 版本和算力策略，不做全局 AI 工具箱。",
    responsibility: "PC 配置任务模板；学生实际运行状态仍属于具体 competitionId 的 Workshop Runtime。",
    entities: [
      { name: "WorkshopSkillConfig", kind: "运营配置", description: "S1-S6 或后续技能定义、顺序与可用范围。", writeBy: "产品 / 赛事运营", mobileConsumers: ["创赛工坊"], status: "missing" },
      { name: "WorkshopTaskConfig", kind: "运营配置", description: "任务说明、输入问题、材料要求、结果类型。", writeBy: "产品 / 运营", mobileConsumers: ["Task Runtime"], status: "missing" },
      { name: "PromptVersion", kind: "运营配置", description: "Prompt 版本、模型策略和发布状态。", writeBy: "AI 运营", mobileConsumers: ["任务生成"], status: "missing" },
      { name: "WorkshopRun", kind: "交易状态", description: "某赛事、团队、任务的 queued/running/failed/completed 状态。", writeBy: "运行服务", mobileConsumers: ["任务进度", "任务专区聚合"], status: "partial" },
    ],
    relations: ["Competition ↔ Workshop config version", "Skill ↔ Task", "Task ↔ MaterialRequirement", "Run ↔ Team / Result"],
    minimumActions: ["配置并版本化 Skill / Task", "绑定赛事与生效版本", "配置材料和算力规则", "查看运行与失败记录"],
  },
];

export const statusMeta: Record<DomainStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  existing: { label: "已有 PC 真相源", tone: "success" },
  partial: { label: "部分已有 / 需归一", tone: "warning" },
  missing: { label: "当前主要在手机 mock", tone: "neutral" },
};
