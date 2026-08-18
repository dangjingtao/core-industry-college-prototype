import { ArrowLeft, ArrowRight, ChevronRight, Database, FileBadge2, FileSpreadsheet, KeyRound, ShieldCheck, Tag, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { competitionControlById } from "./competition-control-data";
import { adminDomains, sourceMeta, type AdminObjectRecord, type DataSource } from "./data";
import { pc03OrganizationById, pc03Organizations } from "./PC03State";
import { studentAccountSeed } from "./pc05-data";

type StudentProfileRow = {
  viewKey: string;
  accountId?: string;
  name: string;
  schoolOrganizationId: string;
  major: string;
  grade: string;
  phone: string;
  source: DataSource;
  sourceDetail: string;
  operator: string;
  updatedAt: string;
};

type BasicConfigIndexRow = {
  key: string;
  name: string;
  category: "赛道" | "赛事阶段" | "证书类型" | "协议模板";
  ownerDomain: string;
  canonicalObject: string;
  scope: string;
  maintainPath: string;
  stableIdLabel?: string;
  stableIdValue?: string;
};

type TemplateIndexRow = {
  key: string;
  name: string;
  type: "证书" | "协议" | "Banner" | "权益规则";
  ownerDomain: string;
  canonicalObject: string;
  versionRef: string;
  maintainPath: string;
  note: string;
};

type ImportBatchRow = {
  batchId: string;
  filename: string;
  kind: "报名学生" | "参赛学校" | "赛事赛道" | "证书结果";
  source: DataSource;
  sourceDetail: string;
  target: string;
  total: number;
  success: number;
  failed: number;
  state: "pending" | "validated" | "rejected" | "applied";
  reason?: string;
  conflict?: string;
};

const studentProfiles: StudentProfileRow[] = [
  {
    viewKey: "current",
    name: studentAccountSeed.name,
    schoolOrganizationId: "org-huanan-commerce-college",
    major: studentAccountSeed.major,
    grade: "当前治理样例",
    phone: studentAccountSeed.phone,
    source: "Runtime",
    sourceDetail: "学生本人维护的长期资料",
    operator: "学生本人",
    updatedAt: "2026-08-18 11:18",
  },
];

const schoolOrganizations = pc03Organizations.filter(organization => organization.type === "学校");
const sanchuang16 = competitionControlById("sanchuang-16");

const basicConfigIndex: BasicConfigIndexRow[] = [
  ...(sanchuang16?.tracks.map(track => ({
    key: `sanchuang-16-${track.id}`,
    name: track.name,
    category: "赛道" as const,
    ownerDomain: "赛事中心",
    canonicalObject: "CompetitionTrack",
    scope: "competitionId=sanchuang-16",
    maintainPath: "/admin/competitions/objects/sanchuang-16",
    stableIdLabel: "trackId",
    stableIdValue: track.id,
  })) ?? []),
  {
    key: "sanchuang-16-lifecycle",
    name: "第十六届三创赛生命周期",
    category: "赛事阶段",
    ownerDomain: "赛事中心",
    canonicalObject: "CompetitionLifecycle",
    scope: "competitionId=sanchuang-16",
    maintainPath: "/admin/competitions/objects/sanchuang-16",
    stableIdLabel: "competitionId",
    stableIdValue: "sanchuang-16",
  },
  {
    key: "certificate-config",
    name: "证书类型与签发配置",
    category: "证书类型",
    ownerDomain: "可信证书",
    canonicalObject: "Certificate 配置",
    scope: "资产与可信凭证域",
    maintainPath: "/admin/pc04/certificates",
  },
  {
    key: "competition-agreement",
    name: "赛事协议 / 承诺材料",
    category: "协议模板",
    ownerDomain: "赛事中心 / 报名业务",
    canonicalObject: "CompetitionResource / Registration",
    scope: "competitionId=sanchuang-16",
    maintainPath: "/admin/competitions/objects/sanchuang-16",
    stableIdLabel: "competitionId",
    stableIdValue: "sanchuang-16",
  },
];

const templates: TemplateIndexRow[] = [
  { key: "certificate-rules", name: "证书模板与签发规则", type: "证书", ownerDomain: "可信证书", canonicalObject: "Certificate / 签发规则", versionRef: "跟随 PC04 当前配置版本", maintainPath: "/admin/pc04/certificates", note: "在可信证书模块维护签发与发布配置。" },
  { key: "competition-agreement", name: "赛事协议 / 承诺材料", type: "协议", ownerDomain: "赛事中心 / 报名业务", canonicalObject: "CompetitionResource / Registration", versionRef: "跟随具体 Competition", maintainPath: "/admin/competitions/objects/sanchuang-16", note: "跟随具体赛事维护，不作为全平台统一模板发布。" },
  { key: "home-banner", name: "首页 Banner 与推荐位", type: "Banner", ownerDomain: "内容运营", canonicalObject: "Placement / ContentItem", versionRef: "跟随内容发布配置", maintainPath: "/admin/content/operations", note: "在内容运营中维护展示位置与发布状态。" },
  { key: "benefit-rule", name: "权益资格与领取规则", type: "权益规则", ownerDomain: "权益运营", canonicalObject: "Benefit / EligibilityRule", versionRef: "跟随权益配置版本", maintainPath: "/admin/pc04/benefits/benefit-beauty-sample", note: "在权益模块维护资格和领取规则。" },
];

const importBatches: ImportBatchRow[] = [
  { batchId: "batch-2026-08-17-001", filename: "students-2026-fall.csv", kind: "报名学生", source: "文件导入", sourceDetail: "运营 · 张老师", target: "Account / StudentProfile", total: 248, success: 246, failed: 2, state: "applied", reason: "2 条联系方式重复，已进入人工核对记录" },
  { batchId: "batch-2026-08-16-002", filename: "schools-2026-q3.xlsx", kind: "参赛学校", source: "文件导入", sourceDetail: "运营 · 王老师", target: "Organization(type=School)", total: 312, success: 312, failed: 0, state: "applied" },
  { batchId: "batch-2026-08-15-003", filename: "cert-results-sanchuang-15.xlsx", kind: "证书结果", source: "API 同步", sourceDetail: "赛事可信方接口回流", target: "Certificate / Result", total: 1, success: 1, failed: 0, state: "validated" },
  { batchId: "batch-2026-08-14-004", filename: "students-2026-fall-2.csv", kind: "报名学生", source: "文件导入", sourceDetail: "运营 · 张老师", target: "Account / StudentProfile", total: 96, success: 0, failed: 96, state: "rejected", reason: "缺少学校列；批次已退回" },
  { batchId: "batch-2026-08-18-005", filename: "student-phone-corrections.csv", kind: "报名学生", source: "人工修正", sourceDetail: "运营 · 李老师 · 修正原因已留痕", target: "Account / StudentProfile", total: 2, success: 1, failed: 1, state: "validated", conflict: "1 条手机号与 API 同步值冲突，等待确认；不会静默覆盖权威事实" },
];

const canonicalSources = Object.keys(sourceMeta) as DataSource[];

function StableId({ value, label, testId }: { value: string; label: string; testId?: string }) {
  return (
    <span data-pc05-technical className="inline-flex items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 text-xs">
      <KeyRound size={13} aria-hidden="true" />
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-tertiary"> · </span>
      <strong data-testid={testId} className="text-text-primary">{value}</strong>
    </span>
  );
}

function SourceTag({ source }: { source: DataSource }) {
  return <StatusTag tone={sourceMeta[source].tone}>{source}</StatusTag>;
}

function batchStateMeta(state: ImportBatchRow["state"]) {
  if (state === "applied") return { label: "已应用", tone: "success" as const };
  if (state === "validated") return { label: "已校验", tone: "info" as const };
  if (state === "pending") return { label: "待校验", tone: "warning" as const };
  return { label: "已驳回", tone: "danger" as const };
}

function writebackLabel(kind: ImportBatchRow["kind"]) {
  if (kind === "报名学生") return "学生资料";
  if (kind === "参赛学校") return "学校主体资料";
  if (kind === "赛事赛道") return "赛事配置";
  return "证书与成绩记录";
}

function Header({ eyebrow, title, description, idLabel, idValue }: { eyebrow: string; title: string; description: string; idLabel?: string; idValue?: string }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-text-secondary">{description}</p>
      {idLabel && idValue ? <div className="mt-3"><StableId value={idValue} label={idLabel} testId={idLabel === "organizationId" ? `org-id-${idValue}` : undefined} /></div> : null}
    </section>
  );
}

function NotReady() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 跨域维护工作台" title="未找到这个维护视图" description="基础数据管理用于集中查看各业务模块的基础资料和维护入口，不在这里再创建一套独立业务记录。" />
      <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
        <h2 className="text-xl font-semibold">请选择现有维护入口</h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link to="/admin/basic-data/students" className="inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">学生基础数据 <ArrowRight size={15} /></Link>
          <Link to="/admin/basic-data/schools" className="inline-flex min-h-11 items-center gap-1 rounded-control border border-border-subtle px-4 text-sm font-semibold text-text-secondary">学校基础数据 <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}

function StudentsList() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 学生" title="报名学生基础数据" description="集中查看学生长期资料、来源和维护记录；账号治理、赛事审核和长期成果仍在各自业务入口处理。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div><h2 className="font-semibold">学生资料列表</h2><p className="mt-1 text-xs text-text-tertiary">当前原型复用学生控制台的林晓样例，避免基础数据与治理页面出现对象切换。</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/admin/basic-data/imports" className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold text-text-secondary">批量导入</Link><SecondaryButton>导出</SecondaryButton><SecondaryButton>补充学生资料</SecondaryButton><Link to="/admin/students" className="inline-flex min-h-10 items-center rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">查看学生治理样例</Link></div>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-border-subtle text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary"><tr><th className="px-4 py-3">学生</th><th className="px-4 py-3">学校 / 专业 / 年级</th><th className="px-4 py-3">联系方式</th><th className="px-4 py-3">资料来源</th><th data-pc05-technical className="px-4 py-3">账号锚点</th><th className="px-4 py-3">维护记录</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-border-subtle">{studentProfiles.map(row => { const school = pc03OrganizationById(row.schoolOrganizationId); return <tr key={row.viewKey} className="align-top"><td className="px-4 py-3"><p className="font-semibold">{row.name}</p><p data-pc05-technical className="mt-1 text-xs text-text-tertiary">StudentProfile</p></td><td className="px-4 py-3 text-text-secondary"><p>{school?.name ?? "学校主体待映射"}</p><p className="mt-1 text-xs text-text-tertiary">{row.major} · {row.grade}</p></td><td className="px-4 py-3 text-text-secondary">{row.phone}</td><td className="px-4 py-3"><SourceTag source={row.source} /><p className="mt-1 text-xs text-text-tertiary">{row.sourceDetail}</p></td><td data-pc05-technical className="px-4 py-3"><span data-testid={`account-id-${row.viewKey}`} className="text-xs font-semibold text-warning-text">{row.accountId ?? "账号 ID 待真实账号层接入"}</span></td><td className="px-4 py-3 text-xs text-text-tertiary"><p>{row.operator}</p><p className="mt-1">{row.updatedAt}</p></td><td className="px-4 py-3 text-right text-text-brand"><Link to={`/admin/basic-data/students/${row.viewKey}`} className="inline-flex items-center gap-1 text-xs font-semibold">查看 <ChevronRight size={13} /></Link></td></tr>; })}</tbody></table></div>
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text"><h3 className="font-semibold">资料、账号治理和赛事审核分开维护</h3><p className="mt-2 leading-6">这里负责集中查看学生基础资料；冻结账号去权限与审计，报名审核和官方资格去具体赛事，学习、投递、权益与证书继续在所属模块处理。</p><p data-pc05-technical className="mt-2 text-xs">Account / StudentProfile · Governance · CompetitionIdentity</p></section>
    </div>
  );
}

function StudentDetail({ viewKey }: { viewKey: string }) {
  const student = studentProfiles.find(item => item.viewKey === viewKey);
  if (!student) return <div className="space-y-6"><Header eyebrow="基础数据管理 / 学生" title="学生资料不存在" description="该地址没有对应的学生资料样例，请返回列表重新选择。" /><section className="rounded-container border border-border-subtle bg-surface p-8 text-center"><Link to="/admin/basic-data/students" className="inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回学生列表 <ArrowRight size={15} /></Link></section></div>;
  const school = pc03OrganizationById(student.schoolOrganizationId);
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 学生" title={`${student.name} · 学生基础资料`} description="查看当前学生的基础资料和维护记录。当前 PC05 只提供这一位学生的治理样例，尚未实现按账号切换其它学生。" />
      <section className="rounded-container border border-border-subtle bg-surface p-5"><Link to="/admin/basic-data/students" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回学生列表</Link><div className="mt-4 grid gap-4 lg:grid-cols-3"><div data-pc05-technical className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">账号锚点</p><p data-testid="student-account-anchor" className="mt-1 text-sm font-semibold text-warning-text">{student.accountId ?? "账号 ID 待真实账号层接入"}</p></div><div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">资料状态</p><p className="mt-1 text-sm font-semibold">由学生长期维护</p><p data-pc05-technical className="mt-1 text-xs text-text-tertiary">StudentProfile 无独立业务状态</p></div><div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">资料来源</p><p className="mt-1 text-sm font-semibold">{student.sourceDetail}</p><div data-pc05-technical className="mt-2"><SourceTag source={student.source} /></div></div></div></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">基础信息</h3><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-text-tertiary">姓名</dt><dd className="mt-1 font-semibold">{student.name}</dd></div><div><dt className="text-xs text-text-tertiary">联系方式</dt><dd className="mt-1 font-semibold">{student.phone}</dd></div><div><dt className="text-xs text-text-tertiary">学校</dt><dd className="mt-1 font-semibold">{school?.name ?? "待映射"}</dd></div><div><dt className="text-xs text-text-tertiary">专业 · 年级</dt><dd className="mt-1 font-semibold">{student.major} · {student.grade}</dd></div></dl></div><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">归属与维护</h3><ul className="mt-4 space-y-3 text-sm"><li className="flex items-center gap-2"><Database size={16} className="text-text-brand" />学生本人优先维护长期资料。</li><li className="flex items-center gap-2"><ShieldCheck size={16} className="text-text-brand" />人工修正必须记录原因和操作人。</li><li className="flex items-center gap-2"><ShieldCheck size={16} className="text-text-brand" />账号冻结在权限与审计中处理，不改变学生资料本身。</li></ul><p data-pc05-technical className="mt-3 text-xs text-text-tertiary">Truth source: Account / StudentProfile</p></div></section>
      <section className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary"><h3 className="font-semibold">继续处理</h3><p className="mt-2 rounded-control bg-warning-bg px-3 py-2 text-xs leading-5 text-warning-text">当前 PC05 学生控制台复用同一位“林晓”治理样例；原型尚未实现按账号切换其它学生，因此这里不声称可以编辑任意列表学生。</p><div className="mt-4 flex flex-wrap gap-2"><Link to="/admin/students" className="inline-flex min-h-10 items-center rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">进入学生与赛事身份控制台</Link><Link to="/admin/basic-data/imports" className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold">查看关联导入批次</Link><Link to="/admin/governance" className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold">查看账号治理与审计</Link></div></section>
    </div>
  );
}

function SchoolsList() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 学校" title="参赛学校基础数据" description="集中查看学校主体资料、来源、赛事授权关系和审核责任；学校本身继续在“主体与学校”中维护。" />
      <section className="rounded-container border border-border-subtle bg-surface"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4"><div><h2 className="font-semibold">学校主体列表</h2><p className="mt-1 text-xs text-text-tertiary">共 {schoolOrganizations.length} 所 · 名称、来源和关系直接复用“主体与学校”资料。</p></div><div className="flex flex-wrap gap-2"><Link to="/admin/basic-data/imports" className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold text-text-secondary">批量导入</Link><Link to="/admin/organizations" className="inline-flex min-h-10 items-center rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">+ 新建 / 维护学校主体</Link></div></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-border-subtle text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary"><tr><th className="px-4 py-3">学校</th><th className="px-4 py-3">主体类型</th><th className="px-4 py-3">数据来源</th><th className="px-4 py-3">赛事授权 / 关系</th><th className="px-4 py-3">审核角色说明</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-border-subtle">{schoolOrganizations.map(row => <tr key={row.id} className="align-top"><td className="px-4 py-3"><p className="font-semibold">{row.name}</p><p className="mt-1 text-xs text-text-tertiary"><StableId value={row.id} label="organizationId" testId={`org-id-${row.id}`} /></p></td><td className="px-4 py-3 text-text-secondary"><span>学校主体</span><span data-pc05-technical className="ml-2 text-xs">Organization(type={row.type})</span></td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{row.sources.map(source => <SourceTag key={source} source={source} />)}</div></td><td className="px-4 py-3 text-text-secondary">{row.relations.length ? row.relations.map(relation => <p key={relation.stableId}>{relation.label}</p>) : "暂无赛事关系"}</td><td className="px-4 py-3 text-xs leading-5 text-text-tertiary">{row.trust}</td><td className="px-4 py-3 text-right text-text-brand"><Link to={`/admin/basic-data/schools/${row.id}`} className="inline-flex items-center gap-1 text-xs font-semibold">查看 <ChevronRight size={13} /></Link></td></tr>)}</tbody></table></div></section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text"><h3 className="font-semibold">学校资料和赛事授权分开维护</h3><p className="mt-2 leading-6">学校基础信息属于主体资料；某场赛事能查看什么、由谁审核，则跟随该赛事的授权范围维护。</p><p data-pc05-technical className="mt-2 text-xs">Organization(type=School) · organizationId + competitionId · SchoolScope</p></section>
    </div>
  );
}

function SchoolDetail({ organizationId }: { organizationId: string }) {
  const school = pc03OrganizationById(organizationId);
  if (!school || school.type !== "学校") return <div className="space-y-6"><Header eyebrow="基础数据管理 / 学校" title="学校主体不存在" description="没有找到对应学校主体，请返回学校列表重新选择。" /><section className="rounded-container border border-border-subtle bg-surface p-8 text-center"><Link to="/admin/basic-data/schools" className="inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回学校列表 <ArrowRight size={15} /></Link></section></div>;
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 学校" title={school.name} description="查看学校主体资料、来源和当前赛事授权关系；这里不维护额外的学校认证状态。" idLabel="organizationId" idValue={school.id} />
      <section className="rounded-container border border-border-subtle bg-surface p-5"><Link to="/admin/basic-data/schools" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回学校列表</Link><div className="mt-4 grid gap-4 lg:grid-cols-3"><div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">主体类型</p><p className="mt-1 font-semibold">学校</p><p data-pc05-technical className="mt-1 text-xs text-text-tertiary">Organization(type={school.type})</p></div><div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">数据来源</p><div className="mt-2 flex flex-wrap gap-1">{school.sources.map(source => <SourceTag key={source} source={source} />)}</div></div><div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm"><p className="text-xs text-text-tertiary">赛事关系数</p><p className="mt-1 font-semibold">{school.relations.length}</p></div></div></section>
      <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">主体说明</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{school.summary}</p><p className="mt-3 text-xs leading-5 text-text-tertiary">{school.trust}</p></div><div className="rounded-container border border-border-subtle bg-surface p-5"><h3 className="font-semibold">当前赛事授权 / 关系</h3><div className="mt-3 space-y-2">{school.relations.map(relation => <div key={relation.stableId} className="rounded-control bg-surface-subtle p-3 text-sm"><p className="font-semibold">{relation.label}</p><p data-pc05-technical className="mt-1 text-xs text-text-tertiary">{relation.kind} · {relation.stableId}</p></div>)}</div><p className="mt-3 text-xs text-text-tertiary">赛事授权范围在赛事中心维护，不在学校主体资料里新增认证状态。</p></div></section>
      <section className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary"><h3 className="font-semibold">继续处理</h3><div className="mt-4 flex flex-wrap gap-2"><Link to={`/admin/organizations/${school.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">编辑学校主体 <ArrowRight size={15} /></Link><Link to="/admin/competitions" className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold">配置赛事范围</Link><Link to={`/admin/organizations/${school.id}`} className="inline-flex min-h-10 items-center rounded-control border border-border-subtle px-3 text-sm font-semibold">查看主体关系</Link></div></section>
    </div>
  );
}

function Dictionaries() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 · 配置索引" title="赛事 / 赛道字典" description="集中查看赛事赛道、阶段、证书类型和协议配置分别由哪个业务模块维护；这里提供索引和跳转，不直接发布配置。" />
      <section className="rounded-container border border-border-subtle bg-surface"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4"><div><h2 className="font-semibold">基础配置索引</h2><p className="mt-1 text-xs text-text-tertiary">共 {basicConfigIndex.length} 条 · 修改时进入对应业务模块。</p></div><Link to="/admin/competitions" className="inline-flex min-h-10 items-center rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">去所属模块新增 / 维护</Link></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-border-subtle text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary"><tr><th className="px-4 py-3">名称</th><th className="px-4 py-3">分类</th><th className="px-4 py-3">归属模块</th><th className="px-4 py-3">配置说明</th><th className="px-4 py-3">维护入口</th></tr></thead><tbody className="divide-y divide-border-subtle">{basicConfigIndex.map(row => <tr key={row.key}><td className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Tag size={14} className="text-text-tertiary" />{row.name}</span>{row.stableIdLabel && row.stableIdValue ? <p className="mt-1"><StableId label={row.stableIdLabel} value={row.stableIdValue} /></p> : null}</td><td className="px-4 py-3 text-text-secondary">{row.category}</td><td className="px-4 py-3 font-medium">{row.ownerDomain}</td><td className="px-4 py-3 text-text-secondary"><p>跟随所属模块维护并生效。</p><div data-pc05-technical className="mt-1 text-xs text-text-tertiary"><p>{row.canonicalObject}</p><p>{row.scope}</p></div></td><td className="px-4 py-3"><Link to={row.maintainPath} className="inline-flex items-center gap-1 text-xs font-semibold text-text-brand">去维护 <ChevronRight size={13} /></Link><p className="mt-2"><Link to={`/admin/basic-data/dictionaries/${row.key}`} className="text-xs text-text-tertiary">查看索引说明</Link></p></td></tr>)}</tbody></table></div></section>
    </div>
  );
}

function DictionaryDetail({ dictionaryKey }: { dictionaryKey: string }) {
  const item = basicConfigIndex.find(row => row.key === dictionaryKey);
  if (!item) return <NotReady />;
  return <div className="space-y-6"><Header eyebrow="基础数据管理 / 配置索引" title={item.name} description="这里用于说明这项配置归属哪个业务模块；真正修改和发布仍回到所属模块完成。" idLabel={item.stableIdLabel} idValue={item.stableIdValue} /><section className="rounded-container border border-border-subtle bg-surface p-5"><Link to="/admin/basic-data/dictionaries" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回配置索引</Link><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-text-tertiary">分类</dt><dd className="mt-1 font-semibold">{item.category}</dd></div><div><dt className="text-xs text-text-tertiary">归属模块</dt><dd className="mt-1 font-semibold">{item.ownerDomain}</dd></div><div data-pc05-technical><dt className="text-xs text-text-tertiary">canonical object</dt><dd className="mt-1 font-semibold">{item.canonicalObject}</dd></div><div data-pc05-technical><dt className="text-xs text-text-tertiary">Scope</dt><dd className="mt-1 font-semibold">{item.scope}</dd></div></dl><Link to={item.maintainPath} className="mt-5 inline-flex min-h-10 items-center gap-1 rounded-control bg-primary px-3 text-sm font-semibold text-on-primary">去所属业务模块维护 <ArrowRight size={15} /></Link></section></div>;
}

function Templates() {
  return <div className="space-y-6"><Header eyebrow="基础数据管理 · 模板索引" title="证书 / 协议模板" description="集中查看证书、赛事协议、首页 Banner 和权益规则分别在哪里维护；版本和发布状态继续由所属业务模块负责。" /><section className="rounded-container border border-border-subtle bg-surface"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4"><div><h2 className="font-semibold">模板与规则索引</h2><p className="mt-1 text-xs text-text-tertiary">共 {templates.length} 条 · 从这里找到入口，不在这里再维护第二份发布状态。</p></div><SecondaryButton>按归属模块维护 / 发布</SecondaryButton></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-border-subtle text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary"><tr><th className="px-4 py-3">模板 / 规则</th><th className="px-4 py-3">类型</th><th className="px-4 py-3">归属模块</th><th className="px-4 py-3">版本 / 发布</th><th className="px-4 py-3">维护入口</th></tr></thead><tbody className="divide-y divide-border-subtle">{templates.map(row => <tr key={row.key} className="align-top"><td className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><FileBadge2 size={14} className="text-text-tertiary" />{row.name}</span><p className="mt-1 text-xs font-normal text-text-tertiary">{row.note}</p></td><td className="px-4 py-3 text-text-secondary">{row.type}</td><td className="px-4 py-3 font-medium">{row.ownerDomain}</td><td className="px-4 py-3 text-text-secondary"><p>跟随所属模块</p><div data-pc05-technical className="mt-1 text-xs text-text-tertiary"><p>{row.canonicalObject}</p><p>{row.versionRef}</p></div></td><td className="px-4 py-3"><Link to={row.maintainPath} className="inline-flex items-center gap-1 text-xs font-semibold text-text-brand">去维护 <ChevronRight size={13} /></Link></td></tr>)}</tbody></table></div></section></div>;
}

function Imports() {
  return <div className="space-y-6"><Header eyebrow="基础数据管理 · 数据接入治理" title="导入与批处理" description="集中查看 Excel / CSV、接口同步和人工修正的处理批次，明确每批数据最终写回哪个业务模块，并保留失败原因与冲突记录。" /><section data-pc05-technical className="rounded-container border border-border-subtle bg-surface p-4"><p className="text-xs font-semibold text-text-tertiary">canonical DataSource（仅五类）</p><div data-testid="canonical-data-sources" className="mt-2 flex flex-wrap gap-2">{canonicalSources.map(source => <SourceTag key={source} source={source} />)}</div></section><section className="rounded-container border border-border-subtle bg-surface"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4"><div><h2 className="font-semibold">数据接入批次</h2><p className="mt-1 text-xs text-text-tertiary">共 {importBatches.length} 个批次 · 这里的“已校验 / 已应用 / 已驳回”只描述数据处理进度。</p></div><div className="flex flex-wrap gap-2"><SecondaryButton><Upload size={15} />上传文件</SecondaryButton><Button><FileSpreadsheet size={15} />下载批次报告</Button></div></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-border-subtle text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary"><tr><th className="px-4 py-3">批次 / 文件</th><th className="px-4 py-3">对象 / 写回位置</th><th className="px-4 py-3">来源 / 责任人</th><th className="px-4 py-3">行数</th><th className="px-4 py-3">批次状态 / 原因</th></tr></thead><tbody className="divide-y divide-border-subtle">{importBatches.map(row => { const state = batchStateMeta(row.state); return <tr key={row.batchId} className="align-top"><td className="px-4 py-3"><p className="font-semibold">{row.filename}</p><p className="mt-1 text-xs text-text-tertiary"><StableId value={row.batchId} label="batchId" /></p></td><td className="px-4 py-3 text-text-secondary"><p>{row.kind}</p><p className="mt-1 text-xs font-semibold text-text-primary">→ {writebackLabel(row.kind)}</p><p data-pc05-technical className="mt-1 text-xs text-text-tertiary">{row.target}</p></td><td className="px-4 py-3"><SourceTag source={row.source} /><p className="mt-1 text-xs text-text-tertiary">{row.sourceDetail}</p></td><td className="px-4 py-3 text-text-secondary">共 {row.total} · 成 {row.success} · 败 {row.failed}</td><td className="px-4 py-3"><StatusTag tone={state.tone}>{state.label}</StatusTag>{row.reason ? <p className="mt-1 text-xs text-text-tertiary">{row.reason}</p> : null}{row.conflict ? <p className="mt-2 rounded-control bg-warning-bg px-2 py-1 text-xs text-warning-text">冲突：{row.conflict}</p> : null}</td></tr>; })}</tbody></table></div></section><section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text"><h3 className="font-semibold">写回规则</h3><p className="mt-2 leading-6">学生资料回学生模块，学校资料回主体与学校，赛事赛道回具体赛事，证书结果回可信资产；接口数据与人工修正冲突必须显式提示，不得静默覆盖。</p><p data-pc05-technical className="mt-2 text-xs">Account / StudentProfile · Organization(type=School) · CompetitionTrack · Certificate / Result</p></section></div>;
}

function SampleObjects() {
  const records: AdminObjectRecord[] = adminDomains.find(domain => domain.id === "basicData")?.sampleObjects ?? [];
  return <div className="space-y-6"><Header eyebrow="基础数据管理 / 数据关系" title="跨域聚合 · 样例对象" description="这些卡片用于评审各业务模块如何被基础数据工作台引用；实际业务状态仍由所属模块维护。" /><section className="grid gap-4 md:grid-cols-2">{records.map(obj => <article key={obj.key} className="rounded-container border border-border-subtle bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-brand">{obj.entity}</p><h3 className="mt-2 text-lg font-semibold">{obj.name}</h3><p className="mt-2 text-sm text-text-secondary">{obj.sourceDetail}</p><div data-pc05-technical className="mt-3 flex flex-wrap gap-2 text-xs text-text-tertiary"><StableId value={obj.stableId} label={obj.stableIdField} /><SourceTag source={obj.source} /><StatusTag tone="info">业务状态：{obj.businessState}</StatusTag></div><p className="mt-3 text-xs text-text-tertiary">写入人：{obj.editor}</p><p className="mt-1 text-xs text-text-tertiary">保留规则：{obj.retention}</p></article>)}</section><section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text"><p className="leading-6">基础数据管理只是跨模块维护入口，不拥有第二份学生、学校、赛事、证书或内容记录。</p></section></div>;
}

export function BasicDataConsole() {
  const { sub, id } = useParams();
  if (!sub || ((sub === "overview" || sub === "students") && !id)) return <StudentsList />;
  if (sub === "students" && id) return <StudentDetail viewKey={id} />;
  if (sub === "schools" && !id) return <SchoolsList />;
  if (sub === "schools" && id) return <SchoolDetail organizationId={id} />;
  if (sub === "dictionaries" && !id) return <Dictionaries />;
  if (sub === "dictionaries" && id) return <DictionaryDetail dictionaryKey={id} />;
  if (sub === "templates") return <Templates />;
  if (sub === "imports") return <Imports />;
  if (sub === "samples") return <SampleObjects />;
  return <NotReady />;
}
