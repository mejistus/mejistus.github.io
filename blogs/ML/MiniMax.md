---
tag: ML
title: MiniMax Loss
---

# MiniMax 損失函數

“**MiniMax 损失函数**”通常指的是 **极小极大优化目标**，最常见出现在 **GAN（生成对抗网络）** 里。

------

## **1. 基本含义**

MiniMax 就是：

- 一个模型想让目标函数**尽可能大**
- 另一个模型想让目标函数**尽可能小**

写成数学形式就是：$\min_G \max_D V(D,G)$

其中：

- $G$ 是生成器（Generator）
- $D$ 是判别器（Discriminator）
- $V(D,G)$ 是两者博弈的目标函数

这就是“极小极大”损失。

------

## **2. GAN 中最经典的 MiniMax 损失**

原始 GAN 的目标函数是：

$$
\min_G \max_D V(D,G) = \mathbb E_{x\sim p_{\text{data}}(x)}[\log D(x)] + \mathbb E_{z\sim p_z(z)}[\log(1-D(G(z)))]
$$
含义如下：

### **判别器** $D$ **的目标**

希望：

- 对真实样本 $x，D(x)\to 1$
- 对生成样本 $G(z)，D(G(z))\to 0$

所以它要**最大化**

$$
\mathbb E_{x\sim p_{\text{data}}}[\log D(x)] + \mathbb E_{z\sim p_z}[\log(1-D(G(z)))]
$$

### **生成器** $G$ **的目标**

希望生成的样本骗过判别器，让 $D(G(z))\to 1$

但在原始 minimax 写法里，生成器是去**最小化**

$$
\mathbb E_{z\sim p_z}[\log(1-D(G(z)))]
$$

------

## **3. 为什么叫损失函数**

因为训练时通常会把上面的目标改写成损失形式。

### **判别器损失**

常写为：

$$
L_D = -\mathbb E_{x\sim p_{\text{data}}}[\log D(x)] -\mathbb E_{z\sim p_z}[\log(1-D(G(z)))]
$$
因为实际训练里一般是“最小化损失”，所以把“最大化目标”前面加个负号。

### **生成器的 minimax 损失**

$$
L_G^{\text{minimax}} = \mathbb E_{z\sim p_z}[\log(1-D(G(z)))]
$$

------

## **4. 原始 MiniMax 损失的问题**

这个生成器损失虽然理论上对，但训练中常有一个问题：

当判别器很强时，$D(G(z))\approx 0$，这时$\log(1-D(G(z)))$

对生成器提供的梯度会很弱，容易出现**梯度消失**。

所以实际中常不用这个原始 minimax 形式训练生成器。

------

## **5. 更常用的 Non-saturating loss**

实际训练 GAN 时，生成器通常改成最大化 $\log D(G(z))$，等价于最小化：

$$
L_G^{\text{NS}} = -\mathbb E_{z\sim p_z}[\log D(G(z))]
$$
这个版本梯度更强，更容易训练。

所以你如果在论文里看到：

- **minimax loss**：多半指原始 GAN 论文中的博弈目标
- **generator loss**：实际实现里往往改成 $\textbf{non-saturating loss}$

------

## **6. 从博弈角度理解**

MiniMax 的本质是一个二人零和博弈：

- 判别器努力区分真假
- 生成器努力伪造得更真实

两者不断对抗，最终理想状态下：

$$
p_g = p_{\text{data}}
$$
也就是生成分布接近真实分布。

此时判别器无法区分真假，有：

$$
D(x)=\frac12
$$

------

## **7. 如果不是 GAN，MiniMax 也可以泛指什么**

更一般地，MiniMax 损失函数就是这种形式：$\min_\theta \max_\phi f(\theta,\phi)$

常见于：

- 生成对抗网络 GAN
- 对抗训练
- 域适应
- 鲁棒优化
- 博弈论建模

也就是说，“MiniMax”不是某一个固定公式，而是一类**优化结构**。
