# 📝 Antigravity-PM 更新日志 (Changelog)

本项目严格遵循 [Semantic Versioning (语义化版本规范)](https://semver.org/lang/zh-CN/)。

> 💡 **版本归档规则说明**：
> 当发布全新的主版本或次版本时，前一版本的完整发布纪要与核心改动将自动归档迁移至 [`docs/history/`](./docs/history/) 目录（如 `docs/history/v1.0.0-full-edition.md`），保证根目录 CHANGELOG.md 保持精炼，同时历史档案永久留痕。

---

## [v1.1.0] - 2026-09-05 (纯净开源版 · Pure Clean Edition)

### 🧼 核心升级与重构 (Features & Refactoring)
- **零预设轻量化架构**：
  - 移除了源码中写死绑定的 9 大专家团与 18 个 Skill 行业数据，提供纯净空白骨架；
  - 面向全球通用场景：全球开发者可自由在此定义任意领域的专属 AI 专家团（自媒体、外贸、电商、科研、全栈开发等）；
- **预设包解耦机制 (`presets/`)**：
  - 将原完整版生态数据固化至 [`presets/official-full-preset.json`](./presets/official-full-preset.json)，支持按需一键载入，兼顾轻量与开箱即用；
- **纯净空白项目模板**：
  - `projects.json` 重构为开箱即用的空白入门引导模版，不含任何私有业务数据；
- **便携包双轨发行**：
  - 同步发布 `Antigravity-PM-Pure-Portable`（纯净轻巧便携版）与 `Antigravity-PM-Full-Portable`（完整功能便携版）。

---

## [v1.0.0] - 2026-09-05 (完整版 · Full Edition - 已归档)

> 📌 **注**：原初始版本正式重命名为 **【完整版 (Full Edition)】**，已完整归档至 [`docs/history/v1.0.0-full-edition.md`](./docs/history/v1.0.0-full-edition.md)。

- 内置 9 大垂直专家决策圆桌与 18+ 款工业级 Skill 插件；
- 包含 4 套完整的跨领域示范工程（量化策略、肉鸽小游戏、Bento 官网、本地数据挖掘）；
- 完成钱学森控制论 50 路并发读取与 100 次密集写碰撞抗脆弱压测。

---

## 📂 历史版本归档索引 (Archive Index)
- [v1.1.0 纯净开源版发行报告](./docs/history/v1.1.0-pure-edition.md)
- [v1.0.0 完整版全景档案与指标记录 (已归档)](./docs/history/v1.0.0-full-edition.md)
