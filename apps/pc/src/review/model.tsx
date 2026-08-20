import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type SchoolReviewStatus = "pending" | "approved" | "rejected";

export type ReviewMember = {
  name: string;
  school: string;
  phone: string;
  email: string;
  studentId: string;
};

export type ReviewTeam = {
  id: string;
  teamId: string;
  teamName: string;
  province: string;
  school: string;
  category: string;
  track: string;
  firstParticipation: boolean;
  crossSchool: boolean;
  leaderName: string;
  leaderPhone: string;
  leaderEmail: string;
  members: ReviewMember[];
  submittedAt: string;
  status: SchoolReviewStatus;
  reviewedAt?: string;
  rejectionReason?: string;
  projectSummary?: string;
};

export type ReviewTeacher = {
  name: string;
  school: string;
  competitionId: string;
  competitionName: string;
};

export type SchoolReviewScenario = "all" | "pending" | "approved" | "rejected";

type SchoolReviewState = {
  teacher?: ReviewTeacher;
  teams: ReviewTeam[];
};

type SchoolReviewContextValue = SchoolReviewState & {
  selectTeacher: (teacher: ReviewTeacher) => void;
  approveTeam: (teamId: string, comment?: string) => void;
  rejectTeam: (teamId: string, reason: string) => void;
  reopenTeam: (teamId: string) => void;
  loadScenario: (scenario: SchoolReviewScenario) => void;
  reset: () => void;
};

const seedMemberA: ReviewMember = {
  name: "林钰贤",
  school: "广东技术师范大学",
  phone: "15360270209",
  email: "keyieye_2021@qq.com",
  studentId: "20260001",
};

const seedMemberB: ReviewMember = {
  name: "张三",
  school: "广州大学",
  phone: "13800138000",
  email: "zhangsan@example.edu.cn",
  studentId: "20260002",
};

const seedMemberC: ReviewMember = {
  name: "陈晓",
  school: "广东技术师范大学",
  phone: "13900000001",
  email: "chenxiao@example.edu.cn",
  studentId: "20260003",
};

const seedMemberD: ReviewMember = {
  name: "李娜",
  school: "广东技术师范大学",
  phone: "13900000002",
  email: "lina@example.edu.cn",
  studentId: "20260004",
};

const seedMemberE: ReviewMember = {
  name: "王浩",
  school: "广东财经大学",
  phone: "13900000003",
  email: "wanghao@example.edu.cn",
  studentId: "20260005",
};

const seedMemberF: ReviewMember = {
  name: "刘洋",
  school: "广东技术师范大学",
  phone: "13900000004",
  email: "liuyang@example.edu.cn",
  studentId: "20260006",
};

const seedTeams: ReviewTeam[] = [
  {
    id: "review-team-16192192",
    teamId: "16192192",
    teamName: "号外号外爆卖爆卖",
    province: "广东省",
    school: "广东技术师范大学",
    category: "美妆新零售实战赛",
    track: "美妆新零售实战赛",
    firstParticipation: true,
    crossSchool: true,
    leaderName: "林钰贤",
    leaderPhone: "15360270209",
    leaderEmail: "keyieye_2021@qq.com",
    members: [seedMemberA, seedMemberB, seedMemberC],
    submittedAt: "2026-08-18 14:32",
    status: "pending",
    projectSummary: "围绕校园消费场景，通过内容、直播与数据复盘完成从用户洞察到经营验证的完整实践。",
  },
  {
    id: "review-team-16192088",
    teamId: "16192088",
    teamName: "校园美妆增长实验室",
    province: "广东省",
    school: "广东技术师范大学",
    category: "美妆新零售实战赛",
    track: "美妆新零售实战赛",
    firstParticipation: false,
    crossSchool: false,
    leaderName: "陈晓",
    leaderPhone: "13900000001",
    leaderEmail: "chenxiao@example.edu.cn",
    members: [seedMemberC, seedMemberF],
    submittedAt: "2026-08-15 10:08",
    status: "approved",
    reviewedAt: "2026-08-16 09:40",
    projectSummary: "基于校园场景的美妆选品与内容运营实验，聚焦复购率与用户留存。",
  },
  {
    id: "review-team-16192076",
    teamId: "16192076",
    teamName: "潮品速递站",
    province: "广东省",
    school: "广东技术师范大学",
    category: "美妆新零售实战赛",
    track: "美妆新零售实战赛",
    firstParticipation: true,
    crossSchool: true,
    leaderName: "李娜",
    leaderPhone: "13900000002",
    leaderEmail: "lina@example.edu.cn",
    members: [seedMemberD, seedMemberE],
    submittedAt: "2026-08-14 16:55",
    status: "rejected",
    reviewedAt: "2026-08-17 11:20",
    rejectionReason: "团队成员信息与报名材料不一致，请核对跨校队员学校、邮箱后重新提交。",
    projectSummary: "校园快闪与社群团购组合的潮流美妆分销实验。",
  },
];

const seedTeacher: ReviewTeacher = {
  name: "王老师",
  school: "广东技术师范大学",
  competitionId: "sanchuang-16",
  competitionName: "第十六届全国大学生三创赛",
};

function initialState(): SchoolReviewState {
  return { teacher: undefined, teams: seedTeams };
}

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SchoolReviewState>(() => initialState());

  const value = useMemo<SchoolReviewContextValue>(() => ({
    ...state,
    selectTeacher: teacher => setState(current => ({ ...current, teacher })),
    approveTeam: (teamId, comment) => setState(current => ({
      ...current,
      teams: current.teams.map(team => team.id === teamId ? { ...team, status: "approved", reviewedAt: "2026-08-20 15:00", rejectionReason: comment } : team),
    })),
    rejectTeam: (teamId, reason) => setState(current => ({
      ...current,
      teams: current.teams.map(team => team.id === teamId ? { ...team, status: "rejected", reviewedAt: "2026-08-20 15:00", rejectionReason: reason } : team),
    })),
    reopenTeam: teamId => setState(current => ({
      ...current,
      teams: current.teams.map(team => team.id === teamId ? { ...team, status: "pending", reviewedAt: undefined, rejectionReason: undefined } : team),
    })),
    loadScenario: scenario => setState(current => {
      const teacher = current.teacher ?? seedTeacher;
      if (scenario === "all") return { teacher, teams: seedTeams };
      return { teacher, teams: seedTeams.filter(team => team.status === scenario) };
    }),
    reset: () => setState(initialState()),
  }), [state]);

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
};

export function useReview() {
  const value = useContext(ReviewContext);
  if (!value) throw new Error("ReviewProvider missing");
  return value;
}

const ReviewContext = createContext<SchoolReviewContextValue | null>(null);
