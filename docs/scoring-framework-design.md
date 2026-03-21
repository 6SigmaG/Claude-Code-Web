# 设计文档：内容优先的 Skill 质量评估框架

生成时间：2026-03-20
分支：claude/setup-skills-plugins-iYEYn
仓库：6SigmaG/Claude-Code-Web
状态：草案

## 问题陈述

现有评分引擎（`src/scoring/scorer.js`）评估的是 **repo 元数据**（stars、forks、创作者知名度、commit 数量），但从未读取实际的 skill 内容。这就像通过厨师的 Twitter 粉丝数来给餐厅打分，却从不尝一口菜。

结果：8 个 repo 中 7 个被评为 S 级，technicalQuality 方差 = 0.38，relevanceScope 方差 = 0.19。占 35% 权重的两个维度几乎没有区分度。

用户需要一个评分系统，能高效筛选 100+ 个 skill repo，回答"我该不该花时间试这个？"——优先看内容质量，而非虚荣指标。

## 核心亮点

一个能 **读取实际 SKILL.md 文件** 并评估 prompt 工程质量的框架——行为精确度、失败处理、反合理化工程——而不只是数 stars。粘贴 GitHub URL → 秒出内容质量报告。

"Wow moment"：一个 static analyzer + LLM-as-judge 流水线，能理解什么让一个 Claude Code skill 在 prompt 层面真正 *好*。

## 核心发现：什么是 Skill？

来自 AEE 双盲分析（2 个独立 Opus agent 阅读所有 skill repo）的共识：

> "Claude Code skill 是一个 **结构化 prompt，将 Claude 从通用助手转变为拥有定义好的方法论、工作流和约束集的专家**。它不是代码，而是注入 context 的操作手册。"

### Skill 的四种原型
1. **工作流型**（gstack `/ship`、`/review`）— 多步骤流水线，有门控、条件和升级机制
2. **方法论型**（superpowers TDD、debugging）— 编码一种哲学并设置硬约束
3. **知识/规范型**（antfu-skills）— 某个技术/代码库的参考材料
4. **编排型**（superpowers brainstorming）— 协调其他 skill 的元 skill

### 三个最高质量的 Prompt 工程模式
1. **Iron Laws + 反合理化防御**（superpowers）— 明确列出 AI 会如何走捷径，然后逐一封堵
2. **结构化前导 + 状态管理**（gstack）— 每次调用从已知状态启动
3. **两阶段审查循环**（superpowers subagent-driven-dev）— 将规格合规与代码质量审查分离

## 约束条件

- 必须能高效处理 100+ 个 skill repo
- 静态分析应免费且即时（~秒级）
- LLM 评估应低成本（~$0.10-0.15/skill，100 个 skill 共 ~$15）
- gstack = 参考基准（~80/100 分）
- 权重是初始估算——需要通过测试运行和校准验证
- Creator credibility 保持重要但降低权重（25% → 5-10%）

## 前提假设

1. **筛选 > 排名** — 目标是"我该不该试这个？"而不是"第 3 名和第 4 名谁更好？" ✓ 已确认
2. **内容 > 元数据** — SKILL.md 实际写了什么比 GitHub stars 更重要 ✓ 已确认（AEE 共识）
3. **Creator credibility 保持 ~25% 权重** — 用户偏好保持强创作者信号 ✓ 已确认（用户决定）
4. **权重需要验证** — 初始权重是假设，需要测试和调整 ✓ 已确认

## 备选方案

### 方案 A：内容优先全面重构（已选择）
**工作量**：人工 ~2 周 / CC ~1 小时
**完整度**：9/10

从 skill 内容角度完全重新设计维度。

### 方案 B：渐进式修补（未选择）
快速去重 + S/S- 拆分。4S/4A 替代 7S/1A。但仍是纯元数据评估。

### 方案 C：混合 B→A（未选择）
分两步：先修补再重构。有代码浪费风险。

## 推荐方案

**方案 A：内容优先全面重构。**

理由：AI 让完整性的边际成本趋近于零。AEE 的根本洞察是对的——不读 skill 就评估质量，这个设计本身就是错的。再怎么调元数据权重也修不好。

## 新评分架构

### Tier 1：内容质量（Content Quality）— 50%

| 维度 | 权重 | 自动/LLM/人工 | 说明 |
|------|------|--------------|------|
| **工作流结构** | 12% | 自动 | Phase/Step 结构、决策分支、完成协议 |
| **行为约束力** | 12% | 自动 + LLM | Iron Laws、Red Flags、反合理化防御、护栏 |
| **错误韧性** | 8% | 自动 + LLM | 升级路径、BLOCKED/NEEDS_CONTEXT 协议、重试限制 |
| **心智理论** | 8% | LLM | 预见 agent 走捷径、用户困惑、边界情况 |
| **指令清晰度** | 5% | LLM | 无歧义、可执行、正确排序 |
| **领域深度** | 5% | LLM | 技术准确性、参考质量、实用示例 |

### Tier 2：工程质量（Engineering Quality）— 20%

| 维度 | 权重 | 自动/LLM/人工 | 说明 |
|------|------|--------------|------|
| **测试覆盖** | 8% | 自动 | 测试文件数、测试类型（unit/integration/e2e/LLM-judge） |
| **基础设施** | 5% | 自动 | 构建系统、模板生成、CI/CD |
| **跨 skill 组合** | 4% | 自动 | 引用其他 skill、声明依赖关系 |
| **跨平台支持** | 3% | 自动 | 支持 Claude Code + 其他 agent |

### Tier 3：生态系统信号（Ecosystem Signals）— 30%

| 维度 | 权重 | 自动/LLM/人工 | 说明 |
|------|------|--------------|------|
| **创作者可信度** | 15% | 人工/API | Creator Tier 分级（S/S-/A/B/C → 10/8.5/7/5/2） |
| **社区验证** | 8% | API | Stars、marketplace 上架、awesome-list 收录 |
| **维护活跃度** | 5% | API | Commit 频率、贡献者数量、issue 响应时间 |
| **使用证据** | 2% | 自动/运行时 | 遥测数据、用户推荐、下游采用 |

> **注意**: Creator 15% + 社区 8% + 维护 5% ≈ 28% 总"谁做的 & 谁在用"信号。内容维度 = 50%。权重待测试验证调整。

## 测量策略

### Phase 1：静态分析（免费，即时）

对每个 SKILL.md 文件提取以下指标：

```
step_count          — ## Step / ## Phase 标题数量
command_count       — bash/shell 代码块数量
conditional_count   — if/else/when 决策点数量
error_token_count   — STOP、BLOCKED、escalate、"never"、"do NOT" 出现次数
anti_pattern_count  — BAD:、合理化反驳表、常见失败模式
table_count         — 结构化评分表和决策矩阵
cross_skill_refs    — 引用兄弟 skill 的次数
has_frontmatter     — 有效 YAML（name/description/allowed-tools）
has_completion_protocol — DONE/BLOCKED/NEEDS_CONTEXT 完成协议
has_escalation      — 明确的升级格式
total_word_count    — 整体深度
reference_file_count — 通过 references/ 渐进式信息披露
```

### Phase 2：LLM-as-Judge（~$0.10/skill）

将 SKILL.md 内容（截断至 ~4K tokens）发送给 Haiku，以 gstack `/review` 为参考基准：

```
评分 1-10：
1. 指令清晰度 — 每步是否无歧义且可执行
2. 心智理论 — 是否预见了 agent 走捷径和用户困惑
3. 工作流完整性 — 是否覆盖 启动 → 正常路径 → 错误路径 → 升级 → 完成
4. 行为约束力 — 是否有 Iron Laws、Red Flags、反合理化防御
5. 领域准确性 — 技术声明和代码示例是否正确可用
```

### Phase 3：运行时信号（未来）
- 调用频率（skill 遥测）
- 完成率（DONE vs BLOCKED）
- 重试率（10 分钟内重复调用）
- 会话时长

## 校准：以 gstack 为 80 分基准

| Repo | AEE Blind-A | AEE Blind-B | 共识分 |
|------|------------|------------|--------|
| gstack | 9.0/10 | 80/100 | **80** — 参考基准 |
| superpowers | 8.2/10 | 75/100 | **75** — 最佳行为约束力 |
| anthropic feature-dev | 6.8/10 | — | **65** — 结构好但约束轻 |
| anthropic code-review | 6.5/10 | — | **63** — 精确但无升级机制 |
| agentsys | — | 60/100 | **58** — 基础设施 > prompt 质量 |
| antfu-skills | 5.8/10 | 45/100 | **50** — 知识库而非工作流 |
| everything-claude-code | — | 40/100 | **42** — 广度优先，深度不足 |
| compound-engineering | — | 35/100 | **~~35~~ → 60** — 校准验证后修正：实际有完整工作流 |

## 参考的行业最佳实践

来自 Opus 调研（npm/Libraries.io/OpenSSF/crates.io/GitHub）：

| 实践 | 来源 | 应用方式 |
|------|------|----------|
| Bezier 归一化 | npms.io | 将静态指标归一化到 [0,1] 以获得更好的分布 |
| 惩罚系统 | Libraries.io | 对 red flags 负分扣减（-5 已弃用、-5 无文档） |
| 90 天滚动窗口 | crates.io | 活跃度指标使用近期数据而非"历史总量" |
| Star 增长速度 | GitHub Trending | 增长率 > 绝对数量 |
| 下游采用 | Libraries.io | 统计引用此 skill 的 repo 数量（未来） |
| Issue 响应时间 | npms.io | 维护者响应速度（未来，通过 GitHub API） |
| 贡献者多样性 | OpenSSF Scorecard | 多组织贡献者 > 人头数 |

## Creator Tier 分级标准

两个分析 agent 一致认同的分级：

| 级别 | 分值 | 标准 | 示例 |
|------|------|------|------|
| **S** | 10 | 亲手创建了范式转换级别的 OSS，或创建了 AI 平台本身 | Anthropic、Anthony Fu、Jesse Vincent、HashiCorp |
| **S-** | 8.5 | 行业领袖但无个人重大 OSS，或重要工具的官方组织 | Garry Tan (YC CEO) |
| **A** | 7 | 顶尖公司工程师、OSS 维护者、官方组织 | Every Inc、Avi Fenesh |
| **B** | 5 | 有实际成果的活跃贡献者 | Affaan Mustafa |
| **C** | 2 | 新人/未验证 | — |

## 待解决问题

1. **权重校准** — 50/20/30 的分配需要测试运行验证。用户已标注权重可能需要根据验证结果调整。
2. **LLM-judge 模型选择** — Haiku 更便宜？Sonnet 更准确？需要 benchmark。
3. **知识型 vs 工作流型评分** — antfu 这类知识库型 skill 是否应使用不同的评分标准？
4. **评分制** — 采用 0-100 分制，比 0-10 有更多颗粒度。
5. **Creator 权重** — AEE 推荐 5-10%，用户偏好 ~25%。当前设计用 15% 作为折中 + 8% 社区 + 5% 维护 ≈ 28% 生态系统总权重。

## 成功标准

- 分数分散度：至少 40 分的跨度（vs 当前 10 分制下仅 1.6 分跨度）
- 层级分布：清晰的 S/A/B/C 分离，任何单一层级不超过 40%
- antfu-skills 分数显著低于 gstack（内容差异被反映）
- 新增 skill → 30 秒内完成评分（静态）或 2 分钟内（静态 + LLM）
- 100 个 skill 评估的 LLM 总成本 < $15

## 实施步骤

1. 实现静态分析器：解析 SKILL.md 文件并提取所有内容指标
2. 实现新评分器，使用 3 层维度结构
3. 添加 LLM-as-judge 评估模块
4. 对已知的 8 个 repo 运行校准
5. 验证权重并根据校准结果调整
6. 添加 CLI 命令：`node src/scoring/cli.js <github-url>` 支持 URL 评分

## 关于你的思维方式的观察

- 你说"我感觉很拉"——AEE 分析证实了你的直觉。在正式分析证明之前，你就知道系统在评估错误的东西。
- 你要求双盲 AEE 测试并指定了具体模型分配（2 Opus + 2 Sonnet）。这是严谨的验证方法论——你不只是在建造，你在验证。
- 你偏好结构化选项而非开放式输入（"整理选项给我选择而不是让我输入"）。这是产品设计直觉——减少用户认知负担。
- 尽管两个 AEE agent 都推荐 5-10%，你仍将 creator 权重保持在 ~25%。当分析结果与你的判断冲突时，你相信自己的判断，这是有清晰产品愿景的表现。
