# Skill Pool Discovery Report

> 生成日期：2026-03-23
> 方法：AEE 4 视角辩论录取标准 → 4 轮 Web 搜索 → 10 个并行深度调研 agents
> 候选来源：GitHub 搜索、awesome 列表挖掘、quemsah 采用度追踪数据（8,649 repos）

---

## 录取标准

### 硬性条件（全部必须满足）

| 条件 | 说明 |
|------|------|
| 有 SKILL.md 或 `.claude/` 结构 | 是个 skill repo |
| 非 archived | 还活着 |
| 非未标注 fork | 不是抄袭 |
| Repo 年龄 >= 1 个月 | 太新的信号不够 |

### Stars 门槛（分层）

| Repo 年龄 | Stars 门槛 | 理由 |
|-----------|--------:|------|
| 1-6 个月 | >= 1,000 | 新 repo 但已有社区认可 |
| > 6 个月 | >= 2,000 | 有足够时间积累 |
| **例外**: Creator S/S- tier | >= 500 | 大佬新项目可以放宽 |

---

## 已安装 Skills（8 个，不重复评估）

| Repo | Stars | Creator Tier |
|------|------:|:---:|
| anthropics/skills | 100,888 | S |
| obra/superpowers | 93,000+ | S |
| garrytan/gstack | - | S- |
| antfu/antfu-skills | 3,500+ | S |
| hashicorp/agent-skills | - | A |
| everyinc/compound-engineering | - | A |
| avifenesh/agentsys | - | A |
| affaan/everything-claude-code | - | B |

---

## Tier 1 — 强烈推荐安装/评估（深度调研确认高质量）

### 1. sickn33/antigravity-awesome-skills
- **Stars**: 26,811 | **Skills**: 1,309 confirmed | **Creator**: B（策展人）
- **亮点**: 最大的单体 skill 库，75% 有实质内容。npx 安装器、45 个测试、6 个 CI workflow。react-best-practices 和 nextjs-best-practices 来自 Vercel 官方。
- **风险**: ~2% stub 文件，78% skills 未做 risk 分类，creator 非领域专家
- **推荐安装**: Web Wizard bundle（react-best-practices, nextjs-best-practices, tailwind-patterns, frontend-design）+ QA bundle（test-driven-development, systematic-debugging）
- **链接**: https://github.com/sickn33/antigravity-awesome-skills

### 2. jezweb/claude-skills
- **Stars**: 641 | **Skills**: 59（10 plugins）| **Creator**: B（Jeremy Dawes）
- **亮点**: 最适合 web dev 的 skill 集合。v1→v13 精炼（105→59 去冗余）。"每个 skill 必须产出东西"哲学。Cloudflare 8-skill 完整工作流、landing-page 单文件生成、stripe-payments 平台感知。
- **风险**: 无测试，plugin 级安装粒度
- **推荐安装**: cloudflare plugin, frontend plugin, integrations/stripe-payments, dev-tools/project-health
- **链接**: https://github.com/jezweb/claude-skills

### 3. alirezarezvani/claude-skills（工程子集）
- **Stars**: 6,533 | **Skills**: 192+（推荐 ~30 个工程类）| **Creator**: B/A（Berlin CTO，22 年经验）
- **亮点**: pr-review-expert（30 项检查清单 + 爆炸半径分析）、tdd-guide（8 个 Python 模块）、playwright-pro（55 个模板）、self-improving-agent（MEMORY.md→CLAUDE.md 生命周期）。支持 11 个 agent 平台。
- **风险**: 营销/C-level skills 较浅可能是模板生成，无自动化测试
- **推荐安装**: engineering-team/ + engineering/ 目录
- **链接**: https://github.com/alirezarezvani/claude-skills

### 4. tech-leads-club/agent-skills
- **Stars**: 1,792 | **Skills**: 121 verified | **Creator**: B（社区组织）
- **亮点**: 安全第一——Snyk 扫描、SHA-256 哈希、防篡改 lockfile。Nx monorepo + TypeScript 100%。核心 web skills: core-web-vitals, accessibility, react-best-practices, security-best-practices。
- **风险**: 2 个月历史较短，SKILL.md 内容未能直接验证（404）
- **推荐安装**: 通过 `npx @tech-leads-club/agent-skills` 安装 performance + quality + security 类
- **链接**: https://github.com/tech-leads-club/agent-skills

### 5. daymade/claude-code-skills（精选子集）
- **Stars**: 711 | **Skills**: 43 | **Creator**: B
- **亮点**: deep-research（9 阶段 UNION 并行合成）、ui-designer（截图→设计系统→PRD→React）、doc-to-markdown（CJK 支持，31 内部测试）、prompt-optimizer（EARS 方法论）
- **风险**: 质量不均匀，部分 skills 依赖外部工具
- **推荐安装**: deep-research, ui-designer, mermaid-tools, repomix-safe-mixer, i18n-expert
- **链接**: https://github.com/daymade/claude-code-skills

---

## Tier 2 — 值得关注 / 选择性安装

### 6. guanyang/antigravity-skills
- **Stars**: 489 | **Skills**: 58 | **Creator**: B
- **亮点**: 明确支持 Claude Code。从 9 个上游源手工适配。verification-before-completion 有 24 条失败记忆 + Iron Laws。每日自动同步上游。
- **推荐**: TDD + verification + debugging 三件套
- **链接**: https://github.com/guanyang/antigravity-skills

### 7. levnikolaevich/claude-code-skills
- **Stars**: 244 | **Skills**: 128 + 3 MCP servers | **Creator**: B（AI CTO，MSc）
- **亮点**: hex-line-mcp（hash 验证防腐化编辑）、hex-graph-mcp（SQLite 代码知识图谱）。7 个 plugin 覆盖全交付生命周期。跨平台（CLAUDE.md + AGENTS.md + GEMINI.md）。
- **推荐**: MCP servers + codebase-audit-suite + project-bootstrap
- **链接**: https://github.com/levnikolaevich/claude-code-skills

### 8. glebis/claude-skills
- **Stars**: 60 | **Skills**: 37 | **Creator**: B
- **亮点**: TDD skill 独立于 superpowers（7 框架支持 + 状态机）。thinking-patterns（13 并行提取 agent）、decision-toolkit 是独特的知识工作类 skills。Granola skill 有 18 个测试。
- **推荐**: tdd, decision-toolkit, firecrawl-research, retrospective
- **链接**: https://github.com/glebis/claude-skills

### 9. op7418/Claude-to-IM-skill
- **Stars**: 1,454 | **Skills**: 1（桥接 daemon）| **Creator**: B（CodePilot 4.5K stars）
- **亮点**: Claude Code ↔ Telegram/Discord/飞书/微信 双向桥接，流式响应 + 权限审批。11 个测试文件。
- **推荐**: 仅在需要远程控制 Claude Code 时安装
- **链接**: https://github.com/op7418/Claude-to-IM-skill

---

## Tier 3 — 工具类 / 参考学习

### 10. shanraisshan/claude-code-best-practice
- **Stars**: 21,046 | **类型**: 文档知识库
- **价值**: Boris Cherny（Claude Code 创造者）37 条 tips、hooks 声音通知、CLAUDE.md 模板
- **安装**: 不安装，作为参考阅读
- **链接**: https://github.com/shanraisshan/claude-code-best-practice

### 11. alirezarezvani/claude-code-skill-factory
- **Stars**: 624 | **类型**: Skill 构建工具
- **价值**: Q&A 式 skill 脚手架 + 9 个预建 skill，Prompt Factory 69 个模板
- **链接**: https://github.com/alirezarezvani/claude-code-skill-factory

### 12. FrancyJGLisboa/agent-skill-creator
- **Stars**: 529 | **类型**: 跨平台 skill 生成器
- **价值**: 接受非结构化输入 → 生成 14 平台兼容 skill，含 validate.py + security_scan.py
- **链接**: https://github.com/FrancyJGLisboa/agent-skill-creator

---

## 红旗 — 已排除

| Repo | Stars | 排除原因 |
|------|------:|----------|
| jeremylongshore/claude-code-plugins-plus-skills | 1,691 | AI 生成空壳 skills，号称 2,811 实际 ~500 模板内容，"Claude Opus 4.6" 作为 git committer |
| rmyndharis/antigravity-skills | 558 | 单日机械转换，Antigravity 专用不兼容 Claude Code，Creator C-tier |
| abubakarsiddik31/claude-skills-collection | 556 | 纯索引，15 commits vs 556 stars 疑似注水 |
| karanb192/awesome-claude-skills | 199 | 2 天做完弃置，内容全指向已安装 repos |

---

## 第二轮发现 — 高 ROI 来源挖掘（Anthropic 官方 + 博客 + HN/Reddit/V2EX）

### 从 Anthropic 官方 Marketplace 发现

| Repo | Stars | 说明 |
|------|------:|------|
| upstash/context7 | 50,300 | 实时文档 MCP server，解决训练数据过时问题。189K 安装量。官方收录 |
| oraios/serena | 22,000 | 语义代码分析 MCP，40+ 语言 LSP 支持。官方收录 |

**新增官方内部 plugins**（在 anthropics/claude-plugins-official 内）：
- `ralph-loop` — 自循环执行 plugin（YC hackathon 用的，一晚生成 6 repos）
- `math-olympiad` — 竞赛数学求解器（17/18 IMO+Putnam 2025）
- `mcp-server-dev` — MCP server 开发 skill

### 从技术博客/Newsletter 发现

| Repo | Stars (est.) | 来源 | 说明 |
|------|------:|------|------|
| nextlevelbuilder/ui-ux-pro-max-skill | 16,900 | scriptbyai | UI/UX 专业 skill |
| vercel-labs/agent-skills | 12,000 | scriptbyai | Vercel 官方 skills（React/Next.js） |
| wshobson/agents | 25,000 | scriptbyai | 大型 plugin marketplace |
| ruvnet/Claude-Flow | 11,400 | scriptbyai | 多 agent 编排框架 |
| contains-studio/agents | 11,400 | scriptbyai | Agent 编排平台 |
| ryanlewis/claude-format-hook | - | dev.to | 实测 "battle-tested" 格式化 hook |

### 从 HN Show HN 发现（独特，不在 awesome list 中）

| Repo | Stars (est.) | 说明 |
|------|------:|------|
| mvanhorn/last30days-skill | 4,700 | 跨平台情报聚合（Reddit/X/HN/Polymarket/Bluesky） |
| assimovt/productskills | - | YC PM 总监出品，16 个精炼产品管理 skills |
| jeffallan/claude-skills | - | 65 skills + `/common-ground` 假设暴露命令 |
| MinBZK/overheid-claude-plugins | 3 | 荷兰政府合规 skills（6 plugins, 49 skills）完全不在主流列表 |
| kasperjunge/agent-resources | - | `agr` skill 包管理器，类 npm 安装 |

### V2EX 中文社区关键反馈

- **superpowers 争议**：多位用户反映小任务太啰嗦、浪费 tokens，用一次后删除
- **共识**：质量 > 数量，项目专属 skill 比通用预置包更有效
- **实际在用**：ui-ux-pro-max、antfu/skills、自写项目 skills

---

## 发现源（awesome 列表）— 用于持续挖矿

| 来源 | Stars | 新候选数 |
|------|------:|:--------:|
| hesreallyhim/awesome-claude-code | 30,738 | ~14 |
| BehiSecc/awesome-claude-skills | 7,795 | ~54 |
| quemsah/awesome-claude-plugins | 220 | 追踪 8,649 repos |
| Anthropic 官方 marketplace | - | 47 plugins（32 内部 + 15 外部） |
| 技术博客 (buildtolaunch, dev.to, scriptbyai) | - | ~6 独特 repos |
| HN Show HN | - | ~5 独特 repos |

---

## 待深度调研的高优先候选（通过 Stars 门槛）— ✅ 全部完成

> 第三轮深度调研已于 2026-03-24 完成，结果见上方"第三轮深度调研"章节。

| Repo | Stars (实际) | 年龄 | 结论 |
|------|------:|------|------|
| upstash/context7 | 50,444 | 12月 | ✅ Tier 1 强烈推荐 |
| vercel-labs/agent-skills | 23,800 | 3.5月 | ✅ Tier 1 强烈推荐 |
| trailofbits/skills | 3,900 | 2月 | ✅ Tier 1 强烈推荐 |
| oraios/serena | 22,021 | 12月 | ✅ Tier 2 推荐（MCP） |
| kepano/obsidian-skills | 16,800 | 3月 | ✅ Tier 2 推荐 |
| K-Dense-AI/claude-scientific-skills | 16,100 | 5月 | ✅ Tier 2 推荐 |
| mvanhorn/last30days-skill | 5,300 | 2.5月 | ✅ Tier 2 推荐 |
| Orchestra-Research/AI-Research-SKILLs | 5,549 | 4.5月 | ✅ Tier 2 推荐 |
| deanpeters/Product-Manager-Skills | 2,400 | 7周 | ✅ Tier 2 推荐 |
| wshobson/agents | 32,176 | 8月 | ⏸ 观望 |
| VoltAgent/awesome-claude-code-subagents | 15,000 | 6周 | ⏸ 观望 |
| nextlevelbuilder/ui-ux-pro-max-skill | ~49,700 | 4月 | ❌ Star inflation |
| ruvnet/Claude-Flow | 24,900 | >6月 | ❌ Star 注水嫌疑 |
| contains-studio/agents | 12,350 | 8月 | ❌ 弃置+无 license |

**未通过门槛但有独特价值（备注）**：
- `MinBZK/overheid-claude-plugins` (3 stars) — 荷兰政府官方，独特性极高但 stars 不够
- `assimovt/productskills` — YC PM 总监出品但 stars 未知

---

## 第三轮深度调研（2026-03-24）

对第二轮发现的 14 个高优先候选逐一深度调研（并行 agent 模式）。

### Tier 1 — 强烈推荐安装

#### 13. upstash/context7
- **Stars**: 50,444 | **Creator**: S-（Upstash，a16z 投资的 serverless 基础设施公司）
- **类型**: MCP server + Claude Code skill + plugin 三合一
- **亮点**: 实时文档注入防止 LLM 幻觉过时 API。npm 周下载 496K。Anthropic 官方 marketplace 收录。TypeScript monorepo，6 个 CI workflow，changesets 发布管线。支持 Claude Code/Cursor/Gemini 等多平台。
- **安装**: `claude mcp add context7 -- npx -y @upstash/context7-mcp` 或 plugin marketplace
- **风险**: 依赖 context7.com 后端服务（有 rate limit），但公司有 a16z 融资可持续性高
- **链接**: https://github.com/upstash/context7

#### 14. vercel-labs/agent-skills
- **Stars**: 23,800 | **Creator**: S（Vercel 官方，Next.js 创建者 Guillermo Rauch）
- **类型**: 6 个 skill（react-best-practices, web-design-guidelines, react-native, composition-patterns, deploy-to-vercel, vercel-cli-with-tokens）
- **亮点**: react-best-practices 64 条规则按优先级分类（CRITICAL/HIGH/MEDIUM/LOW）。613K 总安装量。构建系统（rules → AGENTS.md 编译管线）。`npx skills` 安装。支持 39+ agent 平台。
- **安装**: `npx skills add vercel-labs/agent-skills`
- **风险**: 无明显红旗
- **链接**: https://github.com/vercel-labs/agent-skills

#### 15. trailofbits/skills
- **Stars**: 3,900 | **Creator**: S（Trail of Bits，顶级安全公司，DARPA AI Cyber Challenge 亚军 $3M）
- **类型**: 30+ 安全审计 skill（11 个 plugin 类别）
- **亮点**: 智能合约安全（6 个区块链平台）、代码审计（Semgrep/差异审查/供应链风险）、恶意软件分析（YARA）、形式化验证、逆向工程。constant-time-analysis skill **发现了 RustCrypto ML-DSA 签名的真实 timing 漏洞**。CI 验证 SKILL.md 结构。26 贡献者。
- **安装**: `/plugin marketplace add trailofbits/skills`
- **风险**: CC-BY-SA-4.0 copyleft 许可证（非 MIT）
- **链接**: https://github.com/trailofbits/skills

### Tier 2 — 推荐安装 / 选择性安装

#### 16. oraios/serena
- **Stars**: 22,021 | **Creator**: B+/A-（Oraios AI，德国 AI 公司，双 PhD 创始人）
- **类型**: MCP server（非 skill/plugin）
- **亮点**: 语义代码分析，40+ 语言 LSP 支持，符号级精确编辑（无需读全文件）。跨 3 OS 的 CI。Microsoft/VSCode 团队赞助。PyPI 27.4K 下载。
- **安装**: `claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code --project "$(pwd)"`
- **风险**: 非 skill 类别（MCP server），需要 Python 3.11+ 和各语言 LSP server
- **链接**: https://github.com/oraios/serena

#### 17. kepano/obsidian-skills
- **Stars**: 16,800 | **Creator**: S-（Steph Ango，Obsidian CEO）
- **类型**: 5 个 skill（obsidian-markdown, obsidian-bases, json-canvas, obsidian-cli, defuddle）
- **亮点**: 解决 Claude Code 不理解 Obsidian 专有语法（wikilinks, .base, .canvas）的问题。标准 SKILL.md + 参考文档。Anthropic marketplace 收录。
- **安装**: `/plugin marketplace add kepano/obsidian-skills`
- **风险**: 领域特定（仅 Obsidian 用户需要），无测试但文档类 repo 可接受
- **链接**: https://github.com/kepano/obsidian-skills

#### 18. K-Dense-AI/claude-scientific-skills
- **Stars**: 16,100 | **Creator**: A（Timothy Kassis，MIT PhD Bioengineering，与 Regina Barzilay 合作）
- **类型**: 178 个科研 SKILL.md（生物信息学/化学信息学/量子计算/药物发现/临床医学/金融等）
- **亮点**: RDKit skill 展示真实化学信息学专业知识（API 演变、力场权衡、错误模式）。3 个 CI workflow（npm 发布 + Sigstore 签名 + CodeQL 安全扫描）。118 贡献者，61 个已合并外部 PR。
- **安装**: `npx @orchestra-research/ai-research-skills` 或 plugin marketplace
- **风险**: 内容可能部分 LLM 生成（但有专家审核），K-Dense Web 商业产品导流
- **链接**: https://github.com/K-Dense-AI/claude-scientific-skills

#### 19. mvanhorn/last30days-skill
- **Stars**: 5,300 | **Creator**: S-（Matt Van Horn，Lyft 联合创始人，June/Weber 创始人）
- **类型**: 1 个情报聚合 skill（10 平台：Reddit/X/Bluesky/YouTube/TikTok/Instagram/HN/Polymarket/Truth Social/Web）
- **亮点**: 455+ 测试（32 个测试文件）。两阶段搜索架构 + 多信号相关性评分。v1→v2.9.5 快速迭代（2.5 个月）。跨 agent 支持。
- **安装**: `/plugin install last30days@last30days-skill`
- **风险**: 重度 API 依赖（ScrapeCreators, X auth cookies），无 CI/CD pipeline
- **链接**: https://github.com/mvanhorn/last30days-skill

#### 20. Orchestra-Research/AI-Research-SKILLs
- **Stars**: 5,549 | **Creator**: A（Jiachen Liu, Meta Superintelligence Lab 研究员；Zechen Zhang, Harvard 物理）
- **类型**: 86 个 AI 研究 skill（22 类别：模型架构/微调/推理/安全/分布式训练/MLOps 等）
- **亮点**: Autoresearch 中央编排（双循环架构）。NVIDIA Inception + Vercel AI Accelerator 支持。npm 安装器。194 commits，24 PR（外部贡献者活跃）。
- **安装**: `npx @orchestra-research/ai-research-skills`
- **风险**: 零测试，社交媒体零讨论（与 5.5K stars 不匹配）
- **链接**: https://github.com/Orchestra-Research/AI-Research-SKILLs

#### 21. deanpeters/Product-Manager-Skills
- **Stars**: 2,400 | **Creator**: B+（Dean Peters，20 年 PM 经验，Productside 首席顾问）
- **类型**: 46 个 PM skill + 6 个工作流命令（用户故事/PRD/定位声明/JTBD/机会方案树等）
- **亮点**: 覆盖 Teresa Torres、Amazon Working Backwards、Geoffrey Moore 等 PM 方法论。ABC（Always Be Coaching）教学理念。跨 14 个 agent 平台文档。验证脚本。
- **安装**: `npx skills add deanpeters/Product-Manager-Skills`
- **风险**: CC BY-NC-SA 非商用许可证。内容可能部分 AI 生成。单人项目。
- **链接**: https://github.com/deanpeters/Product-Manager-Skills

### Tier 3 — 观望 / 不推荐

#### 22. wshobson/agents
- **Stars**: 32,176 | **Creator**: B+（Seth Hobson，Senior AI Engineer）
- **类型**: 72 个 plugin marketplace（112 agents, 146 skills, markdown-only）
- **结论**: **观望**。零测试，用户反馈 agents "too broad, very generic"（Discussion #42）。8 个月 32K stars 但本质是 markdown prompt 集合。"79 tools" 实际只有 2 个文件。
- **链接**: https://github.com/wshobson/agents

#### 23. VoltAgent/awesome-claude-code-subagents
- **Stars**: 15,000 | **Creator**: B（Necati Ozmen，Refine.dev 前 Growth Lead）
- **类型**: 127 个 subagent markdown 定义
- **结论**: **观望**。VoltAgent 是 "awesome-list 工厂"（6 个 awesome repos 共 73K stars），增长黑客模式。零测试零验证，6 周历史。用户反映 subagent "比单个 Claude 更蠢"。
- **链接**: https://github.com/VoltAgent/awesome-claude-code-subagents

### 红旗 — 已排除（第三轮）

| Repo | Stars | 排除原因 |
|------|------:|----------|
| nextlevelbuilder/ui-ux-pro-max-skill | ~49,700 | **Star inflation 红旗**：4 个月从 0 到 50K，3 周内暴涨 20K。org 仅 404 followers。零测试。V2EX 用户负面评价（"死板缺设计感"）。Creator 运营 GoClaw/SkillX 自引流生态。实际有机 stars 估计 5K-8K。 |
| ruvnet/Claude-Flow (ruflo) | 24,900 | **Star 注水嫌疑**：98.8% 单人 commit（5,875/5,947），另一个 repo RuView 41K stars 同样无外部贡献。"Unicorn Breeder" 营销导向。scope inflation（号称 1300+ 测试实际 8 个文件）。 |
| contains-studio/agents | 12,350 | **弃置项目**：单日 10 commits 后 8 个月零更新。无 license。不符合 Claude Code 规范（自认 Issue #19）。纯 markdown prompt 模板。 |

---

## 统计总结

| 指标 | 数量 |
|------|------|
| 搜索覆盖 repos | 8,649+（含 quemsah 追踪） |
| 搜索来源 | 9 类（GitHub/Anthropic/博客/HN/Reddit/V2EX/X/YouTube/Discord） |
| 第一轮深度调研 repos | 17 |
| 第一轮通过录取 | 12（Tier 1-3） |
| 第一轮红旗排除 | 4 |
| 第二轮新发现 | 16 repos（Anthropic 2 + 博客 6 + HN/Reddit 5 + V2EX 3） |
| **第三轮深度调研** | **14 repos** |
| **第三轮通过录取** | **9（Tier 1: 3, Tier 2: 6）** |
| **第三轮观望** | **2（wshobson, VoltAgent）** |
| **第三轮红旗排除** | **3（ui-ux-pro-max, Claude-Flow, contains-studio）** |
| 通过 Stars 门槛的高优先候选 | 14 → 全部完成调研 |
| 从 awesome 列表挖出的新候选 | 68+ |
| 可安装的独立 skills 总量 | ~2,500+（去重后估计） |
| **累计录取 repos** | **21（第一轮 12 + 第三轮 9）** |
| **累计红旗排除** | **7（第一轮 4 + 第三轮 3）** |
