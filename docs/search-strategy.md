# Skill 发现搜索策略

> 生成日期：2026-03-23
> 基于 AEE 分析 9 个聚集地的 ROI

## ROI 排序

| 排名 | 聚集地 | ROI | 推荐频率 |
|------|--------|-----|---------|
| 1 | Anthropic 官方 marketplace JSON | ★★★★★ | 每次发现 |
| 2 | GitHub awesome 列表（含 issues 区） | ★★★★★ | 每周 |
| 3 | Twitter/X 策展人 | ★★★★☆ | 每周 |
| 4 | 技术博客/Newsletter | ★★★★☆ | 每两周 |
| 5 | Reddit (r/ClaudeAI, r/ClaudeCode) | ★★★☆☆ | 每月 |
| 6 | Hacker News (Show HN) | ★★★☆☆ | 每月 |
| 7 | 中文社区（V2EX/知乎/即刻） | ★★★☆☆ | 每月 |
| 8 | YouTube | ★★☆☆☆ | 偶尔 |
| 9 | Discord | ★★☆☆☆ | 不推荐定期 |

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

## 每周必做（< 30 分钟）
1. 解析 `anthropics/claude-plugins-official` 的 `marketplace.json` diff
2. 检查 `hesreallyhim/awesome-claude-code` 的新 issues + merged PRs
3. X 搜索：`"claude code skill" OR "SKILL.md" min_faves:100 since:7days`

## 每月做一次（< 2 小时）
1. 扫描 scriptbyai.com 和 awesome-skills.com 新增条目
2. HN Algolia 搜索上月 Show HN submissions
3. V2EX + 知乎搜索最新讨论
4. buildtolaunch / dev.to 的 must-haves 文章
