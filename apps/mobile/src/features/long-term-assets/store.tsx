import { isCourseCompleted } from "@core/shared";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { usePublicPlatform } from "../public-platform/PublicPlatform";
import { benefitById, benefits, courses, initialCertificates, initialCompetitionResults, type BenefitStatus, type CertificateRecord, type CompetitionResultRecord } from "./data";
import {
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

type LongTermAssetsContextValue = {
  learning: LearningRecord[];
  benefitStatuses: Record<string, BenefitStatus>;
  benefitStatusFor: (benefitId: string) => BenefitStatus;
  certificates: CertificateRecord[];
  competitionResults: CompetitionResultRecord[];
  resume: ResumePresentation;
  profile: StudentProfile;
  profileSources: StudentProfileSources;
  learningFor: (courseId: string) => LearningRecord;
  courseCompletedFor: (courseId: string) => boolean;
  startCourse: (courseId: string) => void;
  advanceCourse: (courseId: string) => void;
  completeCourse: (courseId: string) => void;
  submitAssessment: (courseId: string, passed: boolean) => void;
  claimBenefit: (benefitId: string) => void;
  useBenefit: (benefitId: string) => void;
  claimCertificate: (certificateId: string) => void;
  toggleResumeFact: (factKey: string) => void;
  updateStrengths: (value: string) => void;
  updateEducation: (value: string) => void;
  updateEducationDetails: (patch: Partial<ResumeEducationDetails>) => void;
  updateProfile: (patch: Partial<StudentProfile>, source?: ProfileSource) => void;
  mergeProfileFromSource: (patch: Partial<StudentProfile>, source: Exclude<ProfileSource, "seed" | "profile">, mode?: "fill-empty" | "replace") => void;
};

const seedLearning: LearningRecord[] = [
  { courseId: "data-analytics", status: "completed", progress: 100, assessment: "passed" },
  { courseId: "brand-ecommerce", status: "inProgress", progress: 38, assessment: "idle" },
  { courseId: "retail-project-lab", status: "notStarted", progress: 0, assessment: "idle" },
];

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
  const [resume, setResume] = useState<ResumePresentation>(seedResume);
  const [profile, setProfile] = useState<StudentProfile>(seedStudentProfile);
  const [profileSources, setProfileSources] = useState<StudentProfileSources>(() => initialProfileSources(seedStudentProfile));

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
    resume,
    profile,
    profileSources,
    learningFor: courseId => learning.find(record => record.courseId === courseId) ?? { courseId, status: "notStarted", progress: 0, assessment: "idle" },
    courseCompletedFor: courseId => {
      const record = learning.find(item => item.courseId === courseId) ?? { courseId, status: "notStarted" as LearningStatus, progress: 0, assessment: "idle" as const };
      return isCourseCompleted(record);
    },
    startCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => record.status === "notStarted" ? normalizedLearningRecord(record, 8, record.assessment) : record));
    },
    advanceCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => {
        const nextProgress = Math.min(100, Math.max(record.progress, 8) + 22);
        return normalizedLearningRecord(record, nextProgress, record.assessment);
      }));
    },
    completeCourse: courseId => {
      if (!session.loggedIn) return;
      setLearning(records => updateLearning(records, courseId, record => normalizedLearningRecord(record, 100, record.assessment)));
    },
    submitAssessment: (courseId, passed) => {
      if (!session.loggedIn) return;
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
    mergeProfileFromSource,
  }), [learning, benefitStatuses, benefitStatusFor, certificates, competitionResults, resume, profile, profileSources, session.loggedIn, updateProfile, mergeProfileFromSource]);

  return <LongTermAssetsContext.Provider value={value}>{children}</LongTermAssetsContext.Provider>;
}

export function useLongTermAssets() {
  const value = useContext(LongTermAssetsContext);
  if (!value) throw new Error("LongTermAssetsProvider missing");
  return value;
}
