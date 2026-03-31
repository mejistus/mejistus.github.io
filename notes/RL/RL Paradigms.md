---
title: 主流强化学习方法范式综述：策略梯度、值函数、Actor-Critic 及现代变体
date: 2026-03-29
tag: RL
excerpt: 系统梳理强化学习核心范式，涵盖值函数法（MC、TD、Q-Learning、DQN）、策略梯度法（REINFORCE、PPO、TRPO）、Actor-Critic 族（A2C、SAC）及面向 LLM 的 GRPO，每种方法附完整伪代码与核心公式。
---

# 强化学习基础框架

强化学习（Reinforcement Learning, RL）的基本要素：

- **状态** $s \in \mathcal{S}$：环境的描述
- **动作** $a \in \mathcal{A}$：智能体的选择
- **奖励** $r \in \mathbb{R}$：环境的反馈信号
- **策略** $\pi(a|s)$：从状态到动作的映射（概率分布）
- **转移函数** $P(s'|s, a)$：环境动态
- **折扣因子** $\gamma \in [0, 1)$：对未来奖励的折扣

**优化目标**：最大化期望累积折扣回报

$$
J(\pi) = \mathbb{E}_{\tau \sim \pi}\left[\sum_{t=0}^{T} \gamma^t r_t\right]
$$

**关键函数定义：**

$$
V^\pi(s) = \mathbb{E}_\pi\left[\sum_{t=0}^\infty \gamma^t r_t \mid s_0 = s\right] \quad \text{（状态值函数）}
$$

$$
Q^\pi(s, a) = \mathbb{E}_\pi\left[\sum_{t=0}^\infty \gamma^t r_t \mid s_0 = s, a_0 = a\right] \quad \text{（动作值函数）}
$$

$$
A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s) \quad \text{（优势函数）}
$$

---

# 一、值函数方法（Value-Based Methods）

值函数方法的核心思路：**不直接优化策略，而是学习值函数，再从值函数导出策略**（贪心或 $\epsilon$-greedy）。

## 1.1 Monte Carlo 方法

**思路**：用完整轨迹的实际回报 $G_t$ 作为 $Q(s,a)$ 的无偏估计，然后更新值函数。

$$
G_t = \sum_{k=0}^{T-t} \gamma^k r_{t+k}
$$

$$
Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha\left[G_t - Q(s_t, a_t)\right]
$$

**特点：**
- 无偏，但方差高（依赖完整轨迹）
- 只适用于 episodic 任务

```
算法：Monte Carlo Control（每次访问型）
─────────────────────────────────────────
输入：环境 env，学习率 α，折扣 γ，探索率 ε，迭代轮数 N
初始化：Q(s,a) ← 0，Returns(s,a) ← []

for episode = 1 to N:
    # 用 ε-greedy 策略生成完整轨迹
    τ = []
    s ← env.reset()
    while not done:
        以概率 ε 随机选动作，否则 a = argmax_a Q(s,a)
        s', r, done ← env.step(a)
        τ.append((s, a, r))
        s ← s'

    # 反向计算回报并更新
    G ← 0
    for (s_t, a_t, r_t) in reversed(τ):
        G ← γ·G + r_t
        Returns(s_t, a_t).append(G)
        Q(s_t, a_t) ← mean(Returns(s_t, a_t))

return Q
```

---

## 1.2 时序差分（TD Learning）

**思路**：不等轨迹结束，用**单步 bootstrap** 更新值函数：

$$
V(s_t) \leftarrow V(s_t) + \alpha\left[\underbrace{r_t + \gamma V(s_{t+1})}_{\text{TD target}} - V(s_t)\right]
$$

TD error（$\delta_t$）：

$$
\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)
$$

**特点**：有偏但方差低，可在线更新，不依赖完整轨迹。

```
算法：TD(0) 策略评估
─────────────────────────────────────────
输入：策略 π，学习率 α，折扣 γ，迭代轮数 N
初始化：V(s) ← 0 for all s

for episode = 1 to N:
    s ← env.reset()
    while not done:
        a ← π(s)
        s', r, done ← env.step(a)
        
        # TD(0) 更新
        δ ← r + γ·V(s') - V(s)
        V(s) ← V(s) + α·δ
        
        s ← s'

return V
```

---

## 1.3 Q-Learning

**思路**：off-policy TD，直接学习最优动作值函数 $Q^*$：

$$
Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha\left[r_t + \gamma \max_{a'} Q(s_{t+1}, a') - Q(s_t, a_t)\right]
$$

**off-policy 特性**：行为策略（$\epsilon$-greedy）与目标策略（greedy）可以不同。

```
算法：Q-Learning
─────────────────────────────────────────
输入：环境 env，学习率 α，折扣 γ，探索率 ε，迭代轮数 N
初始化：Q(s,a) ← 0 for all s, a

for episode = 1 to N:
    s ← env.reset()
    while not done:
        # ε-greedy 选动作（行为策略）
        if random() < ε:
            a ← random_action()
        else:
            a ← argmax_{a'} Q(s, a')
        
        s', r, done ← env.step(a)
        
        # Q-Learning 更新（目标策略为 greedy）
        td_target ← r + γ · max_{a'} Q(s', a')
        Q(s, a) ← Q(s, a) + α · (td_target - Q(s, a))
        
        s ← s'

return Q
```

---

## 1.4 Deep Q-Network（DQN）

**思路**：用神经网络 $Q_\phi(s, a)$ 近似 Q 函数，解决大状态空间问题。引入两项关键技巧：

1. **Experience Replay**：从 replay buffer $\mathcal{D}$ 中随机采样 mini-batch，打破样本相关性
2. **Target Network**：用滞后参数 $\phi^-$ 计算 TD target，稳定训练

$$
\mathcal{L}(\phi) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}}\!\left[\left(r + \gamma \max_{a'} Q_{\phi^-}(s', a') - Q_\phi(s, a)\right)^2\right]
$$

```
算法：DQN（Deep Q-Network）
─────────────────────────────────────────
输入：神经网络 Q_φ，目标网络 Q_{φ⁻}，Replay Buffer D（容量 N_buf）
超参：batch size B，target 更新频率 C，探索衰减 ε_decay

初始化：φ ← 随机参数，φ⁻ ← φ，D ← 空

for episode = 1 to MAX_EPISODES:
    s ← env.reset()
    while not done:
        # ε-greedy 探索
        if random() < ε:
            a ← random_action()
        else:
            a ← argmax_{a'} Q_φ(s, a')
        
        s', r, done ← env.step(a)
        D.push((s, a, r, s', done))      # 存入 replay buffer
        s ← s'
        ε ← max(ε_min, ε · ε_decay)
        
        if |D| < B: continue
        
        # 从 replay buffer 采样 mini-batch
        {(s_i, a_i, r_i, s'_i, done_i)} ← D.sample(B)
        
        # 计算 TD target
        y_i ← r_i + γ · max_{a'} Q_{φ⁻}(s'_i, a') · (1 - done_i)
        
        # 梯度下降更新 Q_φ
        L ← (1/B) Σ_i (y_i - Q_φ(s_i, a_i))²
        φ ← φ - η · ∇_φ L
        
        # 定期同步 target network
        if step % C == 0:
            φ⁻ ← φ

return φ
```

> **DQN 的重要变体：**
> - **Double DQN**：解耦选动作与评估，用 $Q_\phi$ 选 $a^*$，用 $Q_{\phi^-}$ 估值，缓解过估计
> - **Dueling DQN**：将网络头拆分为 $V(s)$ 和 $A(s,a)$，提升学习效率
> - **Prioritized Experience Replay**：按 TD error 大小对 replay buffer 加权采样

---

# 二、策略梯度方法（Policy Gradient Methods）

值函数方法在**连续动作空间**或**随机策略**上难以应用，策略梯度方法直接对策略参数 $\theta$ 求梯度。

**策略梯度定理（Policy Gradient Theorem）：**

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[\sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t\right]
$$

---

## 2.1 REINFORCE

**思路**：用 Monte Carlo 回报 $G_t$ 估计策略梯度，无偏但高方差。

$$
\nabla_\theta J(\theta) \approx \frac{1}{N}\sum_{n=1}^N \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t^n|s_t^n) \cdot G_t^n
$$

引入 **baseline** $b(s_t)$（通常为 $V(s_t)$）减小方差，不影响梯度期望：

$$
\nabla_\theta J(\theta) \approx \frac{1}{N}\sum_{n=1}^N \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t^n|s_t^n) \cdot (G_t^n - b(s_t^n))
$$

```
算法：REINFORCE（带 baseline）
─────────────────────────────────────────
输入：策略网络 π_θ，值网络 V_φ（baseline），学习率 α_θ, α_φ
超参：折扣 γ，episode 数 N

for episode = 1 to N:
    # 收集完整轨迹
    τ = []
    s ← env.reset()
    while not done:
        a ← π_θ(·|s).sample()
        s', r, done ← env.step(a)
        τ.append((s, a, r))
        s ← s'
    
    # 反向计算折扣回报
    G ← 0
    returns = []
    for (s_t, a_t, r_t) in reversed(τ):
        G ← γ·G + r_t
        returns.prepend(G)
    
    # 标准化回报（减小方差）
    returns ← (returns - mean(returns)) / (std(returns) + ε)
    
    # 更新策略和值网络
    for t, (s_t, a_t, r_t) in enumerate(τ):
        advantage ← returns[t] - V_φ(s_t)             # baseline 修正
        
        # 策略梯度更新
        θ ← θ + α_θ · advantage · ∇_θ log π_θ(a_t|s_t)
        
        # 值网络更新（MSE loss）
        φ ← φ - α_φ · ∇_φ (returns[t] - V_φ(s_t))²

return θ
```

---

## 2.2 TRPO（Trust Region Policy Optimization）

**核心问题**：策略梯度更新步长难以控制，步子太大会破坏策略。

**TRPO 的思路**：在**信赖域（trust region）**内约束更新，确保新旧策略的 KL 散度不超过阈值 $\delta$：

$$
\max_\theta \; \mathbb{E}_{s,a \sim \pi_{\theta_\mathrm{old}}}\left[\frac{\pi_\theta(a|s)}{\pi_{\theta_\mathrm{old}}(a|s)} A^{\pi_{\theta_\mathrm{old}}}(s,a)\right]
$$

$$
\text{s.t.} \quad \mathbb{E}_s\left[\mathrm{KL}(\pi_{\theta_\mathrm{old}}(\cdot|s) \| \pi_\theta(\cdot|s))\right] \leq \delta
$$

求解方法：**共轭梯度 + 线搜索**（计算开销大）。

```
算法：TRPO
─────────────────────────────────────────
输入：策略 π_θ，值网络 V_φ，KL 约束 δ，回退系数 α，最大回退次数 K

for iteration = 1 to MAX_ITER:
    # 收集轨迹数据
    D ← collect_trajectories(π_θ)
    
    # 估计优势函数（GAE 或 MC）
    A ← compute_advantages(D, V_φ)
    
    # 计算替代目标的梯度 g
    L_surr ← E_{s,a~D}[ (π_θ(a|s) / π_θ_old(a|s)) · A ]
    g ← ∇_θ L_surr
    
    # 用共轭梯度法求解 H⁻¹g（H 为 Fisher 信息矩阵）
    d ← conjugate_gradient(H_vec_product, g)    # 避免显式计算 H
    
    # 计算最大步长
    step_size ← sqrt(2δ / (d^T · H · d))
    
    # 线搜索满足 KL 约束
    for k = 0 to K:
        θ_new ← θ + (α^k · step_size) · d
        if KL(π_θ_old, π_{θ_new}) ≤ δ and L_surr(θ_new) > L_surr(θ):
            θ ← θ_new
            break
    
    # 更新值网络
    φ ← update_value_network(V_φ, D)

return θ
```

---

## 2.3 PPO（Proximal Policy Optimization）

**思路**：TRPO 的轻量化替代，用**截断 clip** 代替硬约束，实现近似 trust-region 效果：

$$
\mathcal{L}^\mathrm{CLIP}(\theta) = \mathbb{E}_t\left[\min\left(\rho_t(\theta) A_t,\; \mathrm{clip}(\rho_t(\theta), 1-\varepsilon, 1+\varepsilon) A_t\right)\right]
$$

其中 $\rho_t(\theta) = \dfrac{\pi_\theta(a_t|s_t)}{\pi_{\theta_\mathrm{old}}(a_t|s_t)}$ 为重要性权重。

**完整 PPO 损失（加值函数和熵正则）：**

$$
\mathcal{L}(\theta) = \mathcal{L}^\mathrm{CLIP}(\theta) - c_1 \mathcal{L}^\mathrm{VF}(\theta) + c_2 \mathcal{H}[\pi_\theta]
$$

```
算法：PPO-Clip
─────────────────────────────────────────
输入：Actor π_θ，Critic V_φ，clip 系数 ε，熵系数 c₂，值函数系数 c₁
超参：GAE λ，折扣 γ，epoch 数 K，mini-batch 数 M

for iteration = 1 to MAX_ITER:
    # Phase 1：用旧策略收集 T 步数据
    D ← []
    s ← env.reset()
    for t = 1 to T:
        a, log_prob_old ← π_θ(s)          # 记录旧策略的 log prob
        s', r, done ← env.step(a)
        D.append((s, a, r, s', done, log_prob_old))
        s ← s' if not done else env.reset()
    
    # Phase 2：计算 GAE 优势估计
    advantages, returns ← compute_GAE(D, V_φ, γ, λ)
    advantages ← normalize(advantages)
    
    # Phase 3：多轮 mini-batch 更新
    for epoch = 1 to K:
        for mini-batch (s, a, A, R, log_prob_old) in shuffle(D, M):
            log_prob_new ← π_θ.log_prob(a|s)
            ρ ← exp(log_prob_new - log_prob_old)     # 重要性权重
            
            # Clip 目标
            L_clip ← mean( min(ρ·A,  clip(ρ, 1-ε, 1+ε)·A) )
            
            # 值函数损失
            L_vf ← mean( (V_φ(s) - R)² )
            
            # 熵奖励（鼓励探索）
            H ← mean( π_θ.entropy(s) )
            
            # 总损失
            L ← -L_clip + c₁·L_vf - c₂·H
            
            # 梯度更新
            θ, φ ← optimizer.step(∇L)

return θ, φ
```

> **PPO 的关键超参：**
> - $\varepsilon \in [0.1, 0.3]$：clip 范围，越小越保守
> - $\lambda \in [0.9, 0.99]$：GAE 的 bias-variance tradeoff
> - $K \in [3, 10]$：每批数据复用的 epoch 数

---

# 三、Actor-Critic 方法

Actor-Critic 将策略（Actor）和值函数（Critic）结合，用 Critic 估计 advantage 以降低 Actor 梯度的方差。

## 3.1 A2C / A3C

**A2C（Advantage Actor-Critic）** 是同步版本，A3C 是异步多线程版本。

**Actor 更新**：用 advantage $A_t = r_t + \gamma V(s_{t+1}) - V(s_t)$ 加权策略梯度：

$$
\nabla_\theta J(\theta) = \mathbb{E}_t\left[\nabla_\theta \log \pi_\theta(a_t|s_t) \cdot A_t\right]
$$

**Critic 更新**：最小化 TD error：

$$
\mathcal{L}_\mathrm{critic} = \mathbb{E}_t\left[(r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t))^2\right]
$$

```
算法：A2C（同步 Advantage Actor-Critic）
─────────────────────────────────────────
输入：Actor π_θ，Critic V_φ，n 个并行环境，n-step 回报长度 N_step

初始化 n 个并行环境 {env_i}

for iteration = 1 to MAX_ITER:
    # 并行收集 N_step 步数据
    trajectories ← []
    for each env_i in parallel:
        for t = 1 to N_step:
            a_i ← π_θ(s_i).sample()
            s'_i, r_i, done_i ← env_i.step(a_i)
            trajectories[i].append((s_i, a_i, r_i, done_i))
            s_i ← s'_i if not done_i else env_i.reset()
    
    # 计算 n-step returns 和 advantages
    for each trajectory:
        R ← V_φ(s_last) if not done else 0
        for (s_t, a_t, r_t, done_t) in reversed(trajectory):
            R ← r_t + γ·R·(1 - done_t)
            A_t ← R - V_φ(s_t)
    
    # Actor 损失
    L_actor ← -mean( log π_θ(a_t|s_t) · A_t ) - c_entropy · H[π_θ]
    
    # Critic 损失
    L_critic ← mean( (R_t - V_φ(s_t))² )
    
    # 联合更新
    L ← L_actor + c_vf · L_critic
    θ, φ ← optimizer.step(∇L)

return θ, φ
```

---

## 3.2 SAC（Soft Actor-Critic）

**思路**：最大熵 RL，在奖励中加入策略熵，鼓励探索、提升鲁棒性：

$$
J(\pi) = \mathbb{E}_{\tau \sim \pi}\left[\sum_t \gamma^t \left(r_t + \alpha \mathcal{H}[\pi(\cdot|s_t)]\right)\right]
$$

使用 **Soft Bellman 方程**：

$$
Q(s, a) = r + \gamma \mathbb{E}_{s'}\left[V(s')\right], \quad V(s) = \mathbb{E}_{a \sim \pi}\left[Q(s,a) - \alpha \log \pi(a|s)\right]
$$

Actor 更新最小化 KL 散度：

$$
\pi_\mathrm{new} = \arg\min_\pi \mathrm{KL}\!\left(\pi(\cdot|s) \;\Big\|\; \frac{\exp(Q(s,\cdot)/\alpha)}{Z}\right)
$$

```
算法：SAC（Soft Actor-Critic）
─────────────────────────────────────────
输入：Actor π_θ，双 Critic Q_{φ1}, Q_{φ2}，Target Critic Q_{φ1⁻}, Q_{φ2⁻}
超参：温度参数 α（或自动调节），Replay Buffer D，batch size B，soft update τ

初始化：θ, φ1, φ2 ← 随机，φ1⁻ ← φ1，φ2⁻ ← φ2

for step = 1 to MAX_STEPS:
    # 与环境交互
    a ← π_θ(s).sample()
    s', r, done ← env.step(a)
    D.push((s, a, r, s', done))
    s ← s'
    
    if |D| < B: continue
    
    # 采样 mini-batch
    {(s, a, r, s', done)} ← D.sample(B)
    
    # ---- Critic 更新 ----
    a' ← π_θ(s').sample()
    log_prob' ← π_θ.log_prob(a'|s')
    
    # Soft target（取双 Critic 最小值，缓解过估计）
    y ← r + γ·(1-done)·(min(Q_{φ1⁻}(s',a'), Q_{φ2⁻}(s',a')) - α·log_prob')
    
    L_Q ← mean((Q_{φ1}(s,a) - y)²) + mean((Q_{φ2}(s,a) - y)²)
    φ1, φ2 ← optimizer.step(∇_{φ} L_Q)
    
    # ---- Actor 更新 ----
    a_new ← π_θ(s).rsample()              # reparameterization trick
    log_prob ← π_θ.log_prob(a_new|s)
    
    L_π ← mean( α·log_prob - min(Q_{φ1}(s, a_new), Q_{φ2}(s, a_new)) )
    θ ← optimizer.step(∇_θ L_π)
    
    # ---- 自动调节温度参数 α（可选）----
    L_α ← mean( -α · (log_prob + target_entropy) )
    α ← optimizer.step(∇_α L_α)
    
    # Soft update target networks
    φ1⁻ ← τ·φ1 + (1-τ)·φ1⁻
    φ2⁻ ← τ·φ2 + (1-τ)·φ2⁻

return θ
```

> SAC 是目前**连续控制**任务的 SOTA 基线之一，双 Critic 和自动温度调节是其两大核心设计。

---

# 四、广义优势估计（GAE）

GAE（Generalized Advantage Estimation）是现代 Actor-Critic 方法（PPO、TRPO）中几乎通用的优势估计技术，通过参数 $\lambda$ 平衡偏差与方差：

$$
A_t^\mathrm{GAE}(\gamma, \lambda) = \sum_{l=0}^{\infty} (\gamma\lambda)^l \delta_{t+l}, \quad \delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)
$$

- $\lambda = 0$：纯 TD(0) estimate，**偏差高，方差低**
- $\lambda = 1$：等价于 Monte Carlo，**无偏，方差高**
- $\lambda \in (0.9, 0.99)$：实践中常用区间

```
函数：compute_GAE(trajectory, V_φ, γ, λ)
─────────────────────────────────────────
输入：轨迹 τ = {(s_t, a_t, r_t, done_t)}，值网络 V_φ

advantages ← []
gae ← 0

for (s_t, r_t, s_{t+1}, done_t) in reversed(τ):
    δ_t ← r_t + γ · V_φ(s_{t+1}) · (1 - done_t) - V_φ(s_t)
    gae ← δ_t + γ · λ · (1 - done_t) · gae
    advantages.prepend(gae)

returns ← advantages + [V_φ(s_t) for s_t in τ]   # advantages + baseline

return advantages, returns
```

---

# 五、面向 LLM/Diffusion 的现代变体

## 5.1 GRPO（Group Relative Policy Optimization）

GRPO 来自 DeepSeekMath，专为 LLM 的 RL post-training 设计，**无需单独的 Critic 网络**，用同一 prompt 下一组输出的相对奖励估计 advantage：

$$
A^i = \frac{R(x^i) - \mathrm{mean}(R^{1:G})}{\mathrm{std}(R^{1:G})}
$$

$$
\mathcal{L}_\mathrm{GRPO}(\theta) = \mathbb{E}\left[\min\!\left(\rho_\theta^i A^i,\; \mathrm{clip}(\rho_\theta^i, 1-\varepsilon, 1+\varepsilon) A^i\right) - \beta\, \mathrm{kl}(x^i)\right]
$$

```
算法：GRPO
─────────────────────────────────────────
输入：语言模型 π_θ，参考模型 π_ref，reward function R
超参：组大小 G，clip 系数 ε，KL 系数 β，迭代数 N

for iteration = 1 to N:
    # 采样一批 prompts
    for each prompt c:
        # 同一 prompt 生成 G 个响应
        {x¹, x², ..., x^G} ← π_{θ_old}(·|c).sample(G)
        
        # 计算各响应的奖励
        {R¹, R², ..., R^G} ← R({x^i})
        
        # 组内相对优势（无需 Critic）
        μ_R ← mean({R^i}),  σ_R ← std({R^i})
        A^i ← (R^i - μ_R) / (σ_R + ε)
        
        for each x^i:
            ρ^i ← π_θ(x^i) / π_{θ_old}(x^i)
            
            # KL 惩罚（per-token 近似）
            kl^i ← log(π_{θ_old}(x^i) / π_ref(x^i))
            
            # Clip 损失
            L^i ← min(ρ^i·A^i,  clip(ρ^i, 1-ε, 1+ε)·A^i) - β·kl^i
    
    # 梯度更新
    θ ← θ + η · ∇_θ mean({L^i})
    θ_old ← θ  # 更新采样策略

return θ
```

---

# 六、各方法对比总览

| 方法 | 类型 | 在线/离线 | 动作空间 | 核心优势 | 主要局限 |
|------|------|-----------|----------|---------|---------|
| Monte Carlo | Value-based | On-policy | 离散 | 无偏估计 | 高方差，需完整轨迹 |
| Q-Learning | Value-based | Off-policy | 离散 | 样本高效 | 不适用连续动作 |
| DQN | Value-based | Off-policy | 离散 | 扩展到高维状态 | 动作空间需离散 |
| REINFORCE | Policy-based | On-policy | 离散/连续 | 简单直接 | 高方差，收敛慢 |
| TRPO | Policy-based | On-policy | 离散/连续 | 单调性保证 | 计算开销大 |
| PPO | Actor-Critic | On-policy | 离散/连续 | 简单高效稳定 | 样本利用率一般 |
| A2C/A3C | Actor-Critic | On-policy | 离散/连续 | 并行加速 | 方差仍较高 |
| SAC | Actor-Critic | Off-policy | 连续 | 样本高效、鲁棒 | 超参敏感（α） |
| GRPO | Policy-based | On-policy | 离散（token）| 无需 Critic | 依赖 group reward |

---

# 七、选择指南

```
动作空间是否连续？
├── 否（离散）
│   ├── 状态空间小 → Q-Learning / Monte Carlo
│   └── 状态空间大（图像等）→ DQN / Dueling DQN
└── 是（连续）
    ├── 样本效率优先（机器人/控制）→ SAC / TD3
    ├── 稳定性优先（通用）→ PPO
    └── LLM/Diffusion post-training → GRPO / PPO 变体

是否有精确 likelihood？
├── 是（LLM 等自回归模型）→ PPO / GRPO 均可
└── 否（Diffusion model）→ 需要 ELBO 估计 likelihood（见上篇论文笔记）
```
````
