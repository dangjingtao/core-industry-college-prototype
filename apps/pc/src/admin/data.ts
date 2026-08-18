export type DomainStatus = "existing" | "partial" | "missing";
export type DataSource = "平台配置" | "API 同步" | "文件导入" | "人工修正" | "Runtime";
export type StatusTone = "info" | "success" | "warning" | "danger" | "neutral";

export type DataEntity = {
  name: string;
  kind: "主数据" | "关系" | "运营配置" | "交易状态" | "长期资产";
  description: string;
  writeBy: string;
  mobileConsumers: string[];
  status: DomainStatus;
  idField: string;
  sources: DataSource[];
  states: string[];
  retention: string;
};

export type AdminRelation = {
  label: string;
  stableId: string;
  to: string;
};

export type AdminObjectRecord = {
  key: string;
  entity: string;
  name: string;
  stableIdField: string;
  stableId: string;
  businessState: string;
  source: DataSource;
  sourceDetail: string;
  owner: string;
  editor: string;
  mobileConsumers: string[];
  relations: AdminRelation[];
  retention: string;
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
  sampleObjects: AdminObjectRecord[];
};

export type AppPcMapRow = {
  route: string;
  appFacts: string;
  pcDomain: string;
  source: string;
  states: string;
  stableIds: string;
  retention: string;
};

export const currentOperatorContext = {
  role: "平台运营",
  modulePermission: "PC01 全域查看 · 编辑按域授权",
  dataScope: "全平台（dev 原型）",
  note: "这里只表达 Role + Module Permission + Data Scope 语义；PC01 不冒充已实现完整 RBAC。",
} as const;

export const sourceMeta: Record<DataSource, { description: string; tone: StatusTone }> = {
  平台配置: { description: "由核心产业学院运营维护的主数据、规则或发布配置。", tone: "info" },
  "API 同步": { description: "外部权威或合作系统同步；冲突时默认保留权威来源语义。", tone: "success" },
  文件导入: { description: "API 不可用或批量运营时的兜底导入，必须保留批次与来源。", tone: "neutral" },
  人工修正: { description: "仅用于明确例外或临时覆盖；必须填写原因并进入审计。", tone: "warning" },
  Runtime: { description: "由报名、投递、学习、权益、工坊等真实业务行为产生。", tone: "neutral" },
};

export const stableIdExamples = [
  {
    object: "Competition",
    field: "competitionId",
    value: "sanchuang-16",
    status: "ready" as const,
    note: "Mobile 已使用该 stable id；PC 直接沿用。",
  },
  {
    object: "Organization",
    field: "organizationId",
    value: "northstar-beauty",
    status: "mapped" as const,
    note: "当前 Mobile 字段名仍是 companyId；PC 统一 Organization 时沿用同一 stable value，不生成第二套企业 key。",
  },
  {
    object: "Account",
    field: "accountId",
    value: "—",
    status: "gap" as const,
    note: "当前 Mobile session 只建模 loggedIn / profileComplete，没有显式 accountId。PC01 只暴露缺口，不伪造第二账号真相源。",
  },
];

export const appPcDataMap: AppPcMapRow[] = [
  {
    route: "/home",
    appFacts: "Competition · Opportunity · Content Placement · 派生任务摘要",
    pcDomain: "赛事中心 · 资源运营 · 内容与活动",
    source: "平台配置；外部赛事可 API 同步；当前部分仍为 Mobile mock",
    states: "沿用来源对象状态，不在首页另造状态",
    stableIds: "competitionId · opportunityId · contentId",
    retention: "资源可下架 / 归档；已产生的历史事实不随推荐位消失",
  },
  {
    route: "/competitions",
    appFacts: "Competition · CompetitionIdentity[] · Registration",
    pcDomain: "赛事中心 · 学生与赛事身份",
    source: "平台配置 / API 同步 / 文件导入 / 人工修正 / Runtime",
    states: "upcoming · registrationOpen · inProgress · ended；identity pending/active/rejected/revoked",
    stableIds: "competitionId；身份关系 = accountId + competitionId",
    retention: "赛事可归档；身份历史、成绩与可信成果长期保留",
  },
  {
    route: "/opportunities",
    appFacts: "Opportunity · Application",
    pcDomain: "资源运营 · 学生与赛事身份",
    source: "Opportunity 平台配置；Application 由 App 提交并由运营 / 外部回流更新",
    states: "Opportunity open/closed；Application submitted/statusUnknown",
    stableIds: "opportunityId · organizationId · accountId",
    retention: "Opportunity close/archive；Application 长期保留",
  },
  {
    route: "/courses",
    appFacts: "Course · CourseLearning · assessment",
    pcDomain: "资源运营",
    source: "Course 平台配置；学习与考试为 Runtime",
    states: "notStarted/inProgress/completed；assessment idle/passed/failed",
    stableIds: "courseId；关联 competitionId / organizationId / benefitId / certificateId",
    retention: "Course 可归档；学习成果长期保留",
  },
  {
    route: "/benefits",
    appFacts: "Benefit · 个人领取 / 使用记录",
    pcDomain: "资源运营",
    source: "Benefit / EligibilityRule 平台配置；领取、使用、核销为 Runtime",
    states: "eligible/ineligible/claimed/used/expired",
    stableIds: "benefitId；关联 competitionId / organizationId / courseId",
    retention: "Benefit expire/archive；领取与使用历史保留",
  },
  {
    route: "/assets",
    appFacts: "Experience · Result · Certificate · VerificationRecord",
    pcDomain: "资产与可信凭证",
    source: "API 同步 / 文件导入 / Runtime；必要人工修正必须审计",
    states: "Result pending/trusted/archived；Certificate claimable/claimed/pending/revoked",
    stableIds: "experienceId · resultId · certificateId；关联 competitionId / courseId / accountId",
    retention: "长期保留；使用 archived / revoked / invalid，不物理删除可信历史",
  },
  {
    route: "/me",
    appFacts: "session · StudentProfile · identities[] · Resume presentation",
    pcDomain: "学生与赛事身份",
    source: "账号 / Profile 主要由 App Runtime 与学生本人维护；PC 只做授权治理",
    states: "session 当前只含 loggedIn/profileComplete；Profile 无独立业务状态",
    stableIds: "accountId 当前未显式接入；不得由 PC 另造",
    retention: "冻结账号不删除长期资料、赛事历史、证书或投递",
  },
  {
    route: "/tasks",
    appFacts: "identities[] · Application · CourseLearning · Benefit · WorkshopRun 的派生下一步",
    pcDomain: "跨域派生 · 不建立独立管理域",
    source: "读取既有业务事实，不新增万能 Task 真相源",
    states: "沿用来源对象状态",
    stableIds: "沿用来源对象 stable id，不生成平行 Task business id",
    retention: "聚合项可随条件变化消失；来源业务事实按各自规则保留",
  },
];

export const adminDomains: AdminDomain[] = [
  {
    id: "competitions",
    label: "赛事中心",
    eyebrow: "Competition Control Plane",
    description: "维护赛事、赛道、生命周期、学校范围、资料与报名接入，是赛事上下文的配置源。",
    responsibility: "PC 定义赛事是什么、从哪里接入、谁可参与；报名门户负责具体报名流程，外部权威资格仍由权威来源确认。",
    entities: [
      { name: "Competition", kind: "主数据", description: "赛事名称、主办方、状态、报名窗口与工作区可用性。", writeBy: "平台 / 赛事运营；外部赛事可由权威 API 同步", mobileConsumers: ["/competitions", "/competitions/:competitionId", "/tasks"], status: "partial", idField: "competitionId", sources: ["平台配置", "API 同步", "文件导入", "人工修正"], states: ["upcoming", "registrationOpen", "inProgress", "ended"], retention: "赛事可 archive；学生历史身份和成果不删除" },
      { name: "CompetitionTrack", kind: "主数据", description: "赛道、组别与赛事内分类，不写死三创赛专属。", writeBy: "赛事运营", mobileConsumers: ["/registration", "/competitions/:competitionId/workspace"], status: "missing", idField: "trackId", sources: ["平台配置", "API 同步", "文件导入"], states: [], retention: "随赛事归档，历史引用保留" },
      { name: "CompetitionLifecycle", kind: "运营配置", description: "官方统一窗口、地方节点与平台工作区生命周期。", writeBy: "赛事运营 / 外部权威赛事源", mobileConsumers: ["/competitions/:competitionId", "/competitions/:competitionId/workspace"], status: "partial", idField: "competitionId", sources: ["平台配置", "API 同步", "人工修正"], states: ["notStarted", "inProgress", "ended"], retention: "历史节点保留用于解释资格与资产" },
      { name: "CompetitionResource", kind: "主数据", description: "规则、模板、赛道资料与更新记录。", writeBy: "赛事运营", mobileConsumers: ["/competitions/:competitionId/workspace/resources"], status: "missing", idField: "resourceId", sources: ["平台配置", "API 同步", "文件导入"], states: [], retention: "可归档，已引用版本保留" },
    ],
    relations: ["Competition ↔ Track", "Competition ↔ SchoolScope", "Competition ↔ Organization", "Competition ↔ Course / Benefit / Activity"],
    minimumActions: ["新建 / 编辑 / 归档赛事", "配置生命周期与报名接入", "维护赛道与学校范围", "发布赛事资料"],
    sampleObjects: [
      {
        key: "sanchuang-16",
        entity: "Competition",
        name: "第十六届全国大学生电子商务“创新、创意及创业”挑战赛",
        stableIdField: "competitionId",
        stableId: "sanchuang-16",
        businessState: "registrationOpen",
        source: "API 同步",
        sourceDetail: "目标权威来源为赛事官方 API；当前原型展示仍映射 Mobile mock。文件导入为兜底，人工覆盖必须留痕。",
        owner: "赛事运营 / 外部权威赛事源",
        editor: "赛事运营；权威状态人工修正需原因与审计",
        mobileConsumers: ["/competitions", "/competitions/sanchuang-16", "/tasks"],
        relations: [
          { label: "北辰美妆", stableId: "northstar-beauty", to: "/admin/organizations/objects/northstar-beauty" },
          { label: "品牌电商实战课", stableId: "brand-ecommerce", to: "/admin/resources/objects/course-brand-ecommerce" },
          { label: "北辰美妆校园体验权益", stableId: "benefit-beauty-sample", to: "/admin/resources/objects/benefit-beauty-sample" },
        ],
        retention: "赛事结束后 Competition 可归档；CompetitionIdentity、经历、结果、证书与课程成果继续长期保留。",
      },
      {
        key: "innovation-cup-2026",
        entity: "Competition",
        name: "2026 青年品牌创新挑战赛",
        stableIdField: "competitionId",
        stableId: "innovation-cup-2026",
        businessState: "upcoming",
        source: "平台配置",
        sourceDetail: "普通合作赛事示例，由平台运营直接配置；与三创赛共用同一 Competition 语义。",
        owner: "平台赛事运营",
        editor: "平台赛事运营",
        mobileConsumers: ["/competitions", "/competitions/innovation-cup-2026"],
        relations: [],
        retention: "赛事可归档；已产生的报名与长期资产按各自规则保留。",
      },
    ],
  },
  {
    id: "organizations",
    label: "主体与学校",
    eyebrow: "Organizations & Trust",
    description: "统一维护企业、学校、赛事组织方与合作机构，为跨业务资源建立稳定 Organization ID。",
    responsibility: "企业首先是资源与品牌主体；学校首先是运营与审核范围主体。Organization 不等于手机 D08“主体管理”。",
    entities: [
      { name: "Organization", kind: "主数据", description: "学校、企业、赛事组织方、合作机构的统一主体记录。", writeBy: "平台运营；成熟合作方可按授权维护自身范围", mobileConsumers: ["/companies/:companyId", "赛事主办方", "课程 / 权益 / 机会来源"], status: "missing", idField: "organizationId", sources: ["平台配置", "API 同步", "文件导入"], states: [], retention: "可 archive；历史资源关系与可信事实保留" },
      { name: "CompanyTrustProfile", kind: "主数据", description: "工商可信信息、认证状态与资料来源。", writeBy: "平台运营 / 可信数据源", mobileConsumers: ["/companies/:companyId"], status: "partial", idField: "organizationId", sources: ["API 同步", "文件导入", "人工修正"], states: [], retention: "历史可信版本可追溯" },
      { name: "SchoolScope", kind: "关系", description: "学校在指定赛事中的传播、审核与数据访问范围。", writeBy: "赛事运营", mobileConsumers: ["报名审核结果"], status: "partial", idField: "organizationId + competitionId", sources: ["平台配置"], states: [], retention: "授权可失效，历史审核责任保留" },
      { name: "ResourceProviderRole", kind: "关系", description: "主体作为赛事、课程、权益、活动、机会或内容的来源关系。", writeBy: "平台运营", mobileConsumers: ["/companies/:companyId", "资源来源"], status: "missing", idField: "organizationId + resourceId", sources: ["平台配置"], states: [], retention: "资源下架后历史来源关系保留" },
    ],
    relations: ["Organization ↔ Competition", "Organization ↔ Opportunity / Course / Benefit / Activity / Content", "School ↔ Competition scope"],
    minimumActions: ["维护主体主档", "维护企业可信资料", "配置学校赛事范围", "查看主体提供的全部资源"],
    sampleObjects: [
      {
        key: "northstar-beauty",
        entity: "Organization",
        name: "北辰美妆",
        stableIdField: "organizationId",
        stableId: "northstar-beauty",
        businessState: "—（当前 App Company 未建模发布状态）",
        source: "平台配置",
        sourceDetail: "当前 Mobile 使用 companyId=northstar-beauty；PC 统一 Organization 时沿用同一 stable value。",
        owner: "平台运营",
        editor: "平台运营；可信字段按来源权限受控",
        mobileConsumers: ["/companies/northstar-beauty", "/opportunities/intern-1", "/courses/brand-ecommerce"],
        relations: [
          { label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
          { label: "品牌增长实习生", stableId: "intern-1", to: "/admin/resources/objects/opportunity-intern-1" },
          { label: "品牌电商实战课", stableId: "brand-ecommerce", to: "/admin/resources/objects/course-brand-ecommerce" },
        ],
        retention: "Organization 可归档；已产生的机会投递、课程成果、权益与证书来源关系不删除。",
      },
      {
        key: "cloud-retail",
        entity: "Organization",
        name: "云栖零售实验室",
        stableIdField: "organizationId",
        stableId: "cloud-retail",
        businessState: "—（当前 App Company 未建模发布状态）",
        source: "平台配置",
        sourceDetail: "沿用 Mobile companyId=cloud-retail 作为统一主体迁移基线。",
        owner: "平台运营",
        editor: "平台运营",
        mobileConsumers: ["/companies/cloud-retail", "/opportunities/intern-2", "/courses/retail-project-lab"],
        relations: [],
        retention: "主体退出合作后归档；历史资源与学生事实继续可追溯。",
      },
    ],
  },
  {
    id: "resources",
    label: "资源运营",
    eyebrow: "Courses · Benefits · Opportunities",
    description: "用统一来源与关系承接机会、课程、权益和活动，避免各 Mobile 模块各自维护一份主体。",
    responsibility: "资源类型可以不同，但 stable id、来源主体、发布/有效状态、适用范围和关联关系必须可追溯。",
    entities: [
      { name: "Opportunity", kind: "主数据", description: "实习、校招、项目实践及开放状态。", writeBy: "平台运营", mobileConsumers: ["/opportunities", "/opportunities/:opportunityId"], status: "missing", idField: "opportunityId", sources: ["平台配置", "文件导入"], states: ["open", "closed"], retention: "close/archive；Application 不删除" },
      { name: "Course", kind: "主数据", description: "平台托管课程、章节、来源、证书与解锁关系。", writeBy: "课程运营", mobileConsumers: ["/courses", "/courses/:courseId"], status: "missing", idField: "courseId", sources: ["平台配置", "文件导入"], states: [], retention: "可 archive；CourseLearning / CourseAchievement 长期保留" },
      { name: "Benefit", kind: "主数据", description: "权益内容、供应方、有效期与三类履约方式。", writeBy: "权益运营", mobileConsumers: ["/benefits", "/benefits/wallet", "/tasks"], status: "missing", idField: "benefitId", sources: ["平台配置", "文件导入"], states: [], retention: "expire/archive；个人领取与使用记录保留" },
      { name: "Activity", kind: "主数据", description: "线上 / 线下活动及地域、学校范围。", writeBy: "活动运营", mobileConsumers: ["内容 / 权益关联"], status: "missing", idField: "activityId", sources: ["平台配置", "文件导入"], states: [], retention: "可 unpublish/archive；历史签到或权益事实保留" },
      { name: "ResourceRelation", kind: "关系", description: "Organization、Competition 与各类资源之间的稳定业务关系。", writeBy: "平台运营", mobileConsumers: ["/companies/:companyId", "/home"], status: "missing", idField: "relationId / stable pair", sources: ["平台配置"], states: [], retention: "历史关系保留" },
      { name: "EligibilityRule", kind: "运营配置", description: "只引用可解释既有事实的资格规则，不做万能规则引擎。", writeBy: "平台运营", mobileConsumers: ["/benefits/:benefitId", "课程解锁"], status: "missing", idField: "ruleId", sources: ["平台配置"], states: [], retention: "版本化保留用于解释历史领取资格" },
    ],
    relations: ["Organization ↔ Resource", "Resource ↔ Competition", "Benefit ↔ EligibilityRule", "Course ↔ Benefit / Certificate"],
    minimumActions: ["发布 / 下架资源", "配置来源主体", "建立跨资源关系", "配置资格、有效期与使用范围"],
    sampleObjects: [
      {
        key: "opportunity-intern-1",
        entity: "Opportunity",
        name: "品牌增长实习生",
        stableIdField: "opportunityId",
        stableId: "intern-1",
        businessState: "open",
        source: "平台配置",
        sourceDetail: "当前 Mobile 为静态 mock；未来由 PC Opportunity 主数据提供。",
        owner: "机会运营",
        editor: "平台运营",
        mobileConsumers: ["/opportunities", "/opportunities/intern-1", "/applications"],
        relations: [
          { label: "北辰美妆", stableId: "northstar-beauty", to: "/admin/organizations/objects/northstar-beauty" },
        ],
        retention: "机会关闭后可归档；学生 Application 继续长期保留。",
      },
      {
        key: "course-brand-ecommerce",
        entity: "Course",
        name: "品牌电商实战课",
        stableIdField: "courseId",
        stableId: "brand-ecommerce",
        businessState: "—（Course 主数据未建模发布状态；学习状态属于 Runtime）",
        source: "平台配置",
        sourceDetail: "当前 Mobile 课程静态 mock；课程学习 notStarted/inProgress/completed 仍由学习 Runtime 写。",
        owner: "课程运营",
        editor: "课程运营",
        mobileConsumers: ["/courses/brand-ecommerce", "/courses/brand-ecommerce/learn", "/assets/learning"],
        relations: [
          { label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
          { label: "北辰美妆", stableId: "northstar-beauty", to: "/admin/organizations/objects/northstar-beauty" },
        ],
        retention: "课程可归档；学习进度、考试结果与课程成果长期保留。",
      },
      {
        key: "benefit-beauty-sample",
        entity: "Benefit",
        name: "北辰美妆校园体验权益",
        stableIdField: "benefitId",
        stableId: "benefit-beauty-sample",
        businessState: "—（Benefit 主数据与个人 eligible/claimed/used/expired 分离）",
        source: "平台配置",
        sourceDetail: "权益本身由平台配置；个人资格、领取和核销状态由 Runtime 读取共享赛事身份并写入。",
        owner: "权益运营",
        editor: "权益运营",
        mobileConsumers: ["/benefits/benefit-beauty-sample", "/benefits/wallet", "/tasks"],
        relations: [
          { label: "北辰美妆", stableId: "northstar-beauty", to: "/admin/organizations/objects/northstar-beauty" },
          { label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
        ],
        retention: "权益失效后归档；个人领取、使用和核销历史保留。",
      },
    ],
  },
  {
    id: "students",
    label: "学生与赛事身份",
    eyebrow: "Accounts · Identity · Application",
    description: "查看长期账号主档、赛事身份和投递事实；PC 不重新复制一套学生账号或 CandidateRecord。",
    responsibility: "StudentProfile 是长期的人；CompetitionIdentity 是账号 × 赛事关系；Application 继续是平台投递事实。",
    entities: [
      { name: "Account", kind: "主数据", description: "长期账号锚点。当前 Mobile session 尚未显式暴露 accountId。", writeBy: "账号系统", mobileConsumers: ["/me", "全部 account routes"], status: "missing", idField: "accountId", sources: ["Runtime"], states: [], retention: "冻结不删除历史事实" },
      { name: "StudentProfile", kind: "主数据", description: "长期学生主档与多入口字段来源。", writeBy: "学生本人；授权运营仅补充允许字段", mobileConsumers: ["/onboarding/profile", "/me/profile", "/me/resume"], status: "partial", idField: "accountId", sources: ["Runtime", "人工修正"], states: [], retention: "长期保留" },
      { name: "CompetitionIdentity", kind: "交易状态", description: "同一账号在每场赛事中的报名、审核、身份与权限状态。", writeBy: "报名 / 审核状态机；授权运营仅做审计修正", mobileConsumers: ["/competitions/mine", "/competitions/:competitionId/workspace", "/benefits"], status: "partial", idField: "accountId + competitionId", sources: ["Runtime", "API 同步", "人工修正"], states: ["pending", "active", "rejected", "revoked"], retention: "历史身份保留" },
      { name: "Application", kind: "交易状态", description: "App 内正式投递事实，不另造 CandidateRecord。", writeBy: "学生 App；后续状态由平台运营 / 外部回流", mobileConsumers: ["/applications", "/tasks"], status: "partial", idField: "accountId + opportunityId", sources: ["Runtime", "API 同步", "人工修正"], states: ["submitted", "statusUnknown"], retention: "长期保留" },
    ],
    relations: ["Account ↔ StudentProfile", "Account ↔ CompetitionIdentity[]", "CompetitionIdentity ↔ Competition / Team", "Account ↔ Application[]"],
    minimumActions: ["查询账号与主档", "按赛事查看身份状态", "追溯报名 / 审核来源", "查看 Application 状态"],
    sampleObjects: [
      {
        key: "identity-sanchuang-16",
        entity: "CompetitionIdentity",
        name: "当前账号 × 第十六届三创赛",
        stableIdField: "accountId + competitionId",
        stableId: "accountId 未接入 × sanchuang-16",
        businessState: "identityStatus=active · registrationStatus=approved",
        source: "Runtime",
        sourceDetail: "Mobile 共享 identities[] 由报名 / 审核回流写入。PC01 不复制这份数组；accountId 缺口等待真实账号层接入。",
        owner: "报名 / 审核状态机",
        editor: "授权运营仅可按治理规则人工修正",
        mobileConsumers: ["/competitions/mine", "/competitions/sanchuang-16/workspace", "/benefits"],
        relations: [
          { label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
        ],
        retention: "赛事结束或 revoked 后身份历史保留；赛事期权限关闭，长期资产继续存在。",
      },
      {
        key: "student-profile-current",
        entity: "StudentProfile",
        name: "当前登录学生主档",
        stableIdField: "accountId",
        stableId: "—（Mobile session 尚未显式接入）",
        businessState: "—（StudentProfile 无独立业务状态）",
        source: "Runtime",
        sourceDetail: "学生本人通过 Onboarding / Profile 写同一份长期 StudentProfile；PC 只读取并做授权补充。",
        owner: "学生本人",
        editor: "学生本人优先；授权运营有限字段",
        mobileConsumers: ["/onboarding/profile", "/me/profile", "/me/resume"],
        relations: [],
        retention: "长期保留；账号冻结不删除主档与可信历史。",
      },
    ],
  },
  {
    id: "assets",
    label: "资产与可信凭证",
    eyebrow: "Results · Certificates · Verification",
    description: "管理比赛、课程结束后仍然存在的经历、成绩、证书、学习成果与验真记录。",
    responsibility: "赛事权限可以回收，但可信事实和长期资产不能随着赛事页面消失。",
    entities: [
      { name: "Experience", kind: "长期资产", description: "赛事经历、项目摘要与团队角色。", writeBy: "赛事归档 / 可信事实生成", mobileConsumers: ["/assets/experiences", "/me/resume"], status: "missing", idField: "experienceId", sources: ["Runtime", "API 同步", "文件导入"], states: [], retention: "长期保留" },
      { name: "Result", kind: "长期资产", description: "赛事 / 课程成绩及可信状态。", writeBy: "赛事 / 课程可信方", mobileConsumers: ["/assets/results", "/me/resume"], status: "partial", idField: "resultId", sources: ["API 同步", "文件导入", "人工修正"], states: ["pending", "trusted", "archived"], retention: "长期保留，异常使用 archived/invalid" },
      { name: "Certificate", kind: "长期资产", description: "实际签发主体、编号、文件、状态与验真信息。", writeBy: "真实签发方 / 签发回流", mobileConsumers: ["/assets/certificates", "/assets/verification"], status: "partial", idField: "certificateId", sources: ["API 同步", "文件导入", "人工修正"], states: ["claimable", "claimed", "pending", "revoked"], retention: "长期保留，撤销使用 revoked" },
      { name: "VerificationRecord", kind: "交易状态", description: "验真码、扫码、文件验真与撤销记录。", writeBy: "验证服务", mobileConsumers: ["/assets/verification"], status: "partial", idField: "verificationId", sources: ["Runtime", "API 同步"], states: ["valid", "invalid"], retention: "按审计规则保留" },
    ],
    relations: ["Experience ↔ Competition / CompetitionProject", "Result ↔ Competition / Course", "Certificate ↔ Result / issuer Organization", "Verification ↔ Certificate"],
    minimumActions: ["导入 / 同步结果", "追溯证书签发", "查看验真状态", "按学生查看长期资产"],
    sampleObjects: [
      {
        key: "certificate-sanchuang-15",
        entity: "Certificate",
        name: "第十五届三创赛参赛与项目成果证书",
        stableIdField: "certificateId",
        stableId: "cert-sanchuang-15",
        businessState: "claimed",
        source: "API 同步",
        sourceDetail: "目标形态由真实签发 / 权威结果回流；当前 Mobile 原型已有 certificateId 与 verificationCode。",
        owner: "真实签发方 / 可信资产服务",
        editor: "平台只管理回流与异常；撤销等高风险操作进入后续审批",
        mobileConsumers: ["/assets/certificates", "/assets/certificates/cert-sanchuang-15", "/assets/verification"],
        relations: [
          { label: "第十五届三创赛", stableId: "sanchuang-15", to: "/admin/competitions" },
        ],
        retention: "长期保留；撤销后状态为 revoked，不物理删除。",
      },
      {
        key: "result-sanchuang-15",
        entity: "Result",
        name: "第十五届三创赛 · 校赛一等奖",
        stableIdField: "resultId",
        stableId: "competition-result-sanchuang-15",
        businessState: "trusted",
        source: "文件导入",
        sourceDetail: "示例展示 API 不可用时的兜底导入；正式接入需记录批次与来源。",
        owner: "赛事可信方 / 平台资产运营",
        editor: "授权运营；人工修正必须留痕",
        mobileConsumers: ["/assets/results", "/assets/results/competition-result-sanchuang-15"],
        relations: [
          { label: "证书 cert-sanchuang-15", stableId: "cert-sanchuang-15", to: "/admin/assets/objects/certificate-sanchuang-15" },
        ],
        retention: "长期保留；历史结果可 archived，不能因赛事下架消失。",
      },
    ],
  },
  {
    id: "content",
    label: "内容与活动",
    eyebrow: "Content · Local Operations",
    description: "统一承接公告、赛友内容、首页推荐位、活动与客服出口，为后续本地运营保留位置。",
    responsibility: "内容与活动属于平台支撑层；PC01 只固定来源、scope 与 stable id Pattern，不提前建设复杂多租户。",
    entities: [
      { name: "ContentItem", kind: "主数据", description: "公告、资讯、赛友内容及外部原文。", writeBy: "平台内容运营", mobileConsumers: ["/news", "/stories"], status: "missing", idField: "contentId", sources: ["平台配置", "文件导入"], states: [], retention: "unpublish/archive；历史引用保留" },
      { name: "Activity", kind: "主数据", description: "活动时间、地域、主办主体与后续签到入口。", writeBy: "平台活动运营", mobileConsumers: ["活动 / 权益关联"], status: "missing", idField: "activityId", sources: ["平台配置", "文件导入"], states: [], retention: "可 archive；已产生事实保留" },
      { name: "Placement", kind: "运营配置", description: "首页 Banner、推荐位与生效范围。", writeBy: "平台内容运营", mobileConsumers: ["/home"], status: "missing", idField: "placementId", sources: ["平台配置"], states: [], retention: "历史版本按需要保留" },
      { name: "SupportChannel", kind: "运营配置", description: "人工客服、企业微信等真实 handoff 出口。", writeBy: "客服运营", mobileConsumers: ["/support", "/support/chat"], status: "missing", idField: "channelId", sources: ["平台配置"], states: [], retention: "变更后旧渠道可归档" },
    ],
    relations: ["Content ↔ Organization / Competition", "Activity ↔ Organization / Region / SchoolScope", "Placement ↔ Resource / Content"],
    minimumActions: ["发布 / 下架内容", "配置首页推荐位", "创建活动和 scope", "配置人工客服出口"],
    sampleObjects: [],
  },
  {
    id: "basicData",
    label: "基础数据管理",
    eyebrow: "Master Data · Dictionary · Template",
    description: "维护报名学生、参赛学校、字典、模板、规则和导入批处理等长期复用的主数据；Runtime 状态、长期资产、审计和高风险审批仍由各业务域承担。",
    responsibility: "基础数据只定义、归一、版本和归属，不复制 Runtime；任何编辑都需保留来源与版本，避免与各业务域形成第二份真相源。",
    entities: [
      { name: "报名学生 Profile", kind: "主数据", description: "学生长期 Profile：学校、专业、年级、联系方式、可信状态与来源归属。", writeBy: "运营录入 / App Runtime 同步", mobileConsumers: ["/me", "/registration"], status: "partial", idField: "studentId", sources: ["平台配置", "API 同步", "文件导入", "Runtime"], states: ["active", "frozen", "merged"], retention: "长期保留；冻结账号不删除长期资料" },
      { name: "参赛学校主数据", kind: "主数据", description: "学校主数据：院校名称、省份、地区代码、参赛范围、负责人。", writeBy: "运营录入 / 权威 API 同步", mobileConsumers: ["/registration", "/competitions/:competitionId/workspace"], status: "partial", idField: "organizationId", sources: ["平台配置", "API 同步", "文件导入"], states: ["unverified", "verified", "frozen"], retention: "历史参赛范围与负责人保留可追溯" },
      { name: "赛事 / 赛道字典", kind: "主数据", description: "赛事分类、赛道、阶段、学段，作为长期字段引用基线。", writeBy: "赛事运营", mobileConsumers: ["/competitions", "/registration"], status: "missing", idField: "dictionaryId", sources: ["平台配置", "API 同步"], states: [], retention: "随赛事归档，历史引用保留" },
      { name: "证书 / 协议模板", kind: "运营配置", description: "证书类型、协议模板、Banner 与权益规则模板，统一从这里发布。", writeBy: "内容 / 资产运营", mobileConsumers: ["/assets/certificates"], status: "missing", idField: "templateId + version", sources: ["平台配置"], states: [], retention: "版本化保留" },
      { name: "导入批处理", kind: "运营配置", description: "Excel / CSV 兜底导入、批次管理和来源审计。", writeBy: "授权运营", mobileConsumers: ["—"], status: "missing", idField: "batchId", sources: ["文件导入"], states: ["pending", "validated", "rejected", "applied"], retention: "批次可重放；不允许人工覆盖 Runtime" },
    ],
    relations: ["学生 Profile ↔ 学校主数据", "学生 Profile ↔ 账号", "学校主数据 ↔ 赛事范围", "字典 ↔ 证书 / 协议模板", "导入批次 ↔ 来源文件"],
    minimumActions: ["维护学生 Profile 与可信状态", "维护学校主数据与负责人", "配置赛事 / 赛道字典", "发布证书 / 协议模板", "执行导入与审计批处理"],
    sampleObjects: [
      {
        key: "student-2024-chenyu",
        entity: "报名学生 Profile",
        name: "陈语 · 岭南科技学院",
        stableIdField: "studentId",
        stableId: "student-2024-chenyu",
        businessState: "active",
        source: "API 同步",
        sourceDetail: "示例：登录手机号 + 学校认证合并后形成的 stable studentId。",
        owner: "运营 / 学生本人",
        editor: "授权运营；冻结需高风险审批",
        mobileConsumers: ["/me", "/registration"],
        relations: [
          { label: "岭南科技学院", stableId: "org-lingnan-tech", to: "/admin/organizations" },
        ],
        retention: "长期保留；冻结账号后 Profile 仍可被赛事与权益引用。",
      },
      {
        key: "school-lingnan-tech",
        entity: "参赛学校主数据",
        name: "岭南科技学院",
        stableIdField: "organizationId",
        stableId: "org-lingnan-tech",
        businessState: "verified",
        source: "平台配置",
        sourceDetail: "示例：学校主体主数据；省份 = 广东省，地区代码 = 440000，负责人 = 王老师。",
        owner: "运营 / 学校",
        editor: "授权运营",
        mobileConsumers: ["/registration", "/competitions"],
        relations: [
          { label: "负责人 王老师", stableId: "contact-wang", to: "/admin/organizations" },
        ],
        retention: "历史参赛范围与负责人保留。",
      },
    ],
  },
  {
    id: "workshop",
    label: "创赛工坊配置",
    eyebrow: "Competition-scoped AI Runtime",
    description: "管理赛事上下文里的 Skill、Task、材料、Prompt 版本和算力策略，不做全局 AI 工具箱。",
    responsibility: "PC 配置模板和版本；学生实际 Run 仍属于具体 competitionId + team/project 的 Workshop Runtime。",
    entities: [
      { name: "WorkshopSkillConfig", kind: "运营配置", description: "Skill 定义、顺序与赛事可用范围。", writeBy: "产品 / 赛事运营", mobileConsumers: ["/competitions/:competitionId/workspace/workshop/skills"], status: "missing", idField: "skillId + version", sources: ["平台配置"], states: [], retention: "版本化保留" },
      { name: "WorkshopTaskConfig", kind: "运营配置", description: "任务说明、输入问题、材料要求与结果类型。", writeBy: "产品 / AI 运营", mobileConsumers: ["Workshop Task Runtime"], status: "missing", idField: "taskId + version", sources: ["平台配置"], states: [], retention: "版本化保留" },
      { name: "PromptVersion", kind: "运营配置", description: "Prompt、模型策略和生效版本。", writeBy: "AI 运营", mobileConsumers: ["Workshop Runtime"], status: "missing", idField: "promptVersionId", sources: ["平台配置"], states: [], retention: "版本化保留" },
      { name: "WorkshopRun", kind: "交易状态", description: "某赛事、团队、任务的真实运行状态。", writeBy: "Task Runtime", mobileConsumers: ["/workshop/tasks/:taskId/progress", "/tasks"], status: "partial", idField: "runId", sources: ["Runtime"], states: ["draft", "ready", "queued", "running", "failed", "completed"], retention: "按规则保留；不由 PC 人工录入结果" },
    ],
    relations: ["Competition ↔ Workshop config version", "Skill ↔ Task", "Task ↔ MaterialRequirement", "Run ↔ Team / Result"],
    minimumActions: ["配置并版本化 Skill / Task", "绑定赛事与生效版本", "配置材料和算力规则", "观察运行与失败记录"],
    sampleObjects: [],
  },
];

export const statusMeta: Record<DomainStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  existing: { label: "已有 PC 真相源", tone: "success" },
  partial: { label: "已有事实 / 需归一", tone: "warning" },
  missing: { label: "待接入 PC", tone: "neutral" },
};
