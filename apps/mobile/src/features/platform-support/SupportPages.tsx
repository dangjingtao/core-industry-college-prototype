import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookOpen, BriefcaseBusiness, Calendar, ChevronRight, Heart, ImagePlus, MessageCircle, PenLine, Share2, Users } from "lucide-react";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type Notice = { id: string; title: string; body: string; read: boolean; time: string };
type StoryType = "story" | "wechat";
type Story = {
  id: string;
  type: StoryType;
  title: string;
  summary: string;
  body: string;
  author: string;
  authorInitial: string;
  tags: string[];
  publishTime: string;
  external?: boolean;
  externalUrl?: string;
  likes: number;
};
type SupportState = {
  notifications: Notice[];
  bindings: string[];
  submittedStories: Story[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleBinding: (id: string) => void;
  submitStory: (story: Story) => void;
};

const noticeSeed: Notice[] = [
  { id: "notice-registration", title: "三创赛报名状态已更新", body: "你的报名材料已进入学校审核。审核完成后会在“我的赛事”同步身份状态。", read: false, time: "今天 09:20" },
  { id: "notice-course", title: "课程学习记录已保存", body: "商业数据分析基础的学习结果已进入长期学习资产。", read: true, time: "昨天 18:40" },
  { id: "notice-benefit", title: "权益即将到期", body: "一项活动权益将在近期到期，请在权益中心查看有效期。", read: false, time: "8 月 15 日" },
];

const news = [
  { id: "competition-guide", tag: "赛事", title: "三创赛本阶段报名与校赛安排说明", summary: "集中查看当前报名窗口、学校审核和后续校赛节点。", body: "本阶段以学校审核与团队准备为主。具体时间由学校与赛道安排为准，平台只展示已确认节点。" },
  { id: "internship-week", tag: "机会", title: "企业实践机会本周更新", summary: "品牌、电商、数据分析与供应链方向新增实践岗位。", body: "本周机会来自平台合作企业。投递前可先整理长期简历中的赛事经历、学习成果和证书。" },
  { id: "asset-guide", tag: "平台", title: "比赛结束后，哪些记录会继续保留？", summary: "赛事经历、成绩、证书与学习成果会沉淀到长期账号。", body: "赛事期权限会随着生命周期结束，但长期账号中的可信事实不会随赛事工作区一起消失。" },
];

const storySeed: Story[] = [
  {
    id: "team-retail",
    type: "story",
    title: "从校赛复盘到零售数据实习",
    summary: "一个学生团队如何把比赛里的数据复盘经验整理成长期履历，最终拿到零售企业的数据分析实习机会。",
    body: "去年参加三创赛时，我们团队选择了一个零售数据分析赛道。从选题、调研到最终的路演，整个过程最大的收获不是奖项，而是学会了把比赛项目中的方法论沉淀下来。\n\n比赛结束后，我把这段经历写进了长期简历，并补充了课程学习和证书。后来在企业实践机会中看到一家零售企业在招数据分析实习生，我直接投递了长期简历，HR 在面试时特别问了比赛中的数据复盘思路。\n\n现在回头看，参赛最重要的价值是把一次完整的项目经历变成可复用的能力证据。",
    author: "李思远",
    authorInitial: "李",
    tags: ["赛友故事", "实习", "数据分析"],
    publishTime: "2026-08-10",
    likes: 128,
  },
  {
    id: "brand-project",
    type: "story",
    title: "第一次和企业真实做项目",
    summary: "从需求澄清、协作到阶段汇报，一次并不完美但真实的项目实践，让我理解了课堂之外的商业节奏。",
    body: "大三那年，我通过平台的企业实践机会加入了一个品牌策划项目。最开始以为只是写方案，真正开始后才发现需要反复和客户确认需求、协调组员分工、在截止日期前迭代多版。\n\n项目最后并没有拿到最佳，但企业导师给了我们一份很详细的反馈报告，指出了我们在用户洞察和可行性分析上的不足。这些反馈后来成了我参加三创赛时的重要参考。\n\n真实项目和课堂作业最大的区别是：没有标准答案，但必须给出一个能落地的答案。",
    author: "王浩然",
    authorInitial: "王",
    tags: ["赛友故事", "企业项目", "品牌策划"],
    publishTime: "2026-08-05",
    likes: 96,
  },
  {
    id: "wechat-next",
    type: "wechat",
    title: "公众号精选：三创赛后的下一站",
    summary: "比赛结束不是终点，如何把参赛经历转化为长期履历、实习机会与职业方向。",
    body: "很多同学在赛后会有类似的疑问：比赛结束后，我这段时间的投入算什么？\n\n答案取决于你怎么整理它。赛事经历、项目成果、证书和学习记录，都是长期账号里的可信资产。在投递实习或企业项目时，这些资产比一段空泛的描述更有说服力。\n\n三创赛后的下一站，不是某一场比赛，而是把这些经历连接成一条可持续的成长路径。",
    author: "官方公众号",
    authorInitial: "官",
    tags: ["公众号精选", "成长路径"],
    publishTime: "2026-08-12",
    external: true,
    externalUrl: "https://mp.weixin.qq.com/",
    likes: 243,
  },
  {
    id: "wechat-pitch",
    type: "wechat",
    title: "公众号精选：路演答辩的五个常见失误",
    summary: "从评委视角整理的路演注意事项，帮助你在有限时间内把项目价值说清楚。",
    body: "路演答辩时间通常很短，评委最想知道的是：你在解决什么问题、为什么是你、能不能落地。\n\n常见失误包括：过度介绍背景而缺少结论、把技术细节讲得太细、对商业模式验证不足、回避风险问题、没有时间观念。\n\n建议提前用一句话讲清楚项目价值，再用一分钟展开逻辑，最后留出答疑空间。",
    author: "官方公众号",
    authorInitial: "官",
    tags: ["公众号精选", "路演", "答辩技巧"],
    publishTime: "2026-08-08",
    external: true,
    externalUrl: "https://mp.weixin.qq.com/",
    likes: 189,
  },
];

const SupportContext = createContext<SupportState | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(noticeSeed);
  const [bindings, setBindings] = useState<string[]>(["email"]);
  const [submittedStories, setSubmittedStories] = useState<Story[]>([]);
  const markRead = useCallback((id: string) => setNotifications(current => current.map(item => item.id === id && !item.read ? { ...item, read: true } : item)), []);
  const markAllRead = useCallback(() => setNotifications(current => current.some(item => !item.read) ? current.map(item => ({ ...item, read: true })) : current), []);
  const toggleBinding = useCallback((id: string) => setBindings(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), []);
  const submitStory = useCallback((story: Story) => setSubmittedStories(current => [story, ...current]), []);
  const value = useMemo(() => ({ notifications, bindings, submittedStories, markRead, markAllRead, toggleBinding, submitStory }), [notifications, bindings, submittedStories, markRead, markAllRead, toggleBinding, submitStory]);
  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

function useSupport() {
  const value = useContext(SupportContext);
  if (!value) throw new Error("SupportProvider missing");
  return value;
}

function useViewState() {
  const value = new URLSearchParams(useLocation().search).get("view");
  return value === "loading" || value === "empty" || value === "error" ? value : "ready";
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-medium text-text-primary">{label}</span><input value={value} onChange={event => onChange(event.target.value)} className="mt-2 min-h-touch w-full rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></label>;
}

export function OnboardingProfilePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState({ school: "", major: "", city: "" });
  const valid = Object.values(draft).every(value => value.trim());
  return <PublicShell showNavigation={false}><PageHeader title="完善基础资料" backTo="/auth/login" /><div className="space-y-5 px-4 py-6"><Card><p className="text-sm leading-5 text-text-secondary">这些信息用于推荐赛事、课程与机会；赛事报名仍以对应赛事确认的信息为准。</p></Card><Field label="学校" value={draft.school} onChange={school => setDraft(current => ({ ...current, school }))} /><Field label="专业" value={draft.major} onChange={major => setDraft(current => ({ ...current, major }))} /><Field label="所在城市" value={draft.city} onChange={city => setDraft(current => ({ ...current, city }))} /><Button className="w-full" disabled={!valid} onClick={() => navigate("/onboarding/survey")}>继续填写偏好</Button></div></PublicShell>;
}

export function OnboardingSurveyPage() {
  const navigate = useNavigate();
  const [focus, setFocus] = useState<string[]>([]);
  const options = ["参赛", "实习 / 就业", "企业项目", "课程成长"];
  const toggle = (value: string) => setFocus(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  return <PublicShell showNavigation={false}><PageHeader title="你更关注什么" backTo="/onboarding/profile" /><div className="space-y-5 px-4 py-6"><Card><p className="text-sm leading-5 text-text-secondary">用于首屏排序与推荐，不会把账号永久锁成某一种学生类型。</p></Card><div className="grid grid-cols-2 gap-3">{options.map(item => <button key={item} onClick={() => toggle(item)} className={`min-h-touch rounded-control border px-3 py-4 text-left text-sm font-medium ${focus.includes(item) ? "border-primary bg-primary-container text-text-brand" : "border-border bg-surface text-text-primary"}`}>{item}</button>)}</div><Button className="w-full" disabled={!focus.length} onClick={() => navigate("/onboarding/ready")}>完成问卷</Button></div></PublicShell>;
}

export function OnboardingReadyPage() {
  const navigate = useNavigate();
  return <PublicShell showNavigation={false}><PageHeader title="准备好了" /><div className="space-y-5 px-4 py-8"><Card><StatusTag tone="success">资料已完成</StatusTag><h1 className="mt-3 text-lg font-semibold text-text-primary">先从比赛或机会开始</h1><p className="mt-2 text-sm leading-5 text-text-secondary">课程、权益和可信成果会作为支撑能力出现，不需要先完成一整套成长任务。</p></Card><Button className="w-full" onClick={() => navigate("/home")}>进入首页</Button></div></PublicShell>;
}

export function NewsPage() {
  const view = useViewState();
  return <PublicShell><PageHeader title="公告与资讯" subtitle="赛事、机会与平台通知" /><div className="space-y-4 px-4 py-5">{view === "ready" ? news.map(item => <Link key={item.id} to={`/news/${item.id}`} className="block"><Card interactive><StatusTag tone="neutral">{item.tag}</StatusTag><h2 className="mt-3 text-base font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.summary}</p></Card></Link>) : <StateBlock state={view} />}</div><PrototypeStateTools /></PublicShell>;
}

export function NewsDetailPage() {
  const item = news.find(value => value.id === useParams().contentId);
  if (!item) return <Missing title="内容不存在" backTo="/news" />;
  return <PublicShell showNavigation={false}><PageHeader title="公告详情" backTo="/news" /><article className="space-y-5 px-4 py-6"><div><StatusTag tone="neutral">{item.tag}</StatusTag><h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{item.summary}</p></div><Card><p className="text-base leading-7 text-text-primary">{item.body}</p></Card></article></PublicShell>;
}

export function GrowthScorePage() {
  const { learning } = useLongTermAssets();
  const { applications } = usePublicPlatform();
  const completed = learning.filter(item => item.status === "completed").length;
  const rows: [string, number][] = [["基础账号", 60], ["已完成学习", completed * 20], ["真实投递", applications.length * 10]];
  const score = rows.reduce((sum, [, value]) => sum + value, 0);
  return <PublicShell showNavigation={false}><PageHeader title="成长概览" backTo="/me" /><div className="space-y-6 px-4 py-5"><Card><p className="text-sm text-text-secondary">成长记录汇总</p><strong className="mt-2 block text-2xl font-semibold text-text-primary">{score}</strong><p className="mt-2 text-xs leading-5 text-text-secondary">仅表达平台内成长记录，不替代赛事成绩、证书或招聘评价。</p></Card><Section title="本期构成"><div className="space-y-2">{rows.map(([label,value]) => <Card key={label}><div className="flex items-center justify-between text-sm"><span className="text-text-secondary">{label}</span><strong className="text-text-primary">+{value}</strong></div></Card>)}</div></Section></div></PublicShell>;
}

export function StoriesPage() {
  const { submittedStories } = useSupport();
  const view = useViewState();
  const [activeTab, setActiveTab] = useState<StoryType | "submit">("story");
  const allItems = useMemo(() => [...submittedStories.map(s => ({ ...s, type: "story" as StoryType })), ...storySeed], [submittedStories]);
  const visibleItems = useMemo(() => {
    if (activeTab === "submit") return [];
    return allItems.filter(item => item.type === activeTab);
  }, [activeTab, allItems]);

  return (
    <PublicShell>
      <PageHeader title="三创同学会" subtitle="赛友故事 · 公众号精选 · 投稿" />
      <div className="space-y-5 px-4 py-5">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "story", label: "赛友故事" },
            { key: "wechat", label: "公众号精选" },
            { key: "submit", label: "投稿入口" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as StoryType | "submit")}
              className={`min-h-touch shrink-0 rounded-control px-4 text-sm font-medium ${activeTab === tab.key ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "submit" ? (
          <Card className="space-y-4 py-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-container text-text-brand">
              <PenLine size={26} aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold text-text-primary">投稿你的赛友故事</h2>
            <p className="text-sm leading-5 text-text-secondary">分享参赛经历、项目实践或成长故事，经运营审核后展示给更多同学。</p>
            <Link to="/stories/submit" className="block min-h-touch rounded-control bg-primary px-4 py-3 text-center text-sm font-semibold text-on-primary">去投稿</Link>
          </Card>
        ) : view === "ready" ? (
          <div className="space-y-3">
            {visibleItems.length ? visibleItems.map(item => (
              <Link key={item.id} to={`/stories/${item.id}`} className="block">
                <Card interactive className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-medium text-text-brand">{item.authorInitial}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold leading-6 text-text-primary">{item.title}</h2>
                      <p className="mt-1 text-xs text-text-tertiary">{item.author} · {item.publishTime}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm leading-5 text-text-secondary">{item.summary}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}
                    {item.external && <StatusTag tone="info">公众号来源</StatusTag>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1"><Heart size={14} aria-hidden="true" /> {item.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={14} aria-hidden="true" /> 示例数据</span>
                  </div>
                </Card>
              </Link>
            )) : <StateBlock state="empty" />}
            {visibleItems.length > 0 && <p className="py-2 text-center text-xs text-text-tertiary">— 已加载全部示例数据 —</p>}
          </div>
        ) : <StateBlock state={view} />}
      </div>
      <PrototypeStateTools />
    </PublicShell>
  );
}

export function StoryDetailPage() {
  const { submittedStories } = useSupport();
  const item = [...submittedStories.map(s => ({ ...s, type: "story" as StoryType })), ...storySeed].find(value => value.id === useParams().storyId);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item?.likes ?? 0);
  if (!item) return <Missing title="故事不存在" backTo="/stories" />;
  const toggleLike = () => { setLiked(current => !current); setLikes(current => liked ? current - 1 : current + 1); };
  const paragraphs = item.body.split("\n\n");
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title={item.type === "wechat" ? "公众号精选" : "赛友故事"} backTo="/stories" />
      <article className="space-y-5 px-4 py-6">
        <div>
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}
            {item.external && <StatusTag tone="info">公众号来源</StatusTag>}
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">{item.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-container text-sm font-medium text-text-brand">{item.authorInitial}</span>
            <div>
              <p className="text-sm font-medium text-text-primary">{item.author}</p>
              <p className="text-xs text-text-tertiary">{item.publishTime}</p>
            </div>
          </div>
        </div>
        <Card className="space-y-4">
          {paragraphs.map((paragraph, index) => <p key={index} className="text-base leading-7 text-text-primary">{paragraph}</p>)}
          <p className="text-xs leading-5 text-text-tertiary">正式内容由运营审核后发布；原型只验证来源、阅读与互动动线。示例数据。</p>
          {item.external && item.externalUrl && (
            <>
              <a href={item.externalUrl} target="_blank" rel="noreferrer" className="block min-h-touch rounded-control bg-primary px-4 py-3 text-center text-sm font-semibold text-on-primary">阅读全文（公众号原文）</a>
              <p className="text-xs leading-5 text-text-tertiary">具体文章 URL 由运营内容配置；当前使用公众号域名验证真实外部跳转，不伪造一篇不存在的原文。</p>
            </>
          )}
        </Card>
        <div className="flex gap-3">
          <button onClick={toggleLike} className={`flex flex-1 items-center justify-center gap-2 rounded-control py-3 text-sm font-medium transition ${liked ? "bg-danger text-on-primary" : "bg-surface text-text-primary"}`}>
            <Heart size={18} aria-hidden="true" fill={liked ? "currentColor" : "none"} /> {likes}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-control bg-surface py-3 text-sm font-medium text-text-primary transition active:bg-surface-pressed">
            <Share2 size={18} aria-hidden="true" /> 分享
          </button>
        </div>
      </article>
    </PublicShell>
  );
}

export function StorySubmitPage() {
  const navigate = useNavigate();
  const { submitStory } = useSupport();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const valid = title.trim() && body.trim();
  const addImage = () => setImages(current => [...current, `https://placehold.co/120x120/eef2ff/4f46e5?text=图${current.length + 1}`]);
  const removeImage = (index: number) => setImages(current => current.filter((_, i) => i !== index));
  const submit = () => {
    submitStory({
      id: `submitted-${Date.now()}`,
      type: "story",
      title: title.trim(),
      summary: body.trim().slice(0, 80) + (body.trim().length > 80 ? "…" : ""),
      body: body.trim(),
      author: "我的投稿",
      authorInitial: "我",
      tags: ["赛友投稿"],
      publishTime: new Date().toISOString().slice(0, 10),
      likes: 0,
    });
    setSubmitted(true);
  };

  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="投稿赛友经历" backTo="/stories" />
      <div className="space-y-5 px-4 py-5">
        {submitted ? (
          <Card className="border border-success bg-success-bg py-6 text-center">
            <h1 className="text-lg font-semibold text-success-text">投稿已提交</h1>
            <p className="mt-2 text-sm text-success-text">内容进入运营审核；审核通过后将在「赛友故事」中展示。</p>
            <Button className="mt-4 w-full" onClick={() => navigate("/stories")}>返回三创同学会</Button>
          </Card>
        ) : (
          <>
            <Card className="border border-info bg-info-bg">
              <h2 className="text-sm font-semibold text-info-text">投稿须知</h2>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-info-text">
                <li>内容需为原创或已获得授权，禁止抄袭。</li>
                <li>建议围绕参赛经历、项目实践、成长故事展开。</li>
                <li>配图仅作原型展示，真实上传需运营配置。</li>
                <li>审核结果不会发送通知，本次会话可在列表查看。</li>
              </ul>
            </Card>
            <Field label="标题" value={title} onChange={setTitle} />
            <label className="block">
              <span className="text-sm font-medium text-text-primary">故事正文</span>
              <textarea rows={8} value={body} onChange={event => setBody(event.target.value)} placeholder="写下你的经历…" className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-primary">配图（原型模拟）</span>
              <div className="flex flex-wrap gap-3">
                {images.map((src, index) => (
                  <div key={`${src}-${index}`} className="relative">
                    <img src={src} alt={`配图 ${index + 1}`} className="size-20 rounded-container object-cover" />
                    <button onClick={() => removeImage(index)} className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-danger text-xs text-on-primary">×</button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button onClick={addImage} className="flex size-20 flex-col items-center justify-center gap-1 rounded-container border border-dashed border-border bg-surface text-text-secondary transition active:bg-surface-pressed">
                    <ImagePlus size={20} aria-hidden="true" />
                    <span className="text-xs">添加配图</span>
                  </button>
                )}
              </div>
            </div>
            <Button className="w-full" disabled={!valid} onClick={submit}>提交审核</Button>
          </>
        )}
      </div>
    </PublicShell>
  );
}

export function SupportHomePage() {
  const questions = ["报名后为什么还不能进入赛事工作区？", "比赛结束后证书和成绩在哪里？", "投递使用的是哪一份简历？"];
  return <PublicShell><PageHeader title="帮助与客服" subtitle="先自助定位，再进入客服会话" /><div className="space-y-6 px-4 py-5"><Section title="常见问题"><div className="space-y-2">{questions.map(item => <Card key={item}><p className="text-sm font-medium text-text-primary">{item}</p></Card>)}</div></Section><Card><h2 className="text-base font-semibold text-text-primary">仍需要帮助</h2><p className="mt-2 text-sm leading-5 text-text-secondary">客服会话保留 AI 与人工客服边界。需要人工时，最终渠道明确为企业微信福利官；正式联系人和二维码由运营配置。</p><Link to="/support/chat" className="mt-4 block min-h-touch rounded-control bg-primary px-4 py-3 text-center text-sm font-medium text-on-primary">进入客服会话</Link></Card></div></PublicShell>;
}

export function SupportChatPage() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(["你好，我可以先帮你定位报名、赛事、课程、权益和投递相关问题。"]);
  const [humanRequested, setHumanRequested] = useState(false);
  const send = () => { if (!draft.trim()) return; setMessages(current => [...current, draft.trim(), "原型客服：已记录你的问题。需要人工处理时可以发起人工请求。"]); setDraft(""); };
  return <PublicShell showNavigation={false}><PageHeader title="客服会话" backTo="/support" /><div className="space-y-5 px-4 py-5"><div className="space-y-2">{messages.map((item,index) => <Card key={`${index}-${item}`}><p className="text-sm leading-6 text-text-primary">{item}</p></Card>)}</div>{humanRequested && <Card className="border border-info bg-info-bg"><StatusTag tone="info">人工渠道：企业微信福利官</StatusTag><h2 className="mt-3 font-semibold text-info-text">请通过企业微信进入人工服务</h2><p className="mt-2 text-sm leading-6 text-info-text">正式联系人 / 二维码由运营配置。当前原型只明确最终接入渠道，不伪造已经加好友或已经接通人工。</p><a href="https://work.weixin.qq.com/" target="_blank" rel="noreferrer" className="mt-4 block min-h-touch rounded-control bg-surface px-4 py-3 text-center text-sm font-medium text-text-brand">打开企业微信入口</a></Card>}<textarea rows={4} value={draft} onChange={event => setDraft(event.target.value)} className="w-full rounded-control border border-border bg-surface p-3 text-sm outline-none focus:border-primary" placeholder="描述你的问题" /><div className="grid grid-cols-2 gap-3"><SecondaryButton onClick={() => setHumanRequested(true)} disabled={humanRequested}>{humanRequested ? "查看人工渠道" : "请求人工客服"}</SecondaryButton><Button disabled={!draft.trim()} onClick={send}>发送</Button></div></div></PublicShell>;
}

export function AccountsPage() {
  const { bindings, toggleBinding } = useSupport();
  const accounts = [["email","邮箱"],["wecom","企业微信"],["wechat","微信"]] as const;
  return <PublicShell showNavigation={false}><PageHeader title="账号绑定" backTo="/me" /><div className="space-y-4 px-4 py-5">{accounts.map(([id,label]) => { const bound = bindings.includes(id); return <Card key={id}><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{label}</h2><p className="mt-1 text-xs text-text-secondary">{bound ? "已绑定到当前长期账号" : "尚未绑定"}</p></div><StatusTag tone={bound ? "success" : "neutral"}>{bound ? "已绑定" : "未绑定"}</StatusTag></div><SecondaryButton className="mt-4 w-full" onClick={() => toggleBinding(id)}>{bound ? "解除绑定（原型）" : "绑定账号（原型）"}</SecondaryButton></Card>; })}</div></PublicShell>;
}

export function SubjectDecisionPage() {
  return <DecisionBlockedPage title="主体管理" decision="D08" body="旧原型中的“主体管理”与长期账号身份、学校/企业主体之间的真实业务关系尚未确认。T05 不用 UI 猜定义。" backTo="/me" />;
}

export function NotificationsPage() {
  const { notifications, markAllRead } = useSupport();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const visible = unreadOnly ? notifications.filter(item => !item.read) : notifications;
  return <PublicShell showNavigation={false}><PageHeader title="通知中心" backTo="/me" /><div className="space-y-5 px-4 py-5"><div className="flex gap-2"><button onClick={() => setUnreadOnly(false)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${!unreadOnly ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>全部</button><button onClick={() => setUnreadOnly(true)} className={`min-h-touch rounded-control px-3 text-sm font-medium ${unreadOnly ? "bg-primary-container text-text-brand" : "bg-surface text-text-secondary"}`}>未读</button><GhostButton className="ml-auto" onClick={markAllRead}>全部已读</GhostButton></div>{visible.length ? visible.map(item => <Link key={item.id} to={`/me/notifications/${item.id}`} className="block"><Card interactive><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-text-primary">{item.title}</h2><p className="mt-2 text-sm leading-5 text-text-secondary">{item.body}</p><p className="mt-3 text-xs text-text-tertiary">{item.time}</p></div>{!item.read && <StatusTag tone="info">未读</StatusTag>}</div></Card></Link>) : <StateBlock state="empty" />}</div></PublicShell>;
}

export function NotificationDetailPage() {
  const { notificationId } = useParams();
  const { notifications, markRead } = useSupport();
  const item = notifications.find(value => value.id === notificationId);
  useEffect(() => { if (notificationId) markRead(notificationId); }, [notificationId, markRead]);
  if (!item) return <Missing title="通知不存在" backTo="/me/notifications" />;
  return <PublicShell showNavigation={false}><PageHeader title="通知详情" backTo="/me/notifications" /><div className="space-y-5 px-4 py-6"><div><h1 className="text-lg font-semibold text-text-primary">{item.title}</h1><p className="mt-2 text-xs text-text-tertiary">{item.time}</p></div><Card><p className="text-base leading-7 text-text-primary">{item.body}</p></Card></div></PublicShell>;
}

export function LegalPage({ kind }: { kind: "user" | "privacy" }) {
  const title = kind === "user" ? "用户协议" : "隐私政策";
  return <PublicShell showNavigation={false}><PageHeader title={title} backTo="/me" /><div className="px-4 py-6"><Card><h1 className="text-lg font-semibold text-text-primary">{title}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">本原型仅验证信息架构和阅读入口。正式协议文本必须由业务与法务确认后替换，不在 T05 虚构法律条款。</p></Card></div></PublicShell>;
}

export function AboutPage() {
  return <PublicShell showNavigation={false}><PageHeader title="关于" backTo="/me" /><div className="space-y-5 px-4 py-6"><Card><h1 className="text-lg font-semibold text-text-primary">核心产业学院</h1><p className="mt-3 text-sm leading-6 text-text-secondary">围绕参赛、企业实践与就业/实习建立长期学生账号；课程、权益与可信成果作为支撑能力长期沉淀。</p></Card><Card><p className="text-xs text-text-secondary">Prototype · Com Design consumer</p></Card></div></PublicShell>;
}

function DecisionBlockedPage({ title, decision, body, backTo }: { title: string; decision: string; body: string; backTo: string }) {
  const navigate = useNavigate();
  return <PublicShell showNavigation={false}><PageHeader title={title} backTo={backTo} /><div className="space-y-5 px-4 py-6"><Card className="border border-warning bg-warning-bg"><StatusTag tone="warning">待产品决策 · {decision}</StatusTag><h1 className="mt-3 text-lg font-semibold text-warning-text">暂不实现产品交互</h1><p className="mt-2 text-sm leading-6 text-warning-text">{body}</p></Card><SecondaryButton className="w-full" onClick={() => navigate(backTo)}>返回上一层</SecondaryButton></div></PublicShell>;
}

function Missing({ title, backTo }: { title: string; backTo: string }) {
  return <PublicShell showNavigation={false}><PageHeader title={title} backTo={backTo} /><div className="px-4 py-6"><StateBlock state="error" /></div></PublicShell>;
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  return <PublicShell showNavigation={false}><PageHeader title="页面不存在" /><div className="space-y-5 px-4 py-8"><Card className="border border-danger bg-danger-bg"><StatusTag tone="danger">404 / dead-link</StatusTag><h1 className="mt-3 text-lg font-semibold text-danger-text">没有匹配到已登记路由</h1><p className="mt-2 break-all text-sm text-danger-text">{location.pathname}</p></Card><Button className="w-full" onClick={() => navigate("/home", { replace: true })}>返回首页</Button><SecondaryButton className="w-full" onClick={() => navigate("/dev/routes")}>查看路由总表</SecondaryButton></div></PublicShell>;
}
