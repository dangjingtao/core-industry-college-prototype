# Shared UI

## Dialog

`Dialog` is a controlled, responsive modal for both clients. It renders into a
body portal, locks background scrolling, restores focus on close, traps keyboard
focus, and closes from Escape or the backdrop by default.

```tsx
import { Dialog } from "@core/shared";

<Dialog
  open={open}
  onOpenChange={setOpen}
  title="确认提交"
  description="提交后将进入学校审核。"
  footer={<Button onClick={() => setOpen(false)}>知道了</Button>}
>
  <p>这里放表单或确认内容。</p>
</Dialog>
```

At desktop widths the panel is centered. At mobile widths it becomes a
bottom sheet while retaining the same controlled API and accessibility contract.
