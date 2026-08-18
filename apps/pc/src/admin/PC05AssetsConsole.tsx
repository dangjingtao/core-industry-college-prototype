import { BadgeCheck, FileBadge } from "lucide-react";
import { longTermAssetsSeed } from "./pc05-data";
import { PC05StateTag } from "./pc05-ui";

const kindLabels: Record<string, string> = {
  Experience: "参赛经历",
  Result: "比赛成绩",
  Certificate: "可信证书",
  CourseAchievement: "课程成果",
  VerificationRecord: "验真记录",
};

export function PC05AssetsConsole() {
  return <div className="space-y-6">
    <section className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs text-text-tertiary">林晓 · 长期资产</p><h2 className="mt-1 text-xl font-semibold">比赛结束了，可信成果仍然在</h2><p className="mt-2 text-sm text-text-secondary">这里统一查看参赛经历、成绩、证书、课程成果和验真记录。账号冻结或资源下架不会删除已经产生的历史事实。</p></div><p className="text-sm font-medium text-text-primary">共 {longTermAssetsSeed.length} 类记录</p></div></section>

    <section className="grid gap-4 lg:grid-cols-2">{longTermAssetsSeed.map(a => <article key={a.id} data-testid={`asset-${a.kind}`} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex justify-between gap-3"><div className="flex gap-3"><FileBadge className="text-text-brand" /><div><p className="text-xs font-medium text-text-brand">{kindLabels[a.kind] ?? a.kind}</p><h3 className="mt-1 font-semibold">{a.title}</h3></div></div><PC05StateTag state={a.state}/></div><p className="mt-4 text-sm leading-6 text-text-secondary">{a.retention}</p><details className="mt-4 rounded-control bg-surface-subtle px-3 py-2 text-xs text-text-secondary"><summary className="cursor-pointer font-medium text-text-primary">数据来源与关系</summary><div className="mt-3 space-y-1.5"><p><b>记录标识：</b>{a.id}</p><p><b>来源：</b>{a.source}</p><p><b>关联：</b>{a.relation}</p><p><b>学生端使用：</b>{a.appConsumer}</p></div></details></article>)}</section>

    <section className="rounded-container border border-success bg-success-bg p-5"><div className="flex gap-3"><BadgeCheck className="text-success-text"/><div><h3 className="font-semibold text-success-text">历史事实不靠“删除”解决异常</h3><p className="mt-1 text-sm text-success-text">证书撤销、成绩异常或验真失效都会保留记录并明确标记状态，方便后续追溯和审计。</p></div></div></section>
  </div>;
}
