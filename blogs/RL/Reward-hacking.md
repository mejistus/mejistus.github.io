---
tag: RL
date: 2026/2/9
title: Reward Hacking
---

# **1. Flow-GRPO 的根本问题：Reward Hacking（奖励漏洞）**

在使用在线 RL（例如 GRPO / PPO）时，经常会出现：

> **模型通过一些“取巧的方式”提高 reward，而不是真正改善任务能力。**

例如：

*   贪婪地优化“可测指标”，导致图像质量崩坏
*   为了达到 reward，更偏向某些风格、某些颜色、某些构图
*   在 preference reward 情况下，可能只生成 evaluator 喜欢的“模板式构图”
*   丢失多样性、构图单一、模式坍缩

RL 本质上会**强推模型往 reward 最大的局部最优去挤压**。

如果缺乏 restraint（限制），模型就会：

*   忽略通用能力
*   忽略多样性
*   变得“最优化但极度偏执”

这就是 reward hacking。

# **2. KL Regularization 的作用：把 RL 限在“微调区间”**

KL（通常是和 pretrained model 的分布比）强制：

$$
\text{KL}(\pi_{\text{new}} \,\|\, \pi_{\text{old}})
$$

保持“小而稳定”。

它的含义是：

> **模型的输出分布不能离初始模型太远，更新要围绕原模型的小邻域内进行。**

这有两个关键效果：

***

## **（1）保持 image quality**

原模型（如 SD3.5）在自然图像质量、构图、纹理等方面已经高度训练过。

如果 KL 不存在：

*   RL 可以让  $v_θ$  大幅偏离原模型

*   很容易破坏生成能力

*   图像质量指标（如 DrawBench score）会下降

## **（2）保持 model diversity**

KL 也限制：

*   新模型不能把概率质量全部压到某些 seed、某些 style 上
*   不能把输出收缩到某个窄 distribution

没有 KL 时，RL 极易产生模式坍缩（mode collapse）：

> **不同 seeds → 近乎一样的图**

> 因为 reward 最高的“模式”被强化无数<span style="color: rgb(14, 14, 14)">次。</span>

论文说去掉 KL 后 “different seeds produce nearly identical results”，

这典型就是 RL-based mode collapse。

# **3. 为什么不同任务中，“去掉 KL”的危害表现不同？**

论文说：

### **任务 1： Compositional Image Generation（组合生成）**

### **任务 2： Visual Text Rendering（文本渲染）**

去掉 KL：

*   图像质量明显下降
*   preference score 下降
*   有 reward hacking

这些任务的 reward 与图像整体结构关系不大（大部分 reward 是局部判断）：

*   “两个红色苹果”
*   “一只猫在桌子左边”
*   字体可读性

这些 reward 很容易被“低质量但高相关度”的图像 hack 掉：

*   更简单构图
*   更少背景
*   更强对比度
*   不自然的渲染
*   类似“检测器骗分”

→ 所以去掉 KL 会导致模型“训练得很糟糕”。

***

# **4. 为什么人类偏好任务（PickScore）去掉 KL 不会导致质量崩坏？**

因为：

> **PickScore 与最终评估指标高度一致。**

即：PickScore reward 本身就是在让图像更美观、更清晰、更符合审美。

因此去掉 KL：

*   模型不需要“作弊”
*   它真的能优化到 evaluator（PickScore）的偏好
*   图像质量变得更像“PickScore喜欢的风格”

但是问题又来了：

***

# **5. 即便在 PickScore 中，去掉 KL 会导致 ”样式坍缩“**

因为 PickScore 会偏好某种构图、某种色调、某种主体位置。

去掉 KL → RL 不受约束：

*   模型会倾向于“PickScore最爱的那一种风格”
*   即使不同 prompt、不同 seed，也会生成类似调性的图

因此：

### **❌ 多样性崩溃**

### **❌ 图像看起来“过度一致”**

### **❌ 模型退化成“PickScore模板生成器”**

论文说：

> **Outputs converge to a single style across different seeds.**

这说明 RL 强力“压扁”了模型的分布，把所有概率质量挤到最 reward 的局部区域。

→ 典型的 RL mode collapse。

***

# **6. KL 的本质是什么？**

KL 不是为了“阻止模型更新”，

而是为了实现：

> **Constrained optimization：在不破坏已有能力的情况下往奖励方向推进。**

换句话说：

*   不做 KL = unconstrained optimization
*   加 KL = trust-region / small-step optimization

这也是 PPO/GRPO 背后最经典的思想之一。

***

# **7. 一句话总结论文这段的意义**

> **KL 是必须的，因为 Flow-GRPO 强调任务相关性，但模型的图像质量来自训练前的强大基础模型。**

> **RL 如果不加 KL，就会偏执地追赶 reward，导致质量下降、多样性崩塌、风格单一等 reward hacking 问题。**

> **KL 正是用来维持“基础能力”和“任务能力”的平衡。**
