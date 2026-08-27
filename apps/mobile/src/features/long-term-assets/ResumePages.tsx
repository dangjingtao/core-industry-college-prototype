import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageHeader, PublicShell, SecondaryButton, Section, StatusTag } from "../../components/ui";
import { workspaceData } from "../competition-workspace/data";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { competitionById } from "../public-platform/data";
import { courses } from "./data";
import { TrustNote } from "./shared";
import { useLongTermAssets } from "./store";
import { educationLevelOptions, labelFor } from "./studentProfile";

export function ResumePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const { identities } = usePublicPlatform();
  const { resume, profile, learningFor, certificates, toggleResumeFact } = useLongTermAssets();

  const facts = useMemo(() => {
    const experienceFacts = identities.filter(identity => identity.identityStatus === "active" || identity.identityStatus === "revoked").map(identity => {
      const workspace = workspaceData[identity.competitionId];
      const competition = competitionById(identity.competitionId);
      if (!workspace || !competition) return null;
      return { key: `experience:${identity.competitionId}`, type: "赛事经历", title: `${competition.name} · ${workspace.team.role}`, detail: workspace.project.name, trusted: true };
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
    const learningFacts = courses.filter(course => learningFor(course.id).status === "completed").map(course => ({ key: `learning:${course.id}`, type: "学习成果", title: course.title, detail: `考试 ${learningFor(course.id).assessment === "passed" ? "已通过" : "待确认"}`, trusted: true }));
    const certificateFacts = certificates.filter(item => item.status === "claimed").map(item => ({ key: `certificate:${item.id}`, type: "证书", title: item.title, detail: item.issuer, trusted: true }));
    return [...experienceFacts, ...learningFacts, ...certificateFacts];
  }, [identities, learningFor, certificates]);

  const resumeQuery = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  const education = resume.educationDetails;
  const ready = Boolean(
    profile.name && profile.phone && profile.school && profile.major && resume.strengths.trim() &&
    education.graduationTime && education.startDate && education.endDate && resume.selectedFactKeys.length > 0,
  );
  return <PublicShell showNavigation={false}><PageHeader title="个人成长档案" backTo={returnTo ?? "/me"} /><div className="space-y-6 px-4 py-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-text-secondary">面向机会投递的长期履历</p><h1 className="mt-1 text-lg font-semibold text-text-primary">{profile.name}</h1></div><StatusTag tone={ready ? "success" : "warning"}>{ready ? "可投递" : "待完善"}</StatusTag></div><TrustNote />
    <Section title="基础资料" action={<Link className="text-sm font-medium text-text-brand" to={`/me/profile${resumeQuery}`}>编辑主档</Link>}><Card><p className="font-medium text-text-primary">{profile.school} · {profile.major}</p><p className="mt-2 text-sm text-text-secondary">{labelFor(educationLevelOptions, profile.educationLevel)} · {profile.city}</p><p className="mt-1 text-sm text-text-secondary">{profile.phone} · {profile.email}</p></Card></Section>
    <Section title="个人优势" action={<Link className="text-sm font-medium text-text-brand" to={`/me/resume/strengths${resumeQuery}`}>编辑表达</Link>}><Card><p className="text-sm leading-6 text-text-primary">{resume.strengths || "尚未填写"}</p></Card></Section>
    <Section title="教育经历" action={<Link className="text-sm font-medium text-text-brand" to={`/me/resume/education${resumeQuery}`}>编辑经历</Link>}><Card className="space-y-2"><p className="font-medium text-text-primary">{profile.school} · {profile.major}</p><p className="text-sm text-text-secondary">{education.startDate || "—"} 至 {education.endDate || "—"} · 预计毕业 {education.graduationTime || "—"}</p><p className="text-sm leading-6 text-text-primary">主修：{education.majorCourses || "尚未填写"}</p><p className="text-sm leading-6 text-text-secondary">{education.campusExperience || "尚未填写在校经历"}</p></Card></Section>
    <Section title="选择进入简历的可信经历"><div className="space-y-3">{facts.map(fact => { const selected = resume.selectedFactKeys.includes(fact.key); return <button key={fact.key} onClick={() => toggleResumeFact(fact.key)} className={`w-full rounded-container border p-3 text-left ${selected ? "border-primary bg-primary-container" : "border-border-subtle bg-surface"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><StatusTag tone="success">系统事实</StatusTag><StatusTag tone="neutral">{fact.type}</StatusTag></div><p className="mt-2 font-semibold text-text-primary">{fact.title}</p><p className="mt-1 text-sm text-text-secondary">{fact.detail}</p></div><span className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${selected ? "border-primary bg-primary text-on-primary" : "border-border text-text-tertiary"}`}>{selected ? "✓" : ""}</span></div></button>; })}</div></Section>
    <Card className="border border-border-subtle"><p className="text-xs text-text-secondary">最近整理：{resume.updatedAt}</p><p className="mt-2 text-sm text-text-primary">已选择 {resume.selectedFactKeys.length} 项系统事实。修改简历表达或选择不会改动赛事、成绩或证书原始记录。</p></Card>
    {returnTo ? <Button className="w-full" disabled={!ready} onClick={() => navigate(returnTo)}>返回机会继续投递</Button> : <SecondaryButton className="w-full" onClick={() => navigate("/opportunities")}>用这份简历寻找机会</SecondaryButton>}
  </div></PublicShell>;
}

export function ResumeStrengthsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resume, updateStrengths } = useLongTermAssets();
  const [value, setValue] = useState(resume.strengths);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const resumePath = `/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  const save = () => { updateStrengths(value.trim()); navigate(resumePath); };
  return <PublicShell showNavigation={false}><PageHeader title="个人优势" backTo={resumePath} /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">这里编辑的是简历表达，不会修改系统记录里的赛事结果或课程成绩。</p></Card><textarea value={value} onChange={event => setValue(event.target.value)} rows={8} className="w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 text-text-primary outline-none focus:border-primary" /><Button className="w-full" disabled={!value.trim()} onClick={save}>保存表达</Button></div></PublicShell>;
}

export function ResumeEducationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, resume, updateEducation, updateEducationDetails } = useLongTermAssets();
  const [draft, setDraft] = useState(resume.educationDetails);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const resumePath = `/me/resume${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  const setField = (key: keyof typeof draft, value: string) => setDraft(current => ({ ...current, [key]: value }));
  const save = () => {
    updateEducationDetails(draft);
    updateEducation(`${profile.school} · ${profile.major} · ${labelFor(educationLevelOptions, profile.educationLevel)}`);
    navigate(resumePath);
  };
  return <PublicShell showNavigation={false}><PageHeader title="教育经历" backTo={resumePath} /><div className="space-y-5 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">学校、专业、学历和手机号直接读取统一学生主档；这里维护的是简历中的时间、课程和在校经历表达，不会改写赛事与课程可信事实。</p><p className="mt-3 text-sm font-medium text-text-primary">{profile.school} · {profile.major} · {labelFor(educationLevelOptions, profile.educationLevel)}</p><Link to={`/me/profile${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="mt-3 inline-block text-sm font-medium text-text-brand">修改学生主档 →</Link></Card>
    <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-sm font-medium text-text-primary">入学时间</span><input type="month" value={draft.startDate} onChange={event => setField("startDate", event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="text-sm font-medium text-text-primary">结束时间</span><input type="month" value={draft.endDate} onChange={event => setField("endDate", event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label></div>
    <label className="block"><span className="text-sm font-medium text-text-primary">毕业时间</span><input type="month" value={draft.graduationTime} onChange={event => setField("graduationTime", event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>
    <label className="block"><span className="text-sm font-medium text-text-primary">主修课程</span><textarea rows={3} value={draft.majorCourses} onChange={event => setField("majorCourses", event.target.value)} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" placeholder="例如：消费者行为学、数据分析、供应链管理" /></label>
    <label className="block"><span className="text-sm font-medium text-text-primary">在校经历</span><textarea rows={6} value={draft.campusExperience} onChange={event => setField("campusExperience", event.target.value)} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" placeholder="描述社团、项目、竞赛、实践等经历" /></label>
    <Button className="w-full" disabled={!draft.startDate || !draft.endDate || !draft.graduationTime} onClick={save}>保存教育经历</Button>
  </div></PublicShell>;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile } = useLongTermAssets();
  const [draft, setDraft] = useState(profile);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  const resumePath = returnTo ? `/me/resume?returnTo=${encodeURIComponent(returnTo)}` : "/me";
  const fields: { key: "name" | "school" | "major" | "city" | "email"; label: string }[] = [
    { key: "name", label: "姓名" },
    { key: "school", label: "学校" },
    { key: "major", label: "专业" },
    { key: "city", label: "所在城市" },
    { key: "email", label: "邮箱" },
  ];
  return <PublicShell showNavigation={false}><PageHeader title="个人资料" backTo={resumePath} /><div className="space-y-4 px-4 py-5"><Card><p className="text-sm leading-5 text-text-secondary">基础资料属于长期账号，不绑定某一场赛事。手机号、昵称、生日、学历和问卷维度由统一学生主档维护；赛事身份仍由公共账号身份集合单独管理。</p></Card>{fields.map(field => <label key={field.key} className="block"><span className="text-sm font-medium text-text-primary">{field.label}</span><input value={draft[field.key]} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>)}<Card><p className="text-sm text-text-secondary">手机号：{profile.phone || "未填写"} · 学历：{labelFor(educationLevelOptions, profile.educationLevel)}</p></Card><Button className="w-full" onClick={() => { updateProfile(draft); navigate(resumePath); }}>保存资料</Button></div></PublicShell>;
}
