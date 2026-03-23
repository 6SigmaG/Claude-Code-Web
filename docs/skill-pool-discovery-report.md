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

## 发现源（awesome 列表）— 用于持续挖矿

| 来源 | Stars | 新候选数 |
|------|------:|:--------:|
| hesreallyhim/awesome-claude-code | 30,738 | ~14 |
| BehiSecc/awesome-claude-skills | 7,795 | ~54 |
| quemsah/awesome-claude-plugins | 220 | 追踪 8,649 repos |

---

## 待深度调研的高优先候选（下一轮）

从 awesome 列表和 quemsah 追踪中发现但未深度调研的高优先 repos：

| Repo | Stars (est.) | 为什么值得关注 |
|------|------:|----------|
| kepano/obsidian-skills | 16,000+ | Obsidian 创始人，S-tier creator |
| trailofbits/skills | 3,800+ | 顶级安全公司，35 个审计 skills，26 贡献者 |
| K-Dense-AI/claude-scientific-skills | 15,900+ | 125+ 科研/工程 skills |
| VoltAgent/awesome-claude-code-subagents | 14,800+ | 10 个 subagent plugins |
| deanpeters/Product-Manager-Skills | 2,400+ | 46 个 PM skills，v0.75 活跃维护 |
| Orchestra-Research/AI-Research-SKILLs | 5,400+ | 22 个 AI 研究 skills |
| agamm/claude-code-owasp | - | OWASP Top 10:2025 安全参考 |
| AlmogBaku/debug-skill | - | 真正的断点调试器 |
| daxaur/openpaw | - | 38 skill 个人助理套件 |
| pjt222/agent-almanac | - | 317 skills，50+ 领域 |
| mattjoyce/kanban-skill | - | Markdown Kanban |
| product-on-purpose/pm-skills | - | 24 个产品管理 skills |
| robertguss/claude-skills | - | 出版流水线 "Book Factory" |
| akin-ozer/cc-devops-skills | - | DevOps 工具箱 + IaC |
| NeoLabHQ/context-engineering-kit | - | 高级 context 模式 |
| glittercowboy/taches-cc-resources | - | 均衡 sub-agents + meta-skills |

---

## 统计总结

| 指标 | 数量 |
|------|------|
| 搜索覆盖 repos | 8,649+（含 quemsah 追踪） |
| 深度调研 repos | 17 |
| 通过录取的 Skill 实体 repos | 12（Tier 1-3） |
| 排除的红旗 repos | 4 |
| 待下一轮调研的高优先候选 | 16+ |
| 从 awesome 列表挖出的新候选 | 68+ |
| 可安装的独立 skills 总量 | ~1,800+（去重后估计） |
