import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DataSource } from "./data";

export type OrganizationType = "企业" | "学校" | "赛事组织方" | "合作机构";
export type OpportunityStatus = "open" | "closed";
export type ApplicationStatus = "submitted" | "statusUnknown";

export type OrganizationRecord = {
  id: string;
  name: string;
  type: OrganizationType;
  summary: string;
  trust: string;
  sources: DataSource[];
  relations: { kind: string; label: string; stableId: string; to?: string }[];
};

export type OpportunityRecord = {
  id: string;
  title: string;
  organizationId: string;
  city: string;
  mode: "实习" | "校招" | "项目实践";
  summary: string;
  skills: string[];
  status: OpportunityStatus;
};

export type ApplicationRecord = {
  key: string;
  opportunityId: string;
  studentLabel: string;
  status: ApplicationStatus;
  source: "Runtime";
};

export const pc03Organizations: OrganizationRecord[] = [
  {
    id: "northstar-beauty",
    name: "北辰美妆",
    type: "企业",
    summary: "参与赛事命题、课程共建、学生权益、活动与实习机会合作的品牌主体。",
    trust: "企业可信资料映射 Mobile CompanyBusinessInfo；可信字段按来源权限维护。",
    sources: ["平台配置", "API 同步"],
    relations: [
      { kind: "赛事", label: "第十六届三创赛 · 美妆电商赛道", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" },
      { kind: "机会", label: "品牌增长实习生", stableId: "intern-1", to: "/admin/opportunities/intern-1" },
      { kind: "课程", label: "品牌电商实战课", stableId: "brand-ecommerce" },
      { kind: "权益", label: "校园体验权益", stableId: "benefit-beauty-sample" },
      { kind: "活动", label: "品牌开放日", stableId: "activity-northstar-open-day" },
    ],
  },
  {
    id: "cloud-retail",
    name: "云栖零售实验室",
    type: "企业",
    summary: "提供零售数据实践、企业课题、课程与学生项目实践机会。",
    trust: "沿用 Mobile companyId=cloud-retail 作为统一 Organization stable value。",
    sources: ["平台配置"],
    relations: [
      { kind: "机会", label: "商业分析实习生", stableId: "intern-2", to: "/admin/opportunities/intern-2" },
      { kind: "课程", label: "商业数据分析基础", stableId: "data-analytics" },
      { kind: "活动", label: "零售数据工作坊", stableId: "activity-retail-lab" },
    ],
  },
  {
    id: "green-chain",
    name: "青禾供应链",
    type: "企业",
    summary: "围绕绿色供应链提供赛事合作、企业实践与岗位机会。",
    trust: "沿用 Mobile companyId=green-chain；Organization 只是统一主体，不复制 Company 表。",
    sources: ["平台配置"],
    relations: [
      { kind: "赛事", label: "绿色商业实践赛", stableId: "green-business-2026" },
      { kind: "机会", label: "供应链项目助理", stableId: "intern-3", to: "/admin/opportunities/intern-3" },
    ],
  },
  {
    id: "org-sanchuang-committee",
    name: "三创赛组委会",
    type: "赛事组织方",
    summary: "作为外部权威赛事组织主体进入统一 Organization，而不是成为后台信息架构中心。",
    trust: "赛事正式资格等权威事实仍由外部赛事来源确认。",
    sources: ["API 同步", "平台配置"],
    relations: [{ kind: "赛事", label: "第十六届三创赛", stableId: "sanchuang-16", to: "/admin/competitions/objects/sanchuang-16" }],
  },
  {
    id: "school-demo-gz",
    name: "广州示范高校",
    type: "学校",
    summary: "学校作为赛事传播、审核与内容供稿主体进入统一 Organization。",
    trust: "学校老师只在授权赛事 + 授权学校 Scope 内处理数据；首期没有平台直接发布权。",
    sources: ["平台配置"],
    relations: [{ kind: "赛事 Scope", label: "第十六届三创赛 · 本校审核范围", stableId: "school-demo-gz+sanchuang-16" }],
  },
];

const initialOpportunities: OpportunityRecord[] = [
  { id: "intern-1", title: "品牌增长实习生", organizationId: "northstar-beauty", city: "广州", mode: "实习", summary: "参与校园品牌项目、内容投放与活动复盘，适合有赛事 / 项目实践经历的学生。", skills: ["内容运营", "数据复盘", "项目执行"], status: "open" },
  { id: "intern-2", title: "商业分析实习生", organizationId: "cloud-retail", city: "深圳", mode: "实习", summary: "协助零售数据整理、指标分析和项目周报。", skills: ["数据分析", "Excel", "表达"], status: "open" },
  { id: "intern-3", title: "供应链项目助理", organizationId: "green-chain", city: "佛山", mode: "项目实践", summary: "参与绿色供应链调研与企业项目协同。", skills: ["调研", "协作"], status: "open" },
  { id: "closed-1", title: "校园活动运营实习生", organizationId: "northstar-beauty", city: "广州", mode: "实习", summary: "历史机会示例；关闭后保留详情与既有 Application。", skills: ["活动运营"], status: "closed" },
];

const initialApplications: ApplicationRecord[] = [
  { key: "application-demo-a", opportunityId: "intern-1", studentLabel: "匿名学生 A", status: "submitted", source: "Runtime" },
  { key: "application-demo-b", opportunityId: "intern-1", studentLabel: "匿名学生 B", status: "statusUnknown", source: "Runtime" },
];

type PC03StateValue = {
  opportunities: OpportunityRecord[];
  applications: ApplicationRecord[];
  createOpportunity: (record: OpportunityRecord) => boolean;
  updateOpportunity: (opportunityId: string, patch: Omit<OpportunityRecord, "id" | "status">) => void;
  toggleOpportunityStatus: (opportunityId: string) => void;
  updateApplicationStatus: (key: string, status: ApplicationStatus) => void;
};

const PC03StateContext = createContext<PC03StateValue | null>(null);

export function PC03StateProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [applications, setApplications] = useState(initialApplications);

  const value = useMemo<PC03StateValue>(() => ({
    opportunities,
    applications,
    createOpportunity(record) {
      if (opportunities.some(item => item.id === record.id)) return false;
      setOpportunities(current => [record, ...current]);
      return true;
    },
    updateOpportunity(opportunityId, patch) {
      setOpportunities(current => current.map(item => item.id === opportunityId ? { ...item, ...patch } : item));
    },
    toggleOpportunityStatus(opportunityId) {
      setOpportunities(current => current.map(item => item.id === opportunityId ? { ...item, status: item.status === "open" ? "closed" : "open" } : item));
    },
    updateApplicationStatus(key, status) {
      setApplications(current => current.map(item => item.key === key ? { ...item, status } : item));
    },
  }), [applications, opportunities]);

  return <PC03StateContext.Provider value={value}>{children}</PC03StateContext.Provider>;
}

export function usePC03State() {
  const value = useContext(PC03StateContext);
  if (!value) throw new Error("usePC03State must be used within PC03StateProvider");
  return value;
}
