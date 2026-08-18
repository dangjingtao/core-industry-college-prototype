import { ArrowLeft, ArrowRight, BadgeCheck, ChevronRight, Database, FileBadge2, FileSpreadsheet, KeyRound, ShieldCheck, Tag, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, SecondaryButton, StatusTag } from "../components/ui";
import { adminDomains, sourceMeta, type AdminObjectRecord } from "./data";

type StudentProfileRow = {
  studentId: string;
  name: string;
  school: string;
  major: string;
  grade: string;
  phone: string;
  source: keyof typeof sourceMeta;
  trusted: boolean;
  state: "active" | "frozen" | "merged";
  operator: string;
  updatedAt: string;
};

type SchoolMasterRow = {
  organizationId: string;
  name: string;
  province: string;
  regionCode: string;
  contact: string;
  scope: string;
  state: "unverified" | "verified" | "frozen";
  lastSyncAt: string;
};

type DictionaryRow = {
  id: string;
  name: string;
  category: "赛道" | "阶段" | "学段" | "证书类型" | "协议模板";
  usedBy: string;
  status: "启用" | "已归档";
};

type TemplateRow = {
  id: string;
  name: string;
  version: string;
  type: "证书" | "协议" | "Banner";
  publisher: string;
  publishedAt: string;
};

type ImportBatchRow = {
  batchId: string;
  filename: string;
  kind: "报名学生" | "参赛学校" | "证书结果";
  submittedBy: string;
  total: number;
  success: number;
  failed: number;
  state: "pending" | "validated" | "rejected" | "applied";
  reason?: string;
};

const studentProfiles: StudentProfileRow[] = [
  { studentId: "student-2024-chenyu", name: "陈语", school: "岭南科技学院", major: "电子商务", grade: "大三", phone: "138****8821", source: "API 同步", trusted: true, state: "active", operator: "王老师 / 平台合并", updatedAt: "2026-08-17 10:22" },
  { studentId: "student-2025-linhai", name: "林海", school: "华南商贸学院", major: "市场营销", grade: "大四", phone: "139****1102", source: "平台配置", trusted: true, state: "active", operator: "运营录入", updatedAt: "2026-08-16 18:40" },
  { studentId: "student-2025-zhangyu", name: "张雨", school: "华东工学院", major: "信息管理", grade: "大二", phone: "186****5520", source: "文件导入", trusted: false, state: "active", operator: "批量导入 · 待人工核对", updatedAt: "2026-08-15 09:11" },
  { studentId: "student-2023-wangyi", name: "王一", school: "华中管理学院", major: "物流管理", grade: "已毕业", phone: "137****0993", source: "Runtime", trusted: true, state: "frozen", operator: "账号治理 · 冻结", updatedAt: "2026-08-10 14:05" },
];

const schoolMaster: SchoolMasterRow[] = [
  { organizationId: "org-lingnan-tech", name: "岭南科技学院", province: "广东省", regionCode: "440000", contact: "王老师", scope: "第十六届三创赛 · 全赛道", state: "verified", lastSyncAt: "2026-08-17 09:00" },
  { organizationId: "org-huanan-trade", name: "华南商贸学院", province: "广东省", regionCode: "440100", contact: "李老师", scope: "第十六届三创赛 · 全赛道", state: "verified", lastSyncAt: "2026-08-17 08:30" },
  { organizationId: "org-huadong-tech", name: "华东工学院", province: "上海市", regionCode: "310000", contact: "赵老师", scope: "第十六届三创赛 · 待认证", state: "unverified", lastSyncAt: "2026-08-16 17:20" },
  { organizationId: "org-huazhong-mgmt", name: "华中管理学院", province: "湖北省", regionCode: "420000", contact: "陈老师", scope: "历史合作 · 已停招", state: "frozen", lastSyncAt: "2026-08-10 14:00" },
];

const dictionaries: DictionaryRow[] = [
  { id: "track-digital-ops", name: "数字化运营实战", category: "赛道", usedBy: "第十六届三创赛 / 2026 青年品牌创新挑战赛", status: "启用" },
  { id: "track-ai-digital", name: "AI + 数字化运营", category: "赛道", usedBy: "第十六届三创赛", status: "启用" },
  { id: "track-local-life", name: "社区本地生活", category: "赛道", usedBy: "第十六届三创赛", status: "启用" },
  { id: "track-cross-border", name: "跨境数字化运营", category: "赛道", usedBy: "第十六届三创赛", status: "启用" },
  { id: "phase-school-selection", name: "校内选拔赛", category: "阶段", usedBy: "三创赛生命周期", status: "启用" },
  { id: "phase-province", name: "省级赛", category: "阶段", usedBy: "三创赛生命周期", status: "启用" },
  { id: "phase-national", name: "全国总决赛", category: "阶段", usedBy: "三创赛生命周期", status: "启用" },
  { id: "cert-course", name: "课程完成证书", category: "证书类型", usedBy: "PC04 · 证书签发", status: "启用" },
  { id: "agreement-nda", name: "赛事保密协议", category: "协议模板", usedBy: "第十六届三创赛", status: "启用" },
];

const templates: TemplateRow[] = [
  { id: "tpl-cert-course-v3", name: "课程完成证书模板", version: "v3.2", type: "证书", publisher: "资产运营", publishedAt: "2026-08-12" },
  { id: "tpl-cert-sanchuang-final", name: "三创赛国赛证书模板", version: "v2.0", type: "证书", publisher: "资产运营", publishedAt: "2026-07-30" },
  { id: "tpl-agreement-nda-v1", name: "赛事保密协议", version: "v1.4", type: "协议", publisher: "赛事运营", publishedAt: "2026-08-05" },
  { id: "tpl-banner-home-v9", name: "首页主 Banner", version: "v9.1", type: "Banner", publisher: "内容运营", publishedAt: "2026-08-17" },
];

const importBatches: ImportBatchRow[] = [
  { batchId: "batch-2026-08-17-001", filename: "students-2026-fall.csv", kind: "报名学生", submittedBy: "运营 · 张老师", total: 248, success: 246, failed: 2, state: "applied", reason: "2 条联系方式重复，运营已合并" },
  { batchId: "batch-2026-08-16-002", filename: "schools-2026-q3.xlsx", kind: "参赛学校", submittedBy: "运营 · 王老师", total: 312, success: 312, failed: 0, state: "applied" },
  { batchId: "batch-2026-08-15-003", filename: "cert-results-sanchuang-15.xlsx", kind: "证书结果", submittedBy: "赛事可信方 · API 同步", total: 1, success: 1, failed: 0, state: "validated" },
  { batchId: "batch-2026-08-14-004", filename: "students-2026-fall-2.csv", kind: "报名学生", submittedBy: "运营 · 张老师", total: 96, success: 0, failed: 96, state: "rejected", reason: "缺少学校列；批次已退回" },
];

function StableId({ value, label, testId }: { value: string; label: string; testId?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-control bg-surface-subtle px-2.5 py-1 text-xs">
      <KeyRound size={13} aria-hidden="true" />
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-tertiary"> · </span>
      <strong data-testid={testId} className="text-text-primary">{value}</strong>
    </span>
  );
}

function SourceTag({ source }: { source: keyof typeof sourceMeta }) {
  return <StatusTag tone={sourceMeta[source].tone}>{source}</StatusTag>;
}

function studentStateMeta(state: StudentProfileRow["state"]) {
  if (state === "active") return { label: "正常", tone: "success" as const };
  if (state === "frozen") return { label: "已冻结", tone: "warning" as const };
  return { label: "已合并", tone: "neutral" as const };
}

function schoolStateMeta(state: SchoolMasterRow["state"]) {
  if (state === "verified") return { label: "已认证", tone: "success" as const };
  if (state === "unverified") return { label: "待认证", tone: "warning" as const };
  return { label: "已停招", tone: "danger" as const };
}

function batchStateMeta(state: ImportBatchRow["state"]) {
  if (state === "applied") return { label: "已生效", tone: "success" as const };
  if (state === "validated") return { label: "已校验", tone: "info" as const };
  if (state === "pending") return { label: "待校验", tone: "warning" as const };
  return { label: "已驳回", tone: "danger" as const };
}

function Header({ eyebrow, title, description, idLabel, idValue }: { eyebrow: string; title: string; description: string; idLabel?: string; idValue?: string }) {
  return (
    <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-brand">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
      {idLabel && idValue ? <div className="mt-3"><StableId value={idValue} label={idLabel} testId={idLabel === "studentId" ? `student-id-${idValue}` : idLabel === "organizationId" ? `org-id-${idValue}` : undefined} /></div> : null}
    </section>
  );
}

function NotReady() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理" title="即将开放" description="这一项只做主数据 / 字典 / 模板 / 权限 / 导入批处理；正式页还在补，先以列表入口展示。后续会按 PC 端现有 PC01 / PC04 / PC05 的视觉与可交互模式补齐。" />
      <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
        <h2 className="text-xl font-semibold">入口已挂载，正式页待补</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary">老板 15 分钟原型的核心诉求是“把学生 / 学校基础数据集中起来”，当前 PC 端先把入口、路由、子菜单建好。后续按“学生 Profile / 学校主数据”分两个子页落地。</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link to="/admin/basic-data/students" className="inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">进入报名学生基础数据 <ArrowRight size={15} /></Link>
          <Link to="/admin/basic-data/schools" className="inline-flex min-h-11 items-center gap-1 rounded-control border border-border-subtle px-4 text-sm font-semibold text-text-secondary">进入参赛学校基础数据 <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}

function StudentsList() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 报名学生" title="报名学生基础数据" description="学生长期 Profile：学校、专业、年级、联系方式、可信状态与来源归属。账号冻结不清空长期资料；Runtime 状态由各业务域承担，不在这一层复制。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div>
            <h2 className="font-semibold">学生 Profile 列表</h2>
            <p className="mt-1 text-xs text-text-tertiary">共 {studentProfiles.length} 条 · 来源以 API 同步和文件导入为主，人工修正必须留痕。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton>批量导入</SecondaryButton>
            <SecondaryButton>导出</SecondaryButton>
            <Button>+ 新建学生 Profile</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-4 py-3">学生</th>
                <th className="px-4 py-3">学校 / 专业 / 年级</th>
                <th className="px-4 py-3">联系方式</th>
                <th className="px-4 py-3">来源</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">操作者 / 时间</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {studentProfiles.map(row => {
                const state = studentStateMeta(row.state);
                return (
                  <tr key={row.studentId} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <p className="mt-1 text-xs text-text-tertiary"><StableId value={row.studentId} label="studentId" testId={`student-id-${row.studentId}`} /></p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      <p>{row.school}</p>
                      <p className="mt-1 text-xs text-text-tertiary">{row.major} · {row.grade}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.phone}</td>
                    <td className="px-4 py-3"><SourceTag source={row.source} /> <span className="ml-2 text-xs text-text-tertiary">{row.trusted ? "可信" : "待核对"}</span></td>
                    <td className="px-4 py-3"><StatusTag tone={state.tone}>{state.label}</StatusTag></td>
                    <td className="px-4 py-3 text-xs text-text-tertiary">
                      <p>{row.operator}</p>
                      <p className="mt-1">{row.updatedAt}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-text-brand"><Link to={`/admin/basic-data/students/${row.studentId}`} className="inline-flex items-center gap-1 text-xs font-semibold">查看 <ChevronRight size={13} /></Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text">
        <h3 className="font-semibold">基础数据 ≠ 业务状态</h3>
        <p className="mt-2 leading-6">这里只维护学生 Profile 的长期事实（学校、专业、联系方式、可信来源）。学生在每场赛事的身份、当前学习进度、投递状态、证书领取等 Runtime 状态，继续由对应业务域承担；这一层不复制第二份真相源。</p>
      </section>
    </div>
  );
}

function StudentDetail({ studentId }: { studentId: string }) {
  const student = studentProfiles.find(item => item.studentId === studentId);
  if (!student) {
    return (
      <div className="space-y-6">
        <Header eyebrow="基础数据管理 / 报名学生" title="学生 Profile 不存在" description="可能已被合并或归档，可在“合并记录”里继续追溯。" />
        <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold">未找到该学生 Profile</h2>
          <Link to="/admin/basic-data/students" className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回学生列表 <ArrowRight size={15} /></Link>
        </section>
      </div>
    );
  }
  const state = studentStateMeta(student.state);
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 报名学生" title={`${student.name} · Profile`} description="学生长期事实与可信状态。冻结账号不清空长期资料；Runtime 状态由各业务域承担。" idLabel="studentId" idValue={student.studentId} />
      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <Link to="/admin/basic-data/students" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回学生列表</Link>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">状态</p>
            <p className="mt-1 text-base font-semibold"><StatusTag tone={state.tone}>{state.label}</StatusTag></p>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">来源</p>
            <p className="mt-1 text-base font-semibold"><SourceTag source={student.source} /></p>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">操作者 / 时间</p>
            <p className="mt-1 text-sm font-semibold">{student.operator}</p>
            <p className="mt-1 text-xs text-text-tertiary">{student.updatedAt}</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <h3 className="font-semibold">基础信息</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-text-tertiary">姓名</dt><dd className="mt-1 font-semibold">{student.name}</dd></div>
            <div><dt className="text-xs text-text-tertiary">联系方式</dt><dd className="mt-1 font-semibold">{student.phone}</dd></div>
            <div><dt className="text-xs text-text-tertiary">学校</dt><dd className="mt-1 font-semibold">{student.school}</dd></div>
            <div><dt className="text-xs text-text-tertiary">专业 · 年级</dt><dd className="mt-1 font-semibold">{student.major} · {student.grade}</dd></div>
          </dl>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <h3 className="font-semibold">可信状态与来源</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2"><BadgeCheck size={16} className={student.trusted ? "text-success" : "text-text-tertiary"} />{student.trusted ? "已通过可信校验" : "暂未通过可信校验"}</li>
            <li className="flex items-center gap-2"><Database size={16} className="text-text-brand" />来源：{student.source}</li>
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-text-brand" />冻结仅冻结账号，Profile 仍可被历史赛事与权益引用。</li>
          </ul>
        </div>
      </section>
      <section className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary">
        <h3 className="font-semibold">可执行动作（原型）</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>编辑 Profile</Button>
          <SecondaryButton>标记合并 / 转交</SecondaryButton>
          <SecondaryButton>申请冻结（高风险审批）</SecondaryButton>
          <SecondaryButton>查看关联导入批次</SecondaryButton>
        </div>
        <p className="mt-3 text-xs leading-5 text-text-tertiary">按钮只示意运营动作；真实审批仍走“权限与审计”域的高风险审批，不在这一层直接生效。</p>
      </section>
    </div>
  );
}

function SchoolsList() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 参赛学校" title="参赛学校基础数据" description="学校主数据：院校名称、省份、地区代码、参赛范围、负责人。负责人与联系方式是基础数据；赛事范围和“本届是否招新”由赛事范围承担。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div>
            <h2 className="font-semibold">学校主数据</h2>
            <p className="mt-1 text-xs text-text-tertiary">共 {schoolMaster.length} 所 · 认证状态以权威 API / 人工核对为准。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton>批量导入</SecondaryButton>
            <Button>+ 新建学校</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-4 py-3">学校</th>
                <th className="px-4 py-3">省份 / 地区代码</th>
                <th className="px-4 py-3">负责人</th>
                <th className="px-4 py-3">参赛范围</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">最近同步</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {schoolMaster.map(row => {
                const state = schoolStateMeta(row.state);
                return (
                  <tr key={row.organizationId} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <p className="mt-1 text-xs text-text-tertiary"><StableId value={row.organizationId} label="organizationId" testId={`org-id-${row.organizationId}`} /></p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.province} · {row.regionCode}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.contact}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.scope}</td>
                    <td className="px-4 py-3"><StatusTag tone={state.tone}>{state.label}</StatusTag></td>
                    <td className="px-4 py-3 text-xs text-text-tertiary">{row.lastSyncAt}</td>
                    <td className="px-4 py-3 text-right text-text-brand"><Link to={`/admin/basic-data/schools/${row.organizationId}`} className="inline-flex items-center gap-1 text-xs font-semibold">查看 <ChevronRight size={13} /></Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text">
        <h3 className="font-semibold">学校主数据 vs 赛事范围</h3>
        <p className="mt-2 leading-6">学校主数据回答“这是一所什么学校、谁负责”，赛事范围回答“这届比赛这所学校能不能报名 / 哪些赛道”。两者解耦，避免改主数据连带影响赛事范围。</p>
      </section>
    </div>
  );
}

function SchoolDetail({ organizationId }: { organizationId: string }) {
  const school = schoolMaster.find(item => item.organizationId === organizationId);
  if (!school) {
    return (
      <div className="space-y-6">
        <Header eyebrow="基础数据管理 / 参赛学校" title="学校主数据不存在" description="可能已合并或归档。" />
        <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold">未找到该学校主数据</h2>
          <Link to="/admin/basic-data/schools" className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回学校列表 <ArrowRight size={15} /></Link>
        </section>
      </div>
    );
  }
  const state = schoolStateMeta(school.state);
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 参赛学校" title={school.name} description="学校主数据。省份、地区代码、负责人是基础事实；当前赛事范围与是否招新由赛事范围承担。" idLabel="organizationId" idValue={school.organizationId} />
      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <Link to="/admin/basic-data/schools" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回学校列表</Link>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">状态</p>
            <p className="mt-1"><StatusTag tone={state.tone}>{state.label}</StatusTag></p>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">省份 / 地区代码</p>
            <p className="mt-1 font-semibold">{school.province} · {school.regionCode}</p>
          </div>
          <div className="rounded-container border border-border-subtle bg-surface-subtle p-4 text-sm">
            <p className="text-xs text-text-tertiary">负责人</p>
            <p className="mt-1 font-semibold">{school.contact}</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <h3 className="font-semibold">基础信息</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-text-tertiary">学校名称</dt><dd className="mt-1 font-semibold">{school.name}</dd></div>
            <div><dt className="text-xs text-text-tertiary">省份</dt><dd className="mt-1 font-semibold">{school.province}</dd></div>
            <div><dt className="text-xs text-text-tertiary">地区代码</dt><dd className="mt-1 text-sm">{school.regionCode}</dd></div>
            <div><dt className="text-xs text-text-tertiary">负责人</dt><dd className="mt-1 font-semibold">{school.contact}</dd></div>
          </dl>
        </div>
        <div className="rounded-container border border-border-subtle bg-surface p-5">
          <h3 className="font-semibold">当前参赛范围</h3>
          <p className="mt-3 text-sm leading-6 text-text-secondary">{school.scope}</p>
          <p className="mt-3 text-xs text-text-tertiary">赛事范围由赛事中心维护，不在学校主数据里直接编辑。</p>
        </div>
      </section>
      <section className="rounded-container border border-border-subtle bg-surface p-5 text-sm text-text-secondary">
        <h3 className="font-semibold">可执行动作（原型）</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>编辑主数据</Button>
          <SecondaryButton>申请高风险变更（停招 / 合并）</SecondaryButton>
          <SecondaryButton>查看负责人历史</SecondaryButton>
        </div>
      </section>
    </div>
  );
}

function Dictionaries() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 字典" title="赛事 / 赛道字典" description="赛事分类、赛道、阶段、学段、证书类型、协议模板的长期字段引用基线。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div>
            <h2 className="font-semibold">字典项</h2>
            <p className="mt-1 text-xs text-text-tertiary">共 {dictionaries.length} 条 · 新增 / 归档会进入审计</p>
          </div>
          <Button>+ 新增字典项</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">被引用方</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {dictionaries.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><Tag size={14} className="text-text-tertiary" />{row.name}</span></td>
                  <td className="px-4 py-3 text-text-secondary">{row.category}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.usedBy}</td>
                  <td className="px-4 py-3"><StatusTag tone={row.status === "启用" ? "success" : "neutral"}>{row.status}</StatusTag></td>
                  <td className="px-4 py-3 text-right text-text-brand"><Link to={`/admin/basic-data/dictionaries/${row.id}`} className="inline-flex items-center gap-1 text-xs font-semibold">查看 <ChevronRight size={13} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DictionaryDetail({ dictionaryId }: { dictionaryId: string }) {
  const item = dictionaries.find(row => row.id === dictionaryId);
  if (!item) {
    return (
      <div className="space-y-6">
        <Header eyebrow="基础数据管理 / 字典" title="字典项不存在" description="可能已合并或归档；可在历史批次里继续追溯。" />
        <section className="rounded-container border border-border-subtle bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold">未找到该字典项</h2>
          <Link to="/admin/basic-data/dictionaries" className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-control bg-primary-container px-4 text-sm font-semibold text-text-brand">返回字典列表 <ArrowRight size={15} /></Link>
        </section>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 字典" title={item.name} description="字典项只回答“长期字段引用基线”，不直接代表 Runtime 状态。" idLabel="dictionaryId" idValue={item.id} />
      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <Link to="/admin/basic-data/dictionaries" className="inline-flex items-center gap-1 text-sm font-medium text-text-brand"><ArrowLeft size={15} />返回字典列表</Link>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-text-tertiary">分类</dt><dd className="mt-1 font-semibold">{item.category}</dd></div>
          <div><dt className="text-xs text-text-tertiary">状态</dt><dd className="mt-1"><StatusTag tone={item.status === "启用" ? "success" : "neutral"}>{item.status}</StatusTag></dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-text-tertiary">被引用方</dt><dd className="mt-1 text-sm text-text-secondary">{item.usedBy}</dd></div>
        </dl>
      </section>
    </div>
  );
}

function Templates() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 模板" title="证书 / 协议模板" description="证书类型、协议模板、Banner 与权益规则模板，统一从这里发布。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div>
            <h2 className="font-semibold">模板版本</h2>
            <p className="mt-1 text-xs text-text-tertiary">共 {templates.length} 条 · 版本化保留</p>
          </div>
          <Button>+ 发布新版本</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-4 py-3">模板</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">版本</th>
                <th className="px-4 py-3">发布人</th>
                <th className="px-4 py-3">发布时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {templates.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-semibold"><span className="inline-flex items-center gap-2"><FileBadge2 size={14} className="text-text-tertiary" />{row.name}</span></td>
                  <td className="px-4 py-3 text-text-secondary">{row.type}</td>
                  <td className="px-4 py-3 text-xs">{row.version}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.publisher}</td>
                  <td className="px-4 py-3 text-text-tertiary">{row.publishedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Imports() {
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 导入" title="导入与批处理" description="Excel / CSV 兜底导入、批次管理和来源审计。批次可重放，不允许人工覆盖 Runtime。" />
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4">
          <div>
            <h2 className="font-semibold">导入批次</h2>
            <p className="mt-1 text-xs text-text-tertiary">共 {importBatches.length} 个批次</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton><Upload size={15} />上传文件</SecondaryButton>
            <Button><FileSpreadsheet size={15} />下载批次报告</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle text-sm">
            <thead className="bg-surface-subtle text-left text-xs uppercase tracking-[0.08em] text-text-tertiary">
              <tr>
                <th className="px-4 py-3">批次 / 文件</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">提交人</th>
                <th className="px-4 py-3">行数</th>
                <th className="px-4 py-3">状态 / 原因</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {importBatches.map(row => {
                const state = batchStateMeta(row.state);
                return (
                  <tr key={row.batchId} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.filename}</p>
                      <p className="mt-1 text-xs text-text-tertiary"><StableId value={row.batchId} label="batchId" /></p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.kind}</td>
                    <td className="px-4 py-3 text-text-secondary">{row.submittedBy}</td>
                    <td className="px-4 py-3 text-text-secondary">共 {row.total} · 成 {row.success} · 败 {row.failed}</td>
                    <td className="px-4 py-3"><StatusTag tone={state.tone}>{state.label}</StatusTag>{row.reason ? <p className="mt-1 text-xs text-text-tertiary">{row.reason}</p> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SampleObjects() {
  const records: AdminObjectRecord[] = (adminDomains.find(d => d.id === "basicData")?.sampleObjects) ?? [];
  return (
    <div className="space-y-6">
      <Header eyebrow="基础数据管理 / 数据真相" title="基础数据管理 · 样例对象" description="PC01 的样例对象在这里集中说明：长期 Profile 不复制 Runtime 状态。" />
      <section className="grid gap-4 md:grid-cols-2">
        {records.map(obj => (
          <article key={obj.key} className="rounded-container border border-border-subtle bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-brand">{obj.entity}</p>
            <h3 className="mt-2 text-lg font-semibold">{obj.name}</h3>
            <p className="mt-2 text-sm text-text-secondary">{obj.sourceDetail}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-tertiary">
              <StableId value={obj.stableId} label={obj.stableIdField} />
              <SourceTag source={obj.source} />
              <StatusTag tone="info">业务状态：{obj.businessState}</StatusTag>
            </div>
            <p className="mt-3 text-xs text-text-tertiary">写入人：{obj.editor}</p>
            <p className="mt-1 text-xs text-text-tertiary">保留规则：{obj.retention}</p>
          </article>
        ))}
      </section>
      <section className="rounded-container border border-info bg-info-bg p-5 text-sm text-info-text">
        <p className="leading-6">基础数据只做定义、归一、版本和归属；任何编辑都需保留来源与版本，避免与各业务域形成第二份真相源。</p>
      </section>
    </div>
  );
}

export function BasicDataConsole() {
  const { sub, id } = useParams();
  if (!sub || ((sub === "overview" || sub === "students") && !id)) return <StudentsList />;
  if (sub === "students" && id) return <StudentDetail studentId={id} />;
  if (sub === "schools" && !id) return <SchoolsList />;
  if (sub === "schools" && id) return <SchoolDetail organizationId={id} />;
  if (sub === "dictionaries" && !id) return <Dictionaries />;
  if (sub === "dictionaries" && id) return <DictionaryDetail dictionaryId={id} />;
  if (sub === "templates") return <Templates />;
  if (sub === "imports") return <Imports />;
  if (sub === "samples") return <SampleObjects />;
  return <NotReady />;
}
