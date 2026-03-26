# 产品早期构思 AI Skills 完整清单

> 从 6 份调研报告中提取、去重、统一格式后的完整工具图谱。
> 数据文件: `all_skills.json` (140 条记录，统一 schema)

## 数据 Schema

```json
{
  "id": 1,
  "name": "工具/技能名称",
  "source": "来源 URL 或平台",
  "one_line": "一句话定位",
  "mechanism": "核心机制 (输入 → 过程 → 输出)",
  "differentiator": "核心差异点",
  "compatibility": "兼容性/支持平台",
  "activity": "活跃度信号 (Stars/更新日期/用户数)",
  "category": "分类",
  "sources": ["出现在哪些原始文件中"]
}
```

## 分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 产品定义 | 35 | PRD 生成、框架应用、规格写作 |
| 独立工具 | 23 | 独立 AI 平台/SaaS 产品 |
| 结构化Brainstorming | 22 | 多代理/多模型/多视角发散 |
| 需求发现 | 20 | 问题澄清、用户研究、访谈设计 |
| GPT生态 | 17 | GPT Store 中的自定义 GPT |
| 概念验证 | 13 | 假设测试、市场验证、精益方法 |
| MCP服务 | 10 | MCP Server 跨模型/跨工具集成 |
| **合计** | **140** | |

## 原始文件来源

| 文件 | 标记 | 描述 |
|------|------|------|
| `compass_artifact_wf-338e...md` | compass1 | Compass 调研报告 #1 (~54 items) |
| `compass_artifact_wf-4e2b...md` | compass2 | Compass 调研报告 #2 (~56 items) |
| `deep-research-report (1).md` | deep-research | Deep Research 报告 (~20 items, 6字段模板) |
| `grok.txt` | grok | Grok 调研 + X 数据 (~8 items) |
| `早期产品构思 AI Skills 调研.md` | 早期调研 | 深度调研 + 对比矩阵 (~18 items) |
| `docx_extracted.md` | docx | 5 个标杆技能深度剖析 |

## 5 个标杆锚点 Skills

这 5 个 skill 在所有调研中被反复引用为标杆/锚点:

| # | Name | 类型 | 核心特点 |
|---|------|------|----------|
| 1 | **gstack/office-hours** | 对抗性收敛 | YC 风格压力测试，暴露致命缺陷 |
| 2 | **phuryn/pm-skills** | 结构化工作流 | 65个 PM 技能，/discover 端到端链 |
| 3 | **deanpeters/Product-Manager-Skills** | 框架驱动生成 | 多框架模板库(Lean UX/OST等) |
| 4 | **MadAppGang/claude-code-brainstorming** | 多维发散 | 多角色并行脑暴，综合者汇总 |
| 5 | **WesleyMFrederick/cc-workflows/brainstorming** | 苏格拉底对话 | 无压力环境的温和引导式澄清 |

## 按分类快速索引

### 需求发现 (19)

| ID | Name | Stars/信号 | 亮点 |
|----|------|-----------|------|
| 1 | gstack/office-hours | YC CEO 推广 | 对抗性压力测试 |
| 2 | WesleyMFrederick/brainstorming | 标杆 | 苏格拉底式温和引导 |
| 3 | nicknisi/ideation | 60 stars | 0-100% 置信度门控 |
| 4 | johannwilfridcalixte/agentic-discovery | LobeHub | 极端对抗审问 |
| 5 | micsapp/project-brainstorming | 2026-03 | war-room 多模型压测 |
| 6 | Creative Thought Partner | FastMCP | 悖论狩猎 |
| 7 | invest-interview | 24 stars | 用户访谈指南生成 |
| 8 | discovery-interviews-surveys | 44 stars | 发现工作流 |
| 9 | requirements-analysis | SkillsMP | 需求诊断状态机 |
| 10 | openclaw/Idea Explorer | LobeHub | 后台自主市场调研 |
| 11 | synthesize-research | Anthropic | 频率x影响优先排序 |
| 12 | user-research-synthesis | FastMCP | 主题分析方法论 |
| 13 | competitive-landscape | FastMCP | 竞争格局+定位 |
| 14 | rjs/framing-doc | 914 stars | 对话记录→framing 文档 |
| 15 | mohitagw15856/Ambiguity Resolver | 51 stars | 模糊 brief 澄清 |
| 16 | mohitagw15856/Interview Guide | 51 stars | Mom Test 访谈方案 |
| 17 | bmad-discovery-research | 66 stars | 检查清单门控发现简报 |
| 18 | pratikshadake/pm-skills | 13 stars | 6维 D/F/V 分析 |
| 19 | aj-geddes/user-persona-creation | - | 研究→用户画像 |
| 65 | mattpocock/grill-me | 9K+ stars | 残酷审讯器(类 YC grilling) |

### 概念验证 (13)

| ID | Name | Stars/信号 | 亮点 |
|----|------|-----------|------|
| 20 | ailabs-393/startup-validator | 17 installs | TAM/SAM/SOM+波特五力 |
| 21 | booklib-ai-skills/lean-startup | LobeHub | 《精益创业》14章双模式 |
| 22 | alirezarezvani/product-discovery | 5.2K stars | Teresa Torres OST |
| 23 | continuous-discovery | SkillsMP | 持续发现+人类先构思 |
| 24 | hypothesis (panaversity) | 4 stars | 杀死/压测/转向标准 |
| 25 | Afrexai PM OS | 3.4K stars | RICE+Saying No Framework |
| 26 | Scientific Brainstorming | GitHub | 贝叶斯推理+学术验证 |
| 27 | Marketing Strategy PMM | GitHub | April Dunford+红黄绿标签 |
| 28 | softaworks/game-changing | 1.2K stars | 10x 机会发现 |
| 29 | Peer Review (davila7) | GitHub | 学术同行评审 |
| 30 | Bayesian Calibration | GitHub | 贝叶斯校准 |
| 139 | aakashg/idea-validator | - | 概念验证(Coverage Matrix 提及) |
| 140 | ratacat (readiness criteria) | - | "何时停止构思开始构建"门控 |

### 结构化 Brainstorming (22)

| ID | Name | Stars/信号 | 亮点 |
|----|------|-----------|------|
| 31 | MadAppGang/brainstorming | 标杆 | 多角色并行脑暴 |
| 32 | obra/superpowers | 28K+ stars | 浏览器可视化+最高采用 |
| 33 | Orchestra-Research | 4.8K stars | 认知科学8框架 |
| 34 | bladnman/ideation_team | 32 stars | 5代理认知分工 |
| 35 | noin-ai/brainstorm | LobeHub | 3代理交叉辩论 |
| 36 | bbgnsurftech/brainstorming | LobeHub | 30+模式14类别 |
| 37 | alexei-led/brainstorming | LobeHub | 7阶段+YAGNI |
| 38 | workshop-facilitator | ClaudePluginHub | 多轮工作坊 |
| 39 | robertguss/brainstorm | LobeHub | 多会话持久化 |
| 40 | double-diamond | SkillsMP | 双钻设计流程 |
| 41 | creative-intelligence | 351 stars | BMAD 角色系统 |
| 42 | brainstorm-ideas-existing | SkillsMP | 多视角+排序 |
| 43 | gitwalter/brainstorming | LobeHub | 4透镜禁止评估 |
| 44 | OMGKit Brainstorming | LobeHub | 时间盒+匿名投票 |
| 45 | Brainstorm Ideas New | SkillsMP | PM/设计/工程三人组 |
| 46 | TML 4PM AI Toolkit | LobeHub | 架构→Git 初始化 |
| 47 | jkitchin/brainstorming | GitHub | 6种创意技巧 |
| 48 | athola/project-brainstorming | 46.3K views | 约束分析 |
| 49 | lifangda/brainstorming | LobeHub | 选项矩阵+风险 |
| 50 | openclaw/reasoning-personas | LobeHub | 可切换角色模式 |
| 51 | withzombies/hyperpowers | LobeHub | Gherkin+Jira-ready |
| 52 | Jamie-BitFlight/brainstorming | Smithery | Mermaid 流程图 |

### 产品定义 (35)

| ID | Name | Stars/信号 | 亮点 |
|----|------|-----------|------|
| 53 | phuryn/pm-skills | 标杆 | 65技能+/discover 链 |
| 54 | deanpeters/PM-Skills | 标杆 | 多框架模板库 |
| 55 | anthropics/pm-plugins | 64 stars | Anthropic 官方+MCP |
| 56 | alirezarezvani/192+ | 5.2K stars | 最大集+code-to-prd |
| 57 | product-on-purpose/27 | 78 commits | 三钻框架+MCP 版 |
| 58 | pmprompt/28 skills | - | Working Backwards/Shape Up |
| 59 | wondelai/25 book | - | 蓝海/跨越鸿沟 |
| 60 | wdavidturner/20 | - | Lenny's 播客 |
| 61 | Digidai/pm-skills | - | 快速初稿+假设标注 |
| 62 | Yassinello/prd-workflow | - | 7维评分+git worktree |
| 63 | huchi996/prd-creator | v2.0 | 6阶段+多角色评审 |
| 64 | mattpocock/write-a-prd | - | 代码仓库感知 |
| 66 | rjs/shaping | 914 stars | Shape Up 方法 |
| 67 | sd0x-dev-flow | 2026-03 | Plan→Gate→Ship |
| 68 | awesome-copilot | GitHub | Epic→Feature→PRD |
| 69 | github/prd (Smithery) | - | 反模糊强制量化 |
| 70 | jamesrochabrun/prd | - | AARRR/HEART+脚本验证 |
| 71 | requirements-engineering | SkillsMP | 发现→需求→范围 |
| 72 | business-analyst (FastMCP) | - | 产品简报向导 |
| 73 | prd (FastMCP) | - | 强制访谈→PRD |
| 74 | requirements-clarity | FastMCP | 清晰度评分门控 |
| 75-88 | (更多 PRD 工具) | - | 见 all_skills.json |

### MCP 服务 (10)

| ID | Name | 亮点 |
|----|------|------|
| 89 | spranab/brainstorm-mcp | 多模型并行辩论(GPT/Gemini/DeepSeek/Groq/Ollama) |
| 90 | TheodorStorm/brainstorm-mcp | 多终端 Claude 协作+"AI 的 Slack" |
| 91 | cyanheads/mentor-mcp | DeepSeek R1 第二意见 |
| 92 | creating-cat/creative-ideation | 反偏见随机采样 |
| 93 | erophames/superpowers-mcp | obra/superpowers MCP 封装 |
| 94 | hellovarun91/brainstorm-mcp | Google Sheets 输出 |
| 95 | mnemox-ai/idea-reality-mcp | "这个已存在吗?" 0-100 信号 |
| 96 | uddhav/creative-thinking | TRIZ+横向思维+会话持久 |
| 97 | pm-skills-mcp | PM 技能 MCP 服务端 |
| 98 | attune:war-room | 多 LLM 压测子代理 |

### GPT 生态 (17)

| ID | Name | 信号 | 亮点 |
|----|------|------|------|
| 99 | ChatPRD | 100K+ users | CPO 级 PRD+评审, $5/月 |
| 100 | Design Thinking Partner | Stanford | Jeremy Utley 创建 |
| 101 | Product Idea Validator | GPT Store | 端到端验证流 |
| 102 | HMW Maker | GPT Store | 专做 HMW 挑战框定 |
| 103 | Product Hypothesis Builder | GPT Store | Lean UX 假设 |
| 104 | Speedster | GPT Store | 快速假设测试 |
| 105 | Jobs to be Done Pro | GPT Store | 专用 JTBD |
| 106 | Brainstorm to Structure | GPT Store | 语音→结构化 |
| 107 | SW Product Requirements | GPT Store | 竞品+无情优先排序 |
| 108 | King PRD | GPT Store | 步进 Q&A 引导 |
| 109 | GPT Lean Canvas | GPT Store | Miro 集成 |
| 110-115 | (画像/ICP/验证类) | GPT Store | 见 all_skills.json |
| 112-114 | (独立平台) | - | Control Tower/Saarthi/CHAIN |

### 独立工具 (23)

| ID | Name | 用户/信号 | 亮点 |
|----|------|-----------|------|
| 116 | Miro AI | 180K+ orgs | AI Sidekicks+Flows+模板 |
| 117 | FigJam AI | Figma 免费 | 40% 效率提升 |
| 118 | Whimsical AI | Claude 驱动 | 思维导图+线框图+免费 |
| 119 | Maze | - | 真实用户概念测试 |
| 120 | Kraftful | SOC2/GDPR | 用户反馈→PRD+引用 |
| 121 | Ideamap.ai | - | 多模态+自动去重 |
| 122 | illumi.one | - | Input-First AI 白板 |
| 123 | IdeaProof.io | - | 30秒验证+TAM/SAM/SOM |
| 124 | LEANSpark | Techstars | Ash Maurya 亲建 |
| 125 | DimeADozen.ai | 85K+ users | CNBC 专题 |
| 126-138 | (更多工具) | - | 见 all_skills.json |

## 四大应用场景速查

| 场景 | 推荐 Tier 1 | 推荐 Tier 2 |
|------|-------------|-------------|
| **需求发现** (模糊→清晰) | gstack/office-hours, nicknisi/ideation, mattpocock/grill-me | invest-interview, mohitagw15856/Interview Guide, rjs/framing-doc |
| **概念验证** (假设→实验) | phuryn/pm-skills /discover, ailabs-393/validator, continuous-discovery | hypothesis, Afrexai PM OS, Scientific Brainstorming |
| **结构化脑暴** (少→多→精) | obra/superpowers, noin-ai/brainstorm, Orchestra-Research | bladnman/ideation_team, bbgnsurftech/30+模式, workshop-facilitator |
| **产品定义** (想法→PRD) | anthropics/pm-plugins, mattpocock/write-a-prd, rjs/shaping | requirements-clarity(FastMCP), jamesrochabrun/prd, sd0x-dev-flow |

## 使用建议

1. **AI 调用**: 直接读取 `all_skills.json`，通过 `category` 字段筛选，通过 `mechanism` 字段了解输入输出
2. **人工浏览**: 参考本 README 的分类索引表快速定位
3. **安装**: 大部分 Claude Code skill 支持 `npx add-skill <owner>/<skill>` 或 `npx skills add <name>`
4. **去重说明**: `sources` 字段标注了该 skill 出现在哪些原始文件中，跨文件出现越多表示越被广泛认可
