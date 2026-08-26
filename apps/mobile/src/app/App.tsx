import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteLab } from "../dev/RouteLab";
import {
  ApplicationsPage,
  CompaniesPage,
  CompetitionsPage,
  HomePage,
  NewbieTasksPage,
  OpportunitiesPage,
  OpportunityDetailPage,
  PublicPlatformProvider,
} from "../features/public-platform/PublicPlatform";
import { ForgotPasswordPage, RegisterPage, WechatAuthorizePage, WechatPhonePage, WelcomePage } from "../features/auth/AuthPages";
import { AccountSecurityPage } from "../features/auth/AccountSecurityPage";
import { CompetitionAccountPage, CompetitionAwareLoginPage } from "../features/auth/CompetitionAccountPage";
import { PhoneBindingPage } from "../features/auth/PhoneBindingPage";
import {
  CompetitionLifecycleDetailPage,
  CompetitionResourceDetailPage,
  CompetitionResourcesPage,
  CompetitionTeamPage,
  CompetitionWorkspacePage,
  MyCompetitionsLifecyclePage,
} from "../features/competition-workspace/WorkspacePages";
import { RegistrationHandoffPage } from "../features/competition-workspace/RegistrationHandoffPage";
import {
  WorkshopComputePage,
  WorkshopHomePage,
  WorkshopProjectPage,
  WorkshopSkillPage,
  WorkshopSkillsPage,
} from "../features/competition-workspace/WorkshopPages";
import { T013CTaskAnswerPage, T013CTaskProgressPage, T013CTaskReviewPage } from "../features/competition-workspace/T013CTaskPages";
import { T013CResultDetailPage } from "../features/competition-workspace/T013CResultPage";
import { T013CResultsPage } from "../features/competition-workspace/T013CResultsPage";
import { WorkshopRuntimeProvider } from "../features/competition-workspace/runtime";
import { LongTermAssetsProvider } from "../features/long-term-assets/store";
import { AccountRequired } from "../features/long-term-assets/shared";
import { CourseLearnPage } from "../features/long-term-assets/CoursesPages";
import {
  T034CertificateDetailRoute,
  T034CourseAchievementPage,
  T034CourseAssessmentPage,
  T034CourseCenterPage,
  T034CourseDetailPage,
  T034CoursesPage,
} from "../features/long-term-assets/T034CoursePages";
import { BenefitDetailPage, BenefitsPage, BenefitsWalletPage, CreditDetailsPage, FreeBenefitsPage, GiftPackDetailPage, GiftPacksPage } from "../features/long-term-assets/BenefitsPages";
import { T035ExchangeCenterPage, T035ExchangeDetailPage } from "../features/long-term-assets/T035ExchangePages";
import {
  AssetsHomePage,
  CertificatesPage,
  EducationIdentityPage,
  ExperienceDetailPage,
  ExperiencesPage,
  LearningAssetsPage,
  ResultsPage,
} from "../features/long-term-assets/AssetsPages";
import { ResumeEducationPage, ResumePage, ResumeStrengthsPage } from "../features/long-term-assets/ResumePages";
import { OnboardingProfilePage, OnboardingReadyPage, OnboardingSurveyPage, ProfilePage } from "../features/long-term-assets/StudentProfilePages";
import { TaskCenterPage } from "../features/task-center/TaskCenterPage";
import { AppCenterPage } from "../features/app-center/AppCenterPage";
import { StartupShopPage } from "../features/app-center/StartupShopPage";
import { BadgeDetailPage, BadgesPage, CertificateDetailPage } from "../features/badges/BadgePages";
import { AmbassadorStateProvider } from "@core/shared";
import { CampusAmbassadorPromotionPage, CampusAmbassadorResultsPage } from "../features/ambassador/CampusAmbassadorPages";
import { CampusAmbassadorApplyPage, CampusAmbassadorJoinPage, CampusAmbassadorLandingPage, CampusAmbassadorTeamPage } from "../features/ambassador/CampusAmbassadorExperiencePages";
import { AmbassadorAwareMyPage } from "../features/ambassador/AmbassadorAwareMyPage";
import { CourseCheckpointQuizPage } from "../features/long-term-assets/CoursesPages";
import { RedeemCodePage, RedeemResultPage } from "../features/redeem/RedeemPages";
import { SimulationHostPage } from "../features/simulations/SimulationHostPage";
import { SplashOverlay, useSplashGate } from "../features/long-term-assets/SplashOverlay";
import { WelfareAdPage, WelfareDetailPage, WelfareListPage } from "../features/welfare/WelfarePages";
import {
  CompanyDetailTrustedPage,
  ResultDetailTrustedPage,
  VerificationTrustedPage,
} from "../features/trust/TrustPages";
import {
  AboutPage,
  AuthorizationPage,
  AccountsPage,
  AlumniListPage,
  GrowthScorePage,
  LegalPage,
  FeedbackPage,
  NewsDetailPage,
  NewsPage,
  NotificationDetailPage,
  NotificationsPage,
  NotFoundPage,
  StoriesPage,
  StoryDetailPage,
  StorySubmitPage,
  SubjectDecisionPage,
  SettingsPage,
  TeamDetailPage,
  TeamsPage,
  SupportChatPage,
  SupportHomePage,
  SupportProvider,
} from "../features/platform-support/SupportPages";
import { SupportTicketDetailPage, SupportTicketsPage } from "../features/platform-support/SupportTicketPages";

const account = (page: ReactNode) => <AccountRequired>{page}</AccountRequired>;

/** T040：欢迎页前置开屏广告（会话内一次；深链/回流动线跳过；可手动重放演示） */
function WelcomeSplashPage() {
  const location = useLocation();
  const { visible, dismiss, replay } = useSplashGate(location.search);
  return <>
    <WelcomePage
      replayButton={
        <button
          type="button"
          onClick={replay}
          className="mt-3 min-h-touch rounded-control bg-surface-subtle px-3 text-xs font-medium text-text-secondary"
        >
          重放开屏广告
        </button>
      }
    />
    {visible && <SplashOverlay onDone={dismiss} />}
  </>;
}

export function App() {
  return (
    <PublicPlatformProvider>
      <AmbassadorStateProvider>
        <WorkshopRuntimeProvider>
          <LongTermAssetsProvider>
            <SupportProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/dev/routes" element={<RouteLab />} />
              <Route path="/welcome" element={<WelcomeSplashPage />} />
              <Route path="/auth/login" element={<CompetitionAwareLoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/wechat/authorize" element={<WechatAuthorizePage />} />
              <Route path="/auth/wechat/phone" element={<WechatPhonePage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/competition-account" element={<CompetitionAccountPage />} />
              <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
              <Route path="/onboarding/survey" element={<OnboardingSurveyPage />} />
              <Route path="/onboarding/ready" element={<OnboardingReadyPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/competitions" element={<CompetitionsPage />} />
              <Route path="/competitions/mine" element={<MyCompetitionsLifecyclePage />} />
              <Route path="/competitions/:competitionId" element={<CompetitionLifecycleDetailPage />} />
              <Route path="/competitions/:competitionId/registration" element={<RegistrationHandoffPage />} />
              <Route path="/competitions/:competitionId/workspace" element={<CompetitionWorkspacePage />} />
              <Route path="/competitions/:competitionId/workspace/team" element={<CompetitionTeamPage />} />
              <Route path="/competitions/:competitionId/workspace/resources" element={<CompetitionResourcesPage />} />
              <Route path="/competitions/:competitionId/workspace/resources/:resourceId" element={<CompetitionResourceDetailPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop" element={<WorkshopHomePage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/project" element={<WorkshopProjectPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/compute" element={<WorkshopComputePage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/skills" element={<WorkshopSkillsPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/skills/:skillId" element={<WorkshopSkillPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/answer" element={<T013CTaskAnswerPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/review" element={<T013CTaskReviewPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/tasks/:taskId/progress" element={<T013CTaskProgressPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/results" element={<T013CResultsPage />} />
              <Route path="/competitions/:competitionId/workspace/workshop/results/:resultId" element={<T013CResultDetailPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:companyId" element={<CompanyDetailTrustedPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:contentId" element={<NewsDetailPage />} />
              <Route path="/courses" element={<T034CoursesPage />} />
              <Route path="/courses/center" element={<T034CourseCenterPage />} />
              <Route path="/courses/:courseId" element={<T034CourseDetailPage />} />
              <Route path="/courses/:courseId/learn" element={account(<CourseLearnPage />)} />
              <Route path="/courses/:courseId/assessment" element={account(<T034CourseAssessmentPage />)} />
              <Route path="/courses/:courseId/achievement" element={account(<T034CourseAchievementPage />)} />
              <Route path="/courses/:courseId/checkpoint/:cpId" element={account(<CourseCheckpointQuizPage />)} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/benefits/free" element={<FreeBenefitsPage />} />
              <Route path="/benefits/exchange" element={<T035ExchangeCenterPage />} />
              <Route path="/benefits/exchange/:exchangeId" element={<T035ExchangeDetailPage />} />
              <Route path="/benefits/credits" element={<CreditDetailsPage />} />
              <Route path="/benefits/wallet" element={account(<BenefitsWalletPage />)} />
              <Route path="/benefits/gift-packs" element={<GiftPacksPage />} />
              <Route path="/benefits/gift-packs/:giftPackId" element={<GiftPackDetailPage />} />
              <Route path="/benefits/:benefitId" element={<BenefitDetailPage />} />
              <Route path="/growth/score" element={account(<GrowthScorePage />)} />
              <Route path="/assets" element={account(<AssetsHomePage />)} />
              <Route path="/assets/experiences" element={account(<ExperiencesPage />)} />
              <Route path="/assets/experiences/:experienceId" element={account(<ExperienceDetailPage />)} />
              <Route path="/assets/learning" element={account(<LearningAssetsPage />)} />
              <Route path="/assets/results" element={account(<ResultsPage />)} />
              <Route path="/assets/results/:resultId" element={account(<ResultDetailTrustedPage />)} />
              <Route path="/assets/certificates" element={account(<CertificatesPage />)} />
              <Route path="/assets/certificates/:certificateId" element={account(<T034CertificateDetailRoute />)} />
              <Route path="/assets/education-identity" element={account(<EducationIdentityPage />)} />
              <Route path="/assets/verification" element={<VerificationTrustedPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/stories/alumni" element={<AlumniListPage />} />
              <Route path="/stories/:storyId" element={<StoryDetailPage />} />
              <Route path="/stories/submit" element={account(<StorySubmitPage />)} />
              <Route path="/support" element={<SupportHomePage />} />
              <Route path="/support/chat" element={account(<SupportChatPage />)} />
              <Route path="/support/tickets" element={account(<SupportTicketsPage />)} />
              <Route path="/support/tickets/:ticketId" element={account(<SupportTicketDetailPage />)} />
              <Route path="/me" element={account(<AmbassadorAwareMyPage />)} />
              <Route path="/me/profile" element={account(<ProfilePage />)} />
              <Route path="/me/resume" element={account(<ResumePage />)} />
              <Route path="/me/resume/strengths" element={account(<ResumeStrengthsPage />)} />
              <Route path="/me/resume/education" element={account(<ResumeEducationPage />)} />
              <Route path="/me/accounts" element={account(<AccountSecurityPage />)} />
              <Route path="/me/accounts/phone" element={account(<PhoneBindingPage />)} />
              <Route path="/me/accounts/platforms" element={account(<AccountsPage />)} />
              <Route path="/me/teams" element={account(<TeamsPage />)} />
              <Route path="/me/teams/:competitionId" element={account(<TeamDetailPage />)} />
              <Route path="/me/settings" element={account(<SettingsPage />)} />
              <Route path="/me/authorization" element={account(<AuthorizationPage />)} />
              <Route path="/me/feedback" element={account(<FeedbackPage />)} />
              <Route path="/me/subjects" element={account(<SubjectDecisionPage />)} />
              <Route path="/me/notifications" element={account(<NotificationsPage />)} />
              <Route path="/me/notifications/:notificationId" element={account(<NotificationDetailPage />)} />
              <Route path="/me/badges" element={account(<BadgesPage />)} />
              <Route path="/me/badges/:badgeId" element={account(<BadgeDetailPage />)} />
              <Route path="/me/certificates/:certId" element={account(<CertificateDetailPage />)} />
              <Route path="/legal/user-agreement" element={<LegalPage kind="user" />} />
              <Route path="/legal/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/tasks" element={<TaskCenterPage />} />
              <Route path="/tasks/newbie" element={<NewbieTasksPage />} />
              <Route path="/apps" element={<AppCenterPage />} />
              <Route path="/apps/startup-shop" element={<StartupShopPage />} />
              <Route path="/redeem" element={account(<RedeemCodePage />)} />
              <Route path="/redeem/result" element={account(<RedeemResultPage />)} />
              <Route path="/welfare" element={<WelfareListPage />} />
              <Route path="/welfare/:welfareId" element={<WelfareDetailPage />} />
              <Route path="/welfare/:welfareId/ad" element={<WelfareAdPage />} />
              <Route path="/modules/simulations/:assignmentId" element={<SimulationHostPage />} />
              <Route path="/ambassadors" element={<CampusAmbassadorLandingPage />} />
              <Route path="/ambassadors/apply" element={<CampusAmbassadorApplyPage />} />
              <Route path="/ambassadors/join" element={<CampusAmbassadorJoinPage />} />
              <Route path="/ambassadors/team/:teamId" element={<CampusAmbassadorTeamPage />} />
              <Route path="/ambassadors/team/:teamId/results" element={<CampusAmbassadorResultsPage />} />
              <Route path="/ambassadors/promote/:promotionCode" element={<CampusAmbassadorPromotionPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </SupportProvider>
          </LongTermAssetsProvider>
        </WorkshopRuntimeProvider>
      </AmbassadorStateProvider>
    </PublicPlatformProvider>
  );
}
