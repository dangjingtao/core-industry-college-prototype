# F002｜企业可信信息 + 可信凭证完整能力｜施工记录

**状态：待评审**  
**施工日期：2026-08-17**  
**目标卡：`docs/workbench/00-work-ledger.md` → F002**

> 按工作台账规则，施工线程不自行标记 `PASS`。本记录表示实现已完成并具备 build / deploy 证据，等待独立功能评审。

## 1. 实际修改范围

### A. 企业可信基础信息

修改：

- `apps/mobile/src/features/public-platform/data.ts`
- `apps/mobile/src/features/trust/TrustPages.tsx`
- `apps/mobile/src/app/App.tsx`

实现：

- `Company` 增加统一 `businessInfo` 可信基础信息对象；
- 企业详情保留“合作概览”为默认主心智；
- 新增“工商信息”Tab，并兼容旧映射语义：
  - `/companies/:companyId?tab=business`
- 补齐字段：
  - 法定代表人；
  - 注册资本；
  - 经营状态；
  - 成立日期；
  - 企业类型；
  - 所属行业；
  - 所属地区；
  - 统一社会信用代码；
  - 工商注册号；
  - 核准日期；
  - 登记机关；
  - 注册地址；
  - 经营范围。
- 工商数据明确标识为原型 Mock，不伪装为真实官方工商事实。

### B. 可信凭证 / 验真

新增统一 F002 页面实现：

- `apps/mobile/src/features/trust/TrustPages.tsx`

并在 `apps/mobile/src/app/App.tsx` 接管以下既有语义路由：

- `/assets/verification`
- `/assets/certificates/:certificateId`
- `/assets/results/:resultId`
- `/companies/:companyId`

实现：

1. 验真码：保留原有本地可信证书匹配；
2. 扫码验真：增加统一标准二维码入口，摄像头行为使用 Mock；
3. 文件验真：
   - 支持 PDF / OFD 语义；
   - 10MB 上限；
   - 展示文件名、类型、大小、待验证 / 验证通过 / 不可验证状态；
   - 不伪装真实 OFD / 签名解析，明确为中保真 Mock；
4. 官方平台 handoff：
   - 提供明确外部出口；
   - 原型打开 handoff 占位页；
   - 不编造第三方“官方验真网址”；
   - 生产协议明确为 `issuer.officialVerificationUrl + verificationCode / credentialId`；
5. 证书：
   - 保存动作；
   - 下载动作；
   - 快速进入统一验真；
   - 官方平台出口；
6. 成绩：
   - 下载成绩报告动作；
7. 下载文件当前使用中保真文本占位文件，真实服务接入后替换为正式 PDF / OFD / 图片，不改变页面交互；
8. 保留 `TrustNote`，继续明确系统可信事实不能由简历编辑器修改。

### C. 公共验真边界修正

`routeDefinitions` 原本已经把 `/assets/verification` 定义为 `public`，但实际 `App.tsx` 仍套了 `AccountRequired`。

F002 已修正实际路由：验真页不再要求登录，符合公开验真的产品语义；证书详情和成绩详情仍属于长期账号资产，需要登录。

## 2. 实现提交

F002 三个连续提交：

- `89620ff637033c02269b1a7ee8a7c2e543af1bd6` — `feat(F002): add trusted company business information`
- `081577f2437d4f40086222e06401db384e4fb115` — `feat(F002): add trusted company and credential verification pages`
- `2ff2631c8d6979c83041f9ac7bcdd72c03f82f46` — `feat(F002): wire trusted company and verification flows`

其后 F01 并行提交 `0994f12faf0f11eb7b00220b777b0efaa015b7fc` 以 F002 最后提交为 parent，未覆盖 F002 路由与实现。

## 3. Build / CI 证据

GitHub Actions：

- Workflow：`Deploy Mobile to Cloudflare Pages`
- Run ID：`32013871701`
- Head：`0994f12faf0f11eb7b00220b777b0efaa015b7fc`
- 结果：`success`

关键步骤：

- Install dependencies：success
- Type-check and build mobile preview：success
- Deploy mobile：success

由于该成功 run 的 head commit 直接以 F002 最后提交为祖先，因此构建包含本卡全部实现。

## 4. 建议独立评审动线

### 企业可信信息

```text
/companies
→ 任一企业
→ 合作概览仍为默认页
→ 工商信息
→ 核对全部字段
→ 直接访问 /companies/northstar-beauty?tab=business
```

### 三种验真

```text
/assets/verification
→ 验真码
→ 输入 SC15-TOMZ-24001
→ 验证通过

→ 扫码验真
→ 启动扫码（Mock）
→ 二维码有效

→ 文件验真
→ 选择 PDF / OFD
→ 检查类型、大小、10MB 上限、状态
→ 开始文件验真（Mock）
→ 验证通过

→ 官方验证出口
→ 打开 handoff 原型页
```

### 证书 / 成绩下载

```text
/assets/certificates/cert-sanchuang-15
→ 保存证书
→ 下载证书
→ 三种方式验真
→ 官方平台 handoff

/assets/results/competition-result-sanchuang-15
→ 下载成绩报告
→ 查看关联证书
```

## 5. 待独立评审关注点

- 企业页是否仍然明显以资源 / 品牌 / 合作关系为主，而非工商查询；
- `?tab=business` 是否满足旧页面映射兼容；
- `/assets/verification` 未登录访问是否符合预期；
- PDF / OFD 的文件状态表达是否足够清楚；
- Mock 与真实可信事实的边界是否清楚，没有把原型结果伪装为正式验真；
- 证书 / 成绩下载动作是否满足中保真验收；
- 后续真实后端只需替换可信数据源、文件解析、下载与 handoff 层，不需要重画页面。
