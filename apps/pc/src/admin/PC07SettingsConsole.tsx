import {
  CheckCircle2,
  FileText,
  KeyRound,
  MessageSquareText,
  Pencil,
  Save,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConfirmDialog, StatusTag } from "../components/ui";

type SmsRecordStatus = "sending" | "success" | "failed";
type SmsBusinessType = "验证码" | "报名结果通知" | "审核结果通知" | "系统通知";
type TemplateStatus = "draft" | "published";

type SmsTemplateMapping = {
  businessType: SmsBusinessType;
  name: string;
  providerTemplateId: string;
  enabled: boolean;
};

type SmsRecord = {
  id: string;
  maskedPhone: string;
  searchablePhone: string;
  businessType: SmsBusinessType;
  provider: string;
  sentAt: string;
  sentDate: string;
  status: SmsRecordStatus;
  failureReason?: string;
  templateName: string;
  providerTemplateId: string;
};

type ContentTemplate = {
  id: string;
  key: string;
  name: string;
  type: string;
  status: TemplateStatus;
  updatedAt: string;
  body: string;
};

const initialSmsTemplates: SmsTemplateMapping[] = [
  { businessType: "验证码", name: "登录验证码", providerTemplateId: "SMS_MOCK_VERIFY_001", enabled: true },
  { businessType: "报名结果通知", name: "报名结果通知", providerTemplateId: "SMS_MOCK_REGISTRATION_001", enabled: true },
  { businessType: "审核结果通知", name: "审核结果通知", providerTemplateId: "SMS_MOCK_REVIEW_001", enabled: true },
  { businessType: "系统通知", name: "系统通知", providerTemplateId: "SMS_MOCK_SYSTEM_001", enabled: false },
];

const smsRecords: SmsRecord[] = [
  {
    id: "sms-trace-20260819-001",
    maskedPhone: "138****5201",
    searchablePhone: "1385201",
    businessType: "验证码",
    provider: "阿里云短信（Mock）",
    sentAt: "2026-08-19 10:41",
    sentDate: "2026-08-19",
    status: "success",
    templateName: "登录验证码",
    providerTemplateId: "SMS_MOCK_VERIFY_001",
  },
  {
    id: "sms-trace-20260819-002",
    maskedPhone: "186****7719",
    searchablePhone: "1867719",
    businessType: "审核结果通知",
    provider: "阿里云短信（Mock）",
    sentAt: "2026-08-19 10:18",
    sentDate: "2026-08-19",
    status: "failed",
    failureReason: "短信签名未通过服务商校验（Mock）",
    templateName: "审核结果通知",
    providerTemplateId: "SMS_MOCK_REVIEW_001",
  },
  {
    id: "sms-trace-20260818-003",
    maskedPhone: "139****2046",
    searchablePhone: "1392046",
    businessType: "报名结果通知",
    provider: "阿里云短信（Mock）",
    sentAt: "2026-08-18 17:32",
    sentDate: "2026-08-18",
    status: "success",
    templateName: "报名结果通知",
    providerTemplateId: "SMS_MOCK_REGISTRATION_001",
  },
  {
    id: "sms-trace-20260818-004",
    maskedPhone: "137****8890",
    searchablePhone: "1378890",
    businessType: "系统通知",
    provider: "阿里云短信（Mock）",
    sentAt: "2026-08-18 16:05",
    sentDate: "2026-08-18",
    status: "sending",
    templateName: "系统通知",
    providerTemplateId: "SMS_MOCK_SYSTEM_001",
  },
];

const initialContentTemplates: ContentTemplate[] = [
  {
    id: "user-agreement",
    key: "legal.user-agreement",
    name: "用户协议",
    type: "用户协议",
    status: "published",
    updatedAt: "2026-08-18 16:20",
    body: "## 核心产业学院用户协议\n\n欢迎使用核心产业学院。这里展示平台自有协议内容的原型编辑态。",
  },
  {
    id: "privacy-policy",
    key: "legal.privacy-policy",
    name: "隐私政策",
    type: "隐私政策",
    status: "published",
    updatedAt: "2026-08-18 16:18",
    body: "## 隐私政策\n\n我们仅在明确业务目的下处理必要的账号与赛事数据。",
  },
  {
    id: "user-message",
    key: "message.user.default",
    name: "用户消息模板",
    type: "用户消息",
    status: "draft",
    updatedAt: "2026-08-19 09:35",
    body: "你好，{{studentName}}：\n\n你有一条新的平台消息，请进入对应业务页面查看详情。",
  },
  {
    id: "system-notice",
    key: "notice.system.default",
    name: "系统通知模板",
    type: "系统通知",
    status: "published",
    updatedAt: "2026-08-19 09:12",
    body: "## 系统通知\n\n{{title}}\n\n{{content}}",
  },
  {
    id: "registration-review-result",
    key: "competition.registration-review-result",
    name: "报名 / 审核结果通知",
    type: "赛事通知内容",
    status: "draft",
    updatedAt: "2026-08-19 10:02",
    body: "{{studentName}}，你的 {{competitionName}} 报名审核结果为：{{result}}。",
  },
];

function recordStatusLabel(status: SmsRecordStatus) {
  if (status === "success") return "成功";
  if (status === "failed") return "失败";
  return "发送中";
}

function recordStatusTone(status: SmsRecordStatus): "success" | "danger" | "warning" {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  return "warning";
}

function templateStatusLabel(status: TemplateStatus) {
  return status === "published" ? "已发布" : "草稿";
}

function SettingsTabs() {
  const location = useLocation();
  const itemClass = (active: boolean) => `inline-flex min-h-10 items-center rounded-control px-3 text-sm font-semibold ${active ? "bg-primary-container text-text-brand" : "text-text-secondary hover:bg-surface-subtle"}`;
  return (
    <nav aria-label="系统设置二级导航" className="flex flex-wrap gap-1 rounded-container border border-border-subtle bg-surface p-2">
      <Link to="/admin/settings" className={itemClass(location.pathname === "/admin/settings")}>概览</Link>
      <Link to="/admin/settings/sms" data-testid="settings-sms-link" className={itemClass(location.pathname.startsWith("/admin/settings/sms"))}>短信管理</Link>
      <Link to="/admin/settings/content-templates" data-testid="settings-content-link" className={itemClass(location.pathname.startsWith("/admin/settings/content-templates"))}>内容模板</Link>
    </nav>
  );
}

function SettingsHome() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Link to="/admin/settings/sms" className="rounded-container border border-border-subtle bg-surface p-5 transition hover:bg-surface-subtle">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-primary-container text-text-brand"><MessageSquareText size={20} /></div><div><h2 className="font-semibold">短信管理</h2><p className="mt-1 text-xs text-text-tertiary">服务商配置、业务模板映射与发送记录证据</p></div></div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">配置层只保存明显的 mock / masked 凭据；发送记录用于定位投递结果，不替代操作审计。</p>
      </Link>
      <Link to="/admin/settings/content-templates" className="rounded-container border border-border-subtle bg-surface p-5 transition hover:bg-surface-subtle">
        <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-control bg-primary-container text-text-brand"><FileText size={20} /></div><div><h2 className="font-semibold">内容模板</h2><p className="mt-1 text-xs text-text-tertiary">协议、隐私政策与平台自有通知内容</p></div></div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">内容模板保留稳定 template key，与第三方短信模板 ID 分离，不在这里建设复杂 CMS。</p>
      </Link>
    </div>
  );
}

function SmsSettings() {
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [testMode, setTestMode] = useState(true);
  const [provider, setProvider] = useState("阿里云短信（Mock）");
  const [signature, setSignature] = useState("核心产业学院");
  const [templates, setTemplates] = useState(initialSmsTemplates);
  const [accessKeyReplacement, setAccessKeyReplacement] = useState("");
  const [secretKeyReplacement, setSecretKeyReplacement] = useState("");
  const [configFeedback, setConfigFeedback] = useState("");
  const [testPhone, setTestPhone] = useState("13800138000");
  const [testFeedback, setTestFeedback] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SmsRecordStatus>("all");
  const [businessFilter, setBusinessFilter] = useState<"all" | SmsBusinessType>("all");

  const visibleRecords = useMemo(() => smsRecords.filter(record => {
    const phoneKeyword = phoneFilter.replace(/\D/g, "");
    return (!dateFilter || record.sentDate === dateFilter)
      && (!phoneKeyword || record.searchablePhone.includes(phoneKeyword))
      && (statusFilter === "all" || record.status === statusFilter)
      && (businessFilter === "all" || record.businessType === businessFilter);
  }), [businessFilter, dateFilter, phoneFilter, statusFilter]);

  const beginEditing = () => {
    setEditing(true);
    setAccessKeyReplacement("");
    setSecretKeyReplacement("");
    setConfigFeedback("");
  };

  const saveConfig = () => {
    const replacedCredentials = [accessKeyReplacement ? "Access Key" : "", secretKeyReplacement ? "Secret Key" : ""].filter(Boolean).join(" / ");
    setEditing(false);
    setAccessKeyReplacement("");
    setSecretKeyReplacement("");
    setConfigFeedback(replacedCredentials ? `配置已保存到原型状态 · ${replacedCredentials} 已替换并重新掩码` : "配置已保存到原型状态");
  };

  const sendTestSms = () => {
    const normalized = testPhone.replace(/\D/g, "");
    setTestFeedback(normalized.length >= 7 ? `测试短信已进入模拟发送 · ${testMode ? "测试模式" : "演示模式"} · trace mock-test-${normalized.slice(-4)}` : "请输入可识别的测试手机号");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><KeyRound size={18} className="text-text-brand" /><h2 className="font-semibold">短信配置</h2></div><p className="mt-1 text-xs text-text-tertiary">第三方 provider 配置与业务模板映射。真实 Secret 不在浏览器长期裸显。</p></div>
          <button type="button" onClick={editing ? saveConfig : beginEditing} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">{editing ? <Save size={15} /> : <Pencil size={15} />}{editing ? "保存配置" : "编辑配置"}</button>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-control border border-border-subtle p-3"><span><span className="block text-sm font-semibold">启用短信能力</span><span className="mt-1 block text-xs text-text-tertiary">平台级能力开关</span></span><input aria-label="启用短信能力" type="checkbox" checked={enabled} disabled={!editing} onChange={event => setEnabled(event.target.checked)} className="size-4" /></label>
          <label className="flex items-center justify-between gap-4 rounded-control border border-border-subtle p-3"><span><span className="block text-sm font-semibold">测试模式</span><span className="mt-1 block text-xs text-text-tertiary">测试环境不触发真实第三方发送</span></span><input aria-label="测试模式" type="checkbox" checked={testMode} disabled={!editing} onChange={event => setTestMode(event.target.checked)} className="size-4" /></label>
          <label className="text-sm"><span className="mb-2 block font-semibold">短信服务商</span><select value={provider} disabled={!editing} onChange={event => setProvider(event.target.value)} className="min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3"><option>阿里云短信（Mock）</option><option>腾讯云短信（Mock）</option></select></label>
          <label className="text-sm"><span className="mb-2 block font-semibold">默认短信签名</span><input value={signature} disabled={!editing} onChange={event => setSignature(event.target.value)} className="min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3" /></label>
          <label className="text-sm"><span className="mb-2 block font-semibold">Access Key</span>{editing ? <input data-testid="sms-access-key-replacement" type="password" value={accessKeyReplacement} onChange={event => setAccessKeyReplacement(event.target.value)} placeholder="留空则保留当前 Access Key" autoComplete="off" className="min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3" /> : <input data-testid="sms-access-key" value="LTAI••••••••MOCK" readOnly className="min-h-11 w-full rounded-control border border-border-subtle bg-surface-subtle px-3 text-text-secondary" />}<span className="mt-1 block text-[11px] text-text-tertiary">{editing ? "旧值不回填；保存后只恢复掩码展示" : "仅展示 masked mock value"}</span></label>
          <label className="text-sm"><span className="mb-2 block font-semibold">Secret Key</span>{editing ? <input data-testid="sms-secret-key-replacement" type="password" value={secretKeyReplacement} onChange={event => setSecretKeyReplacement(event.target.value)} placeholder="留空则保留当前 Secret Key" autoComplete="new-password" className="min-h-11 w-full rounded-control border border-border-subtle bg-surface px-3" /> : <input data-testid="sms-secret-key" value="••••••••••••••••" readOnly className="min-h-11 w-full rounded-control border border-border-subtle bg-surface-subtle px-3 text-text-secondary" />}<span className="mt-1 block text-[11px] text-text-tertiary">{editing ? "真实旧 Secret 不下发；新值保存后立即清空并重新掩码" : "真实 Secret 不下发到页面；原型不包含真实凭据"}</span></label>
        </div>
        <div className="border-t border-border-subtle p-5">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-sm font-semibold">业务短信模板映射</h3><p className="mt-1 text-xs text-text-tertiary">这里是受第三方服务商审核约束的模板 ID，不等于平台“内容模板”。</p></div><span className="text-xs text-text-tertiary">最近修改：2026-08-19 10:42</span></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-surface-subtle"><tr>{["业务类型", "模板名称", "第三方模板 ID", "状态"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{templates.map((template, index) => <tr key={template.businessType} className="border-t border-border-subtle"><td className="p-3 font-semibold">{template.businessType}</td><td className="p-3">{template.name}</td><td className="p-3"><input aria-label={`${template.businessType}第三方模板 ID`} value={template.providerTemplateId} disabled={!editing} onChange={event => setTemplates(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, providerTemplateId: event.target.value } : item))} className="min-h-9 w-56 rounded-control border border-border-subtle bg-surface px-2 font-mono" /></td><td className="p-3"><button type="button" disabled={!editing} onClick={() => setTemplates(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: !item.enabled } : item))}><StatusTag tone={template.enabled ? "success" : "neutral"}>{template.enabled ? "启用" : "停用"}</StatusTag></button></td></tr>)}</tbody></table></div>
          {configFeedback && <p data-testid="sms-config-feedback" className="mt-3 text-xs font-medium text-success-text">{configFeedback}</p>}
        </div>
      </section>

      <section className="rounded-container border border-border-subtle bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><Send size={18} className="text-text-brand" /><h2 className="font-semibold">发送测试短信</h2></div><p className="mt-1 text-xs text-text-tertiary">只提供原型反馈，不接真实第三方短信通道。</p></div><div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"><input aria-label="测试手机号" value={testPhone} onChange={event => setTestPhone(event.target.value)} className="min-h-11 flex-1 rounded-control border border-border-subtle px-3 text-sm" /><button type="button" onClick={sendTestSms} className="min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary">发送测试短信</button></div></div>
        {testFeedback && <p data-testid="sms-test-feedback" className="mt-3 rounded-control bg-info-bg p-3 text-xs font-medium text-info-text">{testFeedback}</p>}
      </section>

      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="border-b border-border-subtle p-5"><h2 className="font-semibold">短信发送记录</h2><p className="mt-1 text-xs text-text-tertiary">投递证据层：可追踪发送结果，但不复制权限与审计模块。</p></div>
        <div className="grid gap-3 border-b border-border-subtle p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold">日期<input data-testid="sms-record-date-filter" type="date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} className="mt-1 min-h-10 w-full rounded-control border border-border-subtle px-3 font-normal" /></label>
          <label className="text-xs font-semibold">手机号关键字<input data-testid="sms-record-phone-filter" value={phoneFilter} onChange={event => setPhoneFilter(event.target.value)} placeholder="如 186" className="mt-1 min-h-10 w-full rounded-control border border-border-subtle px-3 font-normal" /></label>
          <label className="text-xs font-semibold">状态<select data-testid="sms-record-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value as "all" | SmsRecordStatus)} className="mt-1 min-h-10 w-full rounded-control border border-border-subtle px-3 font-normal"><option value="all">全部状态</option><option value="sending">发送中</option><option value="success">成功</option><option value="failed">失败</option></select></label>
          <label className="text-xs font-semibold">业务类型<select data-testid="sms-record-business-filter" value={businessFilter} onChange={event => setBusinessFilter(event.target.value as "all" | SmsBusinessType)} className="mt-1 min-h-10 w-full rounded-control border border-border-subtle px-3 font-normal"><option value="all">全部业务</option>{initialSmsTemplates.map(item => <option key={item.businessType} value={item.businessType}>{item.businessType}</option>)}</select></label>
        </div>
        <div data-testid="sms-records" className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-surface-subtle"><tr>{["手机号", "业务类型", "服务商", "发送时间", "状态", "模板 / ID", "失败原因", "追踪标识"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{visibleRecords.map(record => <tr key={record.id} data-testid={`sms-record-${record.id}`} className="border-t border-border-subtle"><td className="p-3 font-semibold">{record.maskedPhone}</td><td className="p-3">{record.businessType}</td><td className="p-3">{record.provider}</td><td className="p-3">{record.sentAt}</td><td className="p-3"><StatusTag tone={recordStatusTone(record.status)}>{recordStatusLabel(record.status)}</StatusTag></td><td className="p-3"><p>{record.templateName}</p><p className="mt-1 font-mono text-[11px] text-text-tertiary">{record.providerTemplateId}</p></td><td className="max-w-56 p-3 text-text-secondary">{record.failureReason ?? "—"}</td><td className="p-3 font-mono text-[11px] text-text-tertiary">{record.id}</td></tr>)}</tbody></table>{visibleRecords.length === 0 && <p className="p-8 text-center text-sm text-text-tertiary">当前筛选条件下没有发送记录</p>}</div>
      </section>
    </div>
  );
}

function ContentTemplates() {
  const [templates, setTemplates] = useState(initialContentTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorBody, setEditorBody] = useState("");
  const [feedback, setFeedback] = useState("");
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const selected = templates.find(template => template.id === selectedId);

  const openEditor = (template: ContentTemplate) => {
    setSelectedId(template.id);
    setEditorBody(template.body);
    setFeedback("");
    requestAnimationFrame(() => document.getElementById("content-template-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const applyMarkup = (prefix: string, suffix = prefix) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editorBody.slice(start, end) || "文本";
    const next = `${editorBody.slice(0, start)}${prefix}${selectedText}${suffix}${editorBody.slice(end)}`;
    setEditorBody(next);
    requestAnimationFrame(() => editor.focus());
  };

  const persistTemplate = (publish: boolean) => {
    if (!selectedId) return;
    setTemplates(current => current.map(template => template.id === selectedId ? { ...template, body: editorBody, status: publish ? "published" : "draft", updatedAt: "2026-08-19 12:34" } : template));
    setFeedback(publish ? "模板已发布到原型状态" : "模板草稿已保存到原型状态");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-container border border-border-subtle bg-surface">
        <div className="border-b border-border-subtle p-5"><div className="flex items-center gap-2"><FileText size={18} className="text-text-brand" /><h2 className="font-semibold">内容模板</h2></div><p className="mt-1 text-xs text-text-tertiary">平台自有可复用富文本内容。稳定 template key 与第三方短信模板 ID 分离。</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="bg-surface-subtle"><tr>{["模板名称", "模板类型", "Template Key", "状态", "更新时间", "操作"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{templates.map(template => <tr key={template.id} data-testid={`content-template-${template.id}`} className="border-t border-border-subtle"><td className="p-3 font-semibold">{template.name}</td><td className="p-3">{template.type}</td><td className="p-3 font-mono text-[11px] text-text-tertiary">{template.key}</td><td className="p-3"><StatusTag tone={template.status === "published" ? "success" : "neutral"}>{templateStatusLabel(template.status)}</StatusTag></td><td className="p-3">{template.updatedAt}</td><td className="p-3"><button type="button" onClick={() => openEditor(template)} className="min-h-9 rounded-control border border-border-subtle px-3 font-semibold text-text-brand hover:bg-surface-subtle">编辑{template.name}</button></td></tr>)}</tbody></table></div>
      </section>

      {selected && <section id="content-template-editor" data-testid="content-template-editor" className="scroll-mt-24 rounded-container border border-border-subtle bg-surface">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold">编辑 · {selected.name}</h2><p className="mt-1 text-xs text-text-tertiary">{selected.key} · {selected.type}</p></div><StatusTag tone={selected.status === "published" ? "success" : "neutral"}>{templateStatusLabel(selected.status)}</StatusTag></div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 rounded-t-control border border-b-0 border-border-subtle bg-surface-subtle p-2" aria-label="富文本工具栏"><button type="button" onClick={() => applyMarkup("**")} className="min-h-8 rounded-control border border-border-subtle bg-surface px-3 text-xs font-semibold">加粗</button><button type="button" onClick={() => applyMarkup("## ", "")} className="min-h-8 rounded-control border border-border-subtle bg-surface px-3 text-xs font-semibold">二级标题</button><button type="button" onClick={() => applyMarkup("[", "](https://example.invalid)")} className="min-h-8 rounded-control border border-border-subtle bg-surface px-3 text-xs font-semibold">插入链接</button></div>
          <textarea ref={editorRef} aria-label="模板正文编辑器" value={editorBody} onChange={event => setEditorBody(event.target.value)} className="min-h-72 w-full resize-y rounded-b-control border border-border-subtle bg-surface p-4 text-sm leading-6 outline-none focus:border-primary" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-text-tertiary">原型只模拟保存 / 发布状态，不扩展审批流、多人协作或 A/B Test。</p><div className="flex gap-2"><button type="button" onClick={() => persistTemplate(false)} className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border-subtle px-4 text-sm font-semibold text-text-secondary"><Save size={15} />保存草稿</button><button type="button" onClick={() => setPublishConfirmOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-on-primary"><CheckCircle2 size={15} />发布模板</button></div></div>
          {feedback && <p data-testid="content-template-feedback" className="mt-3 text-xs font-medium text-success-text">{feedback}</p>}
        </div>
      </section>}
      <ConfirmDialog open={publishConfirmOpen && Boolean(selected)} title="发布内容模板？" description={selected ? `${selected.name} · ${selected.key}` : ""} confirmText="确认发布" onCancel={() => setPublishConfirmOpen(false)} onConfirm={() => { persistTemplate(true); setPublishConfirmOpen(false); }}>
        <p className="text-sm leading-6 text-text-secondary">发布后将成为平台对应场景使用的当前模板；稳定 template key 保持不变。</p>
      </ConfirmDialog>
    </div>
  );
}

export function PC07SettingsConsole() {
  const location = useLocation();
  const section = location.pathname.startsWith("/admin/settings/content-templates") ? "content" : location.pathname.startsWith("/admin/settings/sms") ? "sms" : "home";
  const title = section === "sms" ? "短信管理" : section === "content" ? "内容模板" : "系统设置";

  return (
    <div className="space-y-6" data-testid="pc07-settings">
      <section className="rounded-container border border-border-subtle bg-surface p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex items-center gap-2 text-text-brand"><Settings size={18} /><p className="text-xs font-semibold">PC07 · 平台配置层</p></div><h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">把短信能力与平台自有内容模板收进一个清楚的系统设置入口；这里不建设第二套消息中心、短信队列或操作审计。</p></div><div className="flex items-center gap-2 rounded-control bg-surface-subtle px-3 py-2 text-xs text-text-secondary"><ShieldCheck size={15} className="text-text-brand" />凭据默认脱敏 · Mock only</div></div>
      </section>
      <SettingsTabs />
      {section === "home" ? <SettingsHome /> : section === "sms" ? <SmsSettings /> : <ContentTemplates />}
    </div>
  );
}
