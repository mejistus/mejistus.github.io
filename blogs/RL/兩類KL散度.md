---
tag: RL
title: KL Divergence in Reinforcement Learning
---

# 不同的KL散度
There are two types of KL divergence in Reinforcement Learning, **forward KL** and **reverse KL**. In this post, we will focus on the **Loss Difference** between forward KL and reverse KL.


## **一、KL 散度**不是对称的

$$
\mathrm{KL}(p \,\|\, q) \;\neq\; \mathrm{KL}(q \,\|\, p)
$$

在 LLM-RL 里有两个自然的选择：

### **Forward KL**

$$
\mathrm{KL}(\pi_{\text{base}} \,\|\, \pi_\theta)
$$

### **Reverse KL**

$$
\mathrm{KL}(\pi_\theta \,\|\, \pi_{\text{base}})
$$



## **二、为什么 RL 里用的是 reverse KL？**

引用的这句话点中了核心：

> *so that the learned policy assigns high probability mass to a narrow set of high-reward trajectories*

这正是 **reverse KL 的典型性质**。

### **🔹 Reverse KL 的“模式寻优（mode-seeking）”行为**

当你最小化：
$$
\mathrm{KL}(\pi_\theta \,\|\, \pi_{\text{base}}) = \mathbb{E}_{\pi_\theta}\left[\log \frac{\pi_\theta}{\pi_{\text{base}}}\right]
$$
意味着：

- 期望是 **在当前策略** $\pi_\theta$ **下**
- 只关心 $\pi_\theta$ 已经采样到的区域
- **允许忽略 base policy 覆盖但 reward 低的区域**

结果就是：

- 把概率集中到**少量高 reward 序列**
- 快速“塌缩”到 preferred behaviors
- 非常适合 RL 的目标（maximize expected reward）

## **三、为什么不用 forward KL？**

对比一下 forward KL：
$$
\mathrm{KL}(\pi_{\text{base}} \,\|\, \pi_\theta) = \mathbb{E}_{\pi_{\text{base}}}\left[\log \frac{\pi_{\text{base}}}{\pi_\theta}\right]
$$


### **🔹 Forward KL 的“覆盖优先（mode-covering）”行为**

它会强迫：

- $\pi_\theta$ 在 **base policy 有概率的所有地方都给概率**
- 即使这些地方 reward 很低

结果是：

- 保守
- reward 提升慢
- **牺牲性能换取分布覆盖**

------

论文里说的 **reverse KL** 是：
$$
\mathrm{KL}(\pi_\theta \,\|\, \pi_{\text{base}}) \;=\; \mathbb{E}_{x \sim \pi_\theta} \left[ \log \frac{\pi_\theta(x)}{\pi_{\text{base}}(x)} \right]
$$
这里的 x 是：**一个完整序列**（whole trajectory / whole response）

不是 token，也不是 prefix。

## **把期望写成“显式求和”**

$$
\mathrm{KL}(\pi_\theta \,\|\, \pi_{\text{base}}) = \sum_{x \in \mathcal{X}} \pi_\theta(x) \left( \log \pi_\theta(x) - \log \pi_{\text{base}}(x) \right)
$$

### **⚠️ 注意：这里的求和对象**

- $\mathcal{X}$：**所有可能的 token 序列**
- 长度可变
- 每一步 vocab size ~ 30k–100k

---



# 計算Reverse KL 散度的一般方法**

## **一、問題**

**1️⃣ 序列空间是指数级的**

假设：vocab size = V = $50\,000$, 最大长度 = T = $512$。那么序列空间大小：
$$
\mathcal{X}| = \sum_{t=1}^{512} V^t \;\approx\; V^{512}
$$
这是一个**天文数量**，**不可能枚举所有序列，**也不可能对它们做显式加权求和

 **2️⃣ 和 token-level logprob 的“可计算性”形成强烈对比**

给定一个具体序列$x = (a_1,\dots,a_T)$：
$$
\log \pi_\theta(x) = \sum_{t=1}^T \log \pi_\theta(a_t \mid a_{<t})
$$
这一步是：

- 前向传播
- teacher forcing
- **完全可算**

同理$\log \pi_{\text{base}}(x)$也是可算的。算的是 **“给定一个序列，算它的 log-prob”，而**不可算的是 **“对所有序列取期望”**

## **二、为什么 forward KL 反而“更像可算的”？**

对比 forward KL：
$$
\mathrm{KL}(\pi_{\text{base}} \,\|\, \pi_\theta) = \mathbb{E}_{x \sim \pi_{\text{base}}} \left[ \log \frac{\pi_{\text{base}}(x)}{\pi_\theta(x)} \right]
$$
关键差别在采样分布**

- $\pi_{\text{base}}$：**固定的**
- 可以离线采样
- 可以用数据集近似

但：

- $\pi_\theta$：**训练中不断变化**
- 每次更新分布都变
- 无法预先覆盖 support

📌 这也是为什么 reverse KL 更“RL 风格”，但更难处理。

## **三、那 PPO / RLHF 里到底是怎么算的？**

现实中大家做的是：
$$
\mathrm{KL}(\pi_\theta \,\|\, \pi_{\text{base}}) \;\approx\; \frac{1}{N} \sum_{i=1}^N \left( \log \pi_\theta(x^{(i)}) - \log \pi_{\text{base}}(x^{(i)}) \right), \quad x^{(i)} \sim \pi_\theta
$$
也就是：

- 从当前 policy 采样 $N$ **个序列**
- 用 $\color{red}Monte\ Carlo$ 估计期望

$$
\frac{1}{N}\sum_{i=1}^N f(x^{(i)}),
\quad x^{(i)} \sim \pi_\theta
\;\;\xrightarrow[N\to\infty]{}\;\;
\mathbb{E}_{x\sim\pi_\theta}[f(x)]
$$



📌 这就是 *sample-based estimators of the reverse KL divergence*

## **四、但注意：“数值可估 ≠ 梯度无偏”**

这是你现在这篇论文最重要的洞察：

- 即便你能 MC 估计$\mathrm{KL} \approx \hat{K}$
- $\nabla_\theta \hat{K}≠\nabla_\theta \mathrm{KL}$

除非 estimator 的结构是对的。

这也是为什么：

- 放在 **reward** 里 → OK（score function trick）
- 放在 **loss** 里 → 梯度错位
