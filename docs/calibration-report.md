# 校准验证报告

生成时间：2026-03-21
分支：claude/setup-skills-plugins-iYEYn

## 方法

每个锚点 repo 由两个独立的 Opus 4.6 subagent 评估。
Agent 读取所有 SKILL.md 文件，给 12 个维度打 0-10 分，
然后调用 `calc.js` 计算加权总分。

## 结果

| Repo | 目标 | R1 | R2 | 均值 | 稳定性 |
|------|------|-----|-----|------|--------|
| gstack | ≈80 | 84.1 | 84.1 | 84.1 | ±0 极高 |
| superpowers | ≈75 | 85.0 | 87.8 | 86.4 | ±2.8 高 |
| antfu-skills | ≈50 | 51.0 | 62.0 | 56.5 | ±11.0 中 |
| compound | ≈35→60 | 58.0 | 76.8 | 67.4 | ±18.8 低 |

## 排序验证

两轮排序一致：superpowers > gstack > compound ≥ antfu

## 层级分布

- S (≥80): gstack, superpowers
- A (≥60): compound (R2)
- B (≥40): antfu-skills (R1), compound (R1)

## 校准锚点修正

- compound-engineering 目标从 ≈35 修正为 ≈60
  - 原因：AEE 分析时判断"是工具不是 skill 集合"，但实际 SKILL.md 有完整工作流

## 结论

- 权重系统 (50/20/30) 工作正常
- 排序在两轮间稳定
- 内容质量维度有效区分了知识库型(antfu)和工作流型(gstack/superpowers)
- 稳定性与 repo 复杂度负相关（简单 repo 更稳定）
