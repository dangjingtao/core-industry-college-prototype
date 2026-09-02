// Compatibility alias retained because the leaderboard batch was initially dispatched with an incorrect T043 number.
// Canonical tasks: T055 (course home) + T056 (leaderboard detail).
// Existing historical T043 belongs to the Core Ambassador task chain.
export {
  LearningLeaderboardPreview,
  T055CourseHomePage as T043CourseHomePage,
} from "./T055CourseHomePage";
export { T056LeaderboardPage as T043LeaderboardEntryPage } from "./T056LeaderboardPage";
