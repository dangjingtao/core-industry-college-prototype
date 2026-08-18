import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Award, Bookmark, BriefcaseBusiness, ChevronRight, Headphones, Heart, ImagePlus, MessageCircle, PenLine, Plus, Send, Share2, Trophy, Users, X, Zap } from "lucide-react";
import { Button, Card, GhostButton, PageHeader, PrototypeStateTools, PublicShell, SecondaryButton, Section, StateBlock, StatusTag } from "../../components/ui";
import { useLongTermAssets } from "../long-term-assets/store";
import { usePublicPlatform } from "../public-platform/PublicPlatform";

type Notice = { id: string; title: string; body: string; read: boolean; time: string };
type AwardLevel = "金奖" | "银奖" | "铜奖" | "专项奖";

type ShowcaseProject = {
  id: string;
  title: string;
  awardLevel: AwardLevel;
  edition: string;
  description: string;
  tags: string[];
  school: string;
  teamSize: number;
};

type AlumniPost = {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  likes: number;
  comments: number;
  bookmarks: number;
};

type Alumni = {
  id: string;
  name: string;
  verified: boolean;
  school: string;
  edition: string;
  role: string;
  awardLevel: AwardLevel;
  tags: string[];
  likes: number;
  postCount: number;
  initial: string;
  projects: ShowcaseProject[];
  posts: AlumniPost[];
};

type ProjectPostType = "找合作" | "招聘" | "资源置换" | "经验分享";

type ProjectPost = {
  id: string;
  type: ProjectPostType;
  tag: string;
  title: string;
  description: string;
  author: string;
  authorSchool: string;
  authorInitial: string;
  likes: number;
  comments: number;
};

type BoostTask = { id: string; title: string; points: number; tag: string };
type BoostRecord = { title: string; points: number };

type SupportState = {
  notifications: Notice[];
  bindings: string[];
  followedAlumni: string[];
  likedPosts: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggleBinding: (id: string) => void;
  toggleFollowAlumni: (id: string) => void;
  toggleLikePost: (id: string) => void;
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

const showcaseProjectsSeed: ShowcaseProject[] = [
  {
    id: "zhinong",
    title: "智农云仓 · 县域冷链SaaS",
    awardLevel: "金奖",
    edition: "第十六届",
    description: "为县域农业合作社提供从产地到仓配的全链路数字化解决方案，已落地 12 个县域，签约 23 家合作社。",
    tags: ["农业科技", "乡村振兴"],
    school: "中国农业大学",
    teamSize: 5,
  },
  {
    id: "cloud-psy",
    title: "云端心理咨询平台",
    awardLevel: "银奖",
    edition: "第十六届",
    description: "AI 辅助心理咨询师，匹配高校学生心理需求，已合作 5 所高校心理中心，服务学生超 8000 人次。",
    tags: ["心理健康", "AI应用"],
    school: "华东师范大学",
    teamSize: 4,
  },
  {
    id: "campus-recycle",
    title: "校园回收宝 · 闲置交易平台",
    awardLevel: "铜奖",
    edition: "第十六届",
    description: "高校闲置物品循环交易平台，已覆盖 8 所高校，DAU 3000+，月成交 12000+ 单。",
    tags: ["循环经济", "校园服务"],
    school: "厦门大学",
    teamSize: 3,
  },
];

const alumniSeed: Alumni[] = [
  {
    id: "zhang-mingyuan",
    name: "张明远",
    verified: true,
    school: "浙江大学",
    edition: "第15届",
    role: "队长",
    awardLevel: "金奖",
    tags: ["农业科技", "现役创业者"],
    likes: 238,
    postCount: 12,
    initial: "张",
    projects: [
      { id: "p1", title: "智农云仓 · 县域冷链SaaS平台", awardLevel: "金奖", edition: "第十六届", description: "为县域农业合作社提供从产地到仓配的全链路数字化解决方案，已落地 12 个县域，签约 23 家合作社，获天使轮融资 300 万。", tags: ["农业科技", "乡村振兴"], school: "中国农业大学", teamSize: 5 },
      { id: "p2", title: "校园二手书流转平台", awardLevel: "金奖", edition: "第十五届", description: "高校二手教材循环交易平台，已覆盖 3 所高校，累计交易 2 万册。", tags: ["循环经济", "校园服务"], school: "浙江大学", teamSize: 4 },
    ],
    posts: [
      { id: "post-1", title: "两次省赛被毙，第三次冲进国赛金奖", date: "2026-06-15", tag: "金奖复盘", excerpt: "最关键的转变：从「我们想做的」变成「他们需要的」。评委不是来看你炫技的，是来看你能不能解决真问题的。建议每一个团队在备赛前先做 50 份用户访谈，不要闭门造车。", likes: 238, comments: 56, bookmarks: 12 },
      { id: "post-2", title: "选人比选题更重要", date: "2026-03-02", tag: "团队组建", excerpt: "我的三个标准：① 能熬夜但第二天能正常交流的 ② 在某个领域比你强至少一档的 ③ 吵完架不会记仇的。技术、设计、路演，三个岗位缺一不可。", likes: 312, comments: 89, bookmarks: 23 },
      { id: "post-3", title: "不要把三创赛当作终点", date: "2026-01-20", tag: "赛后落地", excerpt: "拿到金奖只是开始，真正的考验是你敢不敢把项目真的做下去。我们跑了 12 个县城的农业局，被拒绝了 8 次才签下第一个合作社。", likes: 456, comments: 102, bookmarks: 34 },
    ],
  },
  {
    id: "li-siyu",
    name: "李思雨",
    verified: true,
    school: "复旦大学",
    edition: "第14届",
    role: "队员",
    awardLevel: "银奖",
    tags: ["教育科技", "早期投资人"],
    likes: 186,
    postCount: 8,
    initial: "李",
    projects: [
      { id: "p3", title: "学伴 — AI 个性化学习路径生成器", awardLevel: "银奖", edition: "第十四届", description: "基于知识图谱和 NLP 的个性化学习规划工具，为中学生提供自适应学习路径推荐，已获评教育部\"互联网+教育\"优秀案例。", tags: ["教育科技", "AI应用"], school: "复旦大学", teamSize: 4 },
    ],
    posts: [
      { id: "post-4", title: "我的路演秘诀就两个字：讲故事", date: "2026-05-10", tag: "路演心法", excerpt: "评委一天听几十个项目，你不讲故事他们根本记不住。先说一个真实的用户痛点场景，再引出你的方案，最后给数据。", likes: 189, comments: 43, bookmarks: 15 },
    ],
  },
  {
    id: "wang-qihang",
    name: "王启航",
    verified: true,
    school: "中南大学",
    edition: "第15届",
    role: "技术负责人",
    awardLevel: "金奖",
    tags: ["全栈开发", "创业中"],
    likes: 312,
    postCount: 15,
    initial: "王",
    projects: [
      { id: "p4", title: "CodePilot — 低代码 AI 应用生成平台", awardLevel: "金奖", edition: "第十五届", description: "通过自然语言描述即可生成企业级应用，内置 50+ 模板，服务 200+ 中小企业，月活 1.5 万。", tags: ["低代码", "AI应用"], school: "中南大学", teamSize: 5 },
    ],
    posts: [
      { id: "post-5", title: "比赛不是炫技场", date: "2026-04-18", tag: "技术干货", excerpt: "别一上来就微服务+K8S，MVP 阶段一个单体+云函数就够了。评委看的是你能不能把技术讲清楚、把价值说明白。", likes: 423, comments: 97, bookmarks: 28 },
    ],
  },
  {
    id: "chen-xiaonan",
    name: "陈晓楠",
    verified: false,
    school: "武汉大学",
    edition: "第16届",
    role: "产品负责人",
    awardLevel: "金奖",
    tags: ["心理健康", "产品设计"],
    likes: 145,
    postCount: 5,
    initial: "陈",
    projects: [],
    posts: [
      { id: "post-6", title: "我们的选题踩过 3 个大坑", date: "2026-06-28", tag: "选题心法", excerpt: "① 选了太热门的赛道竞争惨烈 ② 选了太冷门的评委看不懂 ③ 选了\"校内自嗨\"的需求。小而精准的痛点才是比赛的制胜点。", likes: 267, comments: 58, bookmarks: 19 },
    ],
  },
  {
    id: "zhou-tianyu",
    name: "周天宇",
    verified: true,
    school: "中国农业大学",
    edition: "第15届",
    role: "队长",
    awardLevel: "金奖",
    tags: ["AI+农业", "创业中"],
    likes: 198,
    postCount: 10,
    initial: "周",
    projects: [],
    posts: [
      { id: "post-7", title: "导师不是用来挂名的", date: "2026-02-14", tag: "导师关系", excerpt: "我们的导师帮我们联系了 5 个县的农业局做实地调研，没有这些一手数据根本过不了省赛。用你的热情去打动他，让他愿意为你牵线搭桥。", likes: 178, comments: 35, bookmarks: 11 },
    ],
  },
  {
    id: "xu-ruoxi",
    name: "徐若曦",
    verified: false,
    school: "华东师范大学",
    edition: "第14届",
    role: "队员",
    awardLevel: "银奖",
    tags: ["心理学", "公益方向"],
    likes: 92,
    postCount: 3,
    initial: "徐",
    projects: [],
    posts: [
      { id: "post-8", title: "社会价值是隐藏的加分项", date: "2026-07-10", tag: "社会价值", excerpt: "三创赛不只是比商业模式，社会价值是隐藏的加分项。我们在答辩时专门加了一页\"社会影响力评估\"——服务了多少人、创造了什么改变、有没有可持续性。", likes: 134, comments: 28, bookmarks: 9 },
    ],
  },
];

const projectPostsSeed: ProjectPost[] = [
  {
    id: "post-xu-1",
    type: "找合作",
    tag: "求助",
    title: "寻高校心理中心合作",
    description: "云端心理咨询平台已服务 5 所高校，希望拓展更多高校心理中心资源，可免费提供系统部署。",
    author: "徐若曦",
    authorSchool: "华东师大",
    authorInitial: "徐",
    likes: 12,
    comments: 8,
  },
  {
    id: "post-lin-1",
    type: "招聘",
    tag: "招募",
    title: "招后端 + 运营合伙人",
    description: "校园回收宝已上线，覆盖 8 校，DAU 3000，急招有热情的后端开发和运营同学加入团队。",
    author: "林书豪",
    authorSchool: "厦门大学",
    authorInitial: "林",
    likes: 28,
    comments: 15,
  },
  {
    id: "post-zhou-1",
    type: "资源置换",
    tag: "置换",
    title: "技术换渠道：AI 识别工具寻农业推广",
    description: "我们提供 AI 病虫害识别 API，换取农技推广渠道或农业合作社资源，非诚勿扰。",
    author: "周天宇",
    authorSchool: "中国农大",
    authorInitial: "周",
    likes: 19,
    comments: 6,
  },
  {
    id: "post-zhang-1",
    type: "经验分享",
    tag: "干货",
    title: "金奖复盘：评委到底看什么？",
    description: "两次省赛被毙，第三次冲进国赛金奖。最关键的转变：从「我们想做的」变成「他们需要的」。",
    author: "张明远",
    authorSchool: "浙江大学",
    authorInitial: "张",
    likes: 156,
    comments: 34,
  },
];

const boostTasksSeed: BoostTask[] = [
  { id: "watch-video", title: "观看赛事宣传片", points: 20, tag: "为赛事助力" },
  { id: "browse-benefit", title: "浏览赞助商权益", points: 15, tag: "解锁福利" },
  { id: "watch-ad", title: "观看三创赛公益广告", points: 30, tag: "今日高价值" },
  { id: "invite", title: "邀请新赛友加入同学会", points: 50, tag: "上不封顶" },
];

const boostRecordsSeed: BoostRecord[] = [
  { title: "观看赛事宣传片", points: 20 },
  { title: "浏览赞助商权益", points: 15 },
  { title: "分享三创风采", points: 10 },
];

const awardOptions: { key: "all" | AwardLevel; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "金奖", label: "金奖" },
  { key: "银奖", label: "银奖" },
  { key: "铜奖", label: "铜奖" },
  { key: "专项奖", label: "专项奖" },
];

function awardTone(level: AwardLevel): "success" | "info" | "warning" | "neutral" {
  if (level === "金奖") return "success";
  if (level === "银奖") return "info";
  if (level === "铜奖") return "warning";
  return "neutral";
}

const SupportContext = createContext<SupportState | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(noticeSeed);
  const [bindings, setBindings] = useState<string[]>(["email"]);
  const [followedAlumni, setFollowedAlumni] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const markRead = useCallback((id: string) => setNotifications(current => current.map(item => item.id === id && !item.read ? { ...item, read: true } : item)), []);
  const markAllRead = useCallback(() => setNotifications(current => current.some(item => !item.read) ? current.map(item => ({ ...item, read: true })) : current), []);
  const toggleBinding = useCallback((id: string) => setBindings(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), []);
  const toggleFollowAlumni = useCallback((id: string) => setFollowedAlumni(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), []);
  const toggleLikePost = useCallback((id: string) => setLikedPosts(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), []);
  const value = useMemo(() => ({ notifications, bindings, followedAlumni, likedPosts, markRead, markAllRead, toggleBinding, toggleFollowAlumni, toggleLikePost }), [notifications, bindings, followedAlumni, likedPosts, markRead, markAllRead, toggleBinding, toggleFollowAlumni, toggleLikePost]);
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
  const view = useViewState();
  const [activeTab, setActiveTab] = useState<"showcase" | "projects" | "boost">("showcase");
  const [awardFilter, setAwardFilter] = useState<"all" | AwardLevel>("all");
  const [myPoints, setMyPoints] = useState(1280);
  const [records, setRecords] = useState<BoostRecord[]>(boostRecordsSeed);

  const filteredProjects = useMemo(() => awardFilter === "all" ? showcaseProjectsSeed : showcaseProjectsSeed.filter(p => p.awardLevel === awardFilter), [awardFilter]);

  const completeTask = (task: BoostTask) => {
    setMyPoints(current => current + task.points);
    setRecords(current => [{ title: task.title, points: task.points }, ...current]);
  };

  return (
    <PublicShell>
      <PageHeader title="三创同学会" subtitle="亲爱的三创赛友，欢迎你" />
      <div className="space-y-5 px-4 py-5">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "showcase", label: "赛友风采" },
            { key: "projects", label: "创·项目" },
            { key: "boost", label: "赛事助力" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "showcase" | "projects" | "boost")}
              className={`min-h-touch shrink-0 rounded-control px-4 text-sm font-medium ${activeTab === tab.key ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "showcase" && (
          <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto">
              {awardOptions.map(option => (
                <button
                  key={option.key}
                  onClick={() => setAwardFilter(option.key as "all" | AwardLevel)}
                  className={`min-h-touch shrink-0 rounded-full px-3 text-xs font-medium ${awardFilter === option.key ? "bg-primary text-on-primary" : "bg-surface text-text-secondary"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Section title={`第十六届优秀团队 ${awardFilter === "all" ? "全部" : awardFilter} ${filteredProjects.length} 个`} action={<span className="text-xs text-text-tertiary">示例数据</span>}>
              <div className="space-y-3">
                {filteredProjects.map(project => (
                  <Card key={project.id} interactive className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-container bg-surface text-xs text-text-tertiary">项目展示图</span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-semibold leading-6 text-text-primary">{project.title}</h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusTag tone={awardTone(project.awardLevel)}>{project.awardLevel}</StatusTag>
                          {project.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-5 text-text-secondary">{project.description}</p>
                    <p className="text-xs text-text-tertiary">{project.school} · {project.teamSize} 人团队</p>
                  </Card>
                ))}
              </div>
            </Section>

            <Section title="历届优秀赛友" action={<Link to="/stories/alumni" className="text-sm font-medium text-text-brand">查看更多</Link>}>
              <div className="grid grid-cols-2 gap-3">
                {alumniSeed.slice(0, 4).map(alumni => (
                  <Link key={alumni.id} to={`/stories/${alumni.id}`} className="block">
                    <Card interactive className="space-y-3 text-center">
                      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-container text-lg font-medium text-text-brand">{alumni.initial}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">{alumni.name} {alumni.verified && "✓"}</h3>
                        <p className="mt-1 text-xs text-text-tertiary">{alumni.school} · {alumni.edition}</p>
                        <p className="mt-1 text-xs text-text-secondary">{alumni.role}</p>
                      </div>
                      <StatusTag tone={awardTone(alumni.awardLevel)}>{alumni.awardLevel}</StatusTag>
                      <div className="flex flex-wrap justify-center gap-1">
                        {alumni.tags.map(tag => <span key={tag} className="text-[10px] text-text-tertiary">#{tag}</span>)}
                      </div>
                      <div className="flex items-center justify-center gap-3 text-xs text-text-tertiary">
                        <span className="flex items-center gap-1"><Heart size={12} aria-hidden="true" /> {alumni.likes}</span>
                        <span className="flex items-center gap-1"><Bookmark size={12} aria-hidden="true" /> {alumni.postCount}篇经验</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Section>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-4">
            <Card className="border border-info bg-info-bg">
              <p className="text-sm leading-5 text-info-text">优秀案例与项目需求由运营后台统一上传，学生端暂不支持自行发布。</p>
            </Card>
            <div className="space-y-3">
              {projectPostsSeed.map(post => (
                <ProjectPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "boost" && (
          <div className="space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">我的学力值</span>
                <Zap size={18} className="text-warning-text" aria-hidden="true" />
              </div>
              <strong className="block text-3xl font-semibold text-text-primary">{myPoints.toLocaleString()}</strong>
              <p className="text-xs leading-5 text-text-tertiary">每完成一个任务即可为第十六届三创赛助力，赛事组委会将获得对应资金支持。</p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { label: "已助力人数", value: "8,432" },
                  { label: "累计学力值", value: "12.6万" },
                  { label: "已筹资金", value: "¥32,580" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-control bg-surface p-2 text-center">
                    <strong className="block text-sm font-semibold text-text-primary">{stat.value}</strong>
                    <span className="text-[10px] text-text-tertiary">{stat.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Section title="今日任务">
              <div className="space-y-2">
                {boostTasksSeed.map(task => (
                  <Card key={task.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-text-primary">{task.title}</h3>
                      <p className="mt-1 text-xs text-text-tertiary">{task.tag}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-warning-text">+{task.points}</span>
                      <button onClick={() => completeTask(task)} className="min-h-touch rounded-control bg-primary px-3 py-2 text-xs font-medium text-on-primary">去完成</button>
                    </div>
                  </Card>
                ))}
              </div>
            </Section>

            <Section title="助力记录">
              <div className="space-y-2">
                {records.map((record, index) => (
                  <div key={`${record.title}-${index}`} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{record.title}</span>
                    <span className="font-medium text-warning-text">+{record.points}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
      <PrototypeStateTools />
    </PublicShell>
  );
}

function ProjectPostCard({ post }: { post: ProjectPost }) {
  const { likedPosts, toggleLikePost } = useSupport();
  const liked = likedPosts.includes(post.id);
  return (
    <Card interactive className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <StatusTag tone="info">{post.type}</StatusTag>
          <StatusTag tone="neutral">#{post.tag}</StatusTag>
        </div>
      </div>
      <h3 className="text-base font-semibold text-text-primary">{post.title}</h3>
      <p className="text-sm leading-5 text-text-secondary">{post.description}</p>
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-container text-xs font-medium text-text-brand">{post.authorInitial}</span>
        <span className="text-xs text-text-tertiary">{post.author} · {post.authorSchool}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-tertiary">
        <button onClick={() => toggleLikePost(post.id)} className={`flex items-center gap-1 ${liked ? "text-danger" : ""}`}>
          <Heart size={14} aria-hidden="true" fill={liked ? "currentColor" : "none"} /> {post.likes + (liked ? 1 : 0)}
        </button>
        <span className="flex items-center gap-1"><MessageCircle size={14} aria-hidden="true" /> {post.comments}</span>
      </div>
    </Card>
  );
}

export function StoryDetailPage() {
  const { followedAlumni, toggleFollowAlumni } = useSupport();
  const alumni = alumniSeed.find(value => value.id === useParams().storyId);
  if (!alumni) return <Missing title="赛友不存在" backTo="/stories" />;
  const followed = followedAlumni.includes(alumni.id);
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="赛友主页" backTo="/stories" />
      <div className="space-y-5 px-4 py-5">
        <Card className="space-y-4 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-container text-2xl font-medium text-text-brand">{alumni.initial}</span>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{alumni.name} {alumni.verified && <span className="text-text-brand">✓</span>}</h1>
            <p className="mt-1 text-sm text-text-secondary">{alumni.school} · {alumni.edition} · {alumni.role}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <StatusTag tone={awardTone(alumni.awardLevel)}>{alumni.awardLevel}</StatusTag>
              {alumni.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1"><Heart size={14} aria-hidden="true" /> {alumni.likes}</span>
            <span className="flex items-center gap-1"><Bookmark size={14} aria-hidden="true" /> {alumni.postCount} 篇经验</span>
          </div>
          <Button className="w-full" onClick={() => toggleFollowAlumni(alumni.id)}>{followed ? "已关注" : "关注赛友"}</Button>
        </Card>

        {alumni.projects.length > 0 && (
          <Section title="🏅 获奖项目">
            <div className="space-y-3">
              {alumni.projects.map(project => (
                <Card key={project.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">{project.title}</h3>
                  <p className="text-xs text-text-tertiary">{project.edition}全国大学生三创赛{project.awardLevel}。{project.school} · {project.teamSize} 人团队。</p>
                  <p className="text-sm leading-5 text-text-secondary">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map(tag => <StatusTag key={tag} tone="neutral">{tag}</StatusTag>)}
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        <Section title="📝 备赛经验分享">
          <div className="space-y-3">
            {alumni.posts.map(post => (
              <Card key={post.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-container text-xs font-medium text-text-brand">{alumni.initial}</span>
                  <span className="text-xs font-semibold text-text-primary">{alumni.name}</span>
                  <span className="text-xs text-text-tertiary">{post.date} · {post.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">#{post.tag} {post.title}</h3>
                <p className="text-sm leading-5 text-text-secondary">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1"><Heart size={14} aria-hidden="true" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} aria-hidden="true" /> {post.comments}</span>
                  <span className="flex items-center gap-1"><Bookmark size={14} aria-hidden="true" /> {post.bookmarks}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </PublicShell>
  );
}

export function StorySubmitPage() {
  const navigate = useNavigate();
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="内容上传" backTo="/stories" />
      <div className="px-4 py-5">
        <Card className="border border-info bg-info-bg py-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-info text-on-primary">
            <PenLine size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-info-text">内容由运营后台上传</h1>
          <p className="mt-2 text-sm leading-5 text-info-text">优秀案例、赛友风采与项目需求均由运营后台统一上传，学生端暂不支持自行发布。</p>
          <Button className="mt-4 w-full" onClick={() => navigate("/stories")}>返回三创同学会</Button>
        </Card>
      </div>
    </PublicShell>
  );
}

export function AlumniListPage() {
  return (
    <PublicShell showNavigation={false}>
      <PageHeader title="历届优秀赛友" backTo="/stories" />
      <div className="space-y-3 px-4 py-5">
        {alumniSeed.map(alumni => (
          <Link key={alumni.id} to={`/stories/${alumni.id}`} className="block">
            <Card interactive className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-lg font-medium text-text-brand">{alumni.initial}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-text-primary">{alumni.name} {alumni.verified && <span className="text-text-brand">✓</span>}</h3>
                  <StatusTag tone={awardTone(alumni.awardLevel)}>{alumni.awardLevel}</StatusTag>
                </div>
                <p className="mt-1 text-xs text-text-tertiary">{alumni.school} · {alumni.edition} · {alumni.role}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {alumni.tags.map(t => <span key={t} className="text-[10px] text-text-tertiary">#{t}</span>)}
                </div>
              </div>
              <ChevronRight size={18} className="text-text-tertiary" aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </PublicShell>
  );
}

export function SupportHomePage() {
  const questions = ["报名后为什么还不能进入赛事工作区？", "比赛结束后证书和成绩在哪里？", "投递使用的是哪一份简历？"];
  return <PublicShell><PageHeader title="帮助与客服" subtitle="先自助定位，再进入客服会话" /><div className="space-y-6 px-4 py-5"><Section title="常见问题"><div className="space-y-2">{questions.map(item => <Card key={item}><p className="text-sm font-medium text-text-primary">{item}</p></Card>)}</div></Section><Card><h2 className="text-base font-semibold text-text-primary">仍需要帮助</h2><p className="mt-2 text-sm leading-5 text-text-secondary">客服会话保留 AI 与人工客服边界。需要人工时，最终渠道明确为企业微信福利官；正式联系人和二维码由运营配置。</p><Link to="/support/chat" className="mt-4 block min-h-touch rounded-control bg-primary px-4 py-3 text-center text-sm font-medium text-on-primary">进入客服会话</Link></Card></div></PublicShell>;
}

function MockQRCode({ size = 160, label }: { size?: number; label: string }) {
  const cells = 21;
  const pattern = useMemo(() => {
    const hash = label.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: cells * cells }, (_, i) => ((hash + i * 37) % 7) < 3);
  }, [label]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cells} ${cells}`} className="rounded-control bg-white">
      <rect width={cells} height={cells} fill="white" />
      {pattern.map((active, i) => {
        const x = i % cells;
        const y = Math.floor(i / cells);
        return active ? <rect key={i} x={x} y={y} width={1} height={1} fill="#111827" /> : null;
      })}
      <rect x={1.5} y={1.5} width={5} height={5} fill="none" stroke="#111827" strokeWidth={0.6} />
      <rect x={2} y={2} width={4} height={4} fill="#111827" />
      <rect x={cells - 7.5} y={1.5} width={5} height={5} fill="none" stroke="#111827" strokeWidth={0.6} />
      <rect x={cells - 7} y={2} width={4} height={4} fill="#111827" />
      <rect x={1.5} y={cells - 7.5} width={5} height={5} fill="none" stroke="#111827" strokeWidth={0.6} />
      <rect x={2} y={cells - 7} width={4} height={4} fill="#111827" />
    </svg>
  );
}

const hotQuestions = [
  "如何报名三创赛？",
  "报名后多久能进入赛事工作区？",
  "证书和成绩在哪里查看？",
  "怎么修改已提交的简历？",
  "实习机会需要先有赛事身份吗？",
];

function replyForQuestion(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("报名")) return "报名流程：进入「全部赛事」→ 选择赛事 → 完成身份选择 / 团队报名 → 等待学校审核通过后即可获得赛事身份。";
  if (lower.includes("工作区") || lower.includes("赛事")) return "报名审核通过后，可在首页「任务专区」或「我的」→「当前赛事」进入赛事工作区，查看阶段任务与提交材料。";
  if (lower.includes("证书") || lower.includes("成绩")) return "比赛结束后，证书与成绩会沉淀到「可信成果」→「我的证书」和「成绩查询」中，可保存、下载或验真。";
  if (lower.includes("简历")) return "长期简历在「我的」→「长期简历」中维护；投递机会时会优先使用长期简历中的可信经历。";
  if (lower.includes("实习") || lower.includes("机会")) return "实习与项目机会在「机会」Tab 查看；部分机会与赛事身份、课程学习记录相关联，具体以岗位要求为准。";
  if (lower.includes("人工")) return "已为你打开人工客服通道，请扫描弹窗中的企业微信二维码联系福利官。";
  return "我已记录你的问题，会根据平台知识库继续学习。如果问题紧急，可以点击右上角「人工客服」获取企业微信支持。";
}

type ChatMessage = { id: string; role: "user" | "assistant"; text: string; };

export function SupportChatPage() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: "你好，我是智能客服助手。我可以帮你解答报名、赛事、课程、权益、可信成果和投递相关的问题。" },
  ]);
  const [showHumanModal, setShowHumanModal] = useState(false);
  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const assistantMsg: ChatMessage = { id: `a-${Date.now() + 1}`, role: "assistant", text: replyForQuestion(trimmed) };
    setMessages(current => [...current, userMsg, assistantMsg]);
    setDraft("");
  }, []);
  const openHumanModal = () => setShowHumanModal(true);
  return <PublicShell showNavigation={false}>
    <PageHeader title="智能客服" backTo="/home" right={<button aria-label="人工客服" onClick={openHumanModal} className="flex size-9 items-center justify-center rounded-full bg-surface text-text-primary"><Headphones size={20} aria-hidden="true" /></button>} />
    <div className="flex h-[calc(100dvh-120px)] flex-col px-4 pb-4">
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.map(item => <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "rounded-br-md bg-primary text-on-primary" : "rounded-bl-md bg-surface text-text-primary"}`}>{item.text}</div></div>)}
        {messages.length === 1 && <div className="space-y-2"><p className="text-xs text-text-tertiary">热门问题，点击直接提问：</p><div className="flex flex-wrap gap-2">{hotQuestions.map(q => <button key={q} onClick={() => send(q)} className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition active:bg-surface-pressed">{q}</button>)}</div></div>}
      </div>
      <div className="shrink-0 space-y-3 border-t border-border-subtle pt-3">
        <div className="flex items-end gap-2"><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(draft); } }} className="min-h-touch flex-1 rounded-control border border-border bg-surface px-3 text-sm outline-none focus:border-primary" placeholder="输入你的问题" /><button aria-label="发送" disabled={!draft.trim()} onClick={() => send(draft)} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition active:scale-95 disabled:opacity-40"><Send size={18} aria-hidden="true" /></button></div>
        <div className="flex items-center justify-between gap-3"><button onClick={openHumanModal} className="text-xs font-medium text-text-brand">请求人工客服</button><Link to="/support" className="text-xs text-text-tertiary">查看帮助中心</Link></div>
      </div>
    </div>
    {showHumanModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={event => { if (event.target === event.currentTarget) setShowHumanModal(false); }}><div className="w-full max-w-[320px] rounded-container bg-surface p-5 text-center shadow-floating"><div className="flex items-center justify-between"><h2 className="text-base font-semibold text-text-primary">人工客服</h2><button aria-label="关闭" onClick={() => setShowHumanModal(false)} className="flex size-8 items-center justify-center rounded-full text-text-tertiary"><X size={18} aria-hidden="true" /></button></div><div className="mt-4 flex justify-center"><MockQRCode label="企业微信客服二维码" /></div><p className="mt-4 text-sm font-medium text-text-primary">扫码添加企业微信福利官</p><p className="mt-2 text-xs leading-5 text-text-secondary">正式二维码由运营配置；当前为原型占位，仅验证「获取二维码」的交互出口。</p><SecondaryButton className="mt-4 w-full" onClick={() => setShowHumanModal(false)}>知道了</SecondaryButton></div></div>}
  </PublicShell>;
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
