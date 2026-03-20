---
tag: Diffusion
title: ODE has no GRPO
---

# **问题**

为什么 deterministic flow 会导致计算 $p(x_{t−1} | x_t, c)$ 变得“computationally expensive”，以及“divergence estimation”到底指什么?

 **🔥 原句**

> This deterministic approach fails to meet the GRPO policy update requirements in two key ways:

> **(1) rᵗᵢ(θ) in Eq.5 requires computing p(xₜ₋₁ | xₜ, c), which becomes computationally expensive under deterministic dynamics due to divergence estimation.**

翻译：

> 该确定性（deterministic）的生成过程无法满足 GRPO 对策略更新的要求，其中一个关键原因是：

> GRPO 公式中的 rᵗᵢ(θ) 需要计算 $p(xₜ₋₁ | xₜ, c)$。

> 但在确定性动力系统（ODE）下，这个条件分布的计算需要估计 divergence，从而非常耗费计算资源。

***

# **🚧 为什么 deterministic flow 下无法直接计算 $p(x_{t-1} | x_t, c)$？**

因为 ODE dynamics 是 **完全确定的映射**：

$$
x_{t-1} = F_\theta(x_t, t)
$$

因此：

$$
p(x_{t-1}|x_t,c) = \delta(x_{t-1} - F_\theta(x_t,t))
$$

这是一个 **狄拉克 delta 分布**，它没有标准意义上的 log-probability。

但 GRPO（policy gradient）要求：

$$
\log \pi_\theta(a_t | s_t) = \log p_\theta(x_{t-1}|x_t,c)
$$

可是 δ 分布的 $log$ 是 undefined：

$$
\log \delta(0) = \infty, \quad \log \delta(x\neq 0) = -\infty
$$

因此：

> **ODE 模型没有可用的概率密度，无法用于 policy gradient。**

***

# **🧠 进一步：为什么 deterministic dynamics 下“计算这个 density 会需要 divergence estimation”？**

这是这一句的核心。

上面说 δ 分布不可用，但严格来说：

你 *可以* 用 **change-of-variables** 来定义 deterministic 的 density：

$$
p(x_{t-1}|x_t) = p(x_t|x_{t-1}) \cdot \left|\det\left(\frac{\partial x_t}{\partial x_{t-1}}\right)\right|^{-1}
$$

但在 flow matching（及 SD3 / Flux）中：

*   模型从来没有训练过这个 Jacobian
*   也没有训练对数行列式（log-det-Jacobian）

要计算这个 density，你必须估计：

$$
\text{div}(v_\theta) = \nabla \cdot v_\theta
$$

或：

$$
\det\left(I + \Delta t \, \partial v_\theta / \partial x\right)
$$

这称为 **divergence estimation**。对 Transformer-based flow model 来说：

**❌ 完全不可能直接算**

Jacobian 是一个 4K × 4K 的矩阵（对 64×64×3 或更大图像来说是几十万维）

 **❌ Hutchinson trick 也极其昂贵**

每次需要多次前向传播估计 trace。

 **❌ 模型结构根本没有优化过 log-density**

Flow Matching 根本不是 normalizing flow，它不保证可逆性，也不保证 Jacobian tractable。

因此论文说：

> computing $p(x_{t−1} | x_t)$ becomes computationally expensive due to divergence estimation

意思是：

如果你坚持要为 deterministic ODE 定义概率密度

*   你必须计算 divergence（或 Jacobian determinant）
*   这是 **不可能也不必要**的操作
*   GRPO 的 update 会完全崩溃

***

简单说：$p(x_{t-1} | x_t) = \delta(x_{t-1}-F_\theta(x_t))$ 不可求导，因此必须用雅可比divergence estimate，但是雅可比成本又太高了。

对于ODE而言，$ p(x_{t-1} | x_t) = \delta(x_{t-1}-F_\theta(x_t)) $写作这个，意思是预测噪声刚好等于去噪前后的差的时候概率是无穷大（单点无穷），其他情况全是0，而且仍保持概率积分为1（只是定义成这样，表达出来他不可以求导）

唯一办法是使用连续可逆变换的定理：

$$
p(x_{t-1} | x_t) = p(x_t | x_{t-1}) \cdot \left|\det \frac{\partial x_t}{\partial x_{t-1}}\right|^{-1}
$$

其中核心项：

$$
\det \frac{\partial x_t}{\partial x_{t-1}}
$$

就是 **Jacobian determinant**。

而：

$$
\log \det (I + \Delta t \cdot \nabla_x v_\theta)
$$

展开后就是 **divergence（散度）相关项**：

$$
\text{div}(v_\theta) = \nabla\cdot v_\theta
$$

这就是所谓的 divergence estimation。

***

下面我将 **非常清晰、数学严格、一步不跳地推导**：

> **为什么 deterministic flow 的概率密度会出现**

> $\log \det (I + \Delta t \cdot \nabla_x v_\theta)$

> 这个项到底从哪里来的？

这个式子其实来自： ⭐ 离散化的 ODE → 一个可逆映射的 Jacobian determinant

***

# 🔥 核心背景：我们想给 deterministic 生成过程定义概率密度

Flow Matching 的生成过程（反向）本质是一个 ODE：

$\frac{dx}{dt} = v_\theta(x,t)$

如果使用 Euler 法离散化：

$$
x_{t-\Delta t} = x_t - v_\theta(x_t,t)\Delta t
$$

这是一个确定性映射：

$$
x_{t-1} = F(x_t)
$$

我们想计算**这个映射的概率密度变化**，使其能被 policy gradient 使用。

概率密度变化由 change-of-variables 定律决定：

# 🧠 Change-of-variables formula

对一个可逆映射：$x' = F(x)$

概率密度满足：

$$
p_{x'}(x') = p_x(x)\cdot \left|\det \frac{\partial F(x)}{\partial x}\right|^{-1}
$$

其中：

$$
\frac{\partial F(x)}{\partial x}
$$

就是 **Jacobian matrix**。

# 🔍 应用到 flow matching 的离散 ODE

映射：

$$
x_{t-1} = F(x_t) = x_t - v_\theta(x_t,t)\Delta t
$$

对 $x_t$ 求 Jacobian：

$$
J = \frac{\partial x_{t-1}}{\partial x_t}
$$

展开：

$$
x_{t-1} = x_t - \Delta t\cdot v_\theta(x_t,t)
$$

求导：

$$
\frac{\partial x_{t-1}}{\partial x_t} = I - \Delta t \cdot \frac{\partial v_\theta}{\partial x_t}
$$

也就是：

$$
J = I - \Delta t\,\nabla_x v_\theta
$$

因此：

$$
\log \left|\det J\right| = \log \left|\det\left(I - \Delta t \cdot \nabla_x v_\theta\right)\right|
$$

# **📌 这个 Jacobian determinant 和 divergence 的关系是什么？**

对于小步长 Δt（Euler 离散），使用一阶泰勒展开：

$$
\log \det(I + \epsilon A) \approx \epsilon \, \text{tr}(A)
$$

于是：

$$
\log \det (I + \Delta t \cdot \nabla_x v_\theta) \approx \Delta t\cdot \text{tr}(\nabla_x v_\theta)
$$

而：

$$
\text{tr}(\nabla_x v_\theta) = \nabla \cdot v_\theta
$$

就是 **divergence（散度）**。

# **🔥 最终结论（论文想表达的真正意思）**

为了计算 deterministic flow 的概率密度，你需要：

1.  计算 Jacobian：

    $$
    I + \Delta t\cdot\nabla_x v_\theta
    $$

2.  计算它的 determinant：

    $$
    \det(I + \Delta t\nabla_x v_\theta)
    $$

3.  计算它的 log：

    $$
    \log \det(I + \Delta t\nabla_x v_\theta)
    $$

但这在图像生成模型中意味着：

*   Jacobian 是上万×上万的矩阵

*   det 的计算是  $O(n^3)$

*   divergence 用 Hutchinson trick 也需要多次前向传播

**完全不可行。**

所以 deterministic flow **不能直接做 GRPO**。

这就是论文强调的：

> computing $p(x_{t−1}|x_t)$ is expensive due to divergence estimation.

# **✨ 一句话总结**

$$
\log \det(I + \Delta t \nabla_x v_\theta)
$$

来源于：

*   对 flow matching 的 ODE 离散化
*   应用 change-of-variables formula
*   得到概率密度更新项
*   其一阶近似就是 divergence

这项计算量巨大，使 deterministic flow 无法用于 RL。
