import { isCourseCompleted } from "@core/shared";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePublicPlatform } from "../public-platform/state";
import { redeemCodeWithBackend, type CodeRedemptionRecord, type RedemptionOutcome } from "../redeem/data";
import { welfareProjectById, welfareProjects } from "../welfare/data";
import { benefitById, benefits, courses, initialCertificates, initialCompetitionResults, initialEducationIdentity, type BenefitStatus, type CertificateRecord, type CompetitionResultRecord, type EducationIdentityRecord } from "./data";
import {
  emptyStudentProfile,
  initialProfileSources,
  seedStudentProfile,
  type ProfileSource,
  type StudentProfile,
  type StudentProfileSources,
} from "./studentProfile";

export type LearningStatus = "notStarted" | "inProgress" | "completed";
export type LearningRecord = {
  courseId: string;
  status: LearningStatus;
  progress: number;
  assessment: "idle" | "passed" | "failed";
};

export type ResumeEducationDetails = {
  graduationTime: string;
  startDate: string;
  endDate: string;
  majorCourses: string;
  campusExperience: string;
};

export type ResumePresentation = {
  selectedFactKeys: string[];
  strengths: string;
  education: string;
  educationDetails: ResumeEducationDetails;
  updatedAt: string;
};

/** @deprecated Use StudentProfile. Kept as a compatibility alias for existing prototype code. */
export type ProfileState = StudentProfile;

export type EnrollmentResult = { success: true } | { success: false; reason: string };

export type WelfareParticipationRecord = {
  id: string;
  projectId: string;
  helpedAt: string;
  /** 激励视频广告播放回执 ID，真实 SDK 接入后回填 */
  adPlaybackId?: string;
  /** 奖励发放状态，F04 Decision A 前固定为 pending */
  rewardStatus: "pending" | "granted" | "failed";
};

type LongTermAssetsContextValue = {
  learning: LearningRecord[];
  benefitStatuses: Record<string, BenefitStatus>;
  benefitStatusFor: (benefitId: string) => BenefitStatus;
  certificates: CertificateRecord[];
  competitionResults: CompetitionResultRecord[];
  educationIdentity: EducationIdentityRecord | null;
  resume: ResumePresentation;
  profile: StudentProfile;
  profileSources: StudentProfileSources;
  creditBalance: number;
  enrolledCourseIds: string[];
  learningFor: (courseId: string) => LearningRecord;
  courseCompletedFor: (courseId: string) => boolean;
  enrolledFor: (courseId: string) => boolean;
  startCourse: (courseId: string) => void;
  advanceCourse: (courseId: string) => void;
  completeCourse: (courseId: string) => void;
  submitAssessment: (courseId: string, passed: boolean) => void;
  enrollCourse: (courseId: string) => EnrollmentResult;
  claimBenefit: (benefitId: string) => void;
  useBenefit: (benefitId: string) => void;
  claimCertificate: (certificateId: string) => void;
  claimEducationIdentity: () => void;
  welfareParticipations: WelfareParticipationRecord[];
  welfareProjectStats: Record<string, number>;
  hasHelpedWelfare: (projectId: string) => boolean;
  helpWelfare: (projectId: string) => { success: true } | { success: false; reason: string };
  codeRedemptions: CodeRedemptionRecord[];
  redeemCode: (code: string, outcome: RedemptionOutcome, source: "manual" | "scan") => boolean;
  simulateScanRedeem: () => { code: string; amount: number } | null;
  toggleResumeFact: (factKey: string) => void;
  updateStrengths: (value: string) => void;
  updateEducation: (value: string) => void;
  updateEducationDetails: (patch: Partial<ResumeEducationDetails>) => void;
  updateProfile: (patch: Partial<StudentProfile>, source?: ProfileSource) => void;
  initializeNewAccount: (contact: string) => void;
  mergeProfileFromSource: (patch: Partial<StudentProfile>, source: Exclude<ProfileSource, "seed" | "profile">, mode?: "fill-empty" | "replace") => void;
};

const seedLearning: LearningRecord[] = [
  { courseId: "data-analytics", status: "completed", progress: 100, assessment: "passed" },
  { courseId: "brand-ecommerce", status: "inProgress", progress: 38, assessment: "idle" },
  { courseId: "retail-project-lab", status: "notStarted", progress: 0, assessment: "idle" },
];

const seedEnrolledCourseIds = ["data-analytics", "brand-ecommerce", "retail-project-lab"];
const seedCreditBalance = 1280;

const seedResume: ResumePresentation = {
  selectedFactKeys: ["experience:sanchuang-15", "certificate:cert-sanchuang-15", "learning:data-analytics"],
  strengths: "有真实赛事项目协作、内容运营和数据复盘经历，习惯把结论落到可验证的行动。",
  education: "华南商贸学院 · 电子商务 · 本科",
  educationDetails: {
    graduationTime: "2026-06",
    startDate: "2022-09",
    endDate: "2026-06",
    majorCourses: "消费者行为学、电子商务运营、数据分析、供应链管理",
    campusExperience: "参与校级创新创业项目与赛事团队，负责内容运营、用户调研和阶段复盘。",
  },
  updatedAt: "2026-08-17",
};

const emptyResume: ResumePresentation = {
  selectedFactKeys: [],
  strengths: "",
  education: "",
  educationDetails: {
    graduationTime: "",
    startDate: "",
    endDate: "",
    majorCourses: "",
    campusExperience: "",
  },
  updatedAt: "2026-08-18",
};

const LongTermAssetsContext = createContext<LongTermAssetsContextValue | null>(null);

function updateLearning(records: LearningRecord[], courseId: string, updater: (record: LearningRecord) => LearningRecord) {
  const existing = records.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted" as LearningStatus, progress: 0, assessment: "idle" as const };
  return records.some(record => record.courseId === courseId)
    ? records.map(record => record.courseId === courseId ? updater(record) : record)
    : [...records, updater(existing)];
}

function normalizedLearningRecord(record: LearningRecord, progress: number, assessment: LearningRecord["assessment"]): LearningRecord {
  return {
    ...record,
    progress,
    assessment,
    status: isCourseCompleted({ progress, assessment }) ? "completed" : progress > 0 ? "inProgress" : "notStarted",
  };
}

function sourcePatch(patch: Partial<StudentProfile>, source: ProfileSource): StudentProfileSources {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined).map(([key]) => [key, source]),
  ) as StudentProfileSources;
}

export function LongTermAssetsProvider({ children }: { children: ReactNode }) {
  const { session, identities } = usePublicPlatform();
  const [learning, setLearning] = useState<LearningRecord[]>(seedLearning);
  const [benefitStatuses, setBenefitStatuses] = useState<Record<string, BenefitStatus>>(() => Object.fromEntries(benefits.map(item => [item.id, item.initialStatus])));
  const [certificates, setCertificates] = useState<CertificateRecord[]>(initialCertificates);
  const [competitionResults] = useState<CompetitionResultRecord[]>(initialCompetitionResults);
  const [educationIdentity, setEducationIdentity] = useState<EducationIdentityRecord | null>(initialEducationIdentity);
  const [resume, setResume] = useState<ResumePresentation>(seedResume);
  const [profile, setProfile] = useState<StudentProfile>(seedStudentProfile);
  const [profileSources, setProfileSources] = useState<StudentProfileSources>(() => initialProfileSources(seedStudentProfile));
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(seedEnrolledCourseIds);
  const [creditBalance, setCreditBalance] = useState<number>(seedCreditBalance);
  const [welfareParticipations, setWelfareParticipations] = useState<WelfareParticipationRecord[]>([]);
  const [welfareProjectStats, setWelfareProjectStats] = useState<Record<string, number>>(() => Object.fromEntries(welfareProjects.map(project => [project.id, project.current])));
  const [codeRedemptions, setCodeRedemptions] = useState<CodeRedemptionRecord[]>([]);

  const benefitStatusFor = useCallback((benefitId: string): BenefitStatus => {
    const benefit = benefitById(benefitId);
    if (!benefit) return "ineligible";
    const stored = benefitStatuses[benefitId] ?? benefit.initialStatus;
    if (stored === "claimed" || stored === "used" || stored === "expired") return stored;
    if (!benefit.requiresCompetitionId) return stored;
    const eligibleFromSharedIdentity = session.loggedIn && identities.some(identity => identity.competitionId === benefit.requiresCompetitionId && identity.identityStatus === "active");
    return eligibleFromSharedIdentity ? stored : "ineligible";
  }, [benefitStatuses, identities, session.loggedIn]);

  const updateProfile = useCallback((patch: Partial<StudentProfile>, source: ProfileSource = "profile") => {
    if (!session.loggedIn) return;
    setProfile(current => ({ ...current, ...patch }));
    setProfileSources(current => ({ ...current, ...sourcePatch(patch, source) }));
  }, [session.loggedIn]);

  const initializeNewAccount = useCallback((contact: string) => {
    const isPhone = /^1\d{10}$/.test(contact);
    const nextProfile: StudentProfile = {
      ...emptyStudentProfile,
      phone: isPhone ? contact : "",
      phoneVerified: isPhone ? "verified" : "unverified",
      email: isPhone ? "" : contact,
    };
    setLearning([]);
    setBenefitStatuses(Object.fromEntries(benefits.map(item => [item.id, item.initialStatus])));
    setCertificates([]);
    setEnrolledCourseIds([]);
    setCreditBalance(seedCreditBalance);
    setWelfareParticipations([]);
    setWelfareProjectStats(Object.fromEntries(welfareProjects.map(project => [project.id, project.current])));
    setCodeRedemptions([]);
    setResume(emptyResume);
    setProfile(nextProfile);
    setProfileSources(initialProfileSources(nextProfile));
  }, []);

  const mergeProfileFromSource = useCallback((patch: Partial<StudentProfile>, source: Exclude<ProfileSource, "seed" | "profile">, mode: "fill-empty" | "replace" = "fill-empty") => {
    if (!session.loggedIn) return;
    setProfile(current => {
      const applied = Object.fromEntries(
        Object.entries(patch).filter(([key, value]) => value !== undefined && (mode === "replace" || !current[key as keyof StudentProfile])),
      ) as Partial<StudentProfile>;
      if (!Object.keys(applied).length) return current;
      setProfileSources(sources => ({ ...sources, ...sourcePatch(applied, source) }));
      return { ...current, ...applied };
    });
  }, [session.loggedIn]);

  const value = useMemo<LongTermAssetsContextValue>(() => ({
    learning,
    benefitStatuses,
    benefitStatusFor,
    certificates,
    competitionResults,
    educationIdentity,
    resume,
    profile,
    profileSources,
    creditBalance,
    enrolledCourseIds,
    learningFor: courseId => learning.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted", progress: 0, assessment: "idle" },
    courseCompletedFor: courseId => {
      const record = learning.find(item => item.courseId === courseId) ?? { courseId, status: "notStarted" as LearningStatus, progress: 0, assessment: "idle" as const };
      return isCourseCompleted(record);
    },
    enrolledFor: courseId => enrolledCourseIds.includes(courseId),
    startCourse: courseId => {
      if (!session.loggedIn || !enrolledCourseIds.includes(courseId)) return;
      setLearning(records => updateLearning(records, courseId, record => record.status === "notStarted" ? normalizedLearningRecord(record, 8, record.assessment) : record));
    },
    advanceCourse: courseId => {
      if (!session.loggedIn || !enrolledCourseIds.includes(courseId)) return;
      setLearning(records => updateLearning(records, courseId, record => {
        const nextProgress = Math.min(100, Math.max(record.progress, 8) + 22);
        return normalizedLearningRecord(record, nextProgress, record.assessment);
      }));
    },
    completeCourse: courseId => {
      if (!session.loggedIn || !enrolledCourseIds.includes(courseId)) return;
      setLearning(records => updateLearning(records, courseId, record => normalizedLearningRecord(record, 100, record.assessment)));
    },
    submitAssessment: (courseId, passed) => {
      if (!session.loggedIn || !enrolledCourseIds.includes(courseId)) return;
      const currentRecord = learning.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted" as LearningStatus, progress: 0, assessment: "idle" as const };
      const assessment = passed ? "passed" as const : "failed" as const;
      const updatedRecord = normalizedLearningRecord(currentRecord, currentRecord.progress, assessment);
      setLearning(records => updateLearning(records, courseId, () => updatedRecord));
      if (isCourseCompleted(updatedRecord)) {
        const course = courses.find(item => item.id === courseId);
        const certificateId = course?.certificateId;
        if (course && certificateId) {
          setCertificates(current => current.some(item => item.id === certificateId)
            ? current
            : [...current, {
              id: certificateId,
              title: `${course.title}课程证书`,
              issuer: "核心产业学院",
              sourceType: "course",
              courseId,
              verificationCode: `COURSE-${courseId.toUpperCase()}-26001`,
              status: "claimable",
            }]);
        }
      }
    },
    enrollCourse: courseId => {
      if (!session.loggedIn) return { success: false, reason: "请先登录" };
      if (enrolledCourseIds.includes(courseId)) return { success: true };
      const course = courses.find(item => item.id === courseId);
      if (!course) return { success: false, reason: "课程不存在" };
      if (course.entitlement === "benefitRequired") {
        if (!course.unlockBenefitId) return { success: false, reason: "课程配置缺少解锁权益" };
        const status = benefitStatusFor(course.unlockBenefitId);
        if (!["claimed", "used"].includes(status)) {
          return { success: false, reason: `需要先领取「${benefitById(course.unlockBenefitId)?.title ?? "对应权益"}」` };
        }
      }
      if (course.entitlement === "creditRequired") {
        if (creditBalance < course.cost) {
          return { success: false, reason: `学力值不足，当前余额 ${creditBalance}，需要 ${course.cost}` };
        }
        setCreditBalance(current => current - course.cost);
      }
      setEnrolledCourseIds(current => [...current, courseId]);
      return { success: true };
    },
    claimBenefit: benefitId => {
      if (!session.loggedIn || benefitStatusFor(benefitId) !== "eligible") return;
      setBenefitStatuses(current => ({ ...current, [benefitId]: "claimed" }));
    },
    useBenefit: benefitId => {
      if (!session.loggedIn) return;
      setBenefitStatuses(current => current[benefitId] === "claimed" ? { ...current, [benefitId]: "used" } : current);
    },
    claimCertificate: certificateId => {
      if (!session.loggedIn) return;
      setCertificates(current => current.map(item => item.id === certificateId && item.status === "claimable" ? { ...item, status: "claimed", issuedAt: "2026-08-17" } : item));
    },
    claimEducationIdentity: () => {
      if (!session.loggedIn) return;
      setEducationIdentity(current => current && current.status === "claimable" ? { ...current, status: "claimed", issuedAt: "2026-08-17" } : current);
    },
    welfareParticipations,
    welfareProjectStats,
    hasHelpedWelfare: projectId => welfareParticipations.some(record => record.projectId === projectId),
    helpWelfare: projectId => {
      if (!session.loggedIn) return { success: false, reason: "请先登录" };
      const project = welfareProjectById(projectId);
      if (!project) return { success: false, reason: "项目不存在" };
      if (project.status === "ended") return { success: false, reason: "项目已结束" };
      if (project.status === "upcoming") return { success: false, reason: "项目尚未开始" };
      if (welfareParticipations.some(record => record.projectId === projectId)) return { success: false, reason: "你已经助力过该项目" };
      const record: WelfareParticipationRecord = {
        id: `WELF-${Date.now()}`,
        projectId,
        helpedAt: new Date().toISOString(),
        rewardStatus: "pending",
      };
      setWelfareParticipations(current => [...current, record]);
      setWelfareProjectStats(current => ({ ...current, [projectId]: (current[projectId] ?? project.current) + 1 }));
      return { success: true };
    },
    codeRedemptions,
    redeemCode: (code, outcome, source) => {
      if (!session.loggedIn || outcome.status !== "valid") return false;
      if (codeRedemptions.some(record => record.code === code)) return false;
      const record: CodeRedemptionRecord = {
        id: `REDEEM-${Date.now()}`,
        code,
        type: outcome.type,
        amount: outcome.amount,
        redeemedAt: new Date().toISOString(),
        source,
      };
      setCodeRedemptions(current => [...current, record]);
      setCreditBalance(current => current + outcome.amount);
      return true;
    },
    simulateScanRedeem: () => {
      if (!session.loggedIn) return null;
      const code = `SCAN-${Date.now().toString(36).toUpperCase()}`;
      const amount = 5;
      const record: CodeRedemptionRecord = {
        id: `REDEEM-${Date.now()}`,
        code,
        type: "welfare",
        amount,
        redeemedAt: new Date().toISOString(),
        source: "scan",
      };
      setCodeRedemptions(current => [...current, record]);
      setCreditBalance(current => current + amount);
      return { code, amount };
    },
    toggleResumeFact: factKey => {
      if (!session.loggedIn) return;
      setResume(current => ({
        ...current,
        selectedFactKeys: current.selectedFactKeys.includes(factKey) ? current.selectedFactKeys.filter(key => key !== factKey) : [...current.selectedFactKeys, factKey],
        updatedAt: "2026-08-17",
      }));
    },
    updateStrengths: strengths => {
      if (!session.loggedIn) return;
      setResume(current => ({ ...current, strengths, updatedAt: "2026-08-17" }));
    },
    updateEducation: education => {
      if (!session.loggedIn) return;
      setResume(current => ({ ...current, education, updatedAt: "2026-08-17" }));
    },
    updateEducationDetails: patch => {
      if (!session.loggedIn) return;
      setResume(current => ({ ...current, educationDetails: { ...current.educationDetails, ...patch }, updatedAt: "2026-08-17" }));
    },
    updateProfile,
    initializeNewAccount,
    mergeProfileFromSource,
  }), [learning, benefitStatuses, benefitStatusFor, certificates, competitionResults, educationIdentity, resume, profile, profileSources, creditBalance, enrolledCourseIds, welfareParticipations, welfareProjectStats, codeRedemptions, session.loggedIn, updateProfile, mergeProfileFromSource]);

  return <LongTermAssetsContext.Provider value={value}>{children}</LongTermAssetsContext.Provider>;
}

export function useLongTermAssets() {
  const value = useContext(LongTermAssetsContext);
  if (!value) throw new Error("LongTermAssetsProvider missing");
  return value;
}
