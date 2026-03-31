---
title: Rethinking the Design Space of RL for Diffusion Models — On the Importance of Likelihood Estimation Beyond Loss Design
date: 2026-03-28
tag: Diffusion
excerpt: 系统分析 RL fine-tuning diffusion model 的三大设计维度，发现 ELBO-based likelihood estimation 是主导效率与性能的核心因素，而非 policy-gradient loss 的具体形式；最终方法在 90 GPU hours 内将 SD3.5-M 的 GenEval 从 0.24 提升至 0.95。
---

# 背景与动机

Diffusion/Flow model（DDPM、Stable Diffusion、SD3.5 等）已成为 text-to-image 生成的主流范式。
**Post-training with RL** 的目标是在预训练模型基础上，通过外部 reward signal（人类偏好、任务指标）进一步对齐生成结果，形式化为：

$$
\max_\theta \mathbb{E}_{x \sim \pi_\theta}[R(x)] - \beta \, \mathrm{KL}(\pi_\theta \| \pi_\mathrm{ref})
$$

最优解为 $\pi^*(x) \propto \pi_\mathrm{ref}(x) \exp(R(x)/\beta)$。

LLM 领域 PPO/GRPO 大获成功，但直接迁移到 diffusion model 存在根本障碍：**diffusion model 不是 likelihood-based 模型，无法直接计算 $\log \pi_\theta(x_0)$**，而 policy gradient 方法恰恰依赖这一项。现有工作（FlowGRPO 等）对此的处理方式不同，但缺乏系统性分析。

---

# 设计空间的三个维度

本文将 RL fine-tuning 的设计空间解耦为三个正交维度，逐一控制变量分析：

| 维度 | 候选方案 |
|------|----------|
| Policy-gradient objective | EPG / PEPG / PAR / GRPO |
| Likelihood estimator | Trajectory-based（FlowGRPO）/ ELBO-based |
| Sampling strategy | SDE / ODE |

**核心结论：Likelihood estimation 是主导因素，policy-gradient loss 的选择影响甚微。**

---

# Likelihood Estimation：两种路线

## Trajectory-based estimator（FlowGRPO）

利用反向 SDE 的 Gaussian transition 逐步分解 likelihood：

$$
\log \pi_\theta(x_0) = \sum_{i=1}^N \log p_\theta(x_{t_{i-1}} | x_{t_i}), \quad
p_\theta(x_{t_{i-1}}|x_{t_i}) = \mathcal{N}\!\left(\mu_\theta,\; g_{t_i}^2(t_i - t_{i-1})I\right)
$$

**缺点：**
- 必须使用 SDE sampler（ODE 下 $p_\theta(x_{t_{i-1}}|x_{t_i})$ 退化为 delta，估计失效）
- 需要存储完整的采样轨迹（所有中间 $x_t$），内存开销与 NFE 数线性相关
- 训练时 sampler 与推理时不同，存在 train-inference mismatch

## ELBO-based estimator（本文）

利用 flow matching 的训练目标直接近似 $\log \pi_\theta(x_0)$：

$$
\log \pi_\theta(x_0) \approx -\mathbb{E}_{t,\epsilon}\!\left[w(t)\|v_\theta(x_t, t) - v\|^2\right] + C_\mathrm{fw}(x_0)
$$

其中 $v = \epsilon - x_0$（flow model 的 conditional velocity），$C_\mathrm{fw}$ 与 $\theta$ 无关，不影响梯度。

**优点：**
- 只需最终生成样本 $x_0$，**无需存储轨迹**，节省大量显存
- 与 sampler 完全解耦，可使用任意 black-box ODE solver
- 计算量远低于 trajectory 方案

### ELBO Weighting 的三种变体

| 名称 | $w(t)$ | 备注 |
|------|--------|------|
| Path-KL | $\frac{1-t}{t}$ | 来自 score-based 原始推导，实验中**训练不稳定** |
| Simple | $1$ | 常数权重，简单有效 |
| Adaptive | $\frac{t \cdot d \cdot \|v_\theta - v\|_2^2}{\mathrm{sg}(\|v_\theta - v\|_1)}$ | 数据依赖的自归一化，**默认推荐** |

**ELBO 的 Monte Carlo 估计方案：**
- *Single-timestep*：每次随机抽一个 $t_i$，估计一步，计算最廉价
- *All-timestep*：对完整离散时间轴 $\{1/N, \ldots, 1\}$ 求均值，方差更小

实验表明两者性能相当，**推荐 single-timestep** 以降低计算开销。

---

# Policy-Gradient Objectives

## EPG（Exact Policy Gradient）

REINFORCE + group mean baseline，相比 GRPO 做了三处简化：

$$
\mathcal{L}_\mathrm{epg}(\theta) = \mathbb{E}_{x^i \sim \pi_{\theta_\mathrm{old}}}\!\left[\mathrm{sg}(\rho_\theta)(x^i) A^i_\mathrm{epg} \log \pi_\theta(x^i) - \beta\, \mathrm{kl}(x^i)\right]
$$

1. **去掉 Clipping**：$\epsilon$ 难以调优，在 diffusion 设置下更不稳定，实验证明去掉无损
2. **去掉 Std Normalization**：连续 reward 分布下 std 差异小，normalization 引入 prompt-level bias
3. **去掉 CFG**：CFG 使采样分布更尖锐/集中，与无 guidance 的训练分布不匹配，且双倍 NFE

## PEPG（Proximal Exact Policy Gradient）

在概率测度空间上做 proximal gradient descent，理论上等价于 trust-region 约束但无需 clipping heuristic：

$$
\mathcal{L}_\mathrm{pepg}(\theta) = \mathbb{E}\!\left[\left(A^i - \log \mathrm{sg}(\rho_\theta)(x^i)\right)\mathrm{sg}(\rho_\theta)(x^i)\log \pi_\theta(x^i) - \eta\, \mathrm{kl}(x^i)\right]
$$

迭代更新存在闭式解：

$$
\pi_{k+1}(x_0) \propto \left[\exp(R(x_0)/\beta)\,\pi_\mathrm{ref}(x_0)\right]^{\frac{\eta}{1+\eta}} \pi_k(x_0)^{\frac{1}{1+\eta}}
$$

当 $k \to \infty$ 时收敛至目标 $\pi^*$。

## PAR（Proximal Advantage Regression）

用 $L_2$ 回归让 log-ratio 匹配 advantage，结构类似 GFlowNet trajectory balance：

$$
\mathcal{L}_\mathrm{par}(\theta) = \mathbb{E}\!\left[\frac{1}{2}\mathrm{sg}(\rho_\theta)(x^i)\left\|A^i - \log \rho_\theta(x^i)\right\|^2 - \eta\, \mathrm{kl}(x^i)\right]
$$

**Theorem 3.1**：EPG、PEPG、PAR 三者共享相同的最优解 $\pi^*(x) \propto \pi_\mathrm{ref}(x)\exp(R(x)/\beta)$。

---

# 实验结果

## 主要效率对比（GenEval 0.95）

| 方法 | GPU Hours (8×H100) |
|------|-------------------|
| FlowGRPO (w/ CFG) | 422.9 |
| DiffusionNFT | 340.8 |
| Ours (ELBO, SDE) | 185.4 |
| **Ours (ELBO, ODE)** | **90.4** |

- ELBO vs Trajectory：**4.68× 加速**（prompt efficiency）
- ODE vs SDE（ELBO 下）：性能持平，但 ODE 仅需 10 steps（vs SDE 40 steps），**额外 ~2× 加速**

## 多 Benchmark 对比（Tab. 2）

| 方法 | GenEval | OCR | PickScore | HPSv2.1 | Aesthetic |
|------|---------|-----|-----------|---------|-----------|
| FlowGRPO | 0.95 | 0.92 | 22.51 | 0.274 | 5.32 |
| DiffusionNFT | 0.95 | 0.93 | 22.88 | 0.289 | 5.25 |
| **Ours** | **0.96** | **0.94** | **22.93** | **0.289** | **5.33** |

## Policy-gradient loss 的影响（Tab. 1，ELBO+ODE 下）

| Loss | GenEval | PickScore |
|------|---------|-----------|
| EPG | 0.96 | 22.77 |
| PEPG | 0.96 | 22.85 |
| PAR | 0.96 | 22.97 |
| GRPO | 0.94 | 22.45 |

差异极小，验证了 **loss 选择不是主导因素**。

---

# 与相关工作的关系

```
FlowGRPO   →  GRPO loss  + Trajectory estimator + SDE  （重、慢）
AWM        →  GRPO loss  + ELBO (simple, 1-sample) + ODE  
DiffusionNFT → NFT-style + ELBO (adaptive) + ODE（多阶段训练，SOTA）
本文        →  极简 loss (PEPG/PAR/EPG) + ELBO (adaptive) + ODE（单阶段、更快）
```

AWM 本质上已经用了 ELBO+ODE，但沿用了 GRPO 的 loss 工程；本文进一步剥离了 loss 设计的影响，证明极简 EPG 即可达到同等效果。

---

# 实践建议（来自论文）

- **默认配置**：PEPG loss + Adaptive ELBO + ODE sampler (10 steps) + 无 CFG
- ELBO weighting 避免使用 Path-KL（训练不稳定）
- Single-timestep Monte Carlo 估计足够，无需全轨迹
- Clipping、std normalization、CFG 均可去掉
- KL divergence 估计采用 simple weighting ($w(t)=1$)，实现简单且有效
