import { Card, PageHeader, PublicShell, Button, SecondaryButton } from "../../components/ui";
import { useState } from "react";

const channels = [
  { title: "添加企业微信", desc: "适合需要持续沟通的问题" },
  { title: "排队等待人工", desc: "当前等待 8 人，预计 15 分钟" },
  { title: "提交工单", desc: "客服稍后回复，可查看处理进度" },
];

export function SupportChatPage() {
  const [opened, setOpened] = useState(false);

  return <PublicShell showNavigation={false}>
    <PageHeader title="客服" backTo="/support" />
    <div className="space-y-4 px-4 py-5">
      <Card>
        <p className="font-medium">请选择你的问题</p>
        <div className="mt-3 space-y-2 text-sm text-text-secondary">
          <p>赛事：第十六届三创赛</p>
          <p>赛道：创业实践赛</p>
          <p>问题类型：报名问题</p>
        </div>
      </Card>

      <Card>
        <p>您好，我暂时无法解决这个问题，需要人工协助。</p>
        <div className="mt-4 space-y-3">
          {channels.map(channel => <button key={channel.title} className="w-full rounded-control border border-border p-3 text-left" onClick={() => setOpened(true)}>
            <p className="font-medium">{channel.title}</p>
            <p className="text-sm text-text-secondary">{channel.desc}</p>
          </button>)}
        </div>
      </Card>

      {opened && <Card>
        <p className="font-medium">提交工单</p>
        <textarea className="mt-3 min-h-32 w-full rounded-control border border-border p-3" placeholder="请描述你的问题，可上传截图" />
        <Button className="mt-3 w-full">提交</Button>
        <SecondaryButton className="mt-2 w-full">取消</SecondaryButton>
      </Card>}
    </div>
  </PublicShell>;
}
