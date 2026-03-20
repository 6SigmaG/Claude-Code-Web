# Claude Code Web — Skills & Plugins 合集

本仓库是基于云端 Claude Code Web 会话的个人工具集，包含 skills、plugins、项目配置和工作流。

## 用户画像

- **Vibe coding 小白**：偏好通过自然语言描述需求，让 AI 生成代码
- **喜欢 TDD 驱动开发**：先写测试、再写实现，确保代码质量
- **决策风格**：喜欢结构化选项（"整理选项让我选择"），而非开放式输入
- **语言偏好**：输出内容以中文为主，技术名词和代码保持英文

## 质量提升工具

以下两个框架可以显著提升产出质量，保存在 `docs/` 目录中：

### AEE 框架（`docs/aee-framework.md`）
**Adversarial Epistemic Engine** — 对抗性认知引擎。
- **何时使用**：面对复杂决策、架构选择、多方案对比时
- **效果**：多角度深度分析，避免单一视角盲区
- **触发方式**：用户说"用 AEE 分析"或消息以 "maxmaxmax" 结尾时自动切换多轮模式
- 详见 `docs/aee-framework.md`

### 深度自检框架（`docs/deep-self-check.md`）
- **何时使用**：完成重要设计方案、架构决策或复杂实现后
- **效果**：8 步系统化自检，发现盲点和脆弱点
- **触发方式**：用户说"自检"或"深度自检"时执行
- 详见 `docs/deep-self-check.md`

## 仓库结构

```
.claude/
  skills/
    gstack/                  # Garry Tan 的 gstack — 虚拟工程团队 skills
    superpowers/             # Jesse Vincent 的 superpowers — TDD/subagent 方法论
    antfu-skills/            # Anthony Fu 精选 agent skills
    hashicorp/               # HashiCorp 官方 Terraform/Packer skills
    compound-engineering/    # Every Inc 的复利工程插件
    agentsys/                # Avi Fenesh 的 agent 自动化系统
    everything-claude-code/  # Affaan Mustafa 的 harness 优化系统
    anthropic/               # Anthropic 官方 Claude Code plugins（46 个）
docs/
    aee-framework.md         # AEE 对抗性认知引擎框架
    deep-self-check.md       # 深度自检框架
    scoring-framework-design.md  # 评分框架设计文档
```

## 已安装 Skills

### Tier 1 — 创作者背景 + 质量 + 实战验证

#### gstack（Garry Tan）
**创作者**：YC 总裁兼 CEO，连续创业者
将 Claude Code 转变为虚拟工程团队的"软件工厂"。
Sprint 工作流：Think → Plan → Build → Review → Test → Ship → Reflect

常用命令：`/office-hours`、`/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review`、
`/design-consultation`、`/design-review`、`/review`、`/investigate`、`/qa`、`/ship`、
`/browse`、`/careful`、`/freeze`、`/unfreeze`、`/guard`、`/retro`、`/document-release`

#### superpowers（Jesse Vincent / obra）
**创作者**：Perl 5 pumpking、Request Tracker 作者、Keyboardio 联合创始人
93K+ stars。排名第一的 Claude Code 插件。强制 TDD、subagent 驱动开发、系统化调试和苏格拉底式头脑风暴。

常用命令：`/brainstorming`、`/execute-plan`、`/tdd`、`/debug`

#### antfu-skills（Anthony Fu）
**创作者**：Vue/Vite/Nuxt 核心团队成员，开源大神
3.5K stars。精选 agent skills 集合。
另创建了 `skills-cli`（`npx skills`）跨 agent skill 管理工具。

专注领域：TypeScript、ESM、Vue、Vite、ESLint、pnpm、Vitest

#### hashicorp/agent-skills（HashiCorp）
**创作者**：HashiCorp（Terraform、Vault、Consul、Packer 的创建者）
官方 Terraform + Packer skills：代码生成、模块生成、provider 开发。

#### compound-engineering（Every Inc）
**创作者**：Every Inc — 媒体科技公司，内部验证
"复利工程"方法论——每个工程周期产生复利效果。
100+ 框架支持，MCP servers，跨工具配置同步。

### Tier 2 — 实战验证 + 社区认可

#### agentsys（Avi Fenesh）
**创作者**：Valkey GLIDE 维护者，agent-sh 组织创建者
13 个 plugins、42 个 agents、28 个 skills。在 1000+ 个仓库上测试过。

#### everything-claude-code（Affaan Mustafa）
**创作者**：Anthropic hackathon 获奖者，10+ 个月每日高强度使用
9 个 agents、11 个 skills、11 个 commands、10 个 hooks，997 个内部测试通过。

### Anthropic 官方 Plugins（46 个）
位于 `.claude/skills/anthropic/`，包括：

**开发**：agent-sdk-dev、feature-dev、frontend-design、playground、plugin-dev、skill-creator、
code-simplifier、typescript-lsp、pyright-lsp、rust-analyzer-lsp、gopls-lsp 等

**效率**：code-review、pr-review-toolkit、commit-commands、claude-code-setup、
claude-md-management、hookify

**集成**：github、gitlab、slack、discord、telegram、linear、asana、notion

**数据库**：firebase、supabase、stripe

**测试**：playwright | **安全**：security-guidance

**学习**：explanatory-output-style、learning-output-style

---

## Repo 评估框架（筛选标准体系）

### 评分维度（3 层架构）

**Tier 1：内容质量（50%）**

| 维度 | 权重 | 说明 |
|------|------|------|
| **工作流结构** | 12% | Phase/Step 组织、决策分支、完成协议 |
| **行为约束力** | 12% | Iron Laws、Red Flags、反合理化防御、护栏 |
| **错误韧性** | 8% | 升级路径、BLOCKED/NEEDS_CONTEXT 协议 |
| **心智理论** | 8% | 预见 agent 走捷径、用户困惑、边界情况 |
| **指令清晰度** | 5% | 无歧义、可执行、正确排序 |
| **领域深度** | 5% | 技术准确性、参考质量、实用示例 |

**Tier 2：工程质量（20%）**

| 维度 | 权重 | 说明 |
|------|------|------|
| **测试覆盖** | 8% | 测试文件数、测试类型 |
| **基础设施** | 5% | 构建系统、模板生成、CI/CD |
| **跨 skill 组合** | 4% | 引用其他 skill、声明依赖关系 |
| **跨平台支持** | 3% | 支持多 agent 平台 |

**Tier 3：生态系统信号（30%）**

| 维度 | 权重 | 说明 |
|------|------|------|
| **创作者可信度** | 15% | Creator Tier 分级 |
| **社区验证** | 8% | Stars、marketplace、awesome-list |
| **维护活跃度** | 5% | Commit 频率、贡献者数量 |
| **使用证据** | 2% | 遥测、用户推荐 |

> **注意**: 权重为初始估算，需通过测试验证调整。详见 `docs/scoring-framework-design.md`。

### Creator Tier 分级

| 级别 | 定义 | 示例 |
|------|------|------|
| **S** | AI 公司创始人/高管、重大 OSS 创建者、行业领袖 | Anthropic、Anthony Fu、Jesse Vincent |
| **S-** | 行业领袖（无个人重大 OSS）、重要工具官方组织 | Garry Tan (YC)、HashiCorp |
| **A** | 顶尖公司工程师、OSS 维护者、hackathon 获奖者 | Avi Fenesh、Affaan Mustafa |
| **B** | 有实际成果的活跃贡献者 | 1K+ stars 的社区开发者 |
| **C** | 新人/未验证 | 首个 repo，无记录 |

### 质量信号

**绿旗（正面信号）：**
- 有完善测试（>100 个）
- 活跃维护（30 天内有 commit）
- 在 Anthropic marketplace 或 awesome-claude-code 中上架
- 跨 agent 支持（Claude Code + Codex + 其他）
- 清晰的 SKILL.md 和正确的 frontmatter
- "煮沸整个湖"的完整性优于走捷径

**红旗（负面信号）：**
- 无测试、无文档
- 单 commit / 已弃用
- 口号式声明但无证据（"1000+ skills"但文件夹是空的）
- 未标注出处的 fork
- 无实际使用证据

## 备注

- gstack 的 `/browse` 和 `/qa` 需要 Playwright Chromium（云端可能不可用）
- LSP plugins 需要对应的语言服务器
- 外部集成（Slack、GitHub 等）需要 API tokens
- superpowers 需要 Claude Code 2.0.13+
