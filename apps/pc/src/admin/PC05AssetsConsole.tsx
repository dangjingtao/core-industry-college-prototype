import { BadgeCheck, FileBadge } from "lucide-react";
import { longTermAssetsSeed } from "./pc05-data";
import { PC05StateTag } from "./pc05-ui";

export function PC05AssetsConsole() {
  return <div className="space-y-6">
    <section className="rounded-container border border-border-subtle bg-surface p-5"><h2 className="text-xl font-semibold">长期资产统一查询</h2><p className="mt-2 text-sm text-text-secondary">赛事下架、课程下架、企业退出合作或账号冻结，只能改变可用性 / 可信状态，不能物理抹掉已产生事实。</p></section>
    <section className="grid gap-4 lg:grid-cols-2">{longTermAssetsSeed.map(a => <article key={a.id} data-testid={`asset-${a.kind}`} className="rounded-container border border-border-subtle bg-surface p-5"><div className="flex justify-between gap-3"><div className="flex gap-3"><FileBadge className="text-text-brand" /><div><p className="font-mono text-xs text-text-tertiary">{a.kind} · {a.id}</p><h3 className="mt-1 font-semibold">{a.title}</h3></div></div><PC05StateTag state={a.state}/></div><div className="mt-4 space-y-2 text-xs leading-5 text-text-secondary"><p><b className="text-text-primary">来源：</b>{a.source}</p><p><b className="text-text-primary">Stable relation：</b>{a.relation}</p><p><b className="text-text-primary">App consumer：</b>{a.appConsumer}</p><p><b className="text-text-primary">保留：</b>{a.retention}</p></div></article>)}</section>
    <section className="rounded-container border border-success bg-success-bg p-5"><div className="flex gap-3"><BadgeCheck className="text-success-text"/><p className="text-sm text-success-text">Certificate 撤销使用 revoked，Result 异常使用 archived / invalid，Verification 跟随可信状态；任何一种都不通过“删除记录”表达。</p></div></section>
  </div>;
}
