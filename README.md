# 月澜塔罗
纯Vibe Coding产品，访问[月澜塔罗](https://tlp-neon.vercel.app/)即可体验 

一个基于 `Next.js` 的中文塔罗网页原型，主打“轻量陪伴感 + 视觉入口 + 角色化解读”。

当前版本已经包含：
- 首页双阶段入口：水晶球进入，第二屏使用 `second.mp4`
- 4 位占卜师：`Luna / Iris / Sol / Orion`
- 每位占卜师独立过场视频与独立场景页
- 78 张塔罗牌抽牌与翻牌展示
- 单张 / 三张牌阵
- 结合角色个性的 AI 解读
- AI 不可用时的本地 fallback 解读

## 技术栈

- `Next.js`
- `React`
- 原生 CSS
- `App Router`

## 功能概览

### 入口流程

用户访问 `/` 后会先看到入口页：
- `first` 场景：水晶球与齿轮动效
- 点击进入后播放 `public/video/second.mp4`
- 第二屏可点击四位角色的“选择此指南”热区
- 点击角色后进入对应过场页 `/transition/[readerId]`
- 过场视频播放完成后进入 `/reading/[readerId]`

### 占卜体验

每位角色都有自己的：
- 支持主题
- 过场视频
- 场景背景图
- 说话语气与解读角度

阅读页支持：
- 选择当前角色可用主题
- 选择单张 / 三张牌阵
- 输入问题或使用示例问题
- 抽牌动画、翻牌展示
- 逐张牌面说明
- 角色结合用户问题与牌面的回话
- 趋势、行动建议、提醒

### 当前主题分配

- `Luna`：爱情关系、人际沟通
- `Iris`：健康状态、生活选择
- `Sol`：事业发展、财运机会
- `Orion`：年度运势、人生转折

## 路由说明

- `/`：首页入口
- `/transition/[readerId]`：角色过场页
- `/reading/[readerId]`：角色专属占卜页
- `/api/draw`：抽牌接口
- `/api/reading`：解读接口

## 本地启动

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start
```

## 环境变量

项目支持 Ark 和 OpenAI 两种模型配置。

参考 `.env.example`：

```env
OPENAI_API_KEY=
OPENAI_MODEL=
ARK_API_KEY=
ARK_MODEL=
ARK_BASE_URL=
```

如果你使用 Ark，通常只需要：

```env
ARK_API_KEY=你的密钥
ARK_MODEL=你的模型或接入点 ID
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

说明：
- 有 `ARK_API_KEY` 时优先走 Ark
- 没有 Ark 时会尝试 OpenAI
- 都没有时，`/api/reading` 会回退到本地模板解读

## 资源目录

- `public/video/`：角色过场视频与第二屏视频
- `public/png/`：角色专属阅读场景图
- `public/cards/rws/`：78 张 Rider-Waite-Smith 塔罗牌图
- `components/`：页面交互组件
- `data/`：角色、主题、牌面与场景配置
- `lib/tarot.js`：抽牌、fallback 解读、AI prompt 逻辑

## 当前重点实现

当前版本重点在体验链路：
- 视频引导进入角色
- 角色场景内提问与抽牌
- 抽牌动画与翻牌展示
- 角色化回话与结果呈现

后续如果继续扩展，比较适合往这些方向走：
- 不同角色更强的专属 UI 语言
- 抽牌音效与更完整的仪式动画
- 历史记录与分享页
- 更细的 AI 提示词与角色语气控制
