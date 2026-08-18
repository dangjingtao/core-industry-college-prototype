export type Gender = "" | "male" | "female";
export type PhoneVerificationState = "verified" | "unverified";
export type IdentityType = "" | "vocational-student" | "undergraduate" | "postgraduate" | "employed" | "entrepreneur" | "job-seeker" | "research-educator" | "other";
export type CompetitionExperience = "" | "current" | "alumni" | "none";
export type EducationLevel = "" | "high-school-or-below" | "secondary-vocational" | "college" | "bachelor" | "master-or-above";
export type WorkYears = "" | "student" | "0" | "1-2" | "3-5" | "5-10" | "10+";
export type ProfileSource = "seed" | "onboarding" | "profile" | "registration" | "workshop";

/**
 * Long-lived account profile. Multi-select values are stored as comma-separated ids
 * in this prototype so every field remains serialisable and editable without a second
 * questionnaire truth source.
 */
export type StudentProfile = {
  name: string;
  nickname: string;
  gender: Gender;
  phone: string;
  phoneVerified: PhoneVerificationState;
  birthday: string;
  school: string;
  major: string;
  city: string;
  email: string;
  identityType: IdentityType;
  competitionExperience: CompetitionExperience;
  industryFields: string;
  educationLevel: EducationLevel;
  workYears: WorkYears;
  coreNeeds: string;
  serviceInterests: string;
};

export type StudentProfileField = keyof StudentProfile;
export type StudentProfileSources = Partial<Record<StudentProfileField, ProfileSource>>;

export const emptyStudentProfile: StudentProfile = {
  name: "",
  nickname: "",
  gender: "",
  phone: "",
  phoneVerified: "unverified",
  birthday: "",
  school: "",
  major: "",
  city: "",
  email: "",
  identityType: "",
  competitionExperience: "",
  industryFields: "",
  educationLevel: "",
  workYears: "",
  coreNeeds: "",
  serviceInterests: "",
};

export const seedStudentProfile: StudentProfile = {
  name: "林晓",
  nickname: "小晓",
  gender: "female",
  phone: "13800138000",
  phoneVerified: "verified",
  birthday: "2004-05-12",
  school: "华南商贸学院",
  major: "电子商务",
  city: "广州",
  email: "linxiao@example.edu.cn",
  identityType: "undergraduate",
  competitionExperience: "alumni",
  industryFields: "ecommerce,supply-chain",
  educationLevel: "bachelor",
  workYears: "student",
  coreNeeds: "competition,internship,course",
  serviceInterests: "competition-training,enterprise-recruitment,online-course",
};

export const identityTypeOptions = [
  ["vocational-student", "在校学生 · 职业院校"],
  ["undergraduate", "在校学生 · 本科"],
  ["postgraduate", "在校学生 · 研究生"],
  ["employed", "在职从业者"],
  ["entrepreneur", "创业 / 自由职业者"],
  ["job-seeker", "待就业 / 求职人员"],
  ["research-educator", "行业研究者 / 教育工作者"],
  ["other", "其他社会人士"],
] as const;

export const competitionExperienceOptions = [
  ["current", "本届赛手"],
  ["alumni", "往届赛友"],
  ["none", "暂未参加"],
] as const;

export const educationLevelOptions = [
  ["high-school-or-below", "高中及以下"],
  ["secondary-vocational", "中专 / 职高"],
  ["college", "大专"],
  ["bachelor", "本科"],
  ["master-or-above", "硕士及以上"],
] as const;

export const workYearsOptions = [
  ["student", "学生"],
  ["0", "0 年"],
  ["1-2", "1–2 年"],
  ["3-5", "3–5 年"],
  ["5-10", "5–10 年"],
  ["10+", "10 年以上"],
] as const;

export const industryOptions = [
  ["ai-data", "人工智能与大数据"],
  ["manufacturing", "智能制造 / 工业制造"],
  ["iot", "电子信息 / 物联网"],
  ["digital-content", "新媒体 / 数字文创"],
  ["ecommerce", "电子商务 / 跨境商贸"],
  ["supply-chain", "现代物流 / 供应链"],
  ["finance-management", "金融财会 / 经济管理"],
  ["other", "其它"],
] as const;

export const coreNeedOptions = [
  ["course", "学课程 / 提升职业技能"],
  ["competition", "参加行业赛事"],
  ["industry-news", "行业资讯 / 政策 / 前沿动态"],
  ["internship", "求职就业"],
  ["entrepreneurship", "创业项目对接 / 资源扶持"],
  ["practice-assessment", "实训 / 技能测评"],
  ["school-industry", "院校产业项目 / 产学研成果"],
  ["browse", "兴趣浏览"],
] as const;

export const serviceInterestOptions = [
  ["online-course", "公开课 / 线上课程"],
  ["skill-certificate", "职业技能考证"],
  ["competition-training", "行业竞赛报名与培训"],
  ["enterprise-recruitment", "企业招聘 / 校招"],
  ["skill-assessment", "技能测评 / 能力认证"],
  ["project-incubation", "产业项目孵化 / 创业扶持"],
] as const;

export function splitMulti(value: string) {
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

export function joinMulti(values: string[]) {
  return [...new Set(values)].join(",");
}

export function labelFor<T extends readonly (readonly [string, string])[]>(options: T, value: string) {
  return options.find(([id]) => id === value)?.[1] ?? "未填写";
}

export function initialProfileSources(profile: StudentProfile): StudentProfileSources {
  return Object.fromEntries(
    Object.entries(profile).filter(([, value]) => Boolean(value)).map(([key]) => [key, "seed"]),
  ) as StudentProfileSources;
}
