// 可信证书：独立可信资产，不是徽章品相中的一档（PRD 19 §2.1 / §4.2）。
// 统一资格结构：指定可信课程完成（不可绕过的硬门槛，含结业考核）
//               + X 枚高品相徽章（G3/G4） + Y 枚低品相徽章（G1/G2）。
// 关卡小测要求通过「考核类徽章」间接表达（徽章规则本身绑定小测事实）。
// 数值为原型示范值，待产品收口（PRD 19 §11.3）。
// 领取状态（claimable / claimed）由长期资产 store 维护，本模块只做资格判定，不复制证书状态。

import { isCourseCompleted } from "@core/shared";
import { badgeCatalog, isHighGrade, type BadgeCatalogEntry } from "./catalog";
import type { BadgeEvaluationContext } from "./engine";

export type TrustedCertificateDefinition = {
  id: string;
  name: string;
  description: string;
  /** 指定可信课程（硬门槛：课程完成 + 结业考核通过） */
  courseId: string;
  /** 高品相（G3/G4）徽章数量要求 */
  highGradeBadgeCount: number;
  /** 低品相（G1/G2）徽章数量要求；可来自任意来源（打卡 / 公益 / 广告等） */
  lowGradeBadgeCount: number;
  iconColor: string;
  iconKey: string;
};

export const trustedCertificates: TrustedCertificateDefinition[] = [
  {
    id: "cert.data-analytics",
    name: "数据分析能力认证",
    description: "完成「商业数据分析基础」可信课程，并获得足够数量的品相徽章后，可领取本认证。",
    courseId: "data-analytics",
    highGradeBadgeCount: 5,
    lowGradeBadgeCount: 3,
    iconColor: "bg-[#fef3c7] text-[#92400e]",
    iconKey: "DA",
  },
  {
    id: "cert.newbie-graduate",
    name: "新手结业认证",
    description: "完成「创赛新手必修课」可信课程，并获得足够数量的品相徽章后，可领取本认证。",
    courseId: "newbie-essential",
    highGradeBadgeCount: 3,
    lowGradeBadgeCount: 2,
    iconColor: "bg-[#ede9fe] text-[#5b21b6]",
    iconKey: "NG",
  },
];

export type CertificateProgress = {
  definition: TrustedCertificateDefinition;
  /** 可信课程是否完成（含结业考核） */
  courseCompleted: boolean;
  /** 已获得的高品相（G3/G4）徽章数量 */
  highGradeCount: number;
  /** 已获得的低品相（G1/G2）徽章数量 */
  lowGradeCount: number;
  /** 资格是否达成 */
  eligible: boolean;
};

/** 统计已获得徽章的品相分组数量（高品相 G3/G4 / 低品相 G1/G2） */
export function countGradeGroups(catalog: BadgeCatalogEntry[], earnedIds: Set<string>): { high: number; low: number } {
  let high = 0;
  let low = 0;
  for (const entry of catalog) {
    if (!earnedIds.has(entry.id)) continue;
    if (isHighGrade(entry.grade)) high++;
    else low++;
  }
  return { high, low };
}

/**
 * 判定单个可信证书资格。
 * 课程完成事实直接读取学习记录（含结业考核），不复制第二份课程状态。
 */
export function evaluateCertificate(
  definition: TrustedCertificateDefinition,
  ctx: BadgeEvaluationContext,
  earnedIds: Set<string>,
): CertificateProgress {
  const courseCompleted = ctx.learning.some(record => record.courseId === definition.courseId && isCourseCompleted(record));
  const { high, low } = countGradeGroups(badgeCatalog, earnedIds);
  const eligible = courseCompleted && high >= definition.highGradeBadgeCount && low >= definition.lowGradeBadgeCount;
  return {
    definition,
    courseCompleted,
    highGradeCount: high,
    lowGradeCount: low,
    eligible,
  };
}

export const certificateByCourseId = (courseId: string) => trustedCertificates.find(item => item.courseId === courseId);
