import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  fulfillmentDetailByType,
  pc04Benefits,
  pc04Certificates,
  pc04Courses,
  type BenefitAdminRecord,
  type CourseAdminRecord,
  type FulfillmentType,
} from "./pc04-data";

type CoursePatch = Pick<CourseAdminRecord, "title" | "videoCompletionPercent" | "quizPassScore">;

type PC04StateValue = {
  courses: CourseAdminRecord[];
  benefits: BenefitAdminRecord[];
  certificates: typeof pc04Certificates;
  updateCourse: (courseId: string, patch: CoursePatch) => void;
  updateBenefitFulfillment: (benefitId: string, fulfillment: FulfillmentType) => void;
};

const PC04StateContext = createContext<PC04StateValue | null>(null);

export function PC04StateProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<CourseAdminRecord[]>(pc04Courses);
  const [benefits, setBenefits] = useState<BenefitAdminRecord[]>(pc04Benefits);

  const value = useMemo<PC04StateValue>(() => ({
    courses,
    benefits,
    certificates: pc04Certificates,
    updateCourse(courseId, patch) {
      setCourses(current => current.map(course => course.id === courseId ? { ...course, ...patch } : course));
    },
    updateBenefitFulfillment(benefitId, fulfillment) {
      setBenefits(current => current.map(benefit => benefit.id === benefitId ? {
        ...benefit,
        fulfillment,
        fulfillmentDetail: fulfillmentDetailByType[fulfillment],
      } : benefit));
    },
  }), [benefits, courses]);

  return <PC04StateContext.Provider value={value}>{children}</PC04StateContext.Provider>;
}

export function usePC04State() {
  const value = useContext(PC04StateContext);
  if (!value) throw new Error("usePC04State must be used within PC04StateProvider");
  return value;
}
