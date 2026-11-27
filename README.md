# aiokane-render

YouTube 频道 **AIとお金の実践室**（@AIOkaneJP）的视频源码项目。

本仓库就是这些视频本身的源码：每条视频是一个 HTML/CSS composition（源码），用 [givemotion](https://github.com/givemotion/givemotion)（MIT，code-to-video 引擎）构建成 MP4。GitHub Actions workflow 是**本项目自己的构建/发布流程**——和软件项目用 CI 编译并发布构建产物是同一回事：composition 是源代码，渲染出的 MP4 是本项目的发布物。

本项目不对外提供渲染服务，不接受第三方代渲。

## 目录

- `shorts-v1/index.html` — 竖版 Shorts 样片的 composition 源码（1080×1920 / 30fps，深藏青+青绿+金品牌配色）
- `shorts-v1/avatar.webp` — 结尾卡用的频道头像（项目素材）

## 构建方式

### 主流水线 `render.yml`（定版）

- **手动**：Actions 页 → `render` → Run workflow，可选 quality（默认 `standard`）
- **自动**：push 到 `main` 且改动了 `shorts-v1/**` 或 workflow 本身时自动触发（即源码变更时才构建）

构建产物（artifact `rendered-video`，保留 7 天）：

- `video.mp4` — 1080×1920 原版成片
- `video-4k.mp4` — ffmpeg lanczos 拉升的 2160×3840 上传版（原生只渲 1080p，拉升只是转码一步，是为了 YouTube 分配 VP9 高码率编码；不做 4K 逐帧渲染）
- `sheet.png` — givemotion snapshot 关键帧拼图（构建自查用）

构建缓存：givemotion 分段缓存 `.gm-cache/` 用 actions/cache 按 composition 文件 hash 做 key，源码小改时只重渲变化的 1–2 秒分段，减少重复构建。

### 分段并行实验 `render-matrix.yml`（实验）

仅手动触发。把一条 composition 按 `--frames` 切成 **最多 4 段**、matrix 并行构建，再由 merge job 用 ffmpeg concat 拼回，并校验拼接后时长/帧数。验证通过前不作为定版路线。

## 用量克制（合规）

GitHub 附加产品条款要求 GitHub-hosted runner 只用于与本仓库软件项目直接相关的生产/测试/部署/发布活动，且不得给服务器造成与收益不成比例的负担。本项目即按此执行：

- workflow 只做本项目源码的构建与发布，不做与构建无关的下载、常驻进程或对外服务
- 原生渲染只到 1080p；所谓 4K 版仅为 ffmpeg 拉升转码，不逐帧渲染
- 分段并行最多 4 段，不大规模并发
- artifact 保留期 7 天
- 触发只来自源码 push 或维护者手动 dispatch，不做定时/轮询式空跑

## 环境

- ubuntu-latest（公开仓库标准 runner）、Node 24、ffmpeg、fonts-noto-cjk（日文字体，runner 默认没有，必须装）
- Chrome Headless Shell 由 `npx givemotion install` 下载（构建引擎运行所需）
