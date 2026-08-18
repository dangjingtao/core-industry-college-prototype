export type CourseCompletionInput = {
  progress: number;
  assessment: "idle" | "passed" | "failed";
};

export function isCourseCompleted(record: CourseCompletionInput, requiredProgress = 100) {
  return record.progress >= requiredProgress && record.assessment === "passed";
}
