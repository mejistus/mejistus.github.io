---
tag: ML
date: 2025/12/18
title: GUMBEL-SOFTMAX
---

# GUMBEL-SOFTMAX
This post is a summary of [Gumbel-Softmax](https://arxiv.org/pdf/1611.00712.pdf), which solves the issue of categorical sampling that is not differentiable.
## **1) 数学原理：离散采样怎么变成可反传？**

### **1.1 问题：Categorical 采样不可导**

你有一个分类分布（K 类）：

- logits：$a \in \mathbb{R}^K$
- 概率：$\large \pi_i = \frac{e^{a_i}}{\sum_j e^{a_j}}$

真正的采样是：
$$
y \sim \text{Categorical}(\pi), \quad y \in \{e_1,\dots,e_K\}
$$
这是离散的 one-hot，**无法对 logits 做梯度反传**。

### **1.2 Gumbel-Max Trick：离散采样的等价形式**

先定义 Gumbel 噪声：
$$
g_i \sim \text{Gumbel}(0,1),\quad g_i = -\log(-\log u_i),\ u_i\sim \text{Uniform}(0,1)
$$
则有经典结论（Gumbel-Max trick）：
$$
\arg\max_i (a_i + g_i)\ \sim\ \text{Categorical}(\text{softmax}(a))
$$
也就是说，<span style="background-color:#ff0000;color:#ffffff;">给每个 logit 加 Gumbel 噪声再 argmax，就等价于从 categorical 采样。</span>

但是 argmax 还是不可导。

### **1.3 Gumbel-Softmax：把 argmax 换成 softmax（可导近似）**

把不可导的 argmax 用 softmax 近似，引入温度 $\tau>0$：
$$
\tilde{y}_i = \frac{\exp\left((a_i + g_i)/\tau\right)}{\sum_j \exp\left((a_j + g_j)/\tau\right)}
$$
则 $\tilde{y}$ 是一个 **“软 one-hot”**（分量非负且和为 1），并且对 $a$ **可导**。

关键性质：

- $\tau \to 0$：$\tilde{y}$ 趋近 one-hot（更“离散”，但梯度更不稳定）
- $\tau \to \infty$：$\tilde{y}$ 趋近均匀分布（更“平滑”，但偏差大）

这就是用 **重参数化（reparameterization）** 把采样写成：
$$
\tilde{y}=f(a, u),\quad u\sim U(0,1)
$$
从而可以反传到 $a$。

### **1.4 Straight-Through (ST) Gumbel-Softmax（训练更像真离散）**

很多时候你希望：

- 前向：真的 one-hot（像离散决策）
- 反向：用软的 $\tilde{y}$ 给梯度

做法：
$$
y^{hard}=\text{onehot}(\arg\max \tilde{y})
$$
反传时用 trick：
$$
y = y^{hard} - \text{stopgrad}(\tilde{y}) + \tilde{y}
$$
等价于：**前向用 hard，梯度当作 soft**。

## **2) 伪代码流程（标准版 + ST 版）**

### **2.1 标准 Gumbel-Softmax（soft 输出）**

```python
Input: logits a (K-dim), temperature tau
Sample u_i ~ Uniform(0,1) for i=1..K
Compute g_i = -log(-log(u_i))        # Gumbel noise
Compute z_i = (a_i + g_i) / tau
Output y_soft = softmax(z)          # differentiable "soft one-hot"
```

### **2.2 Straight-Through Gumbel-Softmax（hard 前向，soft 梯度）**

```python
Input: logits a, temperature tau
y_soft = GumbelSoftmax(a, tau)
k = argmax(y_soft)
y_hard = onehot(k)

# forward uses y_hard, backward uses y_soft
Output y = y_hard - stopgrad(y_soft) + y_soft
```

## **3) 简单例子：三选一“离散开关”如何可导训练？**

假设你要从 3 个操作里选 1 个（比如三种滤波器 / 三个专家 / 三个 token）：

- logits $a=[2.0,\ 0.0,\ -1.0]$
- softmax 概率大概偏向第 1 类

### **3.1 如果直接采样**

你会得到 one-hot，比如 [1,0,0]，但因为采样/argmax 不可导，loss 无法把梯度传回 logits。

### **3.2 用 Gumbel-Softmax（**$\tau=0.5$**）**

采样一次 $u$ 得到 gumbel 噪声 g，然后：$\tilde{y}=\text{softmax}((a+g)/0.5)$

可能得到类似：$\tilde{y}=[0.92,\ 0.07,\ 0.01]$

这不是严格 one-hot，但已经很“尖锐”，并且**对** a **可导**。

### **3.3 用 ST 版本**

- 前向用 [1,0,0]（真的选了第 1 类）

- 反向梯度按 [0.92,0.07,0.01] 传播

    你就能像训练连续网络那样训练“离散选择”。
