---
tag: RL
date: 2026/2/9
title: Difference with KL in Loss and reward
---

# 问题陈述

为什么在GRPO中进行微调时，在损失（Loss）里添加散度项（Reverse KL Divergence)本质上和在奖励（Reward）中添加散度项是<span style="background-color: #d32f2f; color: #ffff;">不同的</span>，并且会造成Bias？

---

## **一、优化目标**

$$
J(\theta) = \mathbb{E}_{y\sim\pi_\theta} \big[ \widehat{\mathrm{KL}}(y) \big]
$$


这是一个<span style="background-color:#d32f2f; color: #ffffff;">参数在分布里</span>的期望。

## **二、关键**

> **当参数** $\theta$ **同时出现在：**

- > 分布里（$\pi_\theta$）

- > 被积函数里（$\widehat{\mathrm{KL}}(y)$）

> **对期望求导一定会产生两项**

这是一个数学事实，不是实现细节。

## **三、一步一步来：这两项是怎么来的？**

把期望写成最原始的形式：

$$
J(\theta) = \sum_y \pi_\theta(y)\; \widehat{\mathrm{KL}}(y)
$$
现在对 $\theta$ 求导：

$$
\nabla_\theta J = \nabla_\theta \sum_y \pi_\theta(y)\; \widehat{\mathrm{KL}}(y)
$$

### **用乘法求导法则（这是关键）**

$$
\nabla_\theta(\pi_\theta \cdot \widehat{\mathrm{KL}}) = (\nabla_\theta \pi_\theta)\widehat{\mathrm{KL}} + \pi_\theta (\nabla_\theta \widehat{\mathrm{KL}})
$$

所以：

$$
\nabla_\theta J = \sum_y \Big[ \underbrace{\pi_\theta(y)\nabla_\theta \widehat{\mathrm{KL}}(y)}_{\text{第一项}} + \underbrace{\widehat{\mathrm{KL}}(y)\nabla_\theta \pi_\theta(y)}_{\text{第二项}} \Big]
$$

## **四、化简**

用恒等式：

$$
\nabla_\theta \pi_\theta(y) = \pi_\theta(y)\nabla_\theta \log \pi_\theta(y)
$$
代回去：

$$
\nabla_\theta J = \mathbb{E}_{y\sim\pi_\theta} \big[ \nabla_\theta \widehat{\mathrm{KL}}(y) + \widehat{\mathrm{KL}}(y)\nabla_\theta \log \pi_\theta(y) \big]
$$

## **五、自动微分能算哪一项？**

### **KL 当 loss（GRPO / Loss-based KL）**

代码逻辑是：

```
y = sample(pi_theta)      # 采样
kl_hat = KL_hat(y)        # 计算 KL 估计
loss = kl_hat
loss.backward()
```

### **自动微分看到的计算图是：**

$$
θ → log \pi_\theta (y) → \hat{KL} → loss
$$

<span style="background-color:#0000ff; color:#ffffff">注意：y 是采样出来的整数 token</span>

- $y$ 不是 $\theta$ 的函数
- $y$ 在计算图里是常数（detached）

### 自动微分只能算到什么？

自动微分只能看到：$\text{loss} = \widehat{\mathrm{KL}}(y)$，所以它只能算：$\nabla_\theta \widehat{\mathrm{KL}}(y)$。

<span style="background-color:#00aa00;color:#ffffff;">然后对样本做平均，求出</span>：$\mathbb{E}_{y\sim\pi_\theta} \big[ \nabla_\theta \widehat{\mathrm{KL}}(y) \big]$ ，<span style="background-color:#ff0000;color:#ffffff;">但是无法得到</span>：$\mathbb{E}_{y\sim\pi_\theta} \big[ \widehat{\mathrm{KL}}(y) \nabla_\theta \log \pi_\theta(y) \big]$。

👉 来自 $\pi_\theta(y)$ **对** $\theta$ **的导数**

但在代码里：$y = sample(\pi_{\theta})$

- sampling **不是可微算子**

- 自动微分 **不知道 y 的概率密度**

- 所以它 **完全不知道**

    > “改变 $\theta$ 会改变 $y$ 被采样到的概率”

📌 **这条梯度路径在计算图里根本不存在**

> $\nabla_\theta \mathbb{E}_{y\sim\pi_\theta}[\cdot]$与$\mathbb{E}_{y\sim\pi_\theta}[\nabla_\theta \cdot]$而这两者 **只有在分布不依赖参数**时才相等，这里分布恰恰依赖 $\theta$。

##  六、为什么 RL 不会犯这个错？

因为 RL **不是靠自动微分穿过采样**，而是**手动写出了那一项**：

$$
\nabla_\theta \mathbb{E}_{y\sim\pi_\theta}[R(y)] = \mathbb{E}_{y\sim\pi_\theta} \big[ R(y)\nabla_\theta \log \pi_\theta(y) \big]
$$
当你把：$R(y) = -\beta \widehat{\mathrm{KL}}(y)$

那缺失的一项 **被显式加回来了**。

## 七、总结

> 👉 自动微分只看到了$\nabla_\theta \widehat{\mathrm{KL}}$
>
> 👉 却完全没看到$\nabla_\theta \pi_\theta$
>
> 因此 $\text{Loss-based KL} ⇒ \text{biased gradient}$
