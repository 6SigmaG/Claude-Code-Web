# Skill Scout — Claude Code Skills 质量评估引擎

> 从 31K+ agent skills 中筛选真正值得安装的高质量工具。

## What

一个自动化 skill 评估管线，结合静态分析 + LLM-as-Judge + 数据去重，对 Claude Code / agent skill repos 进行标准化质量评分（0-100 分）。

**核心问题**：skill 生态爆炸式增长（31K+），但没有质量筛选机制。Stars 可以注水，README 可以吹嘘，唯一可靠的方式是**读实际 SKILL.md 内容**来评估 prompt 工程质量。

## 当前状态

| 模块 | 状态 | 测试 |
|------|------|------|
| **数据管线** (`src/pipeline/`) | 四路合并（CSV + Marketplace + Discovery + Product Skills） | 38 tests |
| **静态分析器** (`src/scoring/static-analyzer.js`) | 12 维指标提取 + 归一化 | 24 tests |
| **评分计算器** (`src/scoring/calc.js`) | 3 层 12 维权重（内容 50% / 工程 20% / 生态 30%） | 32 tests |
| **Creator 分级** (`src/scoring/creator-tier.js`) | S/S-/A/B/C 五级 | 17 tests |
| **Green/Red Flags** (`src/scoring/flags.js`) | 质量信号检测 | 10 tests |
| **LLM Judge** (`src/scoring/llm-judge.js`) | OpenRouter + MiniMax M2.7 | 15 tests |
| **CLI** (`src/scoring/cli.js`) | `npm run score <url>` | 22 tests |
| **历史追踪** (`src/history/tracker.js`) | JSON 持久化 + 趋势 diff | 8 tests |
| **遥测** (`src/telemetry/usage.js`) | JSONL 持久化 + 使用统计 | 8 tests |
| **总计** | | **174 tests** |

## 数据覆盖

`data/skills-master.json` — 单一数据源（由 `npm run dedup` 生成）

| 来源 | 条目 | 说明 |
|------|------|------|
| ALL_SKILLS_V2.csv | 523 行 → 304 repos | 7+ 调研报告合并（kimi/compass/deep-research/grok 等） |
| Official Marketplace | 143 插件 | claude.com/plugins/ 官方列表 |
| Discovery Report | 22 标注 | 3 轮深度调研（21 录取 + 7 排除 + 2 观望） |
| Product Skills | 140 条 | 产品构思类 skills（需求发现/概念验证/脑暴/PRD） |
| **去重后** | **331 repos + 196 非 GitHub** | |

## 快速使用

```bash
# 评分单个 repo
npm run score -- https://github.com/obra/superpowers

# 重新生成数据（四路合并去重）
npm run dedup

# 跑全部测试
npm test
```

## 架构设计（AutoResearch 模式）

借鉴 [Karpathy autoresearch](https://github.com/karpathy/autoresearch) 的三文件契约：

| 层 | AutoResearch 原版 | 本项目映射 |
|----|-------------------|-----------|
| **固定评估器** | `prepare.py` | `static-analyzer.js` + `calc.js`（不可修改） |
| **Agent 沙盒** | `train.py` | `weights.json`（可调整） |
| **人类策略** | `program.md` | `CLAUDE.md` 录取标准 |
| **单一指标** | `val_bpb` | F1-score（分类准确率） |

关键约束：**评估器不可变** — agent 不能修改评分公式，只能调整权重。

## 项目结构

```
src/
  pipeline/          # 数据管线
    dedup.js         #   四路合并去重（CSV + Marketplace + Discovery + Products）
    dedup.test.js    #   38 tests
    run-dedup.js     #   CLI runner
  scoring/           # 评分引擎
    static-analyzer.js  # SKILL.md 12 维指标提取
    calc.js          #   3 层权重计算器
    creator-tier.js  #   Creator S/S-/A/B/C 分级
    flags.js         #   Green/Red flag 检测
    llm-judge.js     #   LLM-as-Judge
    cli.js           #   评分 CLI
  history/           # 历史追踪
  telemetry/         # 运行时遥测
data/
  skills-master.json    # 去重后的统一数据源（331 repos + 196 非 GitHub）
  official-plugins.json # Claude 官方 marketplace 列表
  product-skills.json   # 产品构思类 skills（140 条）
docs/
  scoring-framework-design.md    # 评分框架设计
  skill-pool-discovery-report.md # 3 轮发现报告
  search-strategy.md             # 搜索策略（9 个聚集地 ROI 排序）
  product-skills-index.md        # 产品 skills 分类索引
  aee-framework.md               # AEE 对抗性认知引擎
  deep-self-check.md             # 深度自检框架
.claude/skills/                  # 已安装的 Claude Code skills
```

## 评分维度

**Tier 1: 内容质量（50%）** — 工作流结构、行为约束力、错误韧性、心智理论、指令清晰度、领域深度

**Tier 2: 工程质量（20%）** — 测试覆盖、基础设施、跨 skill 组合、跨平台支持

**Tier 3: 生态系统（30%）** — 创作者可信度、社区验证、维护活跃度、使用证据

## Roadmap

- [x] P0: 评分引擎（静态分析 + LLM Judge + CLI）
- [x] P1: Skill 池扩展（3 轮深度调研，21 录取）
- [x] P1: 数据管线（四路合并去重）
- [ ] P2: AutoResearch 校准循环（权重自动调优）
- [ ] P2: 批量自动评估（331 repos）
- [ ] P3: 公共 CLI 发布（`npx skill-scout score <url>`）
- [ ] P3: Badge 生成器 + 推荐系统

## License

MIT
