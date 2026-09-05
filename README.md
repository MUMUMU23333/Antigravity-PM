# 🚀 Antigravity-PM (多智能体专家团与技能项目管理总线)

<p align="center">
  <img src="./public/logo.png" alt="Antigravity-PM Logo" width="120" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>专为 AI 研发者打造的下一代多智能体专家圆桌、底层 Skill 自动化调度与全生命周期项目管理工作台</strong>
</p>

<p align="center">
  <a href="#核心特色">核心特色</a> •
  <a href="#快速上手">快速上手</a> •
  <a href="#九大专家团全景">九大专家团</a> •
  <a href="#自定义扩展指南">自定义配置</a> •
  <a href="#开源协议">开源协议</a>
</p>

---

## 🌟 为什么选择 Antigravity-PM？

在当下大语言模型与智能体 (AI Agents) 井喷的时代，传统的项目管理工具（如 Jira、Trello）无法理解**智能体工作流、技能挂载、提示词工程锁与自动化回测**。

**Antigravity-PM** 致力于践行开源互联网精神，为您提供一套**开箱即用、零环境死绑、自由可扩展**的现代工程面板：

1. 👥 **全域九大垂直专家决策团**：融合 TradingAgents 多空博弈、钱学森工程控制论系统守门员、全语言工业级代码审查官、独立游戏工坊、人感演示PPT等 9 大领域圆桌；
2. ⚡ **底层 Skill 插件无缝挂载**：内置 18+ 款工业级技能（全市场行情财报穿透、多因子选股、抗过拟合雷达、Canvas打击感动效引擎、Web Audio音频合成、TDD原子总线等），全部规范采用 `英文名称（中文名称）` 并提供 1-5 星领域评分；
3. 🗂️ **双视图模式切换**：支持大卡片沉浸式展开视图与高信息密度文本条目紧凑视图，无论策略多少，均可平滑顺畅下滑浏览；
4. 🤖 **IDE 双向无缝互联与修改工坊**：一键在 IDE 中列出全景专家团与技能清单，AI 架构师主动询问您的修改意图，自动重构配置并实时热同步；
5. 📊 **严谨的量化指标隔离**：仅在量化交易策略中呈现夏普比率、最大回撤与年化收益；非量化项目（游戏、网页、PPT、文案）保持纯净展示；
6. 🛡️ **钱学森工程控制论级抗脆弱性**：内置进程防碰撞锁、单实例锁（Single Instance Lock）、原子写入引擎，抗击高并发操作。

---

## 📸 界面预览 (Screenshots)

| 看板研发流 (Kanban Flow) | 技能与专家团中心 (Skill Matrix) |
| :---: | :---: |
| 支持拖拽流转、PM2 进程托管与实时指标监控 | 九大决策团与底层技能全景罗列，支持卡片/列表双视图 |

---

## 🚀 快速上手 (Quick Start)

### 方式一：源码开发与调试

```bash
# 1. 克隆本项目
git clone https://github.com/YOUR_USERNAME/Antigravity-PM.git
cd Antigravity-PM

# 2. 安装项目依赖
npm install

# 3. 启动前端开发调试服务
npm run dev

# 4. 启动 Electron 桌面应用 (支持热重载)
npm run electron:dev
```

### 方式二：编译打包桌面安装包 / 绿色免安装版

```bash
# 编译前端静态资源并打包 Windows 便携版
npm run electron:pack
```

---

## 🏛️ 九大内置垂直专家团队 (Built-in Expert Teams)

- **👥 腾讯自选股股票投研专家团 (stock-partner-team)**：7人实战圆桌，穿透三大财报真实性与行业周期拐点；
- **🏛️ 星辰多空决策投研团 (smart-stock-analyst)**：5人决策组，技术量价、舆情穿透与风控一票否决红蓝对抗；
- **🛡️ 钱学森工程控制论总工守门员 (system-chief-engineer)**：系统总工大白话守门员，从动态系统时滞发散倒查系统崩溃死穴；
- **🔍 全语言工业级代码审查官 (universal-code-reviewer)**：全语言六维工业级质检，防死锁、防内存泄漏与反过度设计；
- **🎮 独立小游戏全流程工坊 (indie-game-studio)**：6人全流程游戏研发，注入屏幕震动打击感与 Web Audio 原生音效；
- **🌐 高端互动网页与体验架构师 (modern-web-architects)**：5人全栈视觉工程，主攻 Bento 栅格、毛玻璃与 LCP<1.0s；
- **📊 花叔数据分析专家团 (huashu-data-pro)**：4人数据组，纯本地隐私推理，输出 HTML+XLSX+PPTX 三格式报告；
- **📑 卡尔人感演示与PPT专家团 (humanize-ppt-team)**：7人全流程演示组，电子杂志风与演讲者双屏系统；
- **📖 长篇小说与文学创作专家团 (novel-writer-suite)**：6人编剧创作组，执行解缚协议，塑造硬核剧情张力。

---

## 🛠️ 自定义配置指南 (Customization Guide)

### 1. 添加或修改项目
修改项目根目录的 `projects.json`，或直接在客户端界面点击 **`+ 新建策略/项目`**，系统将自动进行持久化存储。

### 2. 扩展您的专家团或 Skill
所有专家团和技能定义完全解耦，存放于 `src/App.jsx` 的 `AVAILABLE_EXPERT_TEAMS` 与 `AVAILABLE_SKILLS` 数组中。您可以自由扩充或通过界面点击 **`💡 在 IDE 中编辑生态配置`**，AI 将自动为您全自动重构！

---

## 📄 开源协议 (License)

本项目遵循 [MIT License](LICENSE) 开源协议。欢迎全球开发者自由 Fork、定制、贡献代码或分享给更多有需要的朋友！

让我们一起秉持互联网的自由分享精神，构建更美好的智能体生态！ ✨
