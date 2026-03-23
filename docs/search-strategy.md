# Skill 发现搜索策略

> 生成日期：2026-03-23 | 更新：2026-03-23（AEE 分析增加签名搜索 + 市场评估）
> 方法论：AEE 对抗性分析 → Gap-Driven 三层漏斗

## 核心方法论：三层搜索漏斗

```
Layer 1: Gap 分析 — "我缺什么？"（先定义目标，再搜索）
    ↓
Layer 2: 签名搜索 — 用文件特征精准定位（GitHub/Google）
    ↓
Layer 3: 安全审查 — Stars 门槛 → 静态扫描 → 人工审查
```

> **AEE 结论**：搜索和安装必须严格分离。发现/采用比约 15:1，前置 gap 分析可大幅减少无效搜索。

## Skill 文件签名（用于搜索的关键特征）

| 特征 | 搜索价值 | 说明 |
|------|----------|------|
| `SKILL.md` 文件名 | ★★★★★ | Claude Code skill 的唯一标识文件 |
| frontmatter `name:` + `description:` | ★★★★☆ | 区分 skill 和普通 markdown |
| `allowed-tools:` frontmatter 字段 | ★★★★☆ | 只有高质量 skill 使用 |
| `.claude-plugin/plugin.json` | ★★★★☆ | 完整 plugin 集合的标识 |
| `path:.claude/skills/` | ★★★★★ | 标准安装路径 |
| `path:.agents/skills/` | ★★★☆☆ | Codex 跨平台路径 |
| `path:.github/skills/` | ★★★☆☆ | Copilot 跨平台路径 |
| `hooks/hooks.json` + `SessionStart` | ★★☆☆☆ | hooks 配置 |

## 精准搜索查询清单

### GitHub 原生 Code Search（在 github.com/search 执行）

| 查询 | 用途 | 优先级 |
|------|------|--------|
| `path:.claude/skills filename:SKILL.md` | 全量发现所有 Claude Code skills | P0 |
| `(path:.claude/skills OR path:.agents/skills) filename:SKILL.md` | 跨平台发现 | P0 |
| `filename:SKILL.md content:"allowed-tools"` | 找使用高级功能的 skill | P1 |
| `path:.claude-plugin filename:plugin.json` | 找完整 plugin 集合 | P1 |
| `filename:SKILL.md content:"security" OR content:"audit"` | Gap-driven 示例 | P2 |
| `filename:SKILL.md NOT path:node_modules NOT is:fork` | 去噪 | P2 |

### Google（覆盖 GitHub 索引盲区）

| 查询 | 用途 | 优先级 |
|------|------|--------|
| `site:github.com inurl:.claude/skills SKILL.md` | 最有效 Google 查询 | P0 |
| `site:github.com ".claude/skills" "name:" "description:" filetype:md` | frontmatter 过滤 | P1 |
| `site:github.com "claude-code-skills" OR "agent-skills" SKILL.md 2026` | 按命名惯例+时间 | P2 |
| `site:github.com ".agents/skills" OR ".claude/skills" SKILL.md` | 跨平台 | P2 |

### `gh search code` CLI（需认证环境）

```bash
gh search code "path:.claude/skills filename:SKILL.md" --limit 100
gh search code "filename:SKILL.md content:allowed-tools" --limit 50
```

## 安全审查管道

### 静态安全扫描（自动化 grep）

发现候选后，对 SKILL.md 和相关文件执行以下检查：

```bash
# 高危信号 — 任一命中则标记为 RED FLAG
grep -rn 'curl.*|.*sh\|wget.*|.*bash' .         # 远程执行
grep -rn 'process\.env\|\.ssh\|\.aws' .          # 凭证读取
grep -rn 'base64\|atob\|btoa' .                  # 编码 payload
grep -rn 'http[s]*://[^github\|^anthropic]' .    # 外部 URL
grep -rn 'eval\|exec\|Function(' .               # 动态执行
```

### 审查流程

1. Stars 门槛过滤（1-6 月 >= 1K，> 6 月 >= 2K，S/S- creator >= 500）
2. 静态安全扫描（上述 grep）
3. 人工读 SKILL.md 确认无 prompt injection
4. 小范围测试（先在非关键项目中使用）

## Skill 市场安全评级

| 市场 | 数量 | 质量控制 | 安全级别 | 用法 |
|------|------|----------|----------|------|
| **Anthropic 官方** | ~68 | 内部审核 | 🟢 安全 | 直接安装 |
| **S/S- creator 仓库** | ~200 | 创作者信誉 | 🟢 安全 | 直接安装 |
| **Nori Skillsets** | 少量精选 | 人工审核 | 🟡 谨慎 | 审核后安装 |
| **CCPM** | 少量 | 基本检查 | 🟡 谨慎 | 审核后安装 |
| **GitHub 搜索结果** | 60K+ | 无 | 🟡 谨慎 | 必须三层漏斗 |
| **SkillHub** | 7K+ | AI 自动评估 | 🔴 危险 | 仅作发现线索 |
| **SkillsMP** | 66K+ | 2 stars 门槛 | 🔴 危险 | 仅作发现线索 |
| **OpenClaw/ClawHub** | 10K+ | 几乎没有 | ⛔ 禁用 | **20% 恶意率，不兼容 CC，不使用** |

> **OpenClaw 详情**：Snyk 扫描 3,984 个 skill，36% 含 prompt injection；Koi Security 发现 341 个恶意；
> 单用户 "hightower6eu" 上传 354 个恶意包。CVE-2026-25253（CVSS 8.8）一键 RCE。
> 与 Claude Code 格式不兼容（需桥接），完全不碰。

## ROI 排序（聚集地）

| 排名 | 聚集地 | ROI | 推荐频率 |
|------|--------|-----|---------|
| 1 | **GitHub Code Search（签名查询）** | ★★★★★ | 每月全量扫描 |
| 2 | Anthropic 官方 marketplace JSON | ★★★★★ | 每次发现 |
| 3 | GitHub awesome 列表（含 issues 区） | ★★★★★ | 每周 |
| 4 | **Google 签名搜索** | ★★★★☆ | 每月 |
| 5 | Twitter/X 策展人 | ★★★★☆ | 每周 |
| 6 | 技术博客/Newsletter | ★★★★☆ | 每两周 |
| 7 | Reddit (r/ClaudeAI, r/ClaudeCode) | ★★★☆☆ | 每月 |
| 8 | Hacker News (Show HN) | ★★★☆☆ | 每月 |
| 9 | 中文社区（V2EX/知乎/即刻） | ★★★☆☆ | 每月 |
| 10 | YouTube | ★★☆☆☆ | 偶尔 |
| 11 | Discord | ★★☆☆☆ | 不推荐定期 |

## Tier 1 高 ROI 来源

### Anthropic 官方
- `anthropics/claude-plugins-official` → `marketplace.json`（可直接 parse）
- `anthropics/skills` → 官方 Agent Skills 仓库
- `claude.com/plugins` → 101 个插件（33 Anthropic + 68 合作方）

### GitHub Awesome 列表（按独特发现排序）
- `hesreallyhim/awesome-claude-code` (30.7K) — **issues 区是金矿**
- `ComposioHQ/awesome-claude-skills` (47K) — 跨平台分类最全
- `VoltAgent/awesome-agent-skills` (12.5K) — 含官方 dev team skills
- `travisvn/awesome-claude-skills` (9.5K) — 独立策展
- `BehiSecc/awesome-claude-skills` (7.8K) — 安全方向突出
- `libukai/awesome-agent-skills` — 中文作者，含 skills.sh 排行榜
- `JackyST0/awesome-agent-skills` — V2EX 来源，含微软 Azure 131 skills

### Twitter/X 高质量策展账号
- `@aiwarts`（卡尔的AI沃茨）— 中文实测推荐
- `@omarsar0`（elvis）— Anthropic 内部视角
- `@vista8`（向阳乔木）— CC 版本更新实测

### 技术博客/Newsletter
- buildtolaunch.substack.com — 实测 10 留 4
- baoyu.io — Anthropic 内部实践中文翻译
- scriptbyai.com — 100+ 人工审核资源列表
- dev.to/valgard — 月度 must-haves

## 执行节奏

### 每周必做（< 30 分钟）
1. 解析 `anthropics/claude-plugins-official` 的 `marketplace.json` diff
2. 检查 `hesreallyhim/awesome-claude-code` 的新 issues + merged PRs
3. X 搜索：`"claude code skill" OR "SKILL.md" min_faves:100 since:7days`

### 每月做一次（< 2 小时）
1. **GitHub Code Search 全量扫描**：`path:.claude/skills filename:SKILL.md` → 与上月结果 diff
2. **Google 签名搜索**：`site:github.com inurl:.claude/skills SKILL.md` → 新结果筛查
3. 扫描 scriptbyai.com 和 awesome-skills.com 新增条目
4. HN Algolia 搜索上月 Show HN submissions
5. V2EX + 知乎搜索最新讨论
6. buildtolaunch / dev.to 的 must-haves 文章

### 每季度做一次
1. Gap 分析：列出当前 skill 缺口 → gap-driven 精准搜索
2. 已安装 skill 健康检查（`/health-check`）
3. 安全审查更新：检查已安装 skill 的最新 commit 是否引入异常
