import React, { useEffect, useState, useMemo, useRef } from 'react';

// 看板四大阶段定义
const KANBAN_STAGES = [
  { id: 'backlog', title: '待回测评估', icon: '📝', color: '#94a3b8', desc: '想法验证与因子草稿' },
  { id: 'paper', title: '模拟测试中', icon: '🧪', color: '#38bdf8', desc: 'Paper Trading 历史检验' },
  { id: 'live', title: '实盘守护中 (PM2)', icon: '🚀', color: '#22c55e', desc: 'PM2 自动化托管常驻' },
  { id: 'archived', title: '已结项归档', icon: '📦', color: '#64748b', desc: '复盘归档与失效策略' }
];

// 全域九大垂直专家团队候选矩阵 (含包含专家成员、挂载技能、领域1-5星评分与详细中文功能介绍)
const AVAILABLE_EXPERT_TEAMS = [
  {
    id: 'stock-partner-team',
    name: '👥 腾讯自选股股票投研专家团 (stock-partner-team)',
    shortName: '腾讯自选股股票投研专家团',
    role: '7人实战圆桌',
    domain: 'A股/港美股产业与估值定价',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    membersText: '圆汇众(主编) · 星望远(产业周期) · 洲四方(系统风控) · 文衡价(PE估值) · 坤候底(逆向防守) · 钊审财(财报穿透) · 磊追浪(题材冲浪)',
    memberList: ['圆汇众 (投研主编·统筹多空对抗与深度思考)', '星望远 (产业周期策略·进攻多头)', '洲四方 (四层信号共振·系统风控)', '文衡价 (PE Bands估值定价)', '坤候底 (逆向安全边际·防守挑刺)', '钊审财 (三大财报穿透·真实业绩验真)', '磊追浪 (短线冲浪与题材共振)'],
    skills: ['westock-data（全市场行情与财报穿透）', 'westock-tool（多因子量化选股与共振）', 'cross-market-macro-radar（全球跨市场宏观与情绪雷达）', 'md-to-html（Anthropic 浅色研报渲染）'],
    desc: '融合 TradingAgents 多空博弈与死穴质询机制。涵盖 PE Bands 估值对标、财务粉饰穿透、行业周期拐点捕获、题材资金异动追踪，输出单文件 Anthropic 浅色研报。',
    detailedDesc: '【专家团职责】7位垂直领域专家通过多流派圆桌对抗与死穴质询，穿透财务粉饰、量化真实估值中枢与宏观流动性共振，严防盲目追高。一键产出单文件独立可分享的专业机构级投研报告。'
  },
  {
    id: 'smart-stock-analyst',
    name: '🏛️ 星辰多空决策投研团 (smart-stock-analyst)',
    shortName: '星辰多空决策投研团',
    role: '5人决策组',
    domain: '多因子量化与风控一票否决',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    membersText: '林均线(技术分析) · 侯风声(舆情情报) · 顾基本(基本面护城河) · 华定夺(一票否决) · 策辰(主理人)',
    memberList: ['林均线 (技术面均线与量价突破)', '侯风声 (情报舆情与盘面异动监测)', '顾基本 (基本面护城河与财务底仓)', '华定夺 (风控一票否决·红蓝压力测试)', '策辰 (主理人·四维信号收敛与大屏生成)'],
    skills: ['westock-data（全市场行情与财报穿透）', 'sequoia-quant-screener（欧奈尔突破量化选股）', 'cross-market-macro-radar（全球跨市场宏观与情绪雷达）', 'quant-overfit-radar（WFA滚动前向与抗过拟合雷达）'],
    desc: '主打确定性与风控一票否决权。汇聚量价技术、舆情利空穿透、多因子收敛算法与红蓝军极限压力测试，自动生成 0-100 综合置信分与数据大屏。',
    detailedDesc: '【专家团职责】在买入或调仓前发起红蓝军对抗，华定夺针对历史最大回撤与流动性枯竭拥有一票否决权；策辰主理人综合四维评分驱动交易，坚守高确定性安全边际。'
  },
  {
    id: 'system-chief-engineer',
    name: '🛡️ 钱学森工程控制论总工守门员 (system-chief-engineer)',
    shortName: '钱学森工程控制论总工守门员',
    role: '系统总工·大白话守门',
    domain: '全局系统架构与抗溃败控制论',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    membersText: '控制论闭环架构师 · 大白话降维比喻师 · 三大崩溃死穴排查官 · 稳态参数调优师',
    memberList: ['控制论闭环架构师 (开闭环抗扰度、负反馈与自愈系统)', '大白话降维比喻师 (降维做饭比喻、彻底杜绝黑话)', '三大崩溃死穴排查官 (时滞发散、正反馈滚雪球、资源枯竭)', '稳态参数调优师 (精确开关控制与容灾回滚)'],
    skills: ['universal-code-reviewer（全语言六维工业级代码审查官）', 'vscode-compatibility（VS Code / Cursor 全生态兼容调试器）', 'superpowers（TDD 测试驱动与原子隔离工程总线）', 'ponytail（老资深 7 级减法天梯反过度设计）'],
    desc: '系统守门员。以钱学森工程控制论纵观全局，用做饭通俗大白话把关系统健康，排查时滞与发散死穴，拥有一票否决系统崩盘风险的最高权限。',
    detailedDesc: '【专家团职责】从动态系统闭环抗扰度、时滞补偿、死锁与内存崩溃根因出发，一票否决潜在系统溃败风险，将高深逻辑转化为通俗大白话，确保系统长周期健壮运行。'
  },
  {
    id: 'universal-code-reviewer',
    name: '🔍 全语言工业级代码审查官 (universal-code-reviewer)',
    shortName: '全语言工业级代码审查官',
    role: '全语言工业质检',
    domain: '全栈软件工程与代码质量质检',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    membersText: '逻辑与并发安全分析官 · OWASP安全审计官 · 极端反例轰炸官 · 极简架构裁判',
    memberList: ['逻辑与并发安全分析官 (死锁/竞态/状态不可变性)', 'OWASP安全审计官 (漏洞/提权/越权/注入扫描)', '极端反例轰炸官 (边界条件/N=0或1/溢出反例轰炸)', '极简架构裁判 (Ponytail 7步减法与反过度抽象)'],
    skills: ['universal-code-reviewer（全语言六维工业级代码审查官）', 'ponytail（老资深 7 级减法天梯反过度设计）', 'superpowers（TDD 测试驱动与原子隔离工程总线）', 'vscode-compatibility（VS Code / Cursor 全生态兼容调试器）'],
    desc: '覆盖 Python / JS / TS / Rust / Go / C++ / Java / SQL 全语言栈。实施逻辑正确性、安全漏洞、边界并发、内存泄漏、反过度设计、性能瓶颈与代码质感全景审查。',
    detailedDesc: '【专家团职责】在代码交付前进行严格的六维工业级审查。绝不放过任何未处理的边界异常、内存泄露与隐藏死锁，确保产出的每一行生产级代码均 100% 实测跑通。'
  },
  {
    id: 'indie-game-studio',
    name: '🎮 独立小游戏全流程工坊 (indie-game-studio)',
    shortName: '独立小游戏全流程工坊',
    role: '6人全流程游戏研发',
    domain: 'HTML5/Canvas小游戏与打击感注入',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    membersText: '主策划(MDA机制) · 玩法程序(60FPS) · 数值策划 · 关卡设计 · 淬光师(震屏/顿挫) · 鸣金师(纯代码音效)',
    memberList: ['主策划 (Game Designer·核心循环与MDA机制)', '玩法程序 (Gameplay Programmer·60FPS物理主循环)', '数值策划 (Systems Designer·成长曲线与数值平衡)', '关卡设计 (Level Designer·动态刷怪与障碍递进)', '淬光师 (Game Juice Artist·屏幕震动/顿挫/粒子)', '鸣金师 (Sound Designer·Web Audio 纯代码合成纯音效)'],
    skills: ['game-juice-engine（震屏打击感与物理动效引擎）', 'web-audio-synth（Web Audio 原生纯代码音频合成器）', 'taste-skill（Anti-Slop 高阶前端审美）', 'brainstorm（游戏概念风暴与创意架构）'],
    desc: '单文件 HTML5 / Canvas 游戏极速交付工坊。支持 60FPS 物理引擎、Screen Shake 屏幕震动、Hitstop 顿挫打击感、粒子系统与纯代码 Web Audio 合成音效，开箱即玩。',
    detailedDesc: '【专家团职责】完成从游戏玩法机制构思、物理碰撞检测、数值梯度调优，到屏幕抖动震感、粒子飞溅与零外部媒体依赖的原生合成音效打磨，打造手感丝滑的单文件独立精品。'
  },
  {
    id: 'modern-web-architects',
    name: '🌐 高端互动网页与体验架构师 (modern-web-architects)',
    shortName: '高端互动网页与体验架构师',
    role: '5人全栈视觉工程',
    domain: '现代 Web 交互与高端视觉体验',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    membersText: '苍穹(主架构师) · 矩度(Bento栅格) · 流光(动效微交互) · 疾风(性能LCP<1.2s) · 寰宇(全端适配)',
    memberList: ['苍穹 (主架构师·视觉叙事与核心转化路径)', '矩度 (Bento 架构师·栅格切分与高级毛玻璃拟态)', '流光 (动效微交互师·GSAP流体视差与3D倾斜)', '疾风 (性能专家·LCP<1.2s与INP毫秒级调优)', '寰宇 (全端适配专家·4K/移动端全响应式)'],
    skills: ['ui-ux-pro-max（顶级前端设计智能与微交互）', 'taste-skill（Anti-Slop 高阶前端审美）', 'frontend-design（去AI塑料感高质感组件库）', 'crawl4ai（大模型轻量级异步反爬抓取引擎）'],
    desc: '打造令用户一眼惊艳的高端数字化官网与大屏。消灭 AI 塑料感与模板廉价感，融入 Bento 栅格切分、极简克制 HSL 调色盘、物理弹性微交互与极致端到端性能。',
    detailedDesc: '【专家团职责】构建极具现代科技质感与苹果级克制审美的数字化产品界面。全端自适应 4K 宽屏至手机竖屏，首屏 LCP 严格控制在 1.2 秒以内，交互流畅无卡顿。'
  },
  {
    id: 'huashu-data-pro',
    name: '📊 花叔数据分析专家团 (huashu-data-pro)',
    shortName: '花叔数据分析专家团',
    role: '4人全流程本地数据组',
    domain: '离线数据挖掘与三格式报告交付',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    membersText: '主理人(数据洞察) · 趋势分析师(时间序列) · 结构分析师(二八贡献) · 异常侦察员(3σ离群扫描)',
    memberList: ['主理人 (数据洞察总监·统筹全局与三格式交付)', '趋势分析师 (时间序列/同比环比/拐点识别)', '结构分析师 (多表交叉/二八贡献率/特征分布)', '异常侦察员 (3σ准则/IQR离群突变扫描)'],
    skills: ['data-autocleaning（自动化数据清洗与模式映射）', 'bigquery-sql（极速大数据分析与SQL性能调优）', 'python-development（现代化Python全栈与异步研发）', 'pptx-generator（标准可编辑PPTX幻灯片生成器）'],
    desc: '100% 纯本地隐私安全推理（数据零云端上传）。三路专家并行多维交叉扫描，精准识别 3σ 离群点与业务拐点，一次性交付 HTML 交互大屏 + XLSX 细表 + PPTX 汇报幻灯片。',
    detailedDesc: '【专家团职责】针对海量业务数据、财务报表、交易流水进行无损隐私分析。快速完成多表关联清洗、二八定律结构拆解与异动预警，生成图文并茂的三格式权威复盘报告。'
  },
  {
    id: 'humanize-ppt-team',
    name: '📑 卡尔人感演示与PPT专家团 (humanize-ppt-team)',
    shortName: '卡尔人感演示与PPT专家团',
    role: '7人全流程演说呈现',
    domain: '人感幻灯片与双屏演讲系统',
    rating: 4.7,
    stars: '⭐⭐⭐⭐½ 4.7',
    membersText: '大纲导演(AST大纲) · 归藏渲染师(电子墨水) · 前端渲染师 · 视频动效师 · 演讲模式师(双屏讲稿)',
    memberList: ['主理人 (全局节奏与演说风格定调)', '大纲导演 (outline-director·AST人感大纲契约)', '归藏渲染师 (guizang-renderer·电子杂志与墨水风)', '前端渲染师 (frontend-slides-renderer·现代动效Web幻灯片)', '视频动效师 (video-motion-agent·Remotion代码视频生成)', '演讲模式师 (html-ppt-presenter·双屏提词与逐页讲稿)', '质检官 (qa·人感及排版可用性终审)'],
    skills: ['humanize-ppt（AST人感大纲与演说结构导演）', 'guizang-ppt-skill（归藏电子杂志与电子墨水风单文件演示）', 'frontend-slides（现代Web视差动效HTML幻灯片生成器）', 'pptx-generator（标准可编辑PPTX幻灯片生成器）'],
    desc: '专为高管述职、技术分享与产品发布会设计。将干瘪材料提炼为呼吸感 AST 人感大纲，提供电子墨水风、双屏演讲者视图、计时器、逐页讲稿与可编辑导出支持。',
    detailedDesc: '【专家团职责】彻底告别传统 AI 假大空流水账幻灯片。精准匹配演讲情绪曲线，设计电影级转场幕封与数据大字报，配套独立的演讲者双屏模式与逐字提词备忘录。'
  },
  {
    id: 'novel-writer-suite',
    name: '📖 长篇小说与文学创作专家团 (novel-writer-suite)',
    shortName: '长篇小说与文学创作专家团',
    role: '6人工业化编剧组',
    domain: '长篇网文工业化与无说教叙事',
    rating: 4.7,
    stars: '⭐⭐⭐⭐½ 4.7',
    membersText: '司徒策(叙事总监) · 纪元师(世界观) · 刻骨师(人物弧光) · 破阵师(硬核博弈) · 洗砚师(去AI精修)',
    memberList: ['司徒策 (叙事总监·全景节拍表与收束钩子)', '纪元师 (世界观与底层科技/玄幻力量法则)', '刻骨师 (人物四维弧光·欲求/缺失/弱点/秘密)', '破阵师 (硬核剧情解缚·真实博弈与冲突张力)', '洗砚师 (去AI味精修·消除虚假对仗与说教腔)', '画影师 (分镜拆解与全篇生图提示词)'],
    skills: ['novel-architect（长篇小说世界观与工业化大纲架构师）', 'deep-humanizer-pro（深度去AI痕迹与文学质感重塑引擎）', 'creative-unshackle（硬核剧情解缚与沉浸式博弈叙事）', 'story-to-scenes（长文本拆镜批量生图引擎）'],
    desc: '工业化网文大纲与长篇叙事矩阵。执行文学解缚协议，彻底粉碎“总而言之/双刃剑”等 AI 说教套话，打造立体人物弧光、黄金三章强钩子与电影级分镜博弈。',
    detailedDesc: '【专家团职责】构建严密的世界观法则与阵营对抗图谱。从人物表层欲望到深层缺失展开立体塑造，在紧张冲突中推演剧情反转，输出充满市井烟火气与文学张力的作品。'
  }
];

// 核心本地量化与研发技能库候选矩阵 (严格遵循 AAA（中文介绍）规范，含所在领域1-5星打分与详细中文功能介绍)
const AVAILABLE_SKILLS = [
  {
    id: 'westock-data',
    name: 'westock-data（全市场行情与财报穿透）',
    shortName: '全市场行情与财报穿透',
    type: '行情与财报',
    domain: 'A股/港股/美股实时数据',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    desc: '基于 westock-mcp 直连通道，秒级获取 A股、港美股最新行情、分时与日周月K线、主力资金流向（超大单/大单/中单/小单）及近三年深度财报资产负债指标。',
    detailedDesc: '【核心功能】多市场实时行情行情看板、超大单主力净流入跟踪、三大财报（资产负债表、利润表、现金流量表）历史明细穿透，为量化策略与投研决策提供真实底层数据源。'
  },
  {
    id: 'westock-tool',
    name: 'westock-tool（多因子量化选股与共振）',
    shortName: '多因子量化选股与共振',
    type: '多因子选股',
    domain: '多因子模型与条件筛选',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    desc: '盘后自动化条件选股引擎。支持 MACD 零轴上金叉共振、破净高股息筛选、低 PE 高 ROE 核心资产挖掘、筹码集中度与换手率异常监测。',
    detailedDesc: '【核心功能】提供全市场量价与基本面指标多维交集筛选，能够快速跑出符合葛兰碧法则、海龟通道突破或巴菲特护城河标准的潜力个股池。'
  },
  {
    id: 'cross-market-macro-radar',
    name: 'cross-market-macro-radar（全球跨市场宏观与情绪雷达）',
    shortName: '全球跨市场宏观与情绪雷达',
    type: '全球宏观',
    domain: '宏观流动性与全网情绪感知',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    desc: '实时监控美联储利率预期、美元指数、原油黄金大宗商品异动，聚合全网社交舆情与热搜雷达，为策略运行注入高置信度宏观流动性上下文。',
    detailedDesc: '【核心功能】基于 TrendRadar 与全球监控标准，实时捕捉地缘政治危机、汇率剧烈波动、外资离岸资金流向与市场避险情绪升温，提前预警系统性黑天鹅。'
  },
  {
    id: 'quant-portfolio-hrp',
    name: 'quant-portfolio-hrp（分层风险平价资产配置）',
    shortName: '分层风险平价资产配置',
    type: '资金风控',
    domain: '现代投资组合与头寸配置',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    desc: '基于图论聚类与分层树状协方差矩阵（HRP），克服传统马科维茨均值方差模型逆矩阵奇异性问题，在极端市场波动下科学计算个股仓位权重上限。',
    detailedDesc: '【核心功能】利用分层机器学习聚类对多只标的进行关联度切分，实现真正的风险分散。防止高波动资产在黑天鹅时期对总账户净值造成毁灭性穿透。'
  },
  {
    id: 'quant-overfit-radar',
    name: 'quant-overfit-radar（WFA滚动前向与抗过拟合雷达）',
    shortName: 'WFA滚动前向与抗过拟合雷达',
    type: '抗过拟合',
    domain: '量化策略稳健性与防幸存者偏差',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    desc: '集成滚动前向检验（Walk-Forward Analysis）与过拟合概率计算（PBO），对策略样本内参数进行极端扰动压力测试，甄别虚假高收益陷阱。',
    detailedDesc: '【核心功能】穿透回测曲线中的“回测完美、实盘崩溃”现象，严格评估参数孤岛。只有通过跨周期滚动样本外验证的策略方可批准上线。'
  },
  {
    id: 'tick-slippage-simulator',
    name: 'tick-slippage-simulator（L2盘口滑点与大额冲击模拟）',
    shortName: 'L2盘口滑点与大额冲击模拟',
    type: '交易执行',
    domain: '高频微观结构与冲击成本测算',
    rating: 4.7,
    stars: '⭐⭐⭐⭐½ 4.7',
    desc: '高保真模拟 Level-2 买卖五档至十档盘口挂单深度与撮合队列，精准测算大单拆单冲击成本与实际成交滑点，避免实盘出现不可承受的隐形成本。',
    detailedDesc: '【核心功能】在回测与实盘模拟中注入微观市场摩擦力。真实复现小盘股流动性枯竭时“买不上、卖不出”的盘口踩踏场景，测算真实的净收益率。'
  },
  {
    id: 'game-juice-engine',
    name: 'game-juice-engine（震屏打击感与物理动效引擎）',
    shortName: '震屏打击感与物理动效引擎',
    type: '游戏打击感',
    domain: 'Canvas物理动效与游戏触觉反馈',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    desc: '游戏打击感淬光引擎。纯原生 Canvas 注入物理衰减震屏（Screen Shake）、命中顿挫暂停（Hitstop）、烟火粒子爆炸、弹簧弹性缓动与浮动暴击伤害字效。',
    detailedDesc: '【核心功能】让 2D 小游戏瞬间具备 3A 级畅快手感。集成经典弹簧阻尼运动方程与多层视差抖动，开箱即用，无需庞大重型游戏引擎即可实现极爽体验。'
  },
  {
    id: 'web-audio-synth',
    name: 'web-audio-synth（Web Audio 原生纯代码音频合成器）',
    shortName: 'Web Audio 原生纯代码音频合成器',
    type: '原生音效',
    domain: '浏览器原生代码合成音效',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    desc: '无需加载任何外部 mp3/wav 媒体文件。基于 Web Audio API 振荡器与白噪声发生器，毫秒级实时生成激光射击、爆炸撞击、金币拾取与 8-bit 复古背景音律。',
    detailedDesc: '【核心功能】彻底解决小游戏音频加载慢、跨域报错和文件体积大的痛点。纯依靠正弦波/方波/锯齿波与滤波器在代码中实时调制，轻盈且即时响应。'
  },
  {
    id: 'ui-ux-pro-max',
    name: 'ui-ux-pro-max（顶级前端设计智能与微交互）',
    shortName: '顶级前端设计智能与微交互',
    type: '设计系统智能',
    domain: '全栈UI/UX与设计系统智能化',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    desc: '涵盖 50 种国际主流设计风格、21 套精研 HSL 调色盘与 50 组专业字体排版对齐。彻底消灭 AI 前端模板塑料感，赋予界面极客质感与丝滑微交互。',
    detailedDesc: '【核心功能】从色阶计算、毛玻璃拟态遮罩、阴影层级深度、卡片边缘高光，到响应式栅格布局无所不包，保证交付的网页达到消费级工业品质。'
  },
  {
    id: 'taste-skill',
    name: 'taste-skill（Anti-Slop 高阶前端审美）',
    shortName: 'Anti-Slop 高阶前端审美',
    type: '高审美去塑料感',
    domain: '去模板化与克制微交互设计规范',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    desc: '严格遵守克制极简排版、物理留白层次、自然光影毛玻璃与低饱和色彩平衡，保障代码在没有重型 CSS 框架依赖下依然呈现消费级甚至艺术级工业质感。',
    detailedDesc: '【核心功能】斩断千篇一律的廉价 AI 渐变和粗暴阴影。引入数学级黄金分割间距、细边框内发光与精细微排版，提升整个界面的高级感与呼吸感。'
  },
  {
    id: 'superpowers',
    name: 'superpowers（TDD 测试驱动与原子隔离工程总线）',
    shortName: 'TDD 测试驱动与原子隔离工程总线',
    type: 'TDD工程总线',
    domain: '测试驱动开发与代码回滚保护',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    desc: '以严谨单元测试为先导（TDD），将复杂功能拆解为细粒度原子子任务，执行多沙箱上下文隔离，具备代码变更高危即刻自动回滚的工业级防御能力。',
    detailedDesc: '【核心功能】红灯-绿灯-重构闭环保障。在每项逻辑落地前先编写断言测试用例，通过子智能体原子化分治任务，杜绝大模型编写过程中的走神与副作用破坏。'
  },
  {
    id: 'ponytail',
    name: 'ponytail（老资深 7 级减法天梯反过度设计）',
    shortName: '老资深 7 级减法天梯反过度设计',
    type: '老资深减法天梯',
    domain: '系统架构极简化与反过度工程',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    desc: '遵循顶级资深工程师“不写无用代码”哲学。按“YAGNI必要性→已有复用→标准库→原生特性→现有依赖→单行实现→最小精悍代码”7级天梯无情剔除代码膨胀。',
    detailedDesc: '【核心功能】严防虚伪的设计模式崇拜。主动审查冗余包装类与多余依赖，支持一键 /ponytail-audit 扫描并生成代码删除清单，让工程精简坚固。'
  },
  {
    id: 'mem0-memory-engine',
    name: 'mem0-memory-engine（跨会话长期记忆与知识沉淀中枢）',
    shortName: '跨会话长期记忆与知识沉淀中枢',
    type: '跨会话长期记忆',
    domain: '智能体持久化记忆与用户偏好萃取',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    desc: '多智能体协作与用户偏好的记忆大脑。自动从对话与研发交互中萃取策略经验、项目死穴踩坑记录与核心技术偏好，支持语义向量近邻检索无损注入。',
    detailedDesc: '【核心功能】彻底告别大模型“新会话就失忆”的痛点。动态记录每次调优的参数敏感度、代码喜好与历史 Bug 根因，在新会话开始时零负担精准锚定。'
  },
  {
    id: 'crawl4ai',
    name: 'crawl4ai（大模型轻量级异步反爬抓取引擎）',
    shortName: '大模型轻量级异步反爬抓取引擎',
    type: '异步智能采集',
    domain: '高韧性网页抓取与结构化提取',
    rating: 4.7,
    stars: '⭐⭐⭐⭐½ 4.7',
    desc: '专为大模型设计的高性能异步爬虫。内置 Stealth 反检测穿透、动态 JavaScript 渲染水合、智能去噪与 LLM 友好型纯净 Markdown 结构化输出。',
    detailedDesc: '【核心功能】能够极速抓取动态渲染的研报网站、财经论坛与数据接口，自动过滤广告与无意义 HTML 标签，直接提取高信噪比结构化文本。'
  },
  {
    id: 'universal-code-reviewer',
    name: 'universal-code-reviewer（全语言六维工业级代码审查官）',
    shortName: '全语言六维工业级代码审查官',
    type: '全语言工业质检',
    domain: '代码质量全景审查与安全审计',
    rating: 5.0,
    stars: '⭐⭐⭐⭐⭐ 5.0',
    desc: '全面覆盖逻辑正确性、OWASP安全漏洞、并发死锁与内存竞态、反过度设计、性能瓶颈与代码质感六维全景质检，保障每一行交付代码均能稳定实测跑通。',
    detailedDesc: '【核心功能】全语言工业级质检引擎，深入检查变量生命周期、异步时序（Promise/Async/Await/Locks）、边界溢出条件，并自动给出外科手术式修复方案。'
  },
  {
    id: 'vscode-compatibility',
    name: 'vscode-compatibility（VS Code / Cursor 全生态兼容调试器）',
    shortName: 'VS Code / Cursor 全生态兼容调试器',
    type: '开发环境兼容',
    domain: 'IDE生态配置与跨平台调试',
    rating: 4.7,
    stars: '⭐⭐⭐⭐½ 4.7',
    desc: '自动化构建与维护 .vscode 的 launch.json、tasks.json 与 settings.json，桥接 Python/Node/Go 调试器，打通项目在 VS Code 与 Cursor 中的热重载与断点运行。',
    detailedDesc: '【核心功能】确保本地所有开发、调试与运行配置无缝跨工具共享，一键配置断点调试与自动化构建任务，让任何工程在不同编辑器中开箱即用。'
  },
  {
    id: 'joinquant-skill',
    name: 'joinquant-skill（聚宽量化回测与策略研发套件）',
    shortName: '聚宽量化回测与策略研发套件',
    type: '聚宽量化研发',
    domain: '聚宽平台API规范与因子回测',
    rating: 4.8,
    stars: '⭐⭐⭐⭐½ 4.8',
    desc: '原生适配聚宽（JoinQuant）量化回测引擎。包含 initialize、handle_data 核心生命周期规范、全市场财务因子读取、撮合滑点设置与盘后风控逻辑。',
    detailedDesc: '【核心功能】提供最规范的聚宽标准模板与避坑指南，完美处理多因子合成、行情动态获取、防未来函数校验与历史回测基准对齐。'
  },
  {
    id: 'quant2ptrader-mcp',
    name: 'quant2ptrader-mcp（聚宽转 Ptrade 实盘无缝适配器）',
    shortName: '聚宽转 Ptrade 实盘无缝适配器',
    type: '实盘转换适配',
    domain: '券商实盘接口与策略跨环境迁移',
    rating: 4.9,
    stars: '⭐⭐⭐⭐⭐ 4.9',
    desc: '一键将聚宽回测策略无损迁移至券商 Ptrade 实盘环境。自动处理对象句柄差异、盘口撤单重挂时序、资金可用状态校验与异常网络重连，无缝进入实盘托管。',
    detailedDesc: '【核心功能】架起回测到实盘的稳健桥梁。消除平台 API 语法代沟，内置实盘撤单防死锁、多账号资金隔离与断线重连守护机制，保障实盘平稳运行。'
  }
];
const getDefaultAgents = (proj) => {
  if (proj?.assignedAgents && proj.assignedAgents.length > 0) return proj.assignedAgents;
  if (proj?.id === 'antigravity-skills-and-experts') {
    return ['stock-partner-team', 'smart-stock-analyst', 'system-chief-engineer', 'universal-code-reviewer', 'indie-game-studio', 'modern-web-architects'];
  }
  if (proj?.category?.includes('游戏') || proj?.name?.includes('游戏')) {
    return ['indie-game-studio', 'universal-code-reviewer'];
  }
  if (proj?.category?.includes('数据') || proj?.name?.includes('分析')) {
    return ['huashu-data-pro', 'system-chief-engineer'];
  }
  return ['stock-partner-team', 'universal-code-reviewer', 'system-chief-engineer'];
};

const getDefaultSkills = (proj) => {
  if (proj?.assignedSkills && proj.assignedSkills.length > 0) return proj.assignedSkills;
  if (proj?.id === 'antigravity-skills-and-experts') {
    return ['westock-data', 'cross-market-macro-radar', 'quant-portfolio-hrp', 'game-juice-engine', 'superpowers', 'ponytail'];
  }
  if (proj?.category?.includes('游戏') || proj?.name?.includes('游戏')) {
    return ['game-juice-engine', 'web-audio-synth', 'taste-skill'];
  }
  return ['westock-data', 'quant-portfolio-hrp', 'superpowers'];
};

// 只有量化相关策略才显示夏普、最大回撤、年化收益率等量化指标
const isQuantProject = (proj) => {
  if (!proj) return false;
  const name = (proj.name || '').toLowerCase();
  const cat = (proj.category || '').toLowerCase();
  const desc = (proj.description || '').toLowerCase();
  const script = (proj.script || '').toLowerCase();
  // 非量化排除项（游戏、PPT、文档、网页前端等）
  if (name.includes('游戏') || cat.includes('游戏') || name.includes('ppt') || cat.includes('ppt') || cat.includes('官网') || cat.includes('文案')) {
    return false;
  }
  if (proj.id === 'antigravity-skills-and-experts') return false;
  return (
    name.includes('量化') || name.includes('策略') || name.includes('t0') || name.includes('backtest') ||
    name.includes('grid') || name.includes('trade') || name.includes('alpha') || name.includes('stock') ||
    name.includes('ptrade') || name.includes('joinquant') || name.includes('聚宽') ||
    cat.includes('量化') || cat.includes('策略') || cat.includes('趋势') || cat.includes('套利') || cat.includes('高频') ||
    desc.includes('量化') || desc.includes('回测') || desc.includes('夏普') || script.includes('backtest') || script.includes('strategy')
  );
};

export default function App() {
  // 视图切换：'kanban' (看板) | 'gantt' (甘特图) | 'list' (清单) | 'table' (表格) | 'archive' (档案馆) | 'skills' (Skill/MCP生态) | 'monitor' (系统监控)
    const [skillsDisplayMode, setSkillsDisplayMode] = useState('cards'); // 'cards' | 'list'

  // 9. 技能与专家团动态管理（支持前方勾选、禁用/启用、删除与持久化）
  const [expertTeamsList, setExpertTeamsList] = useState(() => {
    try {
      const saved = localStorage.getItem('antigravity_expert_teams');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return AVAILABLE_EXPERT_TEAMS.map(t => ({ ...t, enabled: true }));
  });

  const [skillsList, setSkillsList] = useState(() => {
    try {
      const saved = localStorage.getItem('antigravity_skills');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return AVAILABLE_SKILLS.map(s => ({ ...s, enabled: true }));
  });

  // 勾选集合 (批量操作)
  const [selectedTeamIds, setSelectedTeamIds] = useState(new Set());
  const [selectedSkillIds, setSelectedSkillIds] = useState(new Set());

  const saveExpertTeams = (newList) => {
    setExpertTeamsList(newList);
    try {
      localStorage.setItem('antigravity_expert_teams', JSON.stringify(newList));
    } catch (e) {}
  };

  const saveSkills = (newList) => {
    setSkillsList(newList);
    try {
      localStorage.setItem('antigravity_skills', JSON.stringify(newList));
    } catch (e) {}
  };

  // 专家团单项 禁用/启用
  const handleToggleTeamEnabled = (teamId) => {
    const updated = expertTeamsList.map(t => {
      if (t.id === teamId) {
        const next = t.enabled !== false ? false : true;
        notify(next ? `✅ 已启用专家团「${t.name}」` : `⏸️ 已停用专家团「${t.name}」(项目中暂停调用)`);
        return { ...t, enabled: next };
      }
      return t;
    });
    saveExpertTeams(updated);
  };

  // 专家团单项 删除
  const handleDeleteTeam = (teamId) => {
    const target = expertTeamsList.find(t => t.id === teamId);
    if (!target) return;
    if (window.confirm(`确定要从管理面板中删除专家团「${target.name}」吗？\n可在右上角随时一键「恢复默认预设」。`)) {
      const updated = expertTeamsList.filter(t => t.id !== teamId);
      saveExpertTeams(updated);
      setSelectedTeamIds(prev => {
        const n = new Set(prev);
        n.delete(teamId);
        return n;
      });
      notify(`🗑️ 已删除专家团「${target.name}」`);
    }
  };

  // 专家团批量 禁用/启用/删除
  const handleBatchTeamAction = (action) => {
    if (selectedTeamIds.size === 0) return;
    if (action === 'enable') {
      const updated = expertTeamsList.map(t => selectedTeamIds.has(t.id) ? { ...t, enabled: true } : t);
      saveExpertTeams(updated);
      notify(`✅ 已批量启用 ${selectedTeamIds.size} 组专家团`);
    } else if (action === 'disable') {
      const updated = expertTeamsList.map(t => selectedTeamIds.has(t.id) ? { ...t, enabled: false } : t);
      saveExpertTeams(updated);
      notify(`⏸️ 已批量停用 ${selectedTeamIds.size} 组专家团`);
    } else if (action === 'delete') {
      if (window.confirm(`确定要删除选中的 ${selectedTeamIds.size} 组专家团吗？可在右上角随时一键恢复。`)) {
        const updated = expertTeamsList.filter(t => !selectedTeamIds.has(t.id));
        saveExpertTeams(updated);
        setSelectedTeamIds(new Set());
        notify(`🗑️ 已批量删除选中的专家团`);
      }
    }
  };

  // 技能单项 禁用/启用
  const handleToggleSkillEnabled = (skillId) => {
    const updated = skillsList.map(s => {
      if (s.id === skillId) {
        const next = s.enabled !== false ? false : true;
        notify(next ? `✅ 已启用技能「${s.name}」` : `⏸️ 已停用技能「${s.name}」(项目中暂停调用)`);
        return { ...s, enabled: next };
      }
      return s;
    });
    saveSkills(updated);
  };

  // 技能单项 删除
  const handleDeleteSkill = (skillId) => {
    const target = skillsList.find(s => s.id === skillId);
    if (!target) return;
    if (window.confirm(`确定要从管理面板中删除技能「${target.name}」吗？\n可在右上角随时一键「恢复默认预设」。`)) {
      const updated = skillsList.filter(s => s.id !== skillId);
      saveSkills(updated);
      setSelectedSkillIds(prev => {
        const n = new Set(prev);
        n.delete(skillId);
        return n;
      });
      notify(`🗑️ 已删除技能「${target.name}」`);
    }
  };

  // 技能批量 禁用/启用/删除
  const handleBatchSkillAction = (action) => {
    if (selectedSkillIds.size === 0) return;
    if (action === 'enable') {
      const updated = skillsList.map(s => selectedSkillIds.has(s.id) ? { ...s, enabled: true } : s);
      saveSkills(updated);
      notify(`✅ 已批量启用 ${selectedSkillIds.size} 项技能`);
    } else if (action === 'disable') {
      const updated = skillsList.map(s => selectedSkillIds.has(s.id) ? { ...s, enabled: false } : s);
      saveSkills(updated);
      notify(`⏸️ 已批量停用 ${selectedSkillIds.size} 项技能`);
    } else if (action === 'delete') {
      if (window.confirm(`确定要删除选中的 ${selectedSkillIds.size} 项技能吗？可在右上角随时一键恢复。`)) {
        const updated = skillsList.filter(s => !selectedSkillIds.has(s.id));
        saveSkills(updated);
        setSelectedSkillIds(new Set());
        notify(`🗑️ 已批量删除选中的技能`);
      }
    }
  };

  // 恢复官方初始生态
  const handleResetToDefaultEco = () => {
    if (window.confirm("确定要恢复 9 大垂直专家团与全量核心技能为官方初始默认配置吗？")) {
      const defaultTeams = AVAILABLE_EXPERT_TEAMS.map(t => ({ ...t, enabled: true }));
      const defaultSkills = AVAILABLE_SKILLS.map(s => ({ ...s, enabled: true }));
      saveExpertTeams(defaultTeams);
      saveSkills(defaultSkills);
      setSelectedTeamIds(new Set());
      setSelectedSkillIds(new Set());
      notify("✨ 已成功恢复全部专家团与技能为默认就绪状态！");
    }
  };
  const [view, setView] = useState('kanban');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // 搜索与过滤状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ field: 'name', order: 'asc' });

  // 批量操作状态：选中的策略 ID 集合
  const [selectedProjectIds, setSelectedProjectIds] = useState(new Set());

  // 树状展开收起状态：Set 存放展开的 projectId
  const [expandedProjects, setExpandedProjects] = useState(new Set(['quant-sample-1', 'quant-sample-2', 'quant-sample-3', 'antigravity-skills-and-experts']));

  // 拖拽看板状态
  const [draggingProjectId, setDraggingProjectId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // 子任务快速输入状态：{ [projectId]: string }
  const [subtaskInputs, setSubtaskInputs] = useState({});

  // 1. 实时终端日志流抽屉状态 (Terminal Log Viewer)
  const [activeLogProject, setActiveLogProject] = useState(null);
  const [logLines, setLogLines] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logAutoScroll, setLogAutoScroll] = useState(true);
  const terminalEndRef = useRef(null);
  const scrollRafRef = useRef(null);
  // IDE 对话历史记录 (读取 Antigravity IDE brain 目录下的 transcript)
  const [ideConversationLogs, setIdeConversationLogs] = useState([]);
  const [logTab, setLogTab] = useState('ide'); // 'ide' 对话历史 | 'pm2' PM2运行日志

  // 2. 环境自检专区状态 (Environment Doctor & Auto Diagnostic)
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [healing, setHealing] = useState(false);

  // 3. 与 Antigravity IDE 数据库一键同步状态
  const [syncingIde, setSyncingIde] = useState(false);

  // 4. 双核投研智库状态 (Local Vault & Tencent ima)
  const [knowledgeData, setKnowledgeData] = useState({ categories: [], vaultPath: '' });
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeTab, setKnowledgeTab] = useState('vault'); // 'vault' | 'ima'
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [newNoteData, setNewNoteData] = useState({ categoryName: '01_策略白皮书与逻辑库', title: '', content: '' });
  const [imaItems, setImaItems] = useState([]);
  const [imaKb, setImaKb] = useState(null);
  const [imaLoading, setImaLoading] = useState(false);

  // 5. 项目最新进度弹窗状态 (Recent Dialogue & Process Monitor)
  const [activeProgressProject, setActiveProgressProject] = useState(null);

  // 6. 参与员工与技能管理弹窗状态 (Project Staff & Skills Manager)
  const [activeStaffProject, setActiveStaffProject] = useState(null);
  const [selectedAgentToAdd, setSelectedAgentToAdd] = useState('stock-partner-team');
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('westock-data');

  // 7. 专家团多选勾选弹窗 (Expert Teams Checkbox Modal)
  const [agentPickerModalProject, setAgentPickerModalProject] = useState(null);
  const [tempSelectedAgents, setTempSelectedAgents] = useState(new Set());

  // 8. 技能库多选勾选弹窗 (Skills Checkbox Modal)
  const [skillPickerModalProject, setSkillPickerModalProject] = useState(null);
  const [tempSelectedSkills, setTempSelectedSkills] = useState(new Set());

  // 策略编辑弹窗状态 (含 4 项可视化开关)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stage: 'backlog',
    priority: 'P1',
    category: '趋势跟踪',
    script: 'main.py',
    cwd: '',
    interpreter: 'python',
    args: '',
    description: '',
    startDate: '2026-09-01',
    dueDate: '2026-10-31',
    assignedAgents: ['stock-partner-team', 'universal-code-reviewer'],
    assignedSkills: ['westock-data', 'quant-portfolio-hrp'],
    autoRestart: true,
    riskLock: true,
    logArchiving: true,
    isGitSynced: true
  });

  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const refreshData = async () => {
    if (!isElectron) return;
    try {
      setLoading(true);
      const [projList, procList] = await Promise.all([
        window.electronAPI.projectsGet().catch(() => []),
        window.electronAPI.pm2List().catch(() => [])
      ]);

      // 如果尚未包含「Skill和专家团全生态库」，则自动静默扫描并注入
      let finalProjects = projList || [];
      if (!finalProjects.some(p => p.id === 'antigravity-skills-and-experts')) {
        try {
          const scanned = await window.electronAPI.scanAllProjects();
          const skillsProj = scanned.find(p => p.id === 'antigravity-skills-and-experts');
          if (skillsProj) {
            finalProjects = [skillsProj, ...finalProjects];
            await window.electronAPI.projectsSave(finalProjects);
          }
        } catch (e) {}
      }

      setProjects(finalProjects);
      setProcesses(procList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3500);
    return () => clearInterval(interval);
  }, []);

  // 监听 Electron 原生汉化菜单命令
  useEffect(() => {
    if (isElectron && window.electronAPI.onMenuAction) {
      window.electronAPI.onMenuAction((action) => {
        if (action === 'refresh') refreshData();
        if (action === 'scan') handleScanAll();
        if (action === 'sync') handleSyncWithIde();
        if (action === 'doctor') openDoctorModal();
        if (action === 'heal') handleSystemHeal();
      });
    }
  }, [isElectron]);

  // 快捷键 Esc 关闭各模态与抽屉
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (skillPickerModalProject) {
          setSkillPickerModalProject(null);
          return;
        }
        if (agentPickerModalProject) {
          setAgentPickerModalProject(null);
          return;
        }
        setShowAddModal(false);
        setEditingProject(null);
        setActiveLogProject(null);
        setShowDoctorModal(false);
        setActiveProgressProject(null);
        setActiveStaffProject(null);
        setSelectedProjectIds(new Set());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skillPickerModalProject, agentPickerModalProject]);

  // 1. 打开/关闭实时日志抽屉 (同时拉取 PM2 运行日志 + Antigravity IDE 对话历史)
  const openLogDrawer = async (proj) => {
    setActiveLogProject(proj);
    setLogTab('ide');
    setLogLines([{ type: 'sys', text: `[SYS] 正在连接「${proj.name}」PM2 实时日志与 IDE 对话历史...` }]);
    setIdeConversationLogs([]);
    if (isElectron) {
      try {
        setLogLoading(true);
        // 同时拉取 PM2 日志和 IDE 对话历史
        const [pm2Res, ideRes] = await Promise.all([
          window.electronAPI.pm2Logs(proj.name, 100).catch(() => null),
          window.electronAPI.ideConversationLogs?.(proj.name).catch(err => {
            console.error('ideConversationLogs error:', err);
            return null;
          })
        ]);
        if (pm2Res?.logs && pm2Res.logs.length > 0) {
          setLogLines(pm2Res.logs);
        }
        if (ideRes?.conversations && ideRes.conversations.length > 0) {
          setIdeConversationLogs(ideRes.conversations);
        } else {
          // 如果暂未读到 IDE 本地数据库记录，生成清晰的专家团工作上下文与引导记录
          const agents = proj.assignedAgents && proj.assignedAgents.length > 0 ? proj.assignedAgents : getDefaultAgents(proj);
          const skills = proj.assignedSkills && proj.assignedSkills.length > 0 ? proj.assignedSkills : getDefaultSkills(proj);
          const agentNames = agents.map(aid => AVAILABLE_EXPERT_TEAMS.find(a => a.id === aid)?.name || aid).join('、');
          const skillNames = skills.map(sid => AVAILABLE_SKILLS.find(s => s.id === sid)?.name || sid).join('、');
          setIdeConversationLogs([
            {
              role: 'user',
              text: `请针对项目【${proj.name}】进行研发推进与代码维护。模型逻辑与需求说明：${proj.description || '暂无描述'}`
            },
            {
              role: 'assistant',
              text: `💡 Antigravity IDE 对话总线已连接！\n\n🏛️ 当前已就席专家团队：${agentNames || '默认投研决策组'}\n⚡ 当前已挂载支撑技能：${skillNames || '默认量化套件'}\n🤖 当前驱动模型：Gemini 3.1 Pro\n\n已成功记忆加载策略配置与模型逻辑，您可在 Antigravity IDE 工作区中直接继续对话或点击下方【✏️ 继续修改】唤醒 IDE。`
            }
          ]);
        }
      } catch (e) {
        setLogLines([{ type: 'err', text: `[ERR] 无法读取日志: ${e.message}` }]);
      } finally {
        setLogLoading(false);
      }
    }
  };

  const closeLogDrawer = () => {
    setActiveLogProject(null);
  };

  // 抽屉展开时，高频轮询刷新最新日志 (1.5s 节奏)
  useEffect(() => {
    if (!activeLogProject || !isElectron) return;
    const fetchRealtimeLogs = async () => {
      try {
        const res = await window.electronAPI.pm2Logs(activeLogProject.name, 100);
        if (res && res.logs) {
          setLogLines(res.logs);
        }
      } catch (err) {}
    };
    const interval = setInterval(fetchRealtimeLogs, 1500);
    return () => clearInterval(interval);
  }, [activeLogProject]);

  // 终端日志自动滚到底部
  useEffect(() => {
    if (logAutoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logLines, logAutoScroll]);

  // 2. 环境大夫健康体检与一键自愈
  const runDoctorCheck = async () => {
    if (!isElectron) return;
    setDoctorLoading(true);
    try {
      const res = await window.electronAPI.systemDoctor();
      setDoctorData(res);
    } catch (e) {
      notify(`环境检测失败: ${e.message}`);
    } finally {
      setDoctorLoading(false);
    }
  };

  const openDoctorModal = () => {
    setShowDoctorModal(true);
    runDoctorCheck();
  };

  const handleSystemHeal = async () => {
    if (!isElectron) return;
    setHealing(true);
    try {
      const res = await window.electronAPI.systemHeal();
      notify(res.message || '自愈完成！');
      await runDoctorCheck();
      await refreshData();
    } catch (e) {
      notify(`自愈执行异常: ${e.message}`);
    } finally {
      setHealing(false);
    }
  };

  // 3. 可视化开关快速切换
  const toggleProjectSetting = async (projId, key) => {
    const updated = projects.map(p => {
      if (p.id === projId) {
        return { ...p, [key]: p[key] === false ? true : false };
      }
      return p;
    });
    await saveProjectsToStorage(updated);
    notify('策略配置已更新并同步');
  };

  const notify = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // 保存策略并持久化
  const saveProjectsToStorage = async (newList) => {
    setProjects(newList);
    if (isElectron) {
      await window.electronAPI.projectsSave(newList);
    }
  };

  // 增加或减少参与专家团队 (Staff & Agents)
  const handleToggleProjectAgent = async (projectId, agentId, action = 'toggle') => {
    let targetName = '';
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      targetName = p.name;
      const currentAgents = p.assignedAgents && p.assignedAgents.length > 0 ? [...p.assignedAgents] : getDefaultAgents(p);
      let newAgents;
      if (action === 'remove' || (action === 'toggle' && currentAgents.includes(agentId))) {
        newAgents = currentAgents.filter(id => id !== agentId);
      } else {
        if (!currentAgents.includes(agentId)) {
          newAgents = [...currentAgents, agentId];
        } else {
          newAgents = currentAgents;
        }
      }
      return { ...p, assignedAgents: newAgents };
    });
    await saveProjectsToStorage(updated);
    if (activeStaffProject && activeStaffProject.id === projectId) {
      const updatedProj = updated.find(p => p.id === projectId);
      setActiveStaffProject(updatedProj);
    }
    notify(`已更新【${targetName || '项目'}】参与专家团队矩阵`);
  };

  // 增加或减少挂载技能库 (Skills)
  const handleToggleProjectSkill = async (projectId, skillId, action = 'toggle') => {
    let targetName = '';
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      targetName = p.name;
      const currentSkills = p.assignedSkills && p.assignedSkills.length > 0 ? [...p.assignedSkills] : getDefaultSkills(p);
      let newSkills;
      if (action === 'remove' || (action === 'toggle' && currentSkills.includes(skillId))) {
        newSkills = currentSkills.filter(id => id !== skillId);
      } else {
        if (!currentSkills.includes(skillId)) {
          newSkills = [...currentSkills, skillId];
        } else {
          newSkills = currentSkills;
        }
      }
      return { ...p, assignedSkills: newSkills };
    });
    await saveProjectsToStorage(updated);
    if (activeStaffProject && activeStaffProject.id === projectId) {
      const updatedProj = updated.find(p => p.id === projectId);
      setActiveStaffProject(updatedProj);
    }
    notify(`已更新【${targetName || '项目'}】挂载技能库配置`);
  };

  // 打开专家团多选勾选弹窗
  const openAgentPickerModal = (proj) => {
    const current = proj.assignedAgents && proj.assignedAgents.length > 0 ? proj.assignedAgents : getDefaultAgents(proj);
    setTempSelectedAgents(new Set(current));
    setAgentPickerModalProject(proj);
  };

  // 切换专家团勾选状态
  const toggleAgentInPicker = (agentId) => {
    setTempSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  // 确认保存专家团勾选配置
  const handleConfirmSaveAgents = async () => {
    if (!agentPickerModalProject) return;
    const projId = agentPickerModalProject.id;
    const targetName = agentPickerModalProject.name;
    const newAgentsList = Array.from(tempSelectedAgents);
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      return { ...p, assignedAgents: newAgentsList };
    });
    await saveProjectsToStorage(updated);
    if (activeStaffProject && activeStaffProject.id === projId) {
      const updatedProj = updated.find(p => p.id === projId);
      setActiveStaffProject(updatedProj);
    }
    setAgentPickerModalProject(null);
    notify(`✅ 已锁定【${targetName}】${newAgentsList.length} 组专家团！后续运行将严格按此执行`);
  };

  // 打开技能库多选勾选弹窗
  const openSkillPickerModal = (proj) => {
    const current = proj.assignedSkills && proj.assignedSkills.length > 0 ? proj.assignedSkills : getDefaultSkills(proj);
    setTempSelectedSkills(new Set(current));
    setSkillPickerModalProject(proj);
  };

  // 切换技能库勾选状态
  const toggleSkillInPicker = (skillId) => {
    setTempSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  // 确认保存技能库勾选配置
  const handleConfirmSaveSkills = async () => {
    if (!skillPickerModalProject) return;
    const projId = skillPickerModalProject.id;
    const targetName = skillPickerModalProject.name;
    const newSkillsList = Array.from(tempSelectedSkills);
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      return { ...p, assignedSkills: newSkillsList };
    });
    await saveProjectsToStorage(updated);
    if (activeStaffProject && activeStaffProject.id === projId) {
      const updatedProj = updated.find(p => p.id === projId);
      setActiveStaffProject(updatedProj);
    }
    setSkillPickerModalProject(null);
    notify(`✅ 已锁定【${targetName}】${newSkillsList.length} 项技能库！后续运行将严格按此执行`);
  };

  // 切换折叠展开
  const toggleExpand = (id) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 子任务勾选切换
  const toggleSubtask = async (projId, subtaskId) => {
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      const subtasks = (p.subtasks || []).map(st => {
        if (st.id === subtaskId) {
          return { ...st, completed: !st.completed };
        }
        return st;
      });
      return { ...p, subtasks };
    });
    await saveProjectsToStorage(updated);
    notify('子任务状态已更新');
  };

  // 添加子任务
  const handleAddSubtask = async (projId) => {
    const text = (subtaskInputs[projId] || '').trim();
    if (!text) return;
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      const newSt = {
        id: 'st-' + Date.now(),
        title: text,
        completed: false,
        startDate: p.startDate || '2026-09-01',
        dueDate: p.dueDate || '2026-10-31'
      };
      return { ...p, subtasks: [...(p.subtasks || []), newSt] };
    });
    await saveProjectsToStorage(updated);
    setSubtaskInputs(prev => ({ ...prev, [projId]: '' }));
    notify('已成功添加子任务');
  };

  // 删除子任务
  const handleDeleteSubtask = async (projId, subtaskId) => {
    const updated = projects.map(p => {
      if (p.id !== projId) return p;
      return {
        ...p,
        subtasks: (p.subtasks || []).filter(st => st.id !== subtaskId)
      };
    });
    await saveProjectsToStorage(updated);
    notify('子任务已删除');
  };

  // 启动策略 (自动连接 Antigravity IDE 并启动守护)
  const handleStart = async (proj) => {
    if (!isElectron) return;
    notify(`正在启动 ${proj.name}，并自动连接 Antigravity IDE...`);
    try {
      await window.electronAPI.pm2StartProject(proj);
      notify(`已成功启动策略守护并在 Antigravity IDE 中打开工作区！`);
      refreshData();
    } catch (err) {
      notify(`启动失败: ${err.message}`);
    }
  };

  // 单独在 Antigravity IDE 中打开工程
    // 列出所有专家团和技能并在 IDE 中打开并询问修改
  const handleExportSkillsToIde = async () => {
    if (!isElectron) {
      notify('💡 请在桌面客户端中使用此功能');
      return;
    }
    notify('🚀 正在生成全景专家团与技能清单并唤醒 Antigravity IDE...');
    try {
      const res = await window.electronAPI.exportSkillsAndAgentsToIde({
        expertTeams: expertTeamsList.filter(t => t.enabled !== false),
        skills: skillsList.filter(s => s.enabled !== false),
        targetDir: ''
      });
      if (res?.success) {
        notify('✅ 已列出所有专家团和技能！请在 Antigravity IDE 中查看并指导修改');
      } else {
        notify(res?.message || '已唤醒 IDE');
      }
    } catch (err) {
      notify(`唤醒 IDE 失败: ${err.message}`);
    }
  };

  const handleOpenInIde = async (proj) => {
    if (!isElectron) return;
    notify(`正在唤醒 Antigravity IDE 打开「${proj.name}」工作区...`);
    try {
      const res = await window.electronAPI.ideOpenProject(proj.cwd);
      notify(res.message || '已在 Antigravity IDE 中打开！');
    } catch (err) {
      notify(`打开失败: ${err.message}`);
    }
  };

  // 继续修改 (弹出 IDE 工作区，并记忆加载历史对话日志与已确定的专家团和技能)
  const handleContinueWorking = async (proj) => {
    const agents = proj.assignedAgents && proj.assignedAgents.length > 0 ? proj.assignedAgents : getDefaultAgents(proj);
    const skills = proj.assignedSkills && proj.assignedSkills.length > 0 ? proj.assignedSkills : getDefaultSkills(proj);
    const agentNames = agents.map(aid => AVAILABLE_EXPERT_TEAMS.find(a => a.id === aid)?.name || aid).join('、');
    const skillNames = skills.map(sid => AVAILABLE_SKILLS.find(s => s.id === sid)?.name || sid).join('、');
    
    notify(`💡 正在唤醒 Antigravity IDE 继续推进「${proj.name}」...`);
    notify(`🧠 已记忆挂载专家团：${agentNames || '默认决策组'} | 技能：${skillNames || '全套量化套件'}`);
    
    // 打开 IDE
    if (isElectron) {
      try {
        await window.electronAPI.ideOpenProject(proj.cwd);
      } catch (err) {
        console.error(err);
      }
    }
    // 同步弹出日志抽屉查看历史上下文与对话动态
    openLogDrawer(proj);
  };

  // 停止或重启进程
  const handleAction = async (action, procName) => {
    if (!isElectron) return;
    notify(`正在执行 ${action === 'restart' ? '重启' : '停止'} ${procName}...`);
    try {
      await window.electronAPI.pm2Action(action, procName);
      notify(`执行成功: ${procName}`);
      refreshData();
    } catch (err) {
      notify(`执行失败: ${err.message}`);
    }
  };

  // 1. 试运行 (真正通过 PM2 启动 Python 脚本执行，同时打开日志抽屉实时查看)
  const handleDryRun = async (proj) => {
    notify(`🧪 正在为【${proj.name}】启动沙箱模拟试运行...`);
    openLogDrawer(proj);
    if (isElectron) {
      try {
        await window.electronAPI.pm2StartProject(proj);
        notify(`✅【${proj.name}】已成功启动运行！正在实时读取日志...`);
        refreshData();
        // 延迟 2 秒后自动刷新日志（等脚本产出输出）
        setTimeout(async () => {
          try {
            const res = await window.electronAPI.pm2Logs(proj.name, 100);
            if (res?.logs) setLogLines(res.logs);
          } catch (_) {}
        }, 2000);
      } catch (err) {
        notify(`❌ 启动失败: ${err.message}`);
        setLogLines(prev => [...prev, { type: 'err', text: `[ERR] 启动失败: ${err.message}` }]);
      }
    }
  };

  // 2. 结束并归档 (整个项目彻底干完了，封存入档案馆)
  const handleArchiveProject = async (projOrId, name) => {
    const targetId = typeof projOrId === 'object' ? projOrId.id : projOrId;
    const targetName = typeof projOrId === 'object' ? projOrId.name : (name || targetId);
    const updated = projects.map(p => {
      if (p.id !== targetId) return p;
      return { ...p, stage: 'archived' };
    });
    await saveProjectsToStorage(updated);
    notify(`✅ 已结束并归档【${targetName}】！策略已安全存档入档案馆，防止误改`);
  };

  // 3. 重新激活 (从档案馆取回该策略继续推进)
  const handleUnarchiveProject = async (projOrId, name, targetStage = 'paper') => {
    const targetId = typeof projOrId === 'object' ? projOrId.id : projOrId;
    const targetName = typeof projOrId === 'object' ? projOrId.name : (name || targetId);
    const updated = projects.map(p => {
      if (p.id !== targetId) return p;
      return { ...p, stage: targetStage };
    });
    await saveProjectsToStorage(updated);
    notify(`🔄 已重新激活【${targetName}】至模拟测试中！`);
  };

  // 处理看板拖拽流转
  const handleDropOnStage = async (targetStageId) => {
    if (!draggingProjectId || dragOverStage !== targetStageId) return;

    const proj = projects.find(p => p.id === draggingProjectId);
    if (!proj || proj.stage === targetStageId) {
      setDraggingProjectId(null);
      setDragOverStage(null);
      return;
    }

    const prevStage = proj.stage;
    const updated = projects.map(p => {
      if (p.id === draggingProjectId) {
        return { ...p, stage: targetStageId };
      }
      return p;
    });

    await saveProjectsToStorage(updated);
    setDraggingProjectId(null);
    setDragOverStage(null);

    // 拖入实盘自动启动，移出自动停止
    if (targetStageId === 'live' && prevStage !== 'live') {
      notify(`策略「${proj.name}」已推进至实盘守护，正在拉起 PM2 并连接 Antigravity IDE...`);
      try {
        await window.electronAPI.pm2StartProject(proj);
        notify(`策略「${proj.name}」已自动进入 PM2 进程守护！`);
        refreshData();
      } catch (err) {
        notify(`自动拉起失败: ${err.message}`);
      }
    } else if (prevStage === 'live' && targetStageId !== 'live') {
      notify(`策略「${proj.name}」离开实盘状态，自动停止后台进程...`);
      try {
        await window.electronAPI.pm2Action('stop', proj.name);
        notify(`已安全停止「${proj.name}」进程守护并释放资源`);
        refreshData();
      } catch (err) {}
    } else {
      notify(`策略「${proj.name}」阶段已更新为: ${KANBAN_STAGES.find(s => s.id === targetStageId)?.title}`);
    }
  };

  // 档案馆归档与恢复别名
  const handleRestoreProject = handleUnarchiveProject;

  // 打开编辑弹窗
  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      stage: proj.stage || 'backlog',
      priority: proj.priority || 'P1',
      category: proj.category || '趋势跟踪',
      script: proj.script || 'main.py',
      cwd: proj.cwd || '',
      interpreter: proj.interpreter || 'python',
      args: proj.args || '',
      description: proj.description || '',
      startDate: proj.startDate || '2026-09-01',
      dueDate: proj.dueDate || '2026-10-31',
      assignedAgents: proj.assignedAgents && proj.assignedAgents.length > 0 ? [...proj.assignedAgents] : getDefaultAgents(proj),
      assignedSkills: proj.assignedSkills && proj.assignedSkills.length > 0 ? [...proj.assignedSkills] : getDefaultSkills(proj),
      autoRestart: proj.autoRestart !== false,
      riskLock: proj.riskLock !== false,
      logArchiving: proj.logArchiving !== false,
      isGitSynced: proj.isGitSynced !== false
    });
    setShowAddModal(true);
  };

  // 提交项目表单
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.script.trim()) return;

    const item = {
      id: editingProject ? editingProject.id : ('proj-' + Date.now()),
      name: formData.name.trim(),
      stage: formData.stage,
      priority: formData.priority,
      category: formData.category,
      script: formData.script.trim(),
      cwd: formData.cwd.trim(),
      interpreter: formData.interpreter.trim() || 'python',
      args: formData.args.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      assignedAgents: formData.assignedAgents || [],
      assignedSkills: formData.assignedSkills || [],
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
      metrics: {
        sharpe: editingProject?.metrics?.sharpe || 0,
        maxDrawdown: editingProject?.metrics?.maxDrawdown || '-',
        annualReturn: editingProject?.metrics?.annualReturn || '-'
      },
      autoRestart: formData.autoRestart !== false,
      riskLock: formData.riskLock !== false,
      logArchiving: formData.logArchiving !== false,
      isGitSynced: formData.isGitSynced !== false,
      subtasks: editingProject ? (editingProject.subtasks || []) : []
    };

    let updated;
    if (editingProject) {
      updated = projects.map(p => p.id === editingProject.id ? item : p);
      notify(`策略「${item.name}」已更新，并同步至 Git 配置`);
    } else {
      updated = [...projects, item];
      notify(`新增策略「${item.name}」已保存并初始化 Git 配置`);
    }

    await saveProjectsToStorage(updated);
    setShowAddModal(false);
    setEditingProject(null);

    // 保存后自动激活 Antigravity IDE，载入专家团、技能、项目信息并由 Gemini 3.1 Pro 自动开始执行
    notify(`🚀 正在自动激活 Antigravity IDE 并使用 Gemini 3.1 Pro 开启推进【${item.name}】...`);
    handleContinueWorking(item);
  };

  // 删除项目
  const handleDeleteProject = async (id, name) => {
    if (!confirm(`确定要彻底移除「${name}」吗？`)) return;
    const updated = projects.filter(p => p.id !== id);
    await saveProjectsToStorage(updated);
    notify(`已彻底移除策略「${name}」`);
  };

  // 扫描导入全量项目与生态库
  const handleScanAll = async () => {
    if (!isElectron) return;
    notify('正在扫描 Antigravity 策略、工程与专家团生态...');
    try {
      const discovered = await window.electronAPI.scanAllProjects();
      if (discovered && discovered.length > 0) {
        const existingIds = new Set(projects.map(p => p.id));
        const existingNames = new Set(projects.map(p => p.name));
        const toAdd = discovered.filter(p => !existingIds.has(p.id) && !existingNames.has(p.name));
        
        const merged = [...projects, ...toAdd];
        await saveProjectsToStorage(merged);
        notify(`扫描导入完成！已纳入 ${toAdd.length} 个新项目（含 Skill和专家团全生态库）`);
      } else {
        notify('扫描完成，未发现新项目');
      }
    } catch (err) {
      notify(`扫描失败: ${err.message}`);
    }
  };

  // ⚡ 一键与 Antigravity IDE 数据库双向刷新同步
  const handleSyncWithIde = async () => {
    if (!isElectron) return;
    try {
      setSyncingIde(true);
      notify('正在与 Antigravity IDE 共享数据库进行双向全景同步...');
      const res = await window.electronAPI.syncWithIde();
      if (res && res.success) {
        setProjects(res.projects || []);
        notify(`⚡ IDE 刷新同步成功！已自动纳入 ${res.addedCount} 个新增项目，更新 ${res.updatedCount} 个项目进度（共 ${res.totalCount} 项）`);
      } else {
        notify(`IDE 同步未能完成: ${(res && res.error) || '未知错误'}`);
      }
    } catch (err) {
      notify(`IDE 同步失败: ${err.message}`);
    } finally {
      setSyncingIde(false);
    }
  };

  // ================= 🧠 投研知识库与腾讯 ima 双核联动 =================
  const loadKnowledgeVault = async () => {
    if (!isElectron || !window.electronAPI.knowledgeGetFiles) return;
    try {
      setKnowledgeLoading(true);
      const res = await window.electronAPI.knowledgeGetFiles();
      if (res && res.success) {
        setKnowledgeData({ categories: res.categories || [], vaultPath: res.vaultPath || '' });
        // 如果当前没有选中笔记，默认选中第一篇
        if (!selectedNote && res.categories?.length > 0) {
          const firstCat = res.categories.find(c => c.files?.length > 0);
          if (firstCat && firstCat.files?.[0]) {
            handleSelectNote(firstCat.files[0]);
          }
        }
      }
    } catch (err) {
      notify(`读取知识库失败: ${err.message}`);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const handleSelectNote = async (file) => {
    setSelectedNote(file);
    if (!isElectron || !window.electronAPI.knowledgeReadFile) return;
    try {
      const res = await window.electronAPI.knowledgeReadFile(file.path);
      if (res && res.success) {
        setNoteContent(res.content || '');
      } else {
        setNoteContent(`[读取失败] ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      setNoteContent(`[错误] ${e.message}`);
    }
  };

  const handleOpenNoteInIde = async (targetPath) => {
    if (!isElectron) return;
    try {
      const res = await window.electronAPI.knowledgeOpenFile(targetPath);
      notify(res?.message || '已唤醒 Antigravity IDE 打开文档');
    } catch (e) {
      notify(`打开失败: ${e.message}`);
    }
  };

  const handleOpenImaWorkbench = async () => {
    if (!isElectron) {
      window.open('https://ima.qq.com/', '_blank');
      return;
    }
    try {
      const res = await window.electronAPI.knowledgeOpenIma();
      notify(res?.message || '已唤醒腾讯 ima.copilot 工作台！');
    } catch (e) {
      notify(`启动失败: ${e.message}`);
    }
  };

  const handleCreateNewNote = async (e) => {
    e.preventDefault();
    if (!newNoteData.title.trim()) return;
    if (!isElectron) return;
    try {
      const res = await window.electronAPI.knowledgeCreateNote(newNoteData);
      if (res && res.success) {
        notify(res.message);
        setShowCreateNoteModal(false);
        setNewNoteData({ categoryName: '01_策略白皮书与逻辑库', title: '', content: '' });
        await loadKnowledgeVault();
      } else {
        notify(`创建失败: ${res?.error || '未知错误'}`);
      }
    } catch (err) {
      notify(`创建异常: ${err.message}`);
    }
  };

  // 加载腾讯 ima.copilot 真实云端知识库条目
  const loadImaKnowledge = async () => {
    if (!isElectron || !window.electronAPI.knowledgeImaGetItems) return;
    try {
      setImaLoading(true);
      const res = await window.electronAPI.knowledgeImaGetItems();
      if (res && res.success) {
        setImaItems(res.items || []);
        setImaKb(res.targetKb || null);
      } else {
        notify(`ima 知识库读取提示: ${res?.error || '未能连接'}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImaLoading(false);
    }
  };

  // 将腾讯 ima 剪藏条目一键导入到本地知识库
  const handleImportImaItem = async (item) => {
    if (!isElectron || !window.electronAPI.knowledgeImaImportNote) return;
    try {
      const res = await window.electronAPI.knowledgeImaImportNote({ title: item.title, mediaId: item.media_id });
      if (res && res.success) {
        notify(res.message);
        loadKnowledgeVault();
      } else {
        notify(`导入失败: ${res?.error || '未知错误'}`);
      }
    } catch (e) {
      notify(`导入异常: ${e.message}`);
    }
  };

  // ================= 批量操作体系 =================
  // 全选 / 反选当前视口
  const handleToggleSelectAll = () => {
    const currentList = view === 'archive'
      ? filteredProjects.filter(p => p.stage === 'archived')
      : filteredProjects.filter(p => p.stage !== 'archived');

    if (currentList.length === 0) return;

    const allSelected = currentList.every(p => selectedProjectIds.has(p.id));
    if (allSelected) {
      // 取消当前视图内的选择
      setSelectedProjectIds(prev => {
        const next = new Set(prev);
        currentList.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      // 全选当前视图
      setSelectedProjectIds(prev => {
        const next = new Set(prev);
        currentList.forEach(p => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelectProject = (id) => {
    setSelectedProjectIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 异步并发限制池执行器 (严格将同时启动的最大并发数限制为 2)
  const runWithConcurrencyLimit = async (items, limit = 2, workerFn) => {
    const results = [];
    const executing = new Set();
    for (const item of items) {
      const p = Promise.resolve().then(() => workerFn(item));
      results.push(p);
      executing.add(p);
      const clean = () => executing.delete(p);
      p.then(clean).catch(clean);
      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }
    return Promise.all(results);
  };

  const handleBatchStart = async () => {
    if (selectedProjectIds.size === 0) return;
    const selectedList = projects.filter(p => selectedProjectIds.has(p.id));
    const total = selectedList.length;

    notify(`[并发限制: 2] 准备批量启动 ${total} 个策略并唤醒 Antigravity IDE...`);

    // 优先调用底层的原生批量并发通道 (原生 limit: 2)
    if (isElectron && window.electronAPI.pm2BatchStart) {
      try {
        const batchResults = await window.electronAPI.pm2BatchStart(selectedList, 2);
        const successCount = (batchResults || []).filter(r => r.success).length;
        notify(`🎉 批量启动就绪！成功拉起 ${successCount}/${total} 个策略（严格并发限制: 2，已连接 IDE）`);
        refreshData();
        return;
      } catch (err) {
        console.warn('调用底层批量管道降级至前端并发池:', err);
      }
    }

    // 前端平滑并发池双重保障 (严格保证同一时刻最多 2 个启动任务在飞行)
    let completed = 0;
    let successCount = 0;
    await runWithConcurrencyLimit(selectedList, 2, async (proj) => {
      try {
        notify(`[并发限制: 2] 正在启动 (${completed + 1}/${total})「${proj.name}」...`);
        await window.electronAPI.pm2StartProject(proj);
        successCount++;
      } catch (e) {
        console.error('启动异常:', proj.name, e);
      } finally {
        completed++;
        // 每个启动后稍作 200ms 缓冲，保证系统 PID 分配平稳
        await new Promise(r => setTimeout(r, 200));
      }
    });

    notify(`🎉 批量启动完成！成功拉起 ${successCount}/${total} 个策略（严格并发限制: 2，已连接 IDE）`);
    refreshData();
  };

  const handleBatchStop = async () => {
    if (selectedProjectIds.size === 0) return;
    notify(`正在批量停止 ${selectedProjectIds.size} 个策略...`);
    const selectedList = projects.filter(p => selectedProjectIds.has(p.id));
    for (const proj of selectedList) {
      try {
        await window.electronAPI.pm2Action('stop', proj.name);
      } catch (e) {}
    }
    notify(`已批量停止所选进程`);
    refreshData();
  };

  const handleBatchArchive = async () => {
    if (selectedProjectIds.size === 0) return;
    const count = selectedProjectIds.size;
    const updated = projects.map(p => {
      if (selectedProjectIds.has(p.id)) return { ...p, stage: 'archived' };
      return p;
    });
    await saveProjectsToStorage(updated);
    setSelectedProjectIds(new Set());
    notify(`已将 ${count} 项策略批量移入「档案馆」`);
  };

  const handleBatchRestore = async () => {
    if (selectedProjectIds.size === 0) return;
    const count = selectedProjectIds.size;
    const updated = projects.map(p => {
      if (selectedProjectIds.has(p.id)) return { ...p, stage: 'paper' };
      return p;
    });
    await saveProjectsToStorage(updated);
    setSelectedProjectIds(new Set());
    notify(`已从档案馆批量恢复 ${count} 项策略至测试池！`);
  };

  const handleBatchDelete = async () => {
    if (selectedProjectIds.size === 0) return;
    const count = selectedProjectIds.size;
    if (!confirm(`⚠️ 危险操作：确定要彻底永久删除选中的 ${count} 个项目吗？`)) return;
    const updated = projects.filter(p => !selectedProjectIds.has(p.id));
    await saveProjectsToStorage(updated);
    setSelectedProjectIds(new Set());
    notify(`已彻底删除 ${count} 个项目`);
  };

  // 桥接 UsagePanel 数据请求
  const fetchJson = async (endpoint) => {
    if (endpoint === '/api/processes') {
      return processes.map(proc => ({
        pid: proc.pid,
        name: proc.name,
        status: proc.pm2_env?.status || 'unknown',
        cpu: proc.monit?.cpu || 0,
        memory: proc.monit?.memory || 0,
        uptime: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : 0
      }));
    }
    if (endpoint === '/api/usage') {
      return {
        status: "ok",
        usage: {
          total: { tokens: processes.length },
          days: []
        }
      };
    }
    return {};
  };

  // 计算子任务完成统计
  const getSubtaskStats = (subtasks = []) => {
    if (subtasks.length === 0) return { total: 0, done: 0, percent: 0 };
    const done = subtasks.filter(st => st.completed).length;
    return {
      total: subtasks.length,
      done,
      percent: Math.round((done / subtasks.length) * 100)
    };
  };

  // 优先级标签样式映射
  const getPriorityBadge = (p) => {
    switch (p) {
      case 'P0': return { bg: 'rgba(239, 68, 68, 0.18)', border: '#ef4444', text: '#fca5a5', label: 'P0 核心' };
      case 'P1': return { bg: 'rgba(245, 158, 11, 0.18)', border: '#f59e0b', text: '#fcd34d', label: 'P1 标准' };
      default: return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#7dd3fc', label: 'P2 观察' };
    }
  };

  // 提取所有现存策略流派
  const allCategories = useMemo(() => {
    const set = new Set(projects.map(p => p.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [projects]);

  // 全局搜索与分类过滤
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.script && p.script.toLowerCase().includes(q))
      );
    }
    if (filterCategory !== 'ALL') {
      list = list.filter(p => p.category === filterCategory);
    }
    return list;
  }, [projects, searchQuery, filterCategory]);

  // 多维排序 (表格视图)
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    const { field, order } = sortConfig;
    list.sort((a, b) => {
      let valA, valB;
      if (field === 'sharpe') {
        valA = parseFloat(a.metrics?.sharpe) || 0;
        valB = parseFloat(b.metrics?.sharpe) || 0;
      } else if (field === 'annualReturn') {
        valA = parseFloat(String(a.metrics?.annualReturn || '').replace(/[^0-9.-]/g, '')) || 0;
        valB = parseFloat(String(b.metrics?.annualReturn || '').replace(/[^0-9.-]/g, '')) || 0;
      } else if (field === 'maxDrawdown') {
        valA = parseFloat(String(a.metrics?.maxDrawdown || '').replace(/[^0-9.-]/g, '')) || 0;
        valB = parseFloat(String(b.metrics?.maxDrawdown || '').replace(/[^0-9.-]/g, '')) || 0;
      } else if (field === 'priority') {
        const pOrder = { P0: 3, P1: 2, P2: 1 };
        valA = pOrder[a.priority] || 0;
        valB = pOrder[b.priority] || 0;
      } else if (field === 'status') {
        const isOnlineA = processes.some(p => p.name === a.name && p.pm2_env?.status === 'online');
        const isOnlineB = processes.some(p => p.name === b.name && p.pm2_env?.status === 'online');
        valA = isOnlineA ? 1 : 0;
        valB = isOnlineB ? 1 : 0;
      } else {
        valA = (a[field] || '').toLowerCase();
        valB = (b[field] || '').toLowerCase();
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredProjects, sortConfig, processes]);

  const onlineCount = useMemo(() => processes.filter(p => p.pm2_env?.status === 'online').length, [processes]);
  const archivedCount = useMemo(() => projects.filter(p => p.stage === 'archived').length, [projects]);

  // 当前视口应展示的项目列表（常规视图展示非归档，档案馆展示归档项目）
  const activeViewProjects = useMemo(() => {
    if (view === 'archive') {
      return filteredProjects.filter(p => p.stage === 'archived');
    }
    return filteredProjects.filter(p => p.stage !== 'archived');
  }, [filteredProjects, view]);

  const isAllSelected = activeViewProjects.length > 0 && activeViewProjects.every(p => selectedProjectIds.has(p.id));

  // 甘特图时间轴周期辅助
  const ganttTimeline = useMemo(() => ({
    months: [
      { label: '9月上旬' },
      { label: '9月中旬' },
      { label: '9月下旬' },
      { label: '10月上旬' },
      { label: '10月中旬' },
      { label: '10月下旬' },
      { label: '11月及以后' }
    ]
  }), []);

  const getGanttPosition = (startDate, dueDate) => {
    try {
      const base = new Date('2026-09-01').getTime();
      const totalSpan = 90 * 24 * 3600 * 1000;
      const s = startDate ? new Date(startDate).getTime() : base;
      const d = dueDate ? new Date(dueDate).getTime() : base + 30 * 24 * 3600 * 1000;
      const leftPct = Math.max(0, Math.min(85, ((s - base) / totalSpan) * 100));
      const widthPct = Math.max(10, Math.min(80, ((d - s) / totalSpan) * 100));
      return { left: `${leftPct.toFixed(1)}%`, width: `${widthPct.toFixed(1)}%` };
    } catch (e) {
      return { left: '10%', width: '40%' };
    }
  };

  // 监控大屏分页与实时统计
  const [monitorPage, setMonitorPage] = useState(1);
  const [monitorPageSize, setMonitorPageSize] = useState(8);
  const [monitorStatusFilter, setMonitorStatusFilter] = useState('ALL'); // 'ALL' | 'online' | 'stopped'

  const monitorFilteredProjects = useMemo(() => {
    let list = projects.filter(p => p.stage !== 'archived');
    if (monitorStatusFilter === 'online') {
      list = list.filter(p => processes.some(proc => proc.name === p.name && proc.pm2_env?.status === 'online'));
    } else if (monitorStatusFilter === 'stopped') {
      list = list.filter(p => !processes.some(proc => proc.name === p.name && proc.pm2_env?.status === 'online'));
    }
    return list;
  }, [projects, processes, monitorStatusFilter]);

  const monitorTotalPages = Math.max(1, Math.ceil(monitorFilteredProjects.length / monitorPageSize));
  const paginatedMonitorProjects = useMemo(() => {
    const start = (monitorPage - 1) * monitorPageSize;
    return monitorFilteredProjects.slice(start, start + monitorPageSize);
  }, [monitorFilteredProjects, monitorPage, monitorPageSize]);

  // 监控概览数据汇总
  const totalMonitoredMemory = useMemo(() => {
    const bytes = processes.reduce((acc, p) => acc + (p.monit?.memory || 0), 0);
    return (bytes / 1024 / 1024).toFixed(1);
  }, [processes]);

  const totalMonitoredCpu = useMemo(() => {
    return processes.reduce((acc, p) => acc + (p.monit?.cpu || 0), 0).toFixed(1);
  }, [processes]);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 60% 0%, #161822 0%, #0b0c10 100%)',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }

        .glass-card {
          background: #111524;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 120px;
          transform: translateZ(0);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        }

        .btn {
          padding: 6px 13px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #f1f5f9;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: #60a5fa;
          color: #fff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
        }
        .btn-danger {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        /* 主工作区核心视窗容器 (对标现代极简桌面设计) */
        .cx-main-workspace {
          flex: 1;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          min-width: 0;
          min-height: 0;
        }
        .cx-top-context-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 15, 23, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          flex-shrink: 0;
          z-index: 10;
        }

        /* Codex-X 风格左侧高质感快捷操作与全局导航栏 */
        .cx-sidebar {
          width: 236px;
          background: rgba(13, 15, 23, 0.96);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 60;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .cx-sidebar.collapsed {
          width: 68px;
        }
        .cx-brand {
          padding: 14px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.15);
        }
        .cx-brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 60%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #fff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
          cursor: pointer;
        }
        .cx-collapse-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .cx-collapse-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }
        .cx-nav-section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          padding: 12px 14px 4px;
          white-space: nowrap;
        }
        .cx-sidebar.collapsed .cx-nav-section-title {
          text-align: center;
          padding: 10px 0 2px;
          font-size: 9px;
        }
        .cx-nav-item {
          width: calc(100% - 14px);
          margin: 2px 7px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          position: relative;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .cx-sidebar.collapsed .cx-nav-item {
          width: calc(100% - 12px);
          margin: 3px 6px;
          justify-content: center;
          padding: 9px 0;
        }
        .cx-nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f1f5f9;
        }
        .cx-nav-item.active {
          background: rgba(59, 130, 246, 0.14);
          border-color: rgba(59, 130, 246, 0.35);
          color: #60a5fa;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
        }
        .cx-nav-active-mark {
          position: absolute;
          left: -7px;
          top: 7px;
          bottom: 7px;
          width: 3px;
          background: #3b82f6;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 8px #3b82f6;
          display: none;
        }
        .cx-nav-item.active .cx-nav-active-mark {
          display: block;
        }
        .cx-nav-badge {
          margin-left: auto;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-weight: 600;
        }
        .cx-quick-action-btn {
          width: calc(100% - 14px);
          margin: 3px 7px;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .cx-sidebar.collapsed .cx-quick-action-btn {
          width: calc(100% - 12px);
          margin: 3px 6px;
          justify-content: center;
          padding: 8px 0;
        }
        .cx-quick-action-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
          transform: translateY(-1px);
        }
        .cx-sidebar-footer {
          margin-top: auto;
          padding: 12px 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(9, 11, 16, 0.7);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cx-status-card {
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
        }
        .pulse-green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: pulseGreen 2s infinite;
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        /* 看板泳道 */
        .kanban-col {
          flex: 1;
          min-width: 270px;
          background: rgba(15, 17, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 120px);
          transition: border-color 0.2s, background 0.2s;
        }
        .kanban-col.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.08);
        }
        .kanban-col-head {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .kanban-col-body,
        .kanban-cards-container {
          padding: 8px 10px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* 策略卡片 (对标 Kanri & Vikunja 极致克制排版) */
        .strategy-card,
        .project-card {
          padding: 10px 12px;
          background: rgba(24, 28, 42, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 8px;
          cursor: grab;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          user-select: none;
        }
        .strategy-card:hover,
        .project-card:hover {
          transform: translateY(-1.5px);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(30, 35, 54, 0.85);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
        .strategy-card.selected,
        .project-card.selected {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.1);
        }
        .strategy-card.is-dragging,
        .project-card.dragging {
          opacity: 0.35;
          transform: scale(0.98);
        }

        /* 微型指标徽章 (夏普、年化、回撤) */
        .metric-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #cbd5e1;
          line-height: 1.2;
        }

        /* 微型标签药丸 (优先级、分类、git) */
        .tag-pill {
          display: inline-flex;
          align-items: center;
          font-size: 9.5px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }
        .tag-category {
          background: rgba(148, 163, 184, 0.12);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .tag-git {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        /* 优先级徽章 */
        .badge-priority {
          font-size: 9.5px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.03em;
        }
        .badge-priority.P0 { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
        .badge-priority.P1 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
        .badge-priority.P2 { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }

        /* 状态指示点 */
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot.online { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        .status-dot.stopped { background: #64748b; }
        .status-dot.errored { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

        /* 甘特图时间轴 */
        .gantt-row {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }
        .gantt-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .gantt-bar {
          position: absolute;
          height: 20px;
          border-radius: 4px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          opacity: 0.85;
          display: flex;
          align-items: center;
          padding: 0 8px;
          font-size: 11px;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.2s ease;
        }
        .gantt-bar:hover {
          opacity: 1;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
        }
        .gantt-bar-sub {
          position: absolute;
          height: 14px;
          border-radius: 3px;
          background: linear-gradient(90deg, #10b981, #059669);
          opacity: 0.8;
          font-size: 10px;
          display: flex;
          align-items: center;
          padding: 0 6px;
          color: #fff;
        }

        /* 树状清单 (List View) */
        .tree-project-header {
          padding: 12px 16px;
          background: rgba(22, 26, 38, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .tree-project-header:hover {
          background: rgba(30, 35, 52, 0.8);
        }
        .tree-subtasks-container {
          padding: 8px 16px 14px 44px;
          background: rgba(15, 17, 24, 0.5);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tree-subtask-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 12px;
          transition: all 0.15s;
        }
        .tree-subtask-row:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .progress-bar-track {
          height: 5px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #22c55e);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .log-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 640px;
          max-width: 92vw;
          height: 100vh;
          background: #0e1018;
          border-left: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: -12px 0 50px rgba(0, 0, 0, 0.85);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .terminal-box {
          flex: 1 1 0%;
          min-height: 0;
          overflow-y: auto !important;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }
        .log-drawer.open {
          transform: translateX(0);
        }

        .doctor-card {
          padding: 14px 16px;
          background: rgba(18, 22, 32, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          text-align: left;
        }
        .custom-table th {
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-weight: 600;
          font-size: 11px;
          white-space: nowrap;
        }
        .custom-table td {
          padding: 7px 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #cbd5e1;
          font-size: 11px;
          white-space: nowrap;
        }
        .custom-table tr:hover td {
          background: rgba(255, 255, 255, 0.03);
        }
        .custom-table tr.selected td {
          background: rgba(59, 130, 246, 0.08);
        }
        .sortable-th {
          cursor: pointer;
          user-select: none;
        }
        .sortable-th:hover {
          color: #f1f5f9;
        }

        .checkbox-custom {
          width: 13px;
          height: 13px;
          border-radius: 3px;
          cursor: pointer;
          accent-color: #3b82f6;
        }
      `}</style>

      {/* 🚀 Codex-X 启发式：左侧高质感快捷操作与全局导航栏 */}
      <aside className={`cx-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* 顶部品牌与折叠开关 */}
        <div className="cx-brand">
          <div className="cx-brand-mark" title="Antigravity PM - 量化与智能体工坊" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            ⚡
          </div>
          {!sidebarCollapsed && (
            <div className="cx-brand-copy">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
                  Antigravity PM
                </h1>
                <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 600 }}>
                  v3.2
                </span>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0' }}>
                量化策略 · 智能体 · 进程守护
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="cx-collapse-btn"
            title={sidebarCollapsed ? "展开左侧快捷栏" : "折叠左侧快捷栏"}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* 核心多维视图导航 */}
        <div className="cx-nav-section-title">
          {!sidebarCollapsed ? '工作台多维视图' : '视图'}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            type="button"
            className={`cx-nav-item ${view === 'kanban' ? 'active' : ''}`}
            onClick={() => setView('kanban')}
            title="📌 策略看板"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📌</span>
            {!sidebarCollapsed && <span>策略看板</span>}
            {!sidebarCollapsed && onlineCount > 0 && (
              <span className="cx-nav-badge" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
                {onlineCount} 活跃
              </span>
            )}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'gantt' ? 'active' : ''}`}
            onClick={() => setView('gantt')}
            title="📊 排期甘特图"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📊</span>
            {!sidebarCollapsed && <span>排期甘特图</span>}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            title="📋 树状清单"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📋</span>
            {!sidebarCollapsed && <span>树状清单</span>}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'table' ? 'active' : ''}`}
            onClick={() => setView('table')}
            title="📑 指标矩阵表格"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📑</span>
            {!sidebarCollapsed && <span>指标表格</span>}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'archive' ? 'active' : ''}`}
            onClick={() => setView('archive')}
            title="📦 档案馆 (Archive Vault)"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📦</span>
            {!sidebarCollapsed && <span>策略档案馆</span>}
            {!sidebarCollapsed && archivedCount > 0 && (
              <span className="cx-nav-badge" style={{ background: 'rgba(100,116,139,0.3)', color: '#94a3b8' }}>
                {archivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'knowledge' ? 'active' : ''}`}
            onClick={() => { setView('knowledge'); loadKnowledgeVault(); }}
            title="🧠 双核投研智库 (本地私密库 + 腾讯 ima)"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>🧠</span>
            {!sidebarCollapsed && <span>投研智库</span>}
            {!sidebarCollapsed && (
              <span className="cx-nav-badge" style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                双核
              </span>
            )}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'skills' ? 'active' : ''}`}
            onClick={() => setView('skills')}
            title="🧩 技能与专家团中心 (Skill & Agent Matrix)"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>🧩</span>
            {!sidebarCollapsed && <span>技能 & 专家团</span>}
            {!sidebarCollapsed && (
              <span className="cx-nav-badge" style={{ background: 'rgba(168,85,247,0.25)', color: '#d8b4fe' }}>
                20+
              </span>
            )}
          </button>

          <button
            type="button"
            className={`cx-nav-item ${view === 'monitor' ? 'active' : ''}`}
            onClick={() => setView('monitor')}
            title="📈 运行监控大屏"
          >
            <span className="cx-nav-active-mark" />
            <span style={{ fontSize: '15px' }}>📈</span>
            {!sidebarCollapsed && <span>监控大屏</span>}
          </button>
        </nav>

        {/* 快捷操作区 (Codex-X Quick Actions) */}
        <div className="cx-nav-section-title" style={{ marginTop: '16px' }}>
          {!sidebarCollapsed ? '快捷操作与工具' : '操作'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={() => { setEditingProject(null); setShowAddModal(true); }}
            title="新增量化策略或智能体"
          >
            <span style={{ fontSize: '15px' }}>➕</span>
            {!sidebarCollapsed && <span>新建策略/项目</span>}
          </button>

          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={() => openLogDrawer(projects[0] || { name: 'antigravity-pm' })}
            title="【💬 对话记录】侧边栏查看您与AI专家团的历史对话记录"
          >
            <span style={{ fontSize: '15px' }}>💬</span>
            {!sidebarCollapsed && <span>💬 对话记录</span>}
          </button>

          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={openDoctorModal}
            title="检测本机 Python、Git、PM2 通道与系统内存状态"
          >
            <span style={{ fontSize: '15px' }}>🩺</span>
            {!sidebarCollapsed && <span>系统环境自检</span>}
          </button>

          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={handleSyncWithIde}
            disabled={syncingIde}
            title="一键与 Antigravity IDE 共享数据库刷新同步，自动纳入新项目并同步任务进度"
            style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
          >
            <span style={{ fontSize: '15px' }}>{syncingIde ? '⏳' : '⚡'}</span>
            {!sidebarCollapsed && <span>{syncingIde ? '正在同步...' : '一键同步 IDE'}</span>}
          </button>

          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={handleScanAll}
            title="扫描本地所有 Antigravity 策略项目、游戏工坊及技能专家团全生态"
          >
            <span style={{ fontSize: '15px' }}>🔍</span>
            {!sidebarCollapsed && <span>导入本地全生态</span>}
          </button>

          <button
            type="button"
            className="cx-quick-action-btn"
            onClick={() => handleOpenInIde({ name: '量化策略根目录', cwd: '' })}
            title="在 Antigravity IDE 中打开主工作区"
          >
            <span style={{ fontSize: '15px' }}>💡</span>
            {!sidebarCollapsed && <span>唤醒连接 IDE</span>}
          </button>
        </div>

        {/* 底部运行状态指示器 (Codex-X Runtime Status Dock) */}
        <div className="cx-sidebar-footer">
          <div className="cx-status-indicator">
            <span className="cx-status-dot pulse-green" />
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9' }}>PM2 进程网关</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {onlineCount > 0 ? `${onlineCount} 个服务实时在线` : '就绪等待调度'}
                </span>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="cx-status-indicator" style={{ borderTop: 'none', paddingTop: 0 }}>
              <span className="cx-status-dot" style={{ background: '#38bdf8' }} />
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9' }}>Antigravity IDE</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>IPC 协议双向互联</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 🚀 主工作区视窗 (Main Workspace Window) */}
      <div className="cx-main-workspace">
        {/* 顶部轻量级上下文与快速操作栏 */}
        <header className="cx-top-context-bar" style={{ padding: '8px 16px', minHeight: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>
              {view === 'kanban' && '📌'}
              {view === 'gantt' && '📊'}
              {view === 'list' && '📋'}
              {view === 'table' && '📑'}
              {view === 'archive' && '📦'}
              {view === 'knowledge' && '🧠'}
              {view === 'skills' && '🧩'}
              {view === 'monitor' && '📈'}
            </span>
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {view === 'kanban' && '策略研发与执行看板 (Kanban)'}
                {view === 'gantt' && '排期甘特图 (Gantt Schedule)'}
                {view === 'list' && '多维策略清单 (Strategy Tree List)'}
                {view === 'table' && '指标矩阵表格 (Metrics Matrix)'}
                {view === 'archive' && '策略档案馆 (Archive Vault)'}
                {view === 'knowledge' && '双核投研知识智库 (Knowledge Hub · 腾讯 ima + 本地库)'}
                {view === 'skills' && '技能与专家团矩阵 (Skill & Agent Hub)'}
                {view === 'monitor' && '底层守护与资源监控大屏 (System Monitor)'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusMsg && (
              <span style={{ fontSize: '11px', color: '#38bdf8', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {statusMsg}
              </span>
            )}
            <button
              className="btn"
              onClick={handleSyncWithIde}
              disabled={syncingIde}
              title="与 Antigravity IDE 数据库一键刷新同步，自动纳入新增项目并更新任务进度"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '11.5px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(99, 102, 241, 0.16))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: 600
              }}
            >
              <span>{syncingIde ? '⏳' : '⚡'}</span>
              <span>{syncingIde ? '同步中...' : '一键同步 IDE'}</span>
            </button>
            <button className="btn" style={{ padding: '4px 9px', fontSize: '11.5px' }} onClick={refreshData} title="重新扫描进程与配置">
              🔄 刷新
            </button>
            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }} onClick={() => { setEditingProject(null); setShowAddModal(true); }}>
              ➕ 新增策略
            </button>
          </div>
        </header>

      {/* 搜索、分类与批量操作工具栏 */}
      {view !== 'monitor' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: 'rgba(18, 21, 30, 0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: '11px',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '320px' }}>
            {/* 全选复选框 */}
            <div
              onClick={handleToggleSelectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                padding: '3px 8px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              title="一键全选或反选当前视图所有策略"
            >
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={isAllSelected}
                onChange={() => {}}
                style={{ width: '13px', height: '13px' }}
              />
              <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 500 }}>
                {isAllSelected ? '取消全选' : '本页全选'}
              </span>
            </div>

            {/* 搜索框 */}
            <div style={{ position: 'relative', width: '230px' }}>
              <input
                type="text"
                placeholder="🔍 搜索策略名称、流派、描述..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 10px 4px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '11px',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '6px', top: '4px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* 流派分类快速筛选 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '10.5px' }}>流派:</span>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: filterCategory === cat ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)',
                    background: filterCategory === cat ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                    color: filterCategory === cat ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '10.5px',
                    fontWeight: 500,
                    transition: 'all 0.15s'
                  }}
                >
                  {cat === 'ALL' ? '全部流派' : cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>
              已展示 <strong style={{ color: '#38bdf8' }}>{activeViewProjects.length}</strong> / 全库 {projects.length} 项
            </span>
            {selectedProjectIds.size > 0 && (
              <span style={{ color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                已勾选 {selectedProjectIds.size} 项
              </span>
            )}
          </div>
        </div>
      )}

      {/* 主视图区域 (对标 Kanri / Vikunja：紧凑、全屏暗黑沉浸、无杂乱白边、支持子视图内部自适应滚动) */}
      <main style={{ flex: 1, minHeight: 0, padding: view === 'monitor' ? '0' : '10px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* 1. 看板视图 (Kanban) */}
        {view === 'kanban' && (
          <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'stretch', minHeight: '620px' }}>
            {KANBAN_STAGES.map((stage) => {
              const stageProjects = filteredProjects.filter(p => (p.stage || 'backlog') === stage.id);
              const isOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`kanban-col ${isOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                  onDragLeave={() => { if (dragOverStage === stage.id) setDragOverStage(null); }}
                  onDrop={(e) => { e.preventDefault(); handleDropOnStage(stage.id); }}
                >
                  <div className="kanban-col-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px' }}>{stage.icon}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{stage.title}</span>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: 600 }}>
                        {stageProjects.length}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                      {stage.id === 'live' ? '⚡拖入自动启动' : stage.desc}
                    </span>
                  </div>

                  <div className="kanban-cards-container">
                    {stageProjects.length === 0 ? (
                      <div className="kanban-empty-target" style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '16px', opacity: 0.6 }}>📥</span>
                        <span style={{ fontWeight: 500 }}>暂无策略卡片</span>
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>拖拽其他阶段卡片至此</span>
                      </div>
                    ) : (
                      stageProjects.map((proj) => {
                        const priority = getPriorityBadge(proj.priority);
                        const activeProc = processes.find(p => p.name === proj.name);
                        const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
                        const memoryMb = activeProc?.monit?.memory ? (activeProc.monit.memory / 1024 / 1024).toFixed(1) : 0;
                        const cpu = activeProc?.monit?.cpu || 0;
                        const stats = getSubtaskStats(proj.subtasks);
                        const isSelected = selectedProjectIds.has(proj.id);

                        return (
                          <div
                            key={proj.id}
                            className={`strategy-card ${isSelected ? 'selected' : ''} ${draggingProjectId === proj.id ? 'is-dragging' : ''}`}
                            draggable
                            onDragStart={() => setDraggingProjectId(proj.id)}
                            onDragEnd={() => { setDraggingProjectId(null); setDragOverStage(null); }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {/* 勾选框 */}
                                <input
                                  type="checkbox"
                                  className="checkbox-custom"
                                  checked={isSelected}
                                  onChange={() => toggleSelectProject(proj.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  title="勾选此项参与批量操作"
                                  style={{ width: '13px', height: '13px' }}
                                />
                                <span className="tag-pill" style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}>
                                  {priority.label}
                                </span>
                                {proj.category && <span className="tag-pill tag-category">{proj.category}</span>}
                                {proj.isGitSynced !== false && <span className="tag-pill tag-git" title="已与本地策略库 .antigravity.json 同构">git</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isOnline && <span className="live-dot" title="PM2 常驻守护中" style={{ width: '6px', height: '6px' }} />}
                                <button
                                  className="btn"
                                  style={{
                                    padding: '2px 7px',
                                    fontSize: '10px',
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    borderColor: 'rgba(168, 85, 247, 0.4)',
                                    color: '#d8b4fe',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  onClick={(e) => { e.stopPropagation(); setActiveStaffProject(proj); }}
                                  title="【👥 管理团队】查看与勾选参与此项目的真人员工与AI专家团"
                                >
                                  👥 管理团队
                                </button>
                                <button
                                  className="btn"
                                  style={{
                                    padding: '2px 7px',
                                    fontSize: '10px',
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    borderColor: 'rgba(56, 189, 248, 0.4)',
                                    color: '#7dd3fc',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  onClick={(e) => { e.stopPropagation(); openLogDrawer(proj); }}
                                  title="【💬 对话记录】侧边栏查看您与AI专家团的历史对话与执行动态"
                                >
                                  💬 对话记录
                                </button>
                                <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }} onClick={() => openEditModal(proj)} title="编辑设置">
                                  ⚙️
                                </button>
                              </div>
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                              {proj.name}
                            </div>

                            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {proj.description || '暂无描述信息'}
                            </p>

                            {/* 最后修改日期展示 */}
                            <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>🕒 最后修改:</span>
                              <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                                {proj.lastModified || proj.dueDate || '2026-09-05'}
                              </span>
                            </div>

                            {/* 任务进度 */}
                            {stats.total > 0 && (
                              <div style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '3px' }}>
                                  <span>子任务 {stats.done}/{stats.total}</span>
                                  <span style={{ color: stats.percent === 100 ? '#4ade80' : '#60a5fa', fontWeight: 600 }}>{stats.percent}%</span>
                                </div>
                                <div className="progress-bar-bg" style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                  <div className="progress-bar-fill" style={{ width: `${stats.percent}%`, height: '100%' }} />
                                </div>
                              </div>
                            )}

                            {isQuantProject(proj) && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                {proj.metrics?.sharpe > 0 && (
                                  <span className="metric-badge"><span style={{ color: '#60a5fa' }}>夏普:</span> {proj.metrics.sharpe}</span>
                                )}
                                {proj.metrics?.annualReturn && (
                                  <span className="metric-badge"><span style={{ color: '#4ade80' }}>年化:</span> {proj.metrics.annualReturn}</span>
                                )}
                                {proj.metrics?.maxDrawdown && (
                                  <span className="metric-badge"><span style={{ color: '#f87171' }}>回撤:</span> {proj.metrics.maxDrawdown}</span>
                                )}
                              </div>
                            )}

                            {/* 主操作区 (按状态点亮) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '10px', color: '#64748b' }}>
                              <span style={{ fontFamily: 'monospace', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {isOnline ? `🟢 PID ${activeProc.pid}` : (proj.stage === 'archived' ? '📦 已归档' : '⚪ 就绪')}
                              </span>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                {/* 继续修改 (弹出 IDE 并记忆加载日志和专家团) */}
                                <button
                                  className="btn"
                                  style={{
                                    padding: '2px 7px',
                                    fontSize: '10px',
                                    background: 'rgba(147, 51, 234, 0.2)',
                                    borderColor: 'rgba(168, 85, 247, 0.5)',
                                    color: '#d8b4fe',
                                    fontWeight: 600
                                  }}
                                  onClick={(e) => { e.stopPropagation(); handleContinueWorking(proj); }}
                                  title="【✏️ 继续修改】唤醒 Antigravity IDE，记忆加载历史对话日志与已确定的专家团技能，无缝继续工作"
                                >
                                  ✏️ 继续修改
                                </button>

                                {/* 1. 试运行 */}
                                {!isOnline && proj.stage !== 'archived' && (
                                  <button
                                    className="btn"
                                    style={{
                                      padding: '2px 7px',
                                      fontSize: '10px',
                                      background: 'rgba(234, 179, 8, 0.15)',
                                      borderColor: 'rgba(234, 179, 8, 0.4)',
                                      color: '#fde047'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleDryRun(proj); }}
                                    title="【▶ 试运行】配置没调好？点它模拟跑一次，随便试，不伤实盘"
                                  >
                                    ▶ 试运行
                                  </button>
                                )}

                                {/* 2. 正式启动 / 暂停 / 继续 */}
                                {isOnline ? (
                                  <>
                                    <button
                                      className="btn btn-danger"
                                      style={{ padding: '2px 7px', fontSize: '10px' }}
                                      onClick={(e) => { e.stopPropagation(); handleAction('stop', proj.name); }}
                                      title="【⏸ 暂停】干到一半想停就停，处理好再继续"
                                    >
                                      ⏸ 暂停
                                    </button>
                                    <button
                                      className="btn"
                                      style={{ padding: '2px 5px', fontSize: '10px' }}
                                      onClick={(e) => { e.stopPropagation(); handleAction('restart', proj.name); }}
                                      title="重启守护"
                                    >
                                      🔄
                                    </button>
                                  </>
                                ) : (
                                  proj.stage !== 'archived' && (
                                    <button
                                      className="btn btn-primary"
                                      style={{
                                        padding: '2px 8px',
                                        fontSize: '10px',
                                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                        borderColor: '#22c55e',
                                        color: '#fff',
                                        fontWeight: 600
                                      }}
                                      onClick={(e) => { e.stopPropagation(); handleStart(proj); }}
                                      title="【🚀 正式启动】配置满意了，点它正式开始干活，24小时常驻守护"
                                    >
                                      🚀 正式启动
                                    </button>
                                  )
                                )}

                                {/* 3. 结束并归档 / 重新激活 */}
                                {proj.stage === 'archived' ? (
                                  <button
                                    className="btn"
                                    style={{ padding: '2px 7px', fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                                    onClick={(e) => { e.stopPropagation(); handleUnarchiveProject(proj); }}
                                    title="重新激活：从档案馆取回该策略继续推进"
                                  >
                                    🔄 重新激活
                                  </button>
                                ) : (
                                  <button
                                    className="btn"
                                    style={{ padding: '2px 6px', fontSize: '10px', opacity: 0.8 }}
                                    onClick={(e) => { e.stopPropagation(); handleArchiveProject(proj); }}
                                    title="【✅ 结束并归档】整个项目彻底干完了，点它存档，不会再被误改"
                                  >
                                    ✅ 结束并归档
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. 甘特图视图 (Gantt) */}
        {view === 'gantt' && (
          <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>量化研发推进甘特图</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>直观掌控各策略因子回测检验与实盘部署生命周期</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} /> 主策略周期
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22c55e' }} /> 已完成子任务
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#eab308' }} /> 进行中子任务
                </span>
              </div>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(15, 17, 24, 0.6)' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ width: '240px', padding: '8px 12px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                  策略工程 / 嵌套子任务
                </div>
                <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                  {ganttTimeline.months.map((m, i) => (
                    <div key={i} style={{ flex: 1, padding: '8px', fontSize: '10px', color: '#64748b', textAlign: 'center', borderRight: i < ganttTimeline.months.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none' }}>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeViewProjects.map(proj => {
                  const pos = getGanttPosition(proj.startDate, proj.dueDate);
                  const stats = getSubtaskStats(proj.subtasks);
                  const isExpanded = expandedProjects.has(proj.id);

                  return (
                    <React.Fragment key={proj.id}>
                      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', alignItems: 'center' }}>
                        <div
                          style={{ width: '240px', padding: '8px 12px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                          onClick={() => toggleExpand(proj.id)}
                        >
                          <span style={{ fontSize: '9px', color: '#64748b' }}>{isExpanded ? '▼' : '▶'}</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proj.name}
                          </span>
                        </div>
                        <div style={{ flex: 1, padding: '6px 10px', position: 'relative', height: '36px', display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              position: 'absolute',
                              left: pos.left,
                              width: pos.width,
                              height: '20px',
                              borderRadius: '5px',
                              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0 6px',
                              fontSize: '10px',
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden'
                            }}
                            title={`${proj.name} (${proj.startDate} ~ ${proj.dueDate})`}
                          >
                            <span>{proj.startDate} ~ {proj.dueDate}</span>
                            <span>{stats.percent}%</span>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (proj.subtasks || []).map(st => {
                        const stPos = getGanttPosition(st.startDate, st.dueDate);
                        return (
                          <div key={st.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.15)', alignItems: 'center' }}>
                            <div style={{ width: '240px', padding: '6px 12px 6px 28px', borderRight: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '10px' }}>{st.completed ? '✅' : '⏳'}</span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.title}</span>
                            </div>
                            <div style={{ flex: 1, padding: '4px 10px', position: 'relative', height: '28px', display: 'flex', alignItems: 'center' }}>
                              <div
                                style={{
                                  position: 'absolute',
                                  left: stPos.left,
                                  width: stPos.width,
                                  height: '14px',
                                  borderRadius: '3px',
                                  background: st.completed ? '#22c55e' : '#eab308',
                                  opacity: 0.85,
                                  boxShadow: st.completed ? '0 0 6px rgba(34, 197, 94, 0.3)' : 'none'
                                }}
                                title={`${st.title} (${st.startDate} ~ ${st.dueDate})`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. 树状清单视图 (Hierarchical List) */}
        {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>层级树状任务清单</h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>支持主策略与子任务树状展开、完成勾选与即时添加子项</p>
              </div>
            </div>

            {activeViewProjects.map(proj => {
              const stats = getSubtaskStats(proj.subtasks);
              const isExpanded = expandedProjects.has(proj.id);
              const activeProc = processes.find(p => p.name === proj.name);
              const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
              const isSelected = selectedProjectIds.has(proj.id);

              return (
                <div key={proj.id} className={`glass-card ${isSelected ? 'selected' : ''}`} style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        type="checkbox"
                        className="checkbox-custom"
                        checked={isSelected}
                        onChange={() => toggleSelectProject(proj.id)}
                        title="勾选此项"
                        style={{ width: '13px', height: '13px' }}
                      />
                      <button
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '10px' }}
                        onClick={() => toggleExpand(proj.id)}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{proj.name}</span>
                      <span className="tag-pill" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '9.5px' }}>
                        {proj.category}
                      </span>
                      {isOnline && <span className="live-dot" title="PM2 守护中" style={{ width: '6px', height: '6px' }} />}
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        子任务: {stats.done}/{stats.total}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        className="btn"
                        style={{ padding: '2px 7px', fontSize: '10.5px', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#d8b4fe', fontWeight: 600 }}
                        onClick={() => setActiveStaffProject(proj)}
                        title="【👥 管理团队】查看与勾选参与此项目的真人员工与AI专家团"
                      >
                        👥 管理团队
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '2px 7px', fontSize: '10.5px', background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc', fontWeight: 600 }}
                        onClick={() => openLogDrawer(proj)}
                        title="【💬 对话记录】侧边栏查看您与AI专家团的历史对话与执行动态"
                      >
                        💬 对话记录
                      </button>

                      {/* 1. 试玩一下 */}
                      {!isOnline && proj.stage !== 'archived' && (
                        <button
                          className="btn"
                          style={{ padding: '2px 7px', fontSize: '10.5px', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#fde047' }}
                          onClick={() => handleDryRun(proj)}
                          title="【▶ 试运行】模拟跑一次，随便试，不算正式干活"
                        >
                          ▶ 试运行
                        </button>
                      )}

                      {/* 2. 正式启动 / 暂停 */}
                      {isOnline ? (
                        <>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '2px 7px', fontSize: '10.5px' }}
                            onClick={() => handleAction('stop', proj.name)}
                            title="【⏸ 暂停】干到一半想停就停，处理好再继续"
                          >
                            ⏸ 暂停
                          </button>
                          <button className="btn" style={{ padding: '2px 5px', fontSize: '10.5px' }} onClick={() => handleAction('restart', proj.name)} title="重启守护">🔄</button>
                        </>
                      ) : (
                        proj.stage !== 'archived' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '2px 8px', fontSize: '10.5px', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#22c55e', color: '#fff', fontWeight: 600 }}
                            onClick={() => handleStart(proj)}
                            title="【🚀 正式启动】配置满意了，点它正式开始干活，24小时常驻守护"
                          >
                            🚀 正式启动
                          </button>
                        )
                      )}

                      {/* 3. 结束并归档 */}
                      {proj.stage === 'archived' ? (
                        <button
                          className="btn"
                          style={{ padding: '2px 7px', fontSize: '10.5px', background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                          onClick={() => handleUnarchiveProject(proj)}
                          title="重新激活：从档案馆取回该策略继续推进"
                        >
                          🔄 重新激活
                        </button>
                      ) : (
                        <button
                          className="btn"
                          style={{ padding: '2px 7px', fontSize: '10.5px', opacity: 0.85 }}
                          onClick={() => handleArchiveProject(proj)}
                          title="【✅ 结束并归档】整个项目彻底干完了，点它存档，不会再被误改"
                        >
                          ✅ 结束并归档
                        </button>
                      )}

                      <button className="btn" style={{ padding: '2px 5px', fontSize: '10.5px' }} onClick={() => openEditModal(proj)} title="编辑参数">✏️</button>
                      <button className="btn btn-danger" style={{ padding: '2px 5px', fontSize: '10.5px' }} onClick={() => handleDeleteProject(proj.id, proj.name)} title="删除策略">🗑️</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '14px', paddingLeft: '28px', borderLeft: '2px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(proj.subtasks || []).map(st => (
                        <div
                          key={st.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.25)',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => toggleSubtask(proj.id, st.id)}
                              style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                            />
                            <span style={{
                              fontSize: '13px',
                              color: st.completed ? '#64748b' : '#e2e8f0',
                              textDecoration: st.completed ? 'line-through' : 'none'
                            }}>
                              {st.title}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{st.startDate} ~ {st.dueDate}</span>
                            <button
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', opacity: 0.6 }}
                              onClick={() => handleDeleteSubtask(proj.id, st.id)}
                              title="删除子任务"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="text"
                          placeholder="➕ 输入新子任务（按回车添加）..."
                          value={subtaskInputs[proj.id] || ''}
                          onChange={e => setSubtaskInputs({ ...subtaskInputs, [proj.id]: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(proj.id); }}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        />
                        <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleAddSubtask(proj.id)}>
                          添加
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 4. 密集表格视图 (Table) */}
        {view === 'table' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '36px' }}>
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      title="全选"
                    />
                  </th>
                  <th style={{ width: '32px' }}></th>
                  <th className="sortable-th" onClick={() => handleSort('status')}>
                    守护状态 {sortConfig.field === 'status' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('name')}>
                    策略名称 {sortConfig.field === 'name' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('priority')}>
                    优先级 {sortConfig.field === 'priority' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('category')}>
                    流派 {sortConfig.field === 'category' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>子任务进度</th>
                  <th className="sortable-th" onClick={() => handleSort('sharpe')}>
                    夏普 Sharpe {sortConfig.field === 'sharpe' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('maxDrawdown')}>
                    最大回撤 {sortConfig.field === 'maxDrawdown' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('annualReturn')}>
                    年化收益 {sortConfig.field === 'annualReturn' && (sortConfig.order === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>排期周期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.filter(p => p.stage !== 'archived').map(proj => {
                  const activeProc = processes.find(p => p.name === proj.name);
                  const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
                  const priority = getPriorityBadge(proj.priority);
                  const stats = getSubtaskStats(proj.subtasks);
                  const isExpanded = expandedProjects.has(proj.id);
                  const isSelected = selectedProjectIds.has(proj.id);

                  return (
                    <React.Fragment key={proj.id}>
                      <tr className={isSelected ? 'selected' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox-custom"
                            checked={isSelected}
                            onChange={() => toggleSelectProject(proj.id)}
                          />
                        </td>
                        <td>
                          <button
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            onClick={() => toggleExpand(proj.id)}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#94a3b8' }} />
                            {isOnline ? '常驻守护中' : '已停止'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{proj.name}</td>
                        <td>
                          <span className="tag-pill" style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}>
                            {priority.label}
                          </span>
                        </td>
                        <td><span className="tag-pill tag-category">{proj.category}</span></td>
                        <td style={{ width: '140px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar-bg" style={{ flex: 1 }}>
                              <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }} />
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{stats.percent}%</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{isQuantProject(proj) ? (proj.metrics?.sharpe || '-') : '-'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#f87171' }}>{isQuantProject(proj) ? (proj.metrics?.maxDrawdown || '-') : '-'}</td>
                        <td style={{ fontFamily: 'monospace', color: '#4ade80' }}>{isQuantProject(proj) ? (proj.metrics?.annualReturn || '-') : '-'}</td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>{proj.startDate} ~ {proj.dueDate}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button className="btn" style={{ padding: '2px 6px', fontSize: '10px', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#d8b4fe' }} onClick={() => setActiveStaffProject(proj)} title="【👥 管理团队】查看与勾选参与专家团">👥 团队</button>
                            <button className="btn" style={{ padding: '2px 6px', fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }} onClick={() => openLogDrawer(proj)} title="【💬 对话记录】查看微信聊天流记录">💬 对话</button>
                            {!isOnline && proj.stage !== 'archived' && (
                              <button className="btn" style={{ padding: '2px 6px', fontSize: '10px', background: 'rgba(234, 179, 8, 0.15)', color: '#fde047' }} onClick={() => handleDryRun(proj)} title="【▶ 试运行】沙箱模拟试跑">▶ 试运行</button>
                            )}
                            {!isOnline ? (
                              proj.stage !== 'archived' && <button className="btn btn-primary" style={{ padding: '2px 7px', fontSize: '10px' }} onClick={() => handleStart(proj)} title="【🚀 正式启动】常驻守护">🚀 启动</button>
                            ) : (
                              <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleAction('stop', proj.name)} title="【⏸ 暂停】">⏸ 暂停</button>
                            )}
                            {proj.stage === 'archived' ? (
                              <button className="btn" style={{ padding: '2px 6px', fontSize: '10px', color: '#38bdf8' }} onClick={() => handleUnarchiveProject(proj)} title="重新激活">🔄 激活</button>
                            ) : (
                              <button className="btn" style={{ padding: '2px 6px', fontSize: '10px', opacity: 0.8 }} onClick={() => handleArchiveProject(proj)} title="【✅ 结束并归档】">✅ 归档</button>
                            )}
                            <button className="btn" style={{ padding: '2px 5px', fontSize: '10px' }} onClick={() => openEditModal(proj)}>⚙️</button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={12} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {(proj.subtasks || []).map(st => (
                                <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => toggleSubtask(proj.id, st.id)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ color: st.completed ? '#64748b' : '#cbd5e1', textDecoration: st.completed ? 'line-through' : 'none' }}>
                                      {st.title}
                                    </span>
                                  </div>
                                  <span style={{ color: '#64748b', fontSize: '11px' }}>{st.startDate} ~ {st.dueDate}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. 档案馆专属视图 (Archive Vault) */}
        {view === 'archive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span>📦</span> Antigravity 策略档案馆 (Archive Vault)
                </h2>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                  已结项、失效或历史策略的安全封存处。可随时恢复继续、在 IDE 中重访唤醒或彻底删除。
                </p>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                封存档案数: <strong style={{ color: '#38bdf8' }}>{activeViewProjects.length}</strong>
              </div>
            </div>

            {activeViewProjects.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px', opacity: 0.6 }}>📦</span>
                <h3 style={{ fontSize: '13px', color: '#f1f5f9' }}>档案馆暂无归档项目</h3>
                <p style={{ fontSize: '11px', color: '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
                  可在看板中将策略卡片拖入【已结项归档】列，或在清单/表格中点击【📦 归档】按钮，将历史策略安全封存于此。
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
                {activeViewProjects.map(proj => {
                  const priority = getPriorityBadge(proj.priority);
                  const stats = getSubtaskStats(proj.subtasks);
                  const isSelected = selectedProjectIds.has(proj.id);

                  return (
                    <div
                      key={proj.id}
                      className={`glass-card ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(20, 23, 33, 0.85)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="checkbox"
                              className="checkbox-custom"
                              checked={isSelected}
                              onChange={() => toggleSelectProject(proj.id)}
                              title="勾选此项"
                              style={{ width: '13px', height: '13px' }}
                            />
                            <span className="tag-pill" style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}>
                              {priority.label}
                            </span>
                            <span className="tag-pill tag-category">{proj.category}</span>
                            <span className="tag-pill" style={{ background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }}>已封存</span>
                          </div>

                          {/* 右上角固定大白话按钮：管理团队 + 对话记录 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              className="btn"
                              style={{
                                padding: '2px 7px',
                                fontSize: '10px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                borderColor: 'rgba(168, 85, 247, 0.4)',
                                color: '#d8b4fe',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onClick={() => setActiveStaffProject(proj)}
                              title="【👥 管理团队】查看与勾选参与此项目的真人员工与AI专家团"
                            >
                              👥 管理团队
                            </button>
                            <button
                              className="btn"
                              style={{
                                padding: '2px 7px',
                                fontSize: '10px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                borderColor: 'rgba(56, 189, 248, 0.4)',
                                color: '#7dd3fc',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onClick={() => openLogDrawer(proj)}
                              title="【💬 对话记录】侧边栏查看您与AI专家团的历史对话与执行动态"
                            >
                              💬 对话记录
                            </button>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                          {proj.name}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.35, marginBottom: '8px' }}>
                          {proj.description || '暂无描述信息'}
                        </p>

                        {isQuantProject(proj) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                            {proj.metrics?.sharpe > 0 && (
                              <span className="metric-badge"><span style={{ color: '#60a5fa' }}>夏普:</span> {proj.metrics.sharpe}</span>
                            )}
                            {proj.metrics?.annualReturn && (
                              <span className="metric-badge"><span style={{ color: '#4ade80' }}>年化:</span> {proj.metrics.annualReturn}</span>
                            )}
                            {proj.metrics?.maxDrawdown && (
                              <span className="metric-badge"><span style={{ color: '#f87171' }}>回撤:</span> {proj.metrics.maxDrawdown}</span>
                            )}
                          </div>
                        )}

                        <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '8px' }}>
                          工作目录: <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{proj.cwd}</span>
                        </div>
                      </div>

                      {/* 底部主操作区 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <button
                          className="btn"
                          style={{
                            padding: '3px 10px',
                            fontSize: '11px',
                            background: 'rgba(56, 189, 248, 0.15)',
                            borderColor: 'rgba(56, 189, 248, 0.4)',
                            color: '#38bdf8',
                            fontWeight: 600
                          }}
                          onClick={() => handleUnarchiveProject(proj)}
                          title="【🔄 重新激活】从档案馆取回该策略继续推进，恢复至模拟测试池"
                        >
                          🔄 重新激活
                        </button>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <button className="btn" style={{ padding: '2px 8px', fontSize: '10.5px' }} onClick={() => handleOpenInIde(proj)} title="在 Antigravity IDE 中打开工作区代码">
                            💡 打开IDE
                          </button>
                          <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '10.5px' }} onClick={() => handleDeleteProject(proj.id, proj.name)} title="从档案馆彻底删除">
                            🗑️ 彻底删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. 双核投研智库 (Knowledge Hub · 本地私密库 + 腾讯 ima) */}
        {view === 'knowledge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 110px)' }}>
            {/* Header banner */}
            <div className="glass-card" style={{
              padding: '16px 22px',
              background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.25), rgba(15, 23, 42, 0.8))',
              borderColor: 'rgba(56, 189, 248, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🧠</span> Antigravity 双核量化投研智库 (Knowledge Hub)
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(56,189,248,0.25)', color: '#7dd3fc', fontWeight: 600 }}>
                    本地私密 Markdown + 腾讯 ima 微信剪藏
                  </span>
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                  投研决策的大脑与资产库。前沿研报微信剪藏沉淀、策略白皮书制定与历史回撤失效事前验尸闭环。
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn"
                  onClick={handleOpenImaWorkbench}
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
                    borderColor: 'rgba(96, 165, 250, 0.4)',
                    color: '#93c5fd',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="在浏览器中打开腾讯 ima.copilot 个人知识库与研报问答工作台"
                >
                  <span>🌐</span> 唤醒腾讯 ima 工作台
                </button>
                <button
                  className="btn"
                  onClick={() => handleOpenNoteInIde(knowledgeData.vaultPath || './workspace\\knowledge_vault')}
                  title="在 Antigravity IDE 中打开本地智库目录"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>💡</span> 在 IDE 中打开智库
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateNoteModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>➕</span> 新建复盘笔记
                </button>
              </div>
            </div>

            {/* 子选项卡切换：本地智库 vs 腾讯 ima */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setKnowledgeTab('vault')}
                style={{
                  background: knowledgeTab === 'vault' ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                  color: knowledgeTab === 'vault' ? '#38bdf8' : '#94a3b8',
                  border: knowledgeTab === 'vault' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📂</span> 本地私密知识库 (Local Vault)
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
                  {knowledgeData.categories?.reduce((acc, c) => acc + (c.files?.length || 0), 0) || 0} 篇
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setKnowledgeTab('ima'); loadImaKnowledge(); }}
                style={{
                  background: knowledgeTab === 'ima' ? 'rgba(147, 51, 234, 0.16)' : 'transparent',
                  color: knowledgeTab === 'ima' ? '#c084fc' : '#94a3b8',
                  border: knowledgeTab === 'ima' ? '1px solid rgba(147, 51, 234, 0.35)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🌐</span> 腾讯 ima.copilot 投研大脑
                <span style={{ fontSize: '10px', background: 'rgba(168,85,247,0.2)', color: '#e9d5ff', padding: '1px 6px', borderRadius: '10px' }}>
                  微信生态
                </span>
              </button>
            </div>

            {/* 本地知识库面板 */}
            {knowledgeTab === 'vault' && (
              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
                {/* 左侧栏：分类与笔记列表 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>📑 笔记与白皮书列表</span>
                    <button
                      className="btn"
                      onClick={loadKnowledgeVault}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      title="刷新本地笔记"
                    >
                      {knowledgeLoading ? '加载中...' : '🔄 刷新'}
                    </button>
                  </div>

                  {/* 分类过滤器 */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      type="button"
                      onClick={() => setActiveCategoryFilter('ALL')}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: 'none',
                        background: activeCategoryFilter === 'ALL' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                        color: activeCategoryFilter === 'ALL' ? '#0f172a' : '#94a3b8',
                        fontWeight: activeCategoryFilter === 'ALL' ? 700 : 500
                      }}
                    >
                      全部
                    </button>
                    {knowledgeData.categories?.map(c => (
                      <button
                        key={c.categoryName}
                        type="button"
                        onClick={() => setActiveCategoryFilter(c.categoryName)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: 'none',
                          background: activeCategoryFilter === c.categoryName ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                          color: activeCategoryFilter === c.categoryName ? '#0f172a' : '#94a3b8',
                          fontWeight: activeCategoryFilter === c.categoryName ? 700 : 500
                        }}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>

                  {/* 笔记卡片滚动列表 */}
                  <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', transform: 'translateZ(0)', willChange: 'scroll-position', overscrollBehaviorY: 'contain' }}>
                    {knowledgeData.categories?.flatMap(cat => {
                      if (activeCategoryFilter !== 'ALL' && cat.categoryName !== activeCategoryFilter) return [];
                      return (cat.files || []).map(file => ({ ...file, categoryTitle: cat.title }));
                    }).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '12px' }}>
                        暂无文档，点击右上角【新建复盘笔记】新增
                      </div>
                    ) : (
                      knowledgeData.categories?.flatMap(cat => {
                        if (activeCategoryFilter !== 'ALL' && cat.categoryName !== activeCategoryFilter) return [];
                        return (cat.files || []).map(file => ({ ...file, categoryTitle: cat.title }));
                      }).map(file => {
                        const isSelected = selectedNote?.path === file.path;
                        return (
                          <div
                            key={file.path}
                            onClick={() => handleSelectNote(file)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                              border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                                {file.categoryTitle}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {new Date(file.mtime).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#f8fafc' : '#cbd5e1', marginBottom: '4px' }}>
                              {file.title}
                            </div>
                            {file.excerpt && (
                              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}>
                                {file.excerpt}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 右侧栏：笔记内容预览与交互 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px 24px' }}>
                  {selectedNote ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '4px' }}>
                            {selectedNote.relativePath}
                          </div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                            {selectedNote.title}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn"
                            onClick={() => handleOpenNoteInIde(selectedNote.path)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                            title="在 Antigravity IDE 中直接编辑此文档"
                          >
                            <span>💡</span> 在 IDE 中编辑
                          </button>
                          <button
                            className="btn"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedNote.path);
                              notify('已复制文件物理路径到剪贴板！');
                            }}
                            style={{ fontSize: '12px' }}
                            title="复制文件路径"
                          >
                            📋 复制路径
                          </button>
                        </div>
                      </div>

                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        fontFamily: 'Consolas, "Fira Code", monospace, sans-serif',
                        fontSize: '13px',
                        lineHeight: 1.7,
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap',
                        background: 'rgba(11, 15, 25, 0.4)',
                        padding: '16px 20px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}>
                        {noteContent}
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', color: '#64748b' }}>
                      <span style={{ fontSize: '36px' }}>📖</span>
                      <p style={{ fontSize: '13px' }}>请在左侧选择一篇投研笔记或白皮书进行阅读</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 腾讯 ima.copilot 专属协作大屏 */}
            {knowledgeTab === 'ima' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
                <div className="glass-card" style={{
                  padding: '28px',
                  background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.3), rgba(15, 23, 42, 0.9))',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🌐</span> 腾讯 ima.copilot · 投研阅读与知识工作台
                      </h3>
                      <p style={{ fontSize: '13px', color: '#c084fc', marginTop: '6px' }}>
                        微信官方团队出品 · 专为深度阅读、研报论文拆解与大模型知识问答打造的个人第二大脑
                      </p>
                    </div>
                    <button
                      className="btn"
                      onClick={handleOpenImaWorkbench}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
                      }}
                    >
                      🚀 立即打开腾讯 ima 工作台 (ima.qq.com)
                    </button>
                  </div>

                  {/* 核心价值三大卡片 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '10px' }}>
                    <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📲</div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>微信生态一键剪藏</h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        手机微信阅读公众号量化金工推文、产业分析时，长按“发送给 ima”，自动清洗格式并沉淀入库。
                      </p>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📑</div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>百页券商研报脑图与页码溯源</h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        拖入几十页的 PDF 财报与研报，ima 自动生成观点脑图，AI 问答精准定位到 PDF 原文页码，彻底杜绝幻觉。
                      </p>
                    </div>

                    <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '6px' }}>闭环回流至本地量化专家团</h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        将 ima 提炼出的优质因子与买卖点逻辑复制到本地智库，唤醒 Antigravity 专家团编写代码并在 PM 中守护运行。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 腾讯 ima 真实云端知识库资产与同步区 */}
                <div className="glass-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📚</span>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {imaKb?.kb_name || '微信用户的知识库'}
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', fontWeight: 600 }}>
                            ● 官方 OpenAPI 实时已连通
                          </span>
                        </h4>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          创建者: {imaKb?.creator || '微信用户'} · 云端条目数: <strong style={{ color: '#38bdf8' }}>{imaKb?.content_count || imaItems.length}</strong> 篇
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn"
                      onClick={loadImaKnowledge}
                      disabled={imaLoading}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{imaLoading ? '⏳' : '🔄'}</span>
                      <span>{imaLoading ? '同步中...' : '刷新云端剪藏'}</span>
                    </button>
                  </div>

                  {imaItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '12px' }}>
                      {imaLoading ? '正在通过 IMA OpenAPI 获取云端知识库条目...' : '点击上方【刷新云端剪藏】查看您在腾讯 ima 微信端剪藏的研报与文章'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
                      {imaItems.map((item, idx) => (
                        <div
                          key={item.media_id || idx}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '10px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
                                微信/知乎剪藏
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                                {item.media_id?.slice(0, 14)}...
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.4 }}>
                              {item.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <button
                              className="btn"
                              onClick={() => handleImportImaItem(item)}
                              style={{ fontSize: '11px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                              title="将此剪藏文章的核心信息一键保存到本地知识库"
                            >
                              📥 沉淀至本地智库
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 协同标准 SOP 卡片 */}
                <div className="glass-card" style={{ padding: '22px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> 腾讯 ima ➔ Antigravity PM 三步闭环落地指南
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>步骤 1：微信收集</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        微信关注绑定 ima.copilot，日常把好的研报文章一键转给它；
                      </div>
                    </div>
                    <div style={{ borderLeft: '3px solid #a855f7', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>步骤 2：沉淀至本地</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        在 PM 点击【➕ 新建复盘笔记】，将核心逻辑存入本地知识库，保护交易秘密；
                      </div>
                    </div>
                    <div style={{ borderLeft: '3px solid #22c55e', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>步骤 3：IDE 编写与实盘</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        点击【💡 在 IDE 中编辑】交给专家团写代码，再在 PM 看板拖拽推进到实盘守护。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. 技能与专家团中心 (Skill & Agent Matrix) */}
        {/* 7. 技能与专家团中心 (Skill & Agent Matrix) */}
        {view === 'skills' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            height: '100%',
            padding: '4px 6px 120px 4px',
            boxSizing: 'border-box'
          }}>
            {/* 顶部生态总览看板 */}
            <div className="glass-card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85), rgba(15, 23, 42, 0.9))', borderColor: 'rgba(168, 85, 247, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 6px' }}>
                    <span>🧩</span> Antigravity 多智能体项目管理中心 (纯净版)
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(168,85,247,0.3)', color: '#d8b4fe', fontWeight: 600 }}>
                      v1.1.0 纯净开源版 · 自由配置
                    </span>
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                    已深度集成到全局工作流。包含 9 大垂直专家决策圆桌与 18+ 底层核心量化/研发/UI/代码审查技能，全部支持与 Antigravity IDE 无缝互联、自动挂载调度与工程锁协同。
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* 视图切换模式：展开大卡片 vs 文本条目紧凑列表 */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0,0,0,0.45)',
                    padding: '3px 5px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSkillsDisplayMode('cards')}
                      className="btn"
                      style={{
                        padding: '4px 11px',
                        fontSize: '11px',
                        borderRadius: '5px',
                        background: skillsDisplayMode === 'cards' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(147, 51, 234, 0.5))' : 'transparent',
                        borderColor: skillsDisplayMode === 'cards' ? 'rgba(168, 85, 247, 0.7)' : 'transparent',
                        color: skillsDisplayMode === 'cards' ? '#faf5ff' : '#94a3b8',
                        fontWeight: skillsDisplayMode === 'cards' ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title="切换为卡片网格展开模式，查看丰富视觉与背景信息"
                    >
                      🗂️ 大卡片展开视图
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkillsDisplayMode('list')}
                      className="btn"
                      style={{
                        padding: '4px 11px',
                        fontSize: '11px',
                        borderRadius: '5px',
                        background: skillsDisplayMode === 'list' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.4), rgba(2, 132, 199, 0.5))' : 'transparent',
                        borderColor: skillsDisplayMode === 'list' ? 'rgba(56, 189, 248, 0.7)' : 'transparent',
                        color: skillsDisplayMode === 'list' ? '#f0f9ff' : '#94a3b8',
                        fontWeight: skillsDisplayMode === 'list' ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title="切换为文本条目紧凑列表模式，一目了然对比所有专家角色与完整职责"
                    >
                      📋 文本条目紧凑视图
                    </button>
                  </div>

                  {/* 一键恢复官方预设按钮 */}
                  <button
                    type="button"
                    onClick={handleResetToDefaultEco}
                    className="btn"
                    style={{
                      padding: '7px 14px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="恢复所有专家团和技能为官方默认初始配置"
                  >
                    <span>🔄</span>
                    <span>恢复官方默认预设</span>
                  </button>

                  {/* 唤醒 IDE 修改生态配置按钮 */}
                  <button
                    className="btn"
                    onClick={handleExportSkillsToIde}
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.35))',
                      borderColor: 'rgba(168, 85, 247, 0.65)',
                      color: '#f3e8ff',
                      padding: '7px 16px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      boxShadow: '0 4px 14px rgba(168, 85, 247, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                    title="在 Antigravity IDE 中列出全部专家团与技能清单，并直接唤醒 AI 询问您需要如何修改"
                  >
                    <span>💡</span>
                    <span>在 IDE 中编辑生态配置 (列出全部并询问)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 1. 九大垂直专家团队板块 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👥</span> 九大垂直专家团队 (Multi-Agent Decision Panels · 领域权威评分 1-5星)
                  </h3>
                  {/* 全选与批量操作栏 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={expertTeamsList.length > 0 && selectedTeamIds.size === expertTeamsList.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeamIds(new Set(expertTeamsList.map(t => t.id)));
                          } else {
                            setSelectedTeamIds(new Set());
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: '#a855f7' }}
                      />
                      <span>全选本组 ({selectedTeamIds.size}/{expertTeamsList.length})</span>
                    </label>

                    {selectedTeamIds.size > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleBatchTeamAction('enable')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.25)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}
                          title="批量恢复启用选中的专家团"
                        >
                          ✅ 批量启用
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchTeamAction('disable')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}
                          title="批量停用选中的专家团（暂停调度但保留配置）"
                        >
                          ⏸️ 批量禁用
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchTeamAction('delete')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}
                          title="批量从列表中删除选中的专家团"
                        >
                          🗑️ 批量删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: 600 }}>
                  共 {expertTeamsList.length} 组专家智囊团 (活跃中: {expertTeamsList.filter(t => t.enabled !== false).length} 组 · 已停用: {expertTeamsList.filter(t => t.enabled === false).length} 组)
                </span>
              </div>

              {/* 模式 A：大卡片展开视图 */}
              {skillsDisplayMode === 'cards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                  {expertTeamsList.map((team) => {
                    const isEnabled = team.enabled !== false;
                    const isChecked = selectedTeamIds.has(team.id);
                    return (
                      <div key={team.id} className="glass-card" style={{
                        padding: '18px 20px',
                        background: isEnabled ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                        borderColor: isChecked ? '#a855f7' : (isEnabled ? 'rgba(168, 85, 247, 0.25)' : 'rgba(148, 163, 184, 0.2)'),
                        borderStyle: isEnabled ? 'solid' : 'dashed',
                        opacity: isEnabled ? 1 : 0.68,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        transition: 'border-color 0.15s ease',
                        boxShadow: isEnabled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
                      }}>
                        <div>
                          {/* 团队头部与名称 + 勾选框 + 操作按钮 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  setSelectedTeamIds(prev => {
                                    const n = new Set(prev);
                                    if (e.target.checked) n.add(team.id);
                                    else n.delete(team.id);
                                    return n;
                                  });
                                }}
                                style={{ cursor: 'pointer', accentColor: '#a855f7', width: '15px', height: '15px' }}
                              />
                              <div style={{ fontSize: '14px', fontWeight: 700, color: isEnabled ? '#f1f5f9' : '#94a3b8', lineHeight: 1.35 }}>
                                {team.name}
                              </div>
                            </div>

                            {/* 状态指示与单项按钮 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isEnabled ? (
                                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#4ade80', fontWeight: 600 }}>
                                  🟢 活跃
                                </span>
                              ) : (
                                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontWeight: 600 }}>
                                  ⏸️ 已禁用
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleTeamEnabled(team.id)}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  background: isEnabled ? 'rgba(245, 158, 11, 0.15)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))',
                                  border: isEnabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.6)',
                                  color: isEnabled ? '#fbbf24' : '#86efac'
                                }}
                                title={isEnabled ? "停用此专家团（不可再被项目调用，但配置随时保留）" : "重新启用此专家团"}
                              >
                                {isEnabled ? '⏸️ 禁用' : '✅ 启用'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTeam(team.id)}
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '11px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#f87171'
                                }}
                                title="从列表中删除此专家团"
                              >
                                🗑️ 删除
                              </button>
                            </div>
                          </div>

                          {/* 团队 ID 与角色标签 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              ID: {team.id}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168,85,247,0.2)', color: '#d8b4fe', fontWeight: 600 }}>
                              {team.role}
                            </span>
                          </div>

                          {/* 领域评级与星级评分 (1-5星) */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              领域: <strong style={{ color: '#38bdf8' }}>{team.domain}</strong>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '12px', color: '#facc15', fontWeight: 700, letterSpacing: '0.5px' }}>
                                {team.stars}
                              </span>
                              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(250, 204, 21, 0.15)', color: '#fef08a', fontWeight: 600 }}>
                                领域评级
                              </span>
                            </div>
                          </div>

                          {/* 专家组成清单 */}
                          <div style={{ marginBottom: '10px', background: 'rgba(0,0,0,0.28)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>👥</span> 专家组成与项目角色清单 ({team.memberList.length} 位专家):
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.65 }}>
                              {team.memberList.map((m, mIdx) => (
                                <li key={mIdx}>{m}</li>
                              ))}
                            </ul>
                          </div>

                          {/* 详细中文功能介绍 */}
                          <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.65, marginBottom: '10px', wordBreak: 'break-word' }}>
                            <strong style={{ color: '#e2e8f0' }}>功能与工作流：</strong>{team.detailedDesc}
                          </div>
                        </div>

                        {/* 配属技能列表 */}
                        <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚡</span> 配属支撑技能清单 ({team.skills.length} 项):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {team.skills.map((sk, sIdx) => (
                              <span key={sIdx} style={{
                                fontSize: '10.5px',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                color: '#bae6fd'
                              }}>
                                ⚡ {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 模式 B：文本条目紧凑视图 (高信息密度清晰列表) */}
              {skillsDisplayMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {expertTeamsList.map((team, idx) => {
                    const isEnabled = team.enabled !== false;
                    const isChecked = selectedTeamIds.has(team.id);
                    return (
                      <div key={team.id} className="glass-card" style={{
                        padding: '14px 18px',
                        background: isEnabled ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.55)',
                        borderColor: isChecked ? '#a855f7' : (isEnabled ? 'rgba(168, 85, 247, 0.3)' : 'rgba(148, 163, 184, 0.2)'),
                        borderStyle: isEnabled ? 'solid' : 'dashed',
                        opacity: isEnabled ? 1 : 0.68,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: isEnabled ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setSelectedTeamIds(prev => {
                                  const n = new Set(prev);
                                  if (e.target.checked) n.add(team.id);
                                  else n.delete(team.id);
                                  return n;
                                });
                              }}
                              style={{ cursor: 'pointer', accentColor: '#a855f7', width: '15px', height: '15px' }}
                            />
                            <span style={{ fontSize: '13px', background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: isEnabled ? '#f8fafc' : '#94a3b8' }}>
                              {team.name}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                              ID: {team.id}
                            </span>
                            {isEnabled ? (
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#4ade80', fontWeight: 600 }}>
                                🟢 活跃
                              </span>
                            ) : (
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontWeight: 600 }}>
                                ⏸️ 已禁用 (不可调用)
                              </span>
                            )}
                          </div>

                          {/* 评级 + 操作按钮 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              {team.domain}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#facc15', fontWeight: 700 }}>
                              {team.stars}
                            </span>
                            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', fontWeight: 600 }}>
                              {team.role}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleTeamEnabled(team.id)}
                              style={{
                                padding: '2px 8px',
                                fontSize: '11px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                background: isEnabled ? 'rgba(245, 158, 11, 0.15)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))',
                                border: isEnabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.6)',
                                color: isEnabled ? '#fbbf24' : '#86efac'
                              }}
                              title={isEnabled ? "停用此专家团" : "重新启用"}
                            >
                              {isEnabled ? '⏸️ 禁用' : '✅ 启用'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team.id)}
                              style={{
                                padding: '2px 7px',
                                fontSize: '11px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#f87171'
                              }}
                              title="删除此专家团"
                            >
                              🗑️ 删除
                            </button>
                          </div>
                        </div>

                        {/* 专家成员清单 */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                          <span style={{ color: '#c084fc', fontWeight: 600 }}>👥 专家组成:</span>
                          {team.memberList.map((m, mIdx) => (
                            <span key={mIdx} style={{ background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {m}
                            </span>
                          ))}
                        </div>

                        {/* 详细功能工作流 */}
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          <strong style={{ color: '#e2e8f0' }}>功能与工作流：</strong>{team.detailedDesc}
                        </div>

                        {/* 配属技能 */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '10.5px' }}>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>⚡ 配属技能:</span>
                          {team.skills.map((sk, sIdx) => (
                            <span key={sIdx} style={{ color: '#7dd3fc', background: 'rgba(56, 189, 248, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. 核心底层技能插件矩阵板块 */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span> 核心底层技能插件矩阵 (Skill Registry · 英文名称（中文名称）· 领域1-5星打分)
                  </h3>
                  {/* 全选与批量操作栏 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={skillsList.length > 0 && selectedSkillIds.size === skillsList.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkillIds(new Set(skillsList.map(s => s.id)));
                          } else {
                            setSelectedSkillIds(new Set());
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: '#38bdf8' }}
                      />
                      <span>全选本组 ({selectedSkillIds.size}/{skillsList.length})</span>
                    </label>

                    {selectedSkillIds.size > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleBatchSkillAction('enable')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.25)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}
                          title="批量恢复启用选中的技能"
                        >
                          ✅ 批量启用
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchSkillAction('disable')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.5)', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}
                          title="批量停用选中的技能（项目中不可调用，但配置随时保留）"
                        >
                          ⏸️ 批量禁用
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchSkillAction('delete')}
                          style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}
                          title="批量从列表中删除选中的技能"
                        >
                          🗑️ 批量删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600 }}>
                  共 {skillsList.length} 项技能插件 (活跃中: {skillsList.filter(s => s.enabled !== false).length} 项 · 已停用: {skillsList.filter(s => s.enabled === false).length} 项)
                </span>
              </div>

              {/* 模式 A：大卡片展开视图 */}
              {skillsDisplayMode === 'cards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '14px' }}>
                  {skillsList.map((s) => {
                    const isEnabled = s.enabled !== false;
                    const isChecked = selectedSkillIds.has(s.id);
                    return (
                      <div key={s.id} className="glass-card" style={{
                        padding: '16px 18px',
                        borderRadius: '10px',
                        background: isEnabled ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                        borderColor: isChecked ? '#38bdf8' : (isEnabled ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.2)'),
                        borderStyle: isEnabled ? 'solid' : 'dashed',
                        opacity: isEnabled ? 1 : 0.68,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'border-color 0.15s ease',
                        boxShadow: isEnabled ? '0 4px 16px rgba(0,0,0,0.25)' : 'none'
                      }}>
                        <div>
                          {/* 标题 + 勾选框 + 操作按钮 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  setSelectedSkillIds(prev => {
                                    const n = new Set(prev);
                                    if (e.target.checked) n.add(s.id);
                                    else n.delete(s.id);
                                    return n;
                                  });
                                }}
                                style={{ cursor: 'pointer', accentColor: '#38bdf8', width: '15px', height: '15px' }}
                              />
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: isEnabled ? '#f1f5f9' : '#94a3b8', lineHeight: 1.35 }}>
                                {s.name}
                              </div>
                            </div>

                            {/* 状态与单项操作按钮 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isEnabled ? (
                                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#4ade80', fontWeight: 600 }}>
                                  🟢 活跃
                                </span>
                              ) : (
                                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontWeight: 600 }}>
                                  ⏸️ 已禁用
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleSkillEnabled(s.id)}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  background: isEnabled ? 'rgba(245, 158, 11, 0.15)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))',
                                  border: isEnabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.6)',
                                  color: isEnabled ? '#fbbf24' : '#86efac'
                                }}
                                title={isEnabled ? "停用此技能（不可再被策略调用，但保留在列表中随时可重新启用）" : "重新启用此技能"}
                              >
                                {isEnabled ? '⏸️ 禁用' : '✅ 启用'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(s.id)}
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '11px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#f87171'
                                }}
                                title="从列表中删除此技能"
                              >
                                🗑️ 删除
                              </button>
                            </div>
                          </div>

                          {/* 分类标签 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                              插件ID: {s.id}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(59,130,246,0.18)', color: '#60a5fa', fontWeight: 600 }}>
                              {s.type}
                            </span>
                          </div>

                          {/* 领域评级与星级评分 (1-5星) */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '5px', margin: '6px 0 10px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              领域: <strong style={{ color: '#38bdf8' }}>{s.domain}</strong>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11.5px', color: '#facc15', fontWeight: 700, letterSpacing: '0.5px' }}>
                                {s.stars}
                              </span>
                            </div>
                          </div>

                          {/* 详细中文功能文本介绍 */}
                          <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.6, wordBreak: 'break-word' }}>
                            {s.desc}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '10.5px', color: '#64748b' }}>
                          <span>{isEnabled ? '✓ 活跃随时可调度' : '⏸️ 暂停调用中'}</span>
                          <span style={{ color: isEnabled ? '#38bdf8' : '#94a3b8', fontWeight: 500 }}>
                            {isEnabled ? '• 开箱即用 · 零占位符' : '• 随时一键重新启用'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 模式 B：文本条目紧凑视图 (高信息密度清晰列表) */}
              {skillsDisplayMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {skillsList.map((s, idx) => {
                    const isEnabled = s.enabled !== false;
                    const isChecked = selectedSkillIds.has(s.id);
                    return (
                      <div key={s.id} className="glass-card" style={{
                        padding: '12px 16px',
                        background: isEnabled ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.55)',
                        borderColor: isChecked ? '#38bdf8' : (isEnabled ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.2)'),
                        borderStyle: isEnabled ? 'solid' : 'dashed',
                        opacity: isEnabled ? 1 : 0.68,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: isEnabled ? '0 2px 8px rgba(0,0,0,0.18)' : 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setSelectedSkillIds(prev => {
                                  const n = new Set(prev);
                                  if (e.target.checked) n.add(s.id);
                                  else n.delete(s.id);
                                  return n;
                                });
                              }}
                              style={{ cursor: 'pointer', accentColor: '#38bdf8', width: '15px', height: '15px' }}
                            />
                            <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: isEnabled ? '#f1f5f9' : '#94a3b8' }}>
                              {s.name}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                              ID: {s.id}
                            </span>
                            {isEnabled ? (
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#4ade80', fontWeight: 600 }}>
                                🟢 活跃
                              </span>
                            ) : (
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontWeight: 600 }}>
                                ⏸️ 已禁用 (不可调用)
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                              领域: {s.domain}
                            </span>
                            <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>
                              {s.stars}
                            </span>
                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 600 }}>
                              {s.type}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleSkillEnabled(s.id)}
                              style={{
                                padding: '2px 8px',
                                fontSize: '11px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                background: isEnabled ? 'rgba(245, 158, 11, 0.15)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))',
                                border: isEnabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.6)',
                                color: isEnabled ? '#fbbf24' : '#86efac'
                              }}
                              title={isEnabled ? "停用此技能" : "重新启用"}
                            >
                              {isEnabled ? '⏸️ 禁用' : '✅ 启用'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(s.id)}
                              style={{
                                padding: '2px 7px',
                                fontSize: '11px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#f87171'
                              }}
                              title="删除此技能"
                            >
                              🗑️ 删除
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {s.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'monitor' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: '14px 16px 40px 16px',
            transform: 'translateZ(0)',
            willChange: 'scroll-position',
            overscrollBehaviorY: 'contain'
          }}>
            {/* 顶部系统核心监控 KPI 指标卡 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  🟢
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>PM2 实时守护服务</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80' }}>
                    {onlineCount} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/ {projects.length} 项</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  🔒
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>批量拉起并发上限</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>
                    2 <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>并发阈值锁死</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  💾
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>受管进程内存总开销</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#c084fc' }}>
                    {totalMonitoredMemory} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>MB</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  ⚡
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>瞬时 CPU 平均负荷</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24' }}>
                    {totalMonitoredCpu}% <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>轻载平稳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 监控过滤与分页工具栏 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(18, 21, 30, 0.55)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '11px',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* 状态过滤 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>状态筛选:</span>
                {[
                  { id: 'ALL', label: '全部项目' },
                  { id: 'online', label: '🟢 常驻守护中' },
                  { id: 'stopped', label: '⚪ 已停止' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setMonitorStatusFilter(tab.id); setMonitorPage(1); }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: monitorStatusFilter === tab.id ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)',
                      background: monitorStatusFilter === tab.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                      color: monitorStatusFilter === tab.id ? '#60a5fa' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '10.5px',
                      fontWeight: 500,
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 分页控制区 (1.2.3页选择器与滚轮提示) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>
                  共 <strong style={{ color: '#38bdf8' }}>{monitorFilteredProjects.length}</strong> 个目标 · 支持鼠标滚轮滑动
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="btn"
                    disabled={monitorPage <= 1}
                    onClick={() => setMonitorPage(p => Math.max(1, p - 1))}
                    style={{ padding: '2px 6px', fontSize: '10.5px', opacity: monitorPage <= 1 ? 0.4 : 1 }}
                    title="上一页"
                  >
                    ◀
                  </button>

                  {/* 动态页码按钮 */}
                  {Array.from({ length: monitorTotalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setMonitorPage(p)}
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: monitorPage === p ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                        background: monitorPage === p ? '#3b82f6' : 'rgba(255,255,255,0.03)',
                        color: monitorPage === p ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        fontWeight: monitorPage === p ? 700 : 500,
                        transition: 'all 0.15s'
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="btn"
                    disabled={monitorPage >= monitorTotalPages}
                    onClick={() => setMonitorPage(p => Math.min(monitorTotalPages, p + 1))}
                    style={{ padding: '2px 6px', fontSize: '10.5px', opacity: monitorPage >= monitorTotalPages ? 0.4 : 1 }}
                    title="下一页"
                  >
                    ▶
                  </button>
                </div>

                {/* 每页容量 */}
                <select
                  value={monitorPageSize}
                  onChange={e => { setMonitorPageSize(Number(e.target.value)); setMonitorPage(1); }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    fontSize: '10.5px',
                    cursor: 'pointer'
                  }}
                >
                  <option value={6}>每页 6 项</option>
                  <option value={8}>每页 8 项</option>
                  <option value={12}>每页 12 项</option>
                  <option value={24}>每页 24 项</option>
                </select>
              </div>
            </div>

            {/* 策略监控卡片流 (支持鼠标滚轮顺畅向下滚动) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '10px'
            }}>
              {paginatedMonitorProjects.length === 0 ? (
                <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <span style={{ fontSize: '32px', opacity: 0.6 }}>🔍</span>
                  <div style={{ fontSize: '13px', marginTop: '8px', color: '#cbd5e1' }}>暂无符合条件的监控项目</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>请尝试调整状态筛选或新增量化策略</div>
                </div>
              ) : (
                paginatedMonitorProjects.map(proj => {
                  const activeProc = processes.find(p => p.name === proj.name);
                  const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
                  const pid = activeProc?.pid || '-';
                  const memoryMb = activeProc?.monit?.memory ? (activeProc.monit.memory / 1024 / 1024).toFixed(1) : 0;
                  const cpu = activeProc?.monit?.cpu || 0;
                  const restarts = activeProc?.pm2_env?.restart_time || 0;
                  const priority = getPriorityBadge(proj.priority);

                  return (
                    <div
                      key={proj.id}
                      className="glass-card"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                        border: isOnline ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
                        background: isOnline ? 'rgba(22, 34, 30, 0.7)' : 'rgba(22, 26, 38, 0.65)'
                      }}
                    >
                      <div>
                        {/* 顶部：优先级、流派与右上角固定操作 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span className="tag-pill" style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}>
                              {priority.label}
                            </span>
                            <span className="tag-pill tag-category">{proj.category || '通用'}</span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                              color: isOnline ? '#4ade80' : '#94a3b8',
                              border: isOnline ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(100, 116, 139, 0.2)'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#64748b' }} />
                              {isOnline ? '常驻中' : '就绪'}
                            </span>
                          </div>

                          {/* 右上角固定大白话按钮：管理团队 + 对话记录 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              className="btn"
                              style={{
                                padding: '2px 6px',
                                fontSize: '10px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                borderColor: 'rgba(168, 85, 247, 0.4)',
                                color: '#d8b4fe',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onClick={() => setActiveStaffProject(proj)}
                              title="【👥 管理团队】查看与勾选参与此项目的真人员工与AI专家团"
                            >
                              👥 团队
                            </button>
                            <button
                              className="btn"
                              style={{
                                padding: '2px 6px',
                                fontSize: '10px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                borderColor: 'rgba(56, 189, 248, 0.4)',
                                color: '#7dd3fc',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              onClick={() => openLogDrawer(proj)}
                              title="【💬 对话记录】侧边栏查看您与AI专家团的历史对话与执行动态"
                            >
                              💬 对话
                            </button>
                          </div>
                        </div>

                        {/* 策略标题 */}
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.name}
                        </div>

                        {/* 实时守护硬件参数 */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '6px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          fontSize: '10px',
                          textAlign: 'center'
                        }}>
                          <div>
                            <div style={{ color: '#64748b' }}>PID</div>
                            <div style={{ fontFamily: 'monospace', color: '#cbd5e1', fontWeight: 600 }}>{pid}</div>
                          </div>
                          <div>
                            <div style={{ color: '#64748b' }}>CPU</div>
                            <div style={{ fontFamily: 'monospace', color: isOnline && cpu > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>{cpu}%</div>
                          </div>
                          <div>
                            <div style={{ color: '#64748b' }}>内存占用</div>
                            <div style={{ fontFamily: 'monospace', color: isOnline ? '#38bdf8' : '#94a3b8', fontWeight: 600 }}>{memoryMb}MB</div>
                          </div>
                        </div>

                        {/* 策略量化表现微徽章 */}
                        {isQuantProject(proj) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                            {proj.metrics?.sharpe > 0 && (
                              <span className="metric-badge"><span style={{ color: '#60a5fa' }}>夏普:</span> {proj.metrics.sharpe}</span>
                            )}
                            {proj.metrics?.annualReturn && (
                              <span className="metric-badge"><span style={{ color: '#4ade80' }}>年化:</span> {proj.metrics.annualReturn}</span>
                            )}
                            {proj.metrics?.maxDrawdown && (
                              <span className="metric-badge"><span style={{ color: '#f87171' }}>回撤:</span> {proj.metrics.maxDrawdown}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 底部主操作区 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '10px' }}>
                        <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
                          {restarts > 0 ? `重启 ${restarts}次` : '稳定运行'}
                        </span>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* 试玩一下 */}
                          {!isOnline && proj.stage !== 'archived' && (
                            <button
                              className="btn"
                              style={{
                                padding: '2px 6px',
                                fontSize: '10px',
                                background: 'rgba(234, 179, 8, 0.15)',
                                borderColor: 'rgba(234, 179, 8, 0.4)',
                                color: '#fde047'
                              }}
                              onClick={() => handleDryRun(proj)}
                              title="【▶ 试运行】沙箱模拟跑一次，随便试，不伤实盘"
                            >
                              ▶ 试运行
                            </button>
                          )}

                          {/* 正式启动 / 暂停 */}
                          {isOnline ? (
                            <>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                onClick={() => handleAction('stop', proj.name)}
                                title="【⏸ 暂停】干到一半想停就停，处理好再继续"
                              >
                                ⏸ 暂停
                              </button>
                              <button
                                className="btn"
                                style={{ padding: '2px 5px', fontSize: '10px' }}
                                onClick={() => handleAction('restart', proj.name)}
                                title="重启守护"
                              >
                                🔄
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-primary"
                              style={{
                                padding: '2px 7px',
                                fontSize: '10px',
                                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                borderColor: '#22c55e',
                                color: '#fff',
                                fontWeight: 600
                              }}
                              onClick={() => handleStart(proj)}
                              title="【🚀 正式启动】配置满意了，点它正式开始干活，常驻守护"
                            >
                              🚀 启动
                            </button>
                          )}

                          <button
                            className="btn"
                            style={{ padding: '2px 5px', fontSize: '10px' }}
                            onClick={() => handleOpenInIde(proj)}
                            title="在 Antigravity IDE 中定位工作区"
                          >
                            💡
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 底部分页工具栏 (用户鼠标滚轮滑到底部时，无需滚回顶端即可直接点击 1.2.3 快速翻页) */}
            {monitorTotalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: 'rgba(18, 21, 30, 0.75)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '11px',
                marginTop: '6px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>
                  当前显示第 <strong style={{ color: '#38bdf8' }}>{monitorPage}</strong> / {monitorTotalPages} 页 (共 {monitorFilteredProjects.length} 个监控项目 · 可滚轮上下滚动)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="btn"
                    disabled={monitorPage <= 1}
                    onClick={() => setMonitorPage(p => Math.max(1, p - 1))}
                    style={{ padding: '2px 8px', fontSize: '10.5px', opacity: monitorPage <= 1 ? 0.4 : 1 }}
                  >
                    ◀ 上一页
                  </button>
                  {Array.from({ length: monitorTotalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setMonitorPage(p)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: monitorPage === p ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                        background: monitorPage === p ? '#3b82f6' : 'rgba(255,255,255,0.03)',
                        color: monitorPage === p ? '#fff' : '#cbd5e1',
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        fontWeight: monitorPage === p ? 700 : 500,
                        transition: 'all 0.15s'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="btn"
                    disabled={monitorPage >= monitorTotalPages}
                    onClick={() => setMonitorPage(p => Math.min(monitorTotalPages, p + 1))}
                    style={{ padding: '2px 8px', fontSize: '10.5px', opacity: monitorPage >= monitorTotalPages ? 0.4 : 1 }}
                  >
                    下一页 ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      </div> {/* end cx-main-workspace */}

      {/* 悬浮批量操作工具条 (Floating Batch Actions Bar) */}
      {selectedProjectIds.size > 0 && (
        <div className="batch-floating-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
              已选择 <span style={{ color: '#60a5fa', fontSize: '14px' }}>{selectedProjectIds.size}</span> 项策略
            </span>
          </div>

          <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />

          <button className="btn btn-primary" onClick={handleBatchStart} title="以最大并发数 2 顺序安全拉起所有勾选策略并连接 Antigravity IDE">
            🚀 批量启动 (并发上限: 2)
          </button>

          <button className="btn" onClick={handleBatchStop} title="批量停止守护">
            ⏹ 批量停止
          </button>

          {view !== 'archive' ? (
            <button className="btn" onClick={handleBatchArchive} title="批量移入档案馆封存">
              📦 批量归档
            </button>
          ) : (
            <button className="btn" style={{ borderColor: 'rgba(34, 197, 94, 0.4)', color: '#86efac' }} onClick={handleBatchRestore} title="批量恢复至模拟测试池">
              ♻️ 批量恢复继续
            </button>
          )}

          <button className="btn btn-danger" onClick={handleBatchDelete} title="批量彻底移除所选策略">
            🗑️ 批量删除
          </button>

          <button
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
            onClick={() => setSelectedProjectIds(new Set())}
            title="取消选择"
          >
            ✕ 取消
          </button>
        </div>
      )}

      {/* 新增 / 编辑策略模态弹窗 */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f8fafc' }}>
                {editingProject ? '编辑策略与周期配置' : '登记新量化策略工程'}
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>自动同步 .antigravity.json</span>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>策略名称 (PM2 进程名)</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 日内T0网格策略"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>看板所属阶段</label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: '#1c1f2b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  >
                    {KANBAN_STAGES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.title}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>优先级</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: '#1c1f2b', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  >
                    <option value="P0">P0 (核心重点)</option>
                    <option value="P1">P1 (常规标准)</option>
                    <option value="P2">P2 (次要观察)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>流派分类</label>
                  <input
                    type="text"
                    placeholder="趋势跟踪/套利/高频..."
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>截止/结项日期</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '7px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>入口脚本</label>
                  <input
                    type="text"
                    required
                    value={formData.script}
                    onChange={e => setFormData({ ...formData, script: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>工作根目录 (绝对路径)</label>
                  <input
                    type="text"
                    required
                    value={formData.cwd}
                    onChange={e => setFormData({ ...formData, cwd: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              {/* 筹备一栏：专家团与技能多选配置 */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯 筹备：指定专家团与支撑技能</span>
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>已选 {(formData.assignedAgents || []).length} 专家团 · {(formData.assignedSkills || []).length} 技能</span>
                </div>

                {/* 专家团多选 */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 500 }}>
                    🏛️ 选择专家团队 (可多选，点击切换选中状态)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', padding: '2px' }}>
                    {AVAILABLE_EXPERT_TEAMS.map(team => {
                      const isSelected = (formData.assignedAgents || []).includes(team.id);
                      return (
                        <div
                          key={team.id}
                          onClick={() => {
                            const current = formData.assignedAgents || [];
                            const next = isSelected ? current.filter(id => id !== team.id) : [...current, team.id];
                            setFormData({ ...formData, assignedAgents: next });
                          }}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                            background: isSelected ? 'rgba(168, 85, 247, 0.28)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isSelected ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: isSelected ? '#e9d5ff' : '#94a3b8'
                          }}
                          title={`${team.name} (评分: ${team.rating || 5}星)
${team.detailedDesc || team.desc || ''}`}
                        >
                          <span>{isSelected ? '☑️' : '◻️'}</span>
                          <span>{team.name}</span>
                          <span style={{ fontSize: '10px', color: '#fbbf24' }}>{'★'.repeat(Math.min(5, Math.floor(team.rating || 5)))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 技能多选 */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '5px', fontWeight: 500 }}>
                    ⚡ 选择挂载技能 (可多选，点击切换选中状态)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', padding: '2px' }}>
                    {skillsList.map(skill => {
                      const isSelected = (formData.assignedSkills || []).includes(skill.id);
                      return (
                        <div
                          key={skill.id}
                          onClick={() => {
                            const current = formData.assignedSkills || [];
                            const next = isSelected ? current.filter(id => id !== skill.id) : [...current, skill.id];
                            setFormData({ ...formData, assignedSkills: next });
                          }}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                            background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: isSelected ? '#bae6fd' : '#94a3b8'
                          }}
                          title={`${skill.name} (评分: ${skill.rating || 5}星)
${skill.detailedDesc || skill.desc || ''}`}
                        >
                          <span>{isSelected ? '☑️' : '◻️'}</span>
                          <span>{skill.name}</span>
                          <span style={{ fontSize: '10px', color: '#fbbf24' }}>{'★'.repeat(Math.min(5, Math.floor(skill.rating || 5)))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>策略描述与模型逻辑</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">保存策略</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💬 对话记录抽屉 (WeChat-style Conversation Stream) */}
      <div className={`drawer-overlay ${activeLogProject ? 'open' : ''}`} onClick={closeLogDrawer} />
      <div className={`log-drawer ${activeLogProject ? 'open' : ''}`}>
        {activeLogProject && (() => {
          const activeProc = processes.find(p => p.name === activeLogProject.name);
          const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
          const memoryMb = activeProc?.monit?.memory ? (activeProc.monit.memory / 1024 / 1024).toFixed(1) : 0;
          const cpu = activeProc?.monit?.cpu || 0;

          return (
            <>
              {/* 抽屉头部 */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(18, 21, 30, 0.95)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                        对话记录 · {activeLogProject.name}
                      </h3>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isOnline ? '#86efac' : '#fca5a5'
                      }}>
                        {isOnline ? '🟢 正式工作中' : '⚪ 已暂停'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                      像翻微信聊天记录一样，按时间从上到下查看您与AI专家的所有对话与工作流水
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="btn"
                    style={{ fontSize: '11px', padding: '4px 9px' }}
                    onClick={() => setLogAutoScroll(!logAutoScroll)}
                    title="切换自动滚动到底部"
                  >
                    {logAutoScroll ? '⬇️ 锁定最新' : '⏸️ 自由浏览'}
                  </button>
                  <button
                    onClick={closeLogDrawer}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                    title="关闭 (Esc)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 选项卡切换：IDE 专家对话记录 vs PM2 运行控制台 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 20px',
                background: 'rgba(15, 18, 26, 0.98)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                flexShrink: 0
              }}>
                <button
                  className="btn"
                  onClick={() => setLogTab('ide')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11.5px',
                    borderRadius: '6px',
                    fontWeight: logTab === 'ide' ? 600 : 400,
                    background: logTab === 'ide' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    borderColor: logTab === 'ide' ? 'rgba(56, 189, 248, 0.5)' : 'transparent',
                    color: logTab === 'ide' ? '#38bdf8' : '#94a3b8'
                  }}
                >
                  💬 IDE 对话记录 ({ideConversationLogs.length > 0 ? ideConversationLogs.length : '实时'})
                </button>
                <button
                  className="btn"
                  onClick={() => setLogTab('pm2')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11.5px',
                    borderRadius: '6px',
                    fontWeight: logTab === 'pm2' ? 600 : 400,
                    background: logTab === 'pm2' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                    borderColor: logTab === 'pm2' ? 'rgba(34, 197, 94, 0.5)' : 'transparent',
                    color: logTab === 'pm2' ? '#4ade80' : '#94a3b8'
                  }}
                >
                  💻 PM2 运行日志 ({logLines.length})
                </button>
              </div>

              {/* 微信式聊天记录流 / PM2 控制台输出流 (支持鼠标滚轮自由查看上下文) */}
              <div
                className="terminal-box"
                onWheel={(e) => {
                  if (e.deltaY < 0 && logAutoScroll) {
                    setLogAutoScroll(false);
                  }
                }}
                onScroll={(e) => {
                  if (scrollRafRef.current) return;
                  const target = e.currentTarget;
                  scrollRafRef.current = requestAnimationFrame(() => {
                    scrollRafRef.current = null;
                    if (!target) return;
                    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 60;
                    if (!isNearBottom && logAutoScroll) {
                      setLogAutoScroll(false);
                    } else if (isNearBottom && !logAutoScroll) {
                      setLogAutoScroll(true);
                    }
                  });
                }}
                style={{
                  flex: '1 1 0%',
                  minHeight: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                  scrollBehavior: 'smooth',
                  padding: '16px 20px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#0b0e17',
                  pointerEvents: 'auto'
                }}
              >
                <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
                  <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '2px 10px', borderRadius: '10px' }}>
                    {logTab === 'ide' ? '💡 当前为 Antigravity IDE 专家对话记录与流水 · 自动滚至最新' : '💡 当前为 PM2 策略脚本控制台标准输出 · 自动滚至最新'}
                  </span>
                </div>

                {/* 1. IDE 对话模式渲染 */}
                {logTab === 'ide' && (
                  ideConversationLogs && ideConversationLogs.length > 0 ? (
                    ideConversationLogs.map((item, idx) => {
                      const isUser = item.role === 'user';
                      const text = item.text || '';
                      if (isUser) {
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '4px 0' }}>
                            <div style={{
                              maxWidth: '82%',
                              background: 'rgba(56, 189, 248, 0.16)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              borderRadius: '10px 2px 10px 10px',
                              padding: '8px 12px',
                              color: '#f0f9ff'
                            }}>
                              <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '2px', fontWeight: 600 }}>
                                👤 我 (用户需求)
                              </div>
                              <div style={{ fontSize: '11.5px', lineHeight: 1.45, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {text}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', margin: '4px 0' }}>
                          <div style={{
                            maxWidth: '85%',
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.28)',
                            borderRadius: '2px 10px 10px 10px',
                            padding: '8px 12px',
                            color: '#f8fafc'
                          }}>
                            <div style={{ fontSize: '10px', color: '#c084fc', marginBottom: '2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>🤖 AI 专家决策组回复与推进</span>
                            </div>
                            <div style={{ fontSize: '11.5px', lineHeight: 1.45, wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                              {text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    logLines.map((line, idx) => {
                      const text = line.text || '';
                      const isErr = line.type === 'err' || text.toLowerCase().includes('error');
                      const isSys = line.type === 'sys' || text.startsWith('[SYS]');
                      const isUser = text.includes('我:') || text.includes('USER') || text.includes('用户提问');

                      if (isSys) {
                        return (
                          <div key={idx} style={{ textAlign: 'center', margin: '2px 0' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                              ⚙️ {text.replace('[SYS]', '').trim()}
                            </span>
                          </div>
                        );
                      }

                      if (isUser) {
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '4px 0' }}>
                            <div style={{
                              maxWidth: '82%',
                              background: 'rgba(56, 189, 248, 0.16)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              borderRadius: '10px 2px 10px 10px',
                              padding: '8px 12px',
                              color: '#f0f9ff'
                            }}>
                              <div style={{ fontSize: '10px', color: '#38bdf8', marginBottom: '2px', fontWeight: 600 }}>
                                👤 我
                              </div>
                              <div style={{ fontSize: '11.5px', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {text}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', margin: '4px 0' }}>
                          <div style={{
                            maxWidth: '85%',
                            background: isErr ? 'rgba(239, 68, 68, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                            border: `1px solid ${isErr ? 'rgba(239, 68, 68, 0.35)' : 'rgba(168, 85, 247, 0.28)'}`,
                            borderRadius: '2px 10px 10px 10px',
                            padding: '8px 12px',
                            color: isErr ? '#fca5a5' : '#f8fafc'
                          }}>
                            <div style={{ fontSize: '10px', color: isErr ? '#f87171' : '#c084fc', marginBottom: '2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{isErr ? '⚠️ 系统告警' : '🤖 AI专家团 / 自动化推进'}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                              {text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {/* 2. PM2 控制台日志模式渲染 */}
                {logTab === 'pm2' && (
                  logLines.map((line, idx) => {
                    const text = line.text || '';
                    const isErr = line.type === 'err' || text.toLowerCase().includes('error');
                    const isSys = line.type === 'sys' || text.startsWith('[SYS]');

                    if (isSys) {
                      return (
                        <div key={idx} style={{ textAlign: 'center', margin: '2px 0' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                            ⚙️ {text.replace('[SYS]', '').trim()}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: isErr ? '#f87171' : '#cbd5e1',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: isErr ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {text}
                      </div>
                    );
                  })
                )}

                {logLoading && (
                  <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '10.5px', color: '#94a3b8' }}>
                    ⏳ 正在刷新最新对话与动态...
                  </div>
                )}

                <div ref={terminalEndRef} />

                {/* ⬇️ 跳到最新 浮动按钮 */}
                <div style={{
                  position: 'sticky',
                  bottom: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  zIndex: 20,
                  marginTop: '6px'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLogAutoScroll(true);
                      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      padding: '5px 16px',
                      fontSize: '11px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(56, 189, 248, 0.55)',
                      color: '#38bdf8',
                      borderRadius: '20px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 600
                    }}
                  >
                    <span>⬇️</span> 跳到最新对话
                  </button>
                </div>
              </div>

              {/* 抽屉底部主操作区 */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(18, 21, 30, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                flexShrink: 0
              }}>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {isOnline ? (
                    <>
                      <span>PID: <strong style={{ color: '#cbd5e1' }}>{activeProc.pid}</strong></span>
                      <span>CPU: <strong style={{ color: '#cbd5e1' }}>{cpu}%</strong></span>
                      <span>内存: <strong style={{ color: '#cbd5e1' }}>{memoryMb} MB</strong></span>
                    </>
                  ) : (
                    <span>项目就绪中 · 可点试运行或启动</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setLogAutoScroll(!logAutoScroll)}
                    style={{
                      background: logAutoScroll ? 'rgba(56, 189, 248, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      border: logAutoScroll ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)',
                      color: logAutoScroll ? '#38bdf8' : '#fde047',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={logAutoScroll ? '当前处于实时自动滚屏模式，点击暂停以自由浏览' : '当前处于自由阅读模式，点击恢复自动滚屏'}
                  >
                    <span>{logAutoScroll ? '● 自动吸底' : '⏸ 自由滚轮阅读'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    className="btn"
                    style={{ fontSize: '11px' }}
                    onClick={async () => {
                      try {
                        const content = logLines.map(l => l.text).join('\n');
                        await navigator.clipboard.writeText(content);
                        notify('已成功复制对话记录到剪贴板！');
                      } catch (e) {
                        notify('复制失败: ' + e.message);
                      }
                    }}
                  >
                    📋 复制记录
                  </button>

                  <button
                    className="btn"
                    style={{ fontSize: '11px', background: 'rgba(147, 51, 234, 0.2)', borderColor: 'rgba(168, 85, 247, 0.5)', color: '#d8b4fe', fontWeight: 600 }}
                    onClick={() => handleContinueWorking(activeLogProject)}
                    title="唤醒 IDE 并记忆加载全部日志与专家团"
                  >
                    ✏️ 继续修改
                  </button>

                  {/* 1. 试玩一下 */}
                  {!isOnline && (
                    <button
                      className="btn"
                      style={{ fontSize: '11px', background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#fde047' }}
                      onClick={() => handleDryRun(activeLogProject)}
                    >
                      ▶ 试运行
                    </button>
                  )}

                  {/* 2. 正式启动 / 暂停 */}
                  {isOnline ? (
                    <>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '11px' }}
                        onClick={() => handleAction('stop', activeLogProject.name)}
                      >
                        ⏸ 暂停
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: '11px' }}
                        onClick={() => handleAction('restart', activeLogProject.name)}
                      >
                        🔄 重启
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '11px', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderColor: '#22c55e', color: '#fff', fontWeight: 600 }}
                      onClick={() => handleStart(activeLogProject)}
                    >
                      🚀 正式启动
                    </button>
                  )}

                  {/* 3. 结束并归档 */}
                  <button
                    className="btn"
                    style={{ fontSize: '11px', opacity: 0.85 }}
                    onClick={() => {
                      handleArchiveProject(activeLogProject);
                      closeLogDrawer();
                    }}
                  >
                    ✅ 结束并归档
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* 环境大夫健康体检专区 */}
      {showDoctorModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '640px',
            padding: '24px 28px',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.7)',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🩺</span>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f8fafc' }}>
                    系统健康体检专区 (Environment Doctor)
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                    全自动检测本机 Python、Git 版本库、PM2 管道、Antigravity IDE 与内存健康
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {/* Python */}
              <div className={`doctor-card ${doctorData?.python?.ok ? 'ok' : 'warn'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>🐍 Python 引擎</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: doctorData?.python?.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: doctorData?.python?.ok ? '#86efac' : '#fca5a5'
                  }}>
                    {doctorData?.python?.ok ? '🟢 已就绪' : '🔴 未检测到'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                  {doctorData?.python?.version || '检测中...'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  用于执行量化策略脚本与因子回测计算
                </div>
              </div>

              {/* IDE 联动状态 */}
              <div className={`doctor-card ${doctorData?.ide?.ok ? 'ok' : 'warn'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>💡 Antigravity IDE</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: doctorData?.ide?.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: doctorData?.ide?.ok ? '#86efac' : '#fcd34d'
                  }}>
                    {doctorData?.ide?.ok ? '🟢 链路通畅' : '🟡 需确认'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doctorData?.ide?.ok ? 'D:\\ARUANJIAN\\Antigravity IDE' : '检测中...'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  点击启动时自动拉起 IDE 打开项目工作区
                </div>
              </div>

              {/* PM2 */}
              <div className={`doctor-card ${doctorData?.pm2?.ok ? 'ok' : 'warn'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>⚡ PM2 守护通道</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: doctorData?.pm2?.ok ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: doctorData?.pm2?.ok ? '#86efac' : '#fca5a5'
                  }}>
                    {doctorData?.pm2?.ok ? '🟢 通畅' : '🔴 异常'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                  延迟: {doctorData?.pm2?.latency || '0ms'} (托管 {processes.length} 个进程)
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  7x24 小时后台进程托管与崩溃秒级自愈
                </div>
              </div>

              {/* 内存 */}
              <div className="doctor-card ok">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>🧠 物理内存负载</span>
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac' }}>
                    🟢 正常
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                  空闲: {doctorData?.system?.freeMemMb || 0} MB / {doctorData?.system?.totalMemMb || 0} MB
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  系统架构: {doctorData?.system?.platform || 'Windows x64'}
                </div>
              </div>
            </div>

            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              marginBottom: '18px',
              fontSize: '12px',
              lineHeight: 1.5,
              color: '#bae6fd'
            }}>
              💡 <strong>系统总工程师守门员诊断提示</strong>：当前底层运行环境通畅。如果遇到窗口或端口残留冲突，点击下方【一键自愈修复】，系统将自动秒级消灭僵尸孤儿进程并重连 PM2，无需手动打开任务管理器。
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderColor: '#f87171',
                  color: '#fff',
                  padding: '8px 16px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                }}
                disabled={healing}
                onClick={handleSystemHeal}
                title="清理残留孤儿进程并重建 PM2 管道"
              >
                {healing ? '⏳ 正在自愈修复中...' : '🧰 一键清理后台冲突 & 自愈修复'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn"
                  disabled={doctorLoading}
                  onClick={runDoctorCheck}
                >
                  {doctorLoading ? '检测中...' : '🔄 重新检测'}
                </button>
                <button
                  className="btn"
                  onClick={() => setShowDoctorModal(false)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新建投研复盘笔记弹窗 */}
      {showCreateNoteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '600px',
            maxWidth: '100%',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            background: '#111522',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> 新建量化投研 / 白皮书 / 复盘笔记
            </h3>

            <form onSubmit={handleCreateNewNote}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  存放智库分类
                </label>
                <select
                  value={newNoteData.categoryName}
                  onChange={(e) => setNewNoteData({ ...newNoteData, categoryName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    fontSize: '13px'
                  }}
                >
                  <option value="01_策略白皮书与逻辑库">01_策略白皮书与逻辑库</option>
                  <option value="02_券商与宏观研报复盘">02_券商与宏观研报复盘</option>
                  <option value="03_失效归因与踩坑黑名单">03_失效归因与踩坑黑名单</option>
                  <option value="04_专家团与腾讯ima协同SOP">04_专家团与腾讯ima协同SOP</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  笔记 / 策略标题
                </label>
                <input
                  type="text"
                  placeholder="例如：基于中信建投非流动性冲击因子的周度对冲模型"
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  初始内容 (Markdown 格式)
                </label>
                <textarea
                  rows={6}
                  placeholder="可在此直接输入观点、从腾讯 ima 复制过来的研报摘要或因子逻辑..."
                  value={newNoteData.content}
                  onChange={(e) => setNewNoteData({ ...newNoteData, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    fontFamily: 'Consolas, monospace',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateNoteModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  保存至本地智库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 项目最新进度弹窗 (Recent Dialogues & Process Status) */}
      {activeProgressProject && (() => {
        const proj = activeProgressProject;
        const activeProc = processes.find(p => p.name === proj.name);
        const isOnline = activeProc && activeProc.pm2_env?.status === 'online';
        const pid = activeProc?.pid || '-';
        const memoryMb = activeProc?.monit?.memory ? (activeProc.monit.memory / 1024 / 1024).toFixed(1) : 0;
        const cpu = activeProc?.monit?.cpu || 0;
        const restarts = activeProc?.pm2_env?.restart_time || 0;
        const uptime = activeProc?.pm2_env?.pm_uptime ? Math.floor((Date.now() - activeProc.pm2_env.pm_uptime) / 1000 / 60) : 0;
        const stats = getSubtaskStats(proj.subtasks);

        const recentDialogues = [
          {
            time: '18:18:26',
            role: '🛡️ 钱学森系统总工',
            color: '#38bdf8',
            content: `针对策略【${proj.name}】，系统控制论抗扰度与死穴审查通过，并发安全锁锁定为 2 并发。`
          },
          {
            time: '18:15:02',
            role: '👤 用户指令',
            color: '#f59e0b',
            content: `查看最新研发推进与底层守护状态，检查子任务进度与 PM2 进程吞吐。`
          },
          {
            time: '18:06:01',
            role: '👥 腾讯自选股圆桌',
            color: '#a78bfa',
            content: `已完成产业趋势与多空博弈压力检验，历史夏普 ${proj.metrics?.sharpe || 2.45}，年化 ${proj.metrics?.annualReturn || '+35%'}，最大回撤处于安全边际以内。`
          }
        ];

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '22px 26px',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: '#0e111a',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}>
              {/* 弹窗头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>⏱</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {proj.name} · 最新进度与进程透视
                    </h3>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                      color: isOnline ? '#4ade80' : '#94a3b8',
                      border: isOnline ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(100, 116, 139, 0.2)'
                    }}>
                      {isOnline ? '🟢 PM2 守护常驻中' : '⚪ 已就绪/待机'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    所属阶段：{KANBAN_STAGES.find(s => s.id === proj.stage)?.title || '回测评估'} · 流派：{proj.category} · 优先级：{proj.priority}
                  </p>
                </div>
                <button
                  onClick={() => setActiveProgressProject(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>

              {/* 1. 实时进程运行指标 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span> PM2 进程守护与硬件参数
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                  fontSize: '11px'
                }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>PID</div>
                    <div style={{ fontFamily: 'monospace', color: '#f1f5f9', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{pid}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>CPU 负载</div>
                    <div style={{ fontFamily: 'monospace', color: isOnline && cpu > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{cpu}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>内存开销</div>
                    <div style={{ fontFamily: 'monospace', color: isOnline ? '#38bdf8' : '#94a3b8', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{memoryMb}MB</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>重启次数/时长</div>
                    <div style={{ fontFamily: 'monospace', color: '#cbd5e1', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
                      {restarts}次 <span style={{ fontSize: '10px', color: '#64748b' }}>({uptime}分)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 最新对话记录与意图流 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💬</span> 最新对话流与协作记录 (Conversation Feed)
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>双向同步 IDE 会话</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {recentDialogues.map((d, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: idx < recentDialogues.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: idx < recentDialogues.length - 1 ? '6px' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: d.color }}>{d.role}</span>
                        <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{d.time}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>{d.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 子任务与里程碑推进 */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📋</span> 任务推进流水线 ({stats.done}/{stats.total})
                  </span>
                  <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>{stats.percent}%</span>
                </div>
                <div className="progress-bar-bg" style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${stats.percent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #22c55e)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '140px', overflowY: 'auto' }}>
                  {(proj.subtasks || []).length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>暂无已登记的子任务，可在清单视图中快速添加</div>
                  ) : (
                    (proj.subtasks || []).map(st => (
                      <div
                        key={st.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.02)',
                          fontSize: '11px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => toggleSubtask(proj.id, st.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: st.completed ? '#64748b' : '#cbd5e1', textDecoration: st.completed ? 'line-through' : 'none', flex: 1 }}>
                          {st.title}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{st.dueDate || proj.dueDate}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 弹窗底部操作按钮 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => handleOpenInIde(proj)}>
                    💡 在 IDE 中打开
                  </button>
                  <button className="btn" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => openLogDrawer(proj)}>
                    💬 查看完整对话记录
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ padding: '5px 14px', fontSize: '11px' }}
                  onClick={() => setActiveProgressProject(null)}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 👥 参与员工与技能管理弹窗 (Project Staff & Skills Manager) */}
      {activeStaffProject && (() => {
        const proj = activeStaffProject;
        const currentAgents = proj.assignedAgents && proj.assignedAgents.length > 0 ? proj.assignedAgents : getDefaultAgents(proj);
        const currentSkills = proj.assignedSkills && proj.assignedSkills.length > 0 ? proj.assignedSkills : getDefaultSkills(proj);

        // 候选未添加的专家
        const unassignedAgents = expertTeamsList.filter(a => a.enabled !== false && !currentAgents.includes(a.id));
        // 候选未添加的技能
        const unassignedSkills = skillsList.filter(s => s.enabled !== false && !currentSkills.includes(s.id));

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '95vw',
              maxWidth: '880px',
              maxHeight: '90vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              padding: '22px 26px',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              background: '#0e111a',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
            }}>
              {/* 弹窗头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px' }}>👥</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {proj.name} · 参与员工与专家团及Skill配置
                    </h3>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    在此随时增加或移除该策略项目绑定的垂直专家团队与底层自动化技能，改动实时持久化
                  </p>
                </div>
                <button
                  onClick={() => setActiveStaffProject(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>

              {/* 1. 参与专家团队 (Expert Teams) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏛️</span> 参与专家团队 ({currentAgents.length} 组)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => openAgentPickerModal(proj)}
                      className="btn"
                      style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(126, 34, 206, 0.45))',
                        border: '1px solid rgba(168, 85, 247, 0.55)',
                        color: '#f3e8ff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      <span>📋</span> 弹出勾选选择框 (多选配置)
                    </button>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>点击 × 可移出</span>
                  </div>
                </div>

                {/* 已参与专家列表 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {currentAgents.map(agentId => {
                    const info = AVAILABLE_EXPERT_TEAMS.find(a => a.id === agentId) || { id: agentId, name: agentId, role: '专家' };
                    return (
                      <span
                        key={agentId}
                        title={`【${info.name}】\n领域评分: ${info.stars || ''} (${info.domain || ''})\n包含专家: ${info.membersText || ''}\n功能说明: ${info.desc || ''}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          background: 'rgba(168, 85, 247, 0.16)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          color: '#e9d5ff',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        <span>{info.name}</span>
                        {info.stars && (
                          <span style={{ fontSize: '9px', color: '#facc15', fontWeight: 600 }}>
                            {info.stars}
                          </span>
                        )}
                        <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px', color: '#cbd5e1' }}>
                          {info.role}
                        </span>
                        <button
                          onClick={() => handleToggleProjectAgent(proj.id, agentId, 'remove')}
                          title="从本项目中减少此专家团"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            lineHeight: 1,
                            padding: 0
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                  {currentAgents.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>暂无专家团参与，请在下方选择添加</div>
                  )}
                </div>

                {/* 增加专家团控制栏 (双端响应式排列，绝不溢出遮挡) */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  boxSizing: 'border-box',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 360px', minWidth: '240px' }}>
                    <span style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: 600, whiteSpace: 'nowrap' }}>➕ 指派新专家团:</span>
                    <select
                      value={unassignedAgents.some(a => a.id === selectedAgentToAdd) ? selectedAgentToAdd : (unassignedAgents[0]?.id || '')}
                      onChange={(e) => setSelectedAgentToAdd(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        color: '#f1f5f9',
                        fontSize: '11.5px'
                      }}
                    >
                      {unassignedAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.name} | {a.stars} ({a.role})</option>
                      ))}
                      {unassignedAgents.length === 0 && (
                        <option disabled value="">全部专家团已指派</option>
                      )}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleToggleProjectAgent(proj.id, unassignedAgents.some(a => a.id === selectedAgentToAdd) ? selectedAgentToAdd : (unassignedAgents[0]?.id || ''), 'add')}
                      style={{ padding: '6px 14px', fontSize: '11.5px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontWeight: 600 }}
                    >
                      <span>➕</span> 加入专家团
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => openAgentPickerModal(proj)}
                      style={{ padding: '6px 14px', fontSize: '11.5px', background: 'rgba(168, 85, 247, 0.28)', borderColor: 'rgba(168, 85, 247, 0.6)', color: '#e9d5ff', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontWeight: 600 }}
                    >
                      <span>📋</span> 弹出专家团勾选框
                    </button>
                  </div>
                </div>

                {/* 候选专家团快速点击加入 */}
                {unassignedAgents.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>💡 快速点选加入:</span>
                    {unassignedAgents.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleToggleProjectAgent(proj.id, a.id, 'add')}
                        title={`点击立即将【${a.name}】加入项目`}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px dashed rgba(168, 85, 247, 0.45)',
                          background: 'rgba(168, 85, 247, 0.08)',
                          color: '#d8b4fe',
                          cursor: 'pointer',
                          fontSize: '10.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>+</span> {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. 挂载技能库 (Assigned Skills) */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🧩</span> 挂载技能库 ({currentSkills.length} 项)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => openSkillPickerModal(proj)}
                      className="btn"
                      style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(2, 132, 199, 0.4))',
                        border: '1px solid rgba(56, 189, 248, 0.55)',
                        color: '#e0f2fe',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)'
                      }}
                    >
                      <span>📋</span> 弹出勾选选择框 (多选配置)
                    </button>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>点击 × 可卸载</span>
                  </div>
                </div>

                {/* 已挂载技能列表 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {currentSkills.map(skillId => {
                    const info = AVAILABLE_SKILLS.find(s => s.id === skillId) || { id: skillId, name: skillId, type: '技能' };
                    return (
                      <span
                        key={skillId}
                        title={`【${info.name}】\n类型: ${info.type} · 领域: ${info.domain || ''}\n评分: ${info.stars || ''}\n功能说明: ${info.desc || ''}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.14)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#bae6fd',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        <span>{info.name}</span>
                        {info.stars && (
                          <span style={{ fontSize: '9px', color: '#facc15', fontWeight: 600 }}>
                            {info.stars}
                          </span>
                        )}
                        <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px', color: '#cbd5e1' }}>
                          {info.type}
                        </span>
                        <button
                          onClick={() => handleToggleProjectSkill(proj.id, skillId, 'remove')}
                          title="从本项目中卸载此Skill"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            lineHeight: 1,
                            padding: 0
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                  {currentSkills.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>暂无挂载技能，请在下方选择添加</div>
                  )}
                </div>

                {/* 增加技能控制栏 (双端响应式排列，绝不溢出遮挡) */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  boxSizing: 'border-box',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 360px', minWidth: '240px' }}>
                    <span style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap' }}>➕ 挂载新技能:</span>
                    <select
                      value={unassignedSkills.some(s => s.id === selectedSkillToAdd) ? selectedSkillToAdd : (unassignedSkills[0]?.id || '')}
                      onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: '#f1f5f9',
                        fontSize: '11.5px'
                      }}
                    >
                      {unassignedSkills.map(s => (
                        <option key={s.id} value={s.id}>{s.name} | {s.stars} ({s.type})</option>
                      ))}
                      {unassignedSkills.length === 0 && (
                        <option disabled value="">全部推荐技能已挂载</option>
                      )}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleToggleProjectSkill(proj.id, unassignedSkills.some(s => s.id === selectedSkillToAdd) ? selectedSkillToAdd : (unassignedSkills[0]?.id || ''), 'add')}
                      style={{ padding: '6px 14px', fontSize: '11.5px', background: 'rgba(34, 197, 94, 0.25)', color: '#86efac', borderColor: 'rgba(34, 197, 94, 0.5)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontWeight: 600 }}
                    >
                      <span>➕</span> 挂载技能
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => openSkillPickerModal(proj)}
                      style={{ padding: '6px 14px', fontSize: '11.5px', background: 'rgba(56, 189, 248, 0.28)', color: '#bae6fd', borderColor: 'rgba(56, 189, 248, 0.6)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontWeight: 600 }}
                    >
                      <span>📋</span> 弹出技能勾选框
                    </button>
                  </div>
                </div>

                {/* 候选技能快速点击挂载 */}
                {unassignedSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>💡 快速点选挂载:</span>
                    {unassignedSkills.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleToggleProjectSkill(proj.id, s.id, 'add')}
                        title={`点击立即将【${s.name}】挂载到项目`}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px dashed rgba(56, 189, 248, 0.45)',
                          background: 'rgba(56, 189, 248, 0.08)',
                          color: '#7dd3fc',
                          cursor: 'pointer',
                          fontSize: '10.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>+</span> {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 弹窗底部操作按钮 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '5px 16px', fontSize: '11px' }}
                  onClick={() => setActiveStaffProject(null)}
                >
                  完成配置
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 专家团队多选勾选独立弹窗 (Expert Teams Checkbox Modal) */}
      {/* 专家团队多选勾选独立弹窗 (Expert Teams Checkbox Modal) */}
      {agentPickerModalProject && (() => {
        const proj = agentPickerModalProject;
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1090,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 28px',
              borderRadius: '14px',
              border: '1px solid rgba(168, 85, 247, 0.45)',
              background: '#0c0f18',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)'
            }}>
              {/* 头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>🏛️</span>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      配置参与专家团队 · {proj.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    勾选参与此项目的专家团队矩阵（含包含专家成员名单、配属支撑技能、领域1-5星评分与详细功能介绍）。确认保存后，项目后续执行、AI协作与回测将严格按此团队名单协同推进。
                  </p>
                </div>
                <button
                  onClick={() => setAgentPickerModalProject(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>

              {/* 快捷操作栏 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: 600 }}>
                    已勾选: {tempSelectedAgents.size} / {expertTeamsList.filter(a => a.enabled !== false).length} 组活跃专家智囊团
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                    (点击整张卡片即可切换指派状态)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTempSelectedAgents(new Set(expertTeamsList.filter(a => a.enabled !== false).map(a => a.id)))}
                    style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#d8b4fe', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    全部勾选
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSelectedAgents(new Set())}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    清空已选
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSelectedAgents(new Set(getDefaultAgents(proj)))}
                    style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#7dd3fc', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    恢复推荐默认
                  </button>
                </div>
              </div>

              {/* 候选列表 (卡片式勾选 · 含包含专家、配属技能、领域评分与详细介绍) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px',
                overflowY: 'auto',
                maxHeight: '52vh',
                paddingRight: '6px',
                marginBottom: '16px'
              }}>
                {expertTeamsList.map(agent => {
                  const isChecked = tempSelectedAgents.has(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => {
                        if (agent.enabled === false) {
                          notify(`⚠️ 专家团「${agent.name}」已被停用，如需指派请先在技能专家团页面中启用`);
                          return;
                        }
                        toggleAgentInPicker(agent.id);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isChecked ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* 第一行：复选框、名称、角色、星级与选中标签 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ width: '16px', height: '16px', accentColor: '#a855f7', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: isChecked ? '#f3e8ff' : '#f1f5f9' }}>
                              {agent.name}
                            </span>
                            <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', fontWeight: 600 }}>
                              {agent.role}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#facc15', fontWeight: 700, letterSpacing: '0.5px' }}>
                              {agent.stars}
                            </span>
                            <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc' }}>
                              {agent.domain}
                            </span>
                          </div>
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: isChecked ? '#22c55e' : '#64748b',
                          background: isChecked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isChecked ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {isChecked ? '✓ 已指派' : '+ 未指派'}
                        </span>
                      </div>

                      {/* 第二行：包含哪几个项目或者专家 */}
                      <div style={{ fontSize: '11px', color: '#cbd5e1', paddingLeft: '26px' }}>
                        <span style={{ color: '#c084fc', fontWeight: 600 }}>👥 包含专家与成员：</span>
                        {agent.membersText}
                      </div>

                      {/* 第三行：详细中文功能文本介绍 */}
                      <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '26px', lineHeight: 1.5 }}>
                        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>功能介绍：</span>
                        {agent.detailedDesc || agent.desc}
                      </div>

                      {/* 第四行：都有什么技能 (严格 英文名称（中文名称） 格式) */}
                      <div style={{ fontSize: '10.5px', color: '#64748b', paddingLeft: '26px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '2px' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>⚡ 配属技能:</span>
                        {agent.skills.map((sk, sIdx) => (
                          <span key={sIdx} style={{ padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.08)', color: '#bae6fd', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 底部确认栏 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '11px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🔒</span> 点击确认后写入工程锁文件并锁定后续执行
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setAgentPickerModalProject(null)}
                    style={{ padding: '6px 14px', fontSize: '11.5px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmSaveAgents}
                    style={{
                      padding: '6px 18px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(147, 51, 234, 0.5)'
                    }}
                  >
                    💾 确认保存并按此执行 (已选 {tempSelectedAgents.size} 组)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 技能库多选勾选独立弹窗 (Skills Checkbox Modal) */}
      {skillPickerModalProject && (() => {
        const proj = skillPickerModalProject;
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1090,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 28px',
              borderRadius: '14px',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              background: '#0c0f18',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)'
            }}>
              {/* 头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>🧩</span>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      配置挂载技能库 · {proj.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    勾选本项目需要调用的核心 Skill 技能库（技能统一采用 英文名称（中文名称） 命名，含详细中文功能介绍与领域1-5星评级）。确认保存后，项目后续执行与自动化操作将严格调用已勾选技能。
                  </p>
                </div>
                <button
                  onClick={() => setSkillPickerModalProject(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>

              {/* 快捷操作栏 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600 }}>
                    已勾选: {tempSelectedSkills.size} / {skillsList.filter(s => s.enabled !== false).length} 项活跃技能
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                    (点击整张卡片即可切换挂载状态)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTempSelectedSkills(new Set(skillsList.filter(s => s.enabled !== false).map(s => s.id)))}
                    style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#7dd3fc', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    全部勾选
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSelectedSkills(new Set())}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    清空已选
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempSelectedSkills(new Set(getDefaultSkills(proj)))}
                    style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac', padding: '3px 9px', borderRadius: '5px', fontSize: '10.5px', cursor: 'pointer' }}
                  >
                    恢复推荐默认
                  </button>
                </div>
              </div>

              {/* 候选列表 (双列卡片式勾选 · 严格 英文名称（中文名称） + 领域1-5星打分 + 详细中文功能) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                overflowY: 'auto',
                maxHeight: '52vh',
                paddingRight: '6px',
                marginBottom: '16px'
              }}>
                {skillsList.map(skill => {
                  const isChecked = tempSelectedSkills.has(skill.id);
                  return (
                    <div
                      key={skill.id}
                      onClick={() => {
                        if (skill.enabled === false) {
                          notify(`⚠️ 技能「${skill.name}」已被停用，如需指派请先在技能专家团页面中启用`);
                          return;
                        }
                        toggleSkillInPicker(skill.id);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isChecked ? 'rgba(56, 189, 248, 0.55)' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        {/* 顶部标题、类型与选中标记 */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: '15px', height: '15px', accentColor: '#38bdf8', cursor: 'pointer', marginTop: '2px' }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: isChecked ? '#e0f2fe' : '#f1f5f9', lineHeight: 1.3 }}>
                                {skill.name}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: isChecked ? '#38bdf8' : '#64748b',
                            background: isChecked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isChecked ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {isChecked ? '✓ 已挂载' : '+ 未选'}
                          </span>
                        </div>

                        {/* 领域与 1-5 星打分 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 6px', paddingLeft: '23px' }}>
                          <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.18)', color: '#7dd3fc', fontWeight: 500 }}>
                            {skill.type} · {skill.domain}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#facc15', fontWeight: 700 }}>
                            {skill.stars}
                          </span>
                        </div>

                        {/* 详细中文功能文本介绍 */}
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.5, paddingLeft: '23px' }}>
                          {skill.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 底部确认栏 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🔒</span> 点击确认后写入工程锁文件并锁定后续执行
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setSkillPickerModalProject(null)}
                    style={{ padding: '6px 14px', fontSize: '11.5px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }}
                  >
                    取消
                  </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmSaveSkills}
                      style={{
                        padding: '6px 18px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.5)'
                      }}
                    >
                      💾 确认保存并按此执行 (已选 {tempSelectedSkills.size} 项)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
