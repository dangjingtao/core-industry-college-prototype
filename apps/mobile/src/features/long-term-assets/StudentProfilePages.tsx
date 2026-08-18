import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import {
  competitionExperienceOptions,
  coreNeedOptions,
  educationLevelOptions,
  identityTypeOptions,
  industryOptions,
  joinMulti,
  labelFor,
  serviceInterestOptions,
  splitMulti,
  workYearsOptions,
  type StudentProfile,
} from "./studentProfile";
import { useLongTermAssets } from "./store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

const sourceLabels = {
  seed: "原型种子",
  onboarding: "注册 / Onboarding",
  profile: "个人资料",
  registration: "赛事报名回流",
  workshop: "创赛工坊问卷",
} as const;

function safeReturnTo(search: string, fallback = "/home") {
  const value = new URLSearchParams(search).get("returnTo");
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function TextField({ label, value, onChange, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string }) {
  return <label className="block"><span className="text-sm font-medium text-text-primary">{label}</span><input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary" />{hint && <span className="mt-1 block text-xs leading-5 text-text-tertiary">{hint}</span>}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-medium text-text-primary">{label}</span><select value={value} onChange={event => onChange(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary"><option value="">请选择</option>{options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>;
}

function SingleChoice({ title, value, options, onChange }: { title: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <Section title={title}><div className="grid grid-cols-2 gap-2">{options.map(([id, label]) => <button key={id} type="button" onClick={() => onChange(id)} className={`min-h-touch rounded-control border px-3 py-3 text-left text-sm ${value === id ? "border-primary bg-primary-container font-medium text-text-brand" : "border-border bg-surface text-text-primary"}`}>{label}</button>)}</div></Section>;
}

function MultiChoice({ title, value, options, onChange }: { title: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  const selected = splitMulti(value);
  const toggle = (id: string) => onChange(joinMulti(selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]));
  return <Section title={title}><div className="grid grid-cols-2 gap-2">{options.map(([id, label]) => <button key={id} type="button" onClick={() => toggle(id)} className={`min-h-touch rounded-control border px-3 py-3 text-left text-sm ${selected.includes(id) ? "border-primary bg-primary-container font-medium text-text-brand" : "border-border bg-surface text-text-primary"}`}>{label}</button>)}</div></Section>;
}

function PhoneVerification({ phone, originalPhone, originalVerified, verified, onPhoneChange, onVerifiedChange }: { phone: string; originalPhone: string; originalVerified: boolean; verified: boolean; onPhoneChange: (value: string) => void; onVerifiedChange: (verified: boolean) => void }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const validPhone = /^1\d{10}$/.test(phone);
  const changePhone = (value: string) => {
    onPhoneChange(value);
    setSent(false);
    setCode("");
    onVerifiedChange(originalVerified && value === originalPhone);
  };
  const verify = () => { if (sent && code === "123456") onVerifiedChange(true); };
  return <div className="space-y-3"><TextField label="手机号" value={phone} onChange={changePhone} hint="原型按 11 位大陆手机号校验；不发送真实短信。" /><div className="flex gap-2"><button type="button" disabled={!validPhone} onClick={() => { setSent(true); setCode(""); onVerifiedChange(false); }} className="min-h-touch flex-1 rounded-control border border-border bg-surface px-3 text-sm font-medium text-text-primary disabled:opacity-40">{sent ? "重新发送验证码" : "发送验证码"}</button><div className="flex min-h-touch flex-1 items-center justify-center rounded-control bg-surface-subtle px-3 text-xs text-text-secondary">{verified ? "手机号已验证" : sent ? "原型验证码：123456" : "待验证"}</div></div>{sent && !verified && <div className="flex gap-2"><input inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} placeholder="输入 6 位验证码" className="min-h-touch min-w-0 flex-1 rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /><button type="button" disabled={code.length !== 6} onClick={verify} className="min-h-touch rounded-control bg-primary px-4 text-sm font-semibold text-on-primary disabled:opacity-40">验证</button></div>}</div>;
}

export function OnboardingProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile } = useLongTermAssets();
  const { completeProfile } = usePublicPlatform();
  const [draft, setDraft] = useState(profile);
  const [phoneVerified, setPhoneVerified] = useState(profile.phoneVerified === "verified");
  const returnTo = safeReturnTo(location.search);
  const valid = Boolean(draft.nickname.trim() && (/^1\d{10}$/.test(draft.phone) ? phoneVerified : draft.email.trim()) && draft.school.trim() && draft.major.trim() && draft.city.trim() && draft.identityType);
  const save = () => {
    updateProfile({ ...draft, phoneVerified: phoneVerified ? "verified" : "unverified" }, "onboarding");
    completeProfile();
    navigate(`/onboarding/survey?returnTo=${encodeURIComponent(returnTo)}`);
  };
  return <PublicShell showNavigation={false}><PageHeader title="完善基础资料" backTo="/auth/register" /><div className="space-y-5 px-4 py-6"><Card><StatusTag tone="info">长期学生主档</StatusTag><p className="mt-3 text-sm leading-5 text-text-secondary">这里只收当前账号长期需要的基础资料。赛事报名已经取得的字段应回流到同一主档，不再建立第二份报名 Profile。</p></Card><TextField label="昵称" value={draft.nickname} onChange={nickname => setDraft(current => ({ ...current, nickname }))} />{draft.phone ? <PhoneVerification phone={draft.phone} originalPhone={profile.phone} originalVerified={profile.phoneVerified === "verified"} verified={phoneVerified} onPhoneChange={phone => setDraft(current => ({ ...current, phone }))} onVerifiedChange={setPhoneVerified} /> : <TextField label="邮箱" type="email" value={draft.email} onChange={email => setDraft(current => ({ ...current, email }))} hint="注册邮箱已通过原型验证码确认。" />}<TextField label="学校" value={draft.school} onChange={school => setDraft(current => ({ ...current, school }))} /><TextField label="专业" value={draft.major} onChange={major => setDraft(current => ({ ...current, major }))} /><TextField label="所在地区" value={draft.city} onChange={city => setDraft(current => ({ ...current, city }))} /><SelectField label="身份类型" value={draft.identityType} options={identityTypeOptions} onChange={identityType => setDraft(current => ({ ...current, identityType: identityType as StudentProfile["identityType"] }))} /><Card className="border border-border-subtle"><p className="text-sm font-medium text-text-primary">其它资料不强迫一次填完</p><p className="mt-2 text-xs leading-5 text-text-secondary">性别、生日、学历、产业方向与使用需求可在个人资料或下一步可跳过问卷中补充。</p></Card><Button className="w-full" disabled={!valid} onClick={save}>保存并继续</Button></div></PublicShell>;
}

export function OnboardingSurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile } = useLongTermAssets();
  const [draft, setDraft] = useState(profile);
  const returnTo = safeReturnTo(location.search);
  const readyPath = `/onboarding/ready?returnTo=${encodeURIComponent(returnTo)}`;
  const save = () => {
    updateProfile({
      identityType: draft.identityType,
      competitionExperience: draft.competitionExperience,
      industryFields: draft.industryFields,
      educationLevel: draft.educationLevel,
      workYears: draft.workYears,
      coreNeeds: draft.coreNeeds,
      serviceInterests: draft.serviceInterests,
    }, "onboarding");
    navigate(readyPath);
  };
  return <PublicShell showNavigation={false}><PageHeader title="可选需求问卷" backTo="/onboarding/profile" /><div className="space-y-6 px-4 py-6"><Card><StatusTag tone="neutral">可跳过</StatusTag><p className="mt-3 text-sm leading-5 text-text-secondary">这些信息用于全平台的内容、赛事、课程与机会排序。地区已在基础资料采集，这里不重复追问；以后创赛工坊需要补充时也写回同一主档。</p></Card><SingleChoice title="你的身份" value={draft.identityType} options={identityTypeOptions} onChange={identityType => setDraft(current => ({ ...current, identityType: identityType as StudentProfile["identityType"] }))} /><SingleChoice title="三创赛经历" value={draft.competitionExperience} options={competitionExperienceOptions} onChange={competitionExperience => setDraft(current => ({ ...current, competitionExperience: competitionExperience as StudentProfile["competitionExperience"] }))} /><MultiChoice title="所属 / 意向产业领域" value={draft.industryFields} options={industryOptions} onChange={industryFields => setDraft(current => ({ ...current, industryFields }))} /><SingleChoice title="最高学历" value={draft.educationLevel} options={educationLevelOptions} onChange={educationLevel => setDraft(current => ({ ...current, educationLevel: educationLevel as StudentProfile["educationLevel"] }))} /><SingleChoice title="从业年限" value={draft.workYears} options={workYearsOptions} onChange={workYears => setDraft(current => ({ ...current, workYears: workYears as StudentProfile["workYears"] }))} /><MultiChoice title="核心使用需求" value={draft.coreNeeds} options={coreNeedOptions} onChange={coreNeeds => setDraft(current => ({ ...current, coreNeeds }))} /><MultiChoice title="关注的服务类型" value={draft.serviceInterests} options={serviceInterestOptions} onChange={serviceInterests => setDraft(current => ({ ...current, serviceInterests }))} /><div className="grid grid-cols-2 gap-2"><SecondaryButton onClick={() => navigate(readyPath)}>暂时跳过</SecondaryButton><Button onClick={save}>保存问卷</Button></div></div></PublicShell>;
}

export function OnboardingReadyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useLongTermAssets();
  const returnTo = safeReturnTo(location.search);
  return <PublicShell showNavigation={false}><PageHeader title="准备好了" /><div className="space-y-5 px-4 py-8"><Card><StatusTag tone="success">主档已保存</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">{profile.nickname || profile.name}，先从比赛或机会开始</h1><p className="mt-2 text-sm leading-5 text-text-secondary">后续报名、个人资料和工坊问卷会围绕同一份长期学生主档补充，不要求你反复填写同一组基础信息。</p></Card><Button className="w-full" onClick={() => navigate(returnTo, { replace: true })}>{returnTo === "/home" ? "进入首页" : "继续之前的操作"}</Button></div></PublicShell>;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, profileSources, updateProfile } = useLongTermAssets();
  const [draft, setDraft] = useState(profile);
  const [phoneVerified, setPhoneVerified] = useState(profile.phoneVerified === "verified");
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const resumePath = returnTo ? `/me/resume?returnTo=${encodeURIComponent(returnTo)}` : "/me";
  const surveyReturn = `${location.pathname}${location.search}`;
  const valid = Boolean(draft.nickname.trim() && /^1\d{10}$/.test(draft.phone) && phoneVerified && draft.school.trim() && draft.major.trim() && draft.city.trim());
  const sourceRows = useMemo(() => (["school", "major", "city", "educationLevel", "competitionExperience"] as const).map(key => ({ key, source: profileSources[key] })), [profileSources]);
  const save = () => {
    updateProfile({ ...draft, phoneVerified: phoneVerified ? "verified" : "unverified" }, "profile");
    navigate(resumePath);
  };
  return <PublicShell showNavigation={false}><PageHeader title="个人资料" backTo={resumePath} /><div className="space-y-6 px-4 py-5"><Card><StatusTag tone="info">长期账号资料</StatusTag><p className="mt-3 text-sm leading-5 text-text-secondary">Onboarding 与这里读写同一个 StudentProfile。赛事报名 / 工坊只向这份主档回流可复用字段，不另外保存 questionnaire profile。</p></Card><Section title="基础身份"><div className="space-y-4"><TextField label="姓名" value={draft.name} onChange={name => setDraft(current => ({ ...current, name }))} hint="用于长期简历表达；不作为赛事身份权限来源。" /><TextField label="昵称" value={draft.nickname} onChange={nickname => setDraft(current => ({ ...current, nickname }))} /><SelectField label="性别" value={draft.gender} options={[["male", "男"], ["female", "女"]]} onChange={gender => setDraft(current => ({ ...current, gender: gender as StudentProfile["gender"] }))} /><TextField label="生日" type="date" value={draft.birthday} onChange={birthday => setDraft(current => ({ ...current, birthday }))} /><PhoneVerification phone={draft.phone} originalPhone={profile.phone} originalVerified={profile.phoneVerified === "verified"} verified={phoneVerified} onPhoneChange={phone => setDraft(current => ({ ...current, phone }))} onVerifiedChange={setPhoneVerified} /><TextField label="邮箱" type="email" value={draft.email} onChange={email => setDraft(current => ({ ...current, email }))} /></div></Section><Section title="学习与地区"><div className="space-y-4"><TextField label="学校" value={draft.school} onChange={school => setDraft(current => ({ ...current, school }))} /><TextField label="专业" value={draft.major} onChange={major => setDraft(current => ({ ...current, major }))} /><TextField label="所在地区" value={draft.city} onChange={city => setDraft(current => ({ ...current, city }))} /><SelectField label="身份类型" value={draft.identityType} options={identityTypeOptions} onChange={identityType => setDraft(current => ({ ...current, identityType: identityType as StudentProfile["identityType"] }))} /><SelectField label="最高学历" value={draft.educationLevel} options={educationLevelOptions} onChange={educationLevel => setDraft(current => ({ ...current, educationLevel: educationLevel as StudentProfile["educationLevel"] }))} /></div></Section><Section title="需求与来源" action={<Link className="text-sm font-medium text-text-brand" to={`/onboarding/survey?returnTo=${encodeURIComponent(surveyReturn)}`}>更新可选问卷</Link>}><Card><div className="space-y-2 text-sm"><p className="text-text-primary">三创赛经历：{labelFor(competitionExperienceOptions, draft.competitionExperience)}</p><p className="text-text-secondary">产业方向：{splitMulti(draft.industryFields).length ? `${splitMulti(draft.industryFields).length} 项` : "未填写"}</p><p className="text-text-secondary">核心需求：{splitMulti(draft.coreNeeds).length ? `${splitMulti(draft.coreNeeds).length} 项` : "未填写"}</p><p className="text-text-secondary">关注服务：{splitMulti(draft.serviceInterests).length ? `${splitMulti(draft.serviceInterests).length} 项` : "未填写"}</p></div></Card><div className="mt-3 grid grid-cols-2 gap-2">{sourceRows.map(item => <Card key={item.key}><p className="text-xs text-text-tertiary">{item.key}</p><p className="mt-1 text-sm font-medium text-text-primary">{item.source ? sourceLabels[item.source] : "尚无来源"}</p></Card>)}</div></Section><Button className="w-full" disabled={!valid} onClick={save}>保存资料</Button></div></PublicShell>;
}
