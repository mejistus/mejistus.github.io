---
tag: ML
title: Residual to HC, mHC, and Attention-Residual
---

## 从 Residual 到 HC、mHC，再到 Attention-Residual 的一条线

### 1. 起点：标准残差为什么强

标准残差层写成$x_{l+1}=x_l+F_l(x_l)$.

跨很多层展开，有$x_L = x_l + \sum_{i=l}^{L-1}F_i(x_i)$.

于是对 $x_l$ 求导：

$$
\frac{\partial x_L}{\partial x_l}
=
I+
\frac{\partial}{\partial x_l}
\sum_{i=l}^{L-1}F_i(x_i).
$$

再乘上 loss 的梯度：
$$
\boxed{
\frac{\partial \mathcal L}{\partial x_l}
=
\frac{\partial \mathcal L}{\partial x_L}
\left(
I+
\frac{\partial}{\partial x_l}
\sum_{i=l}^{L-1}F_i(x_i)
\right)
}
$$
这件事的本质很简单：残差里始终有一条 **identity path**。  
也就是说，即使 \(F_l\) 学得不好，梯度仍然有一条“保底直通路”能穿过去，所以深层网络更稳。

---

### 2. 为什么还要改：单残差流太“窄”

标准残差虽然稳定，但它也很“死板”：

- 每层只能拿到 **上一层汇总后的单状态**；
- 更早层的信息都已经被压进一个 residual stream 里；
- 深度增加后，容易出现一种张力：  
  一边想保住梯度传播，另一边又会遇到表示过度混合、层间信息难以选择性保留的问题。

所以后续改进的核心，不再只是“让 \(F\) 更强”，而是开始动 **连接本身**。

---

### 3. Hyper-Connections：把单流变成多流

HC 的想法是：既然单一 residual stream 太窄，那就把它扩成 \(m\) 个并行流，并且让层与层之间学会“怎么混”。

其单层形式可写成

\[
x_{l+1}
=
H^{\mathrm{res}}_l x_l
+
(H^{\mathrm{post}}_l)^\top
F\!\left(H^{\mathrm{pre}}_l x_l\right).
\]

这里：

- \(x_l\) 不再是单流，而是一个 **多流状态**；
- \(H_l^{\mathrm{pre}}\)：从多流里读出本层要处理的输入；
- \(H_l^{\mathrm{post}}\)：把本层输出写回多流；
- \(H_l^{\mathrm{res}}\)：直接在 residual streams 之间做线性混合。

这样做的收益是：

1. **连接拓扑更丰富**：不再只有“上一层 + 当前层输出”这一种连法；
2. **层间可重排**：不同深度的信息可以以不同强度进入不同流；
3. **表达容量更强**：本质上是在“深度轴”上把状态从一条通道扩成了多条通道。

但代价也立刻出现了。

---

### 4. HC 的问题：identity 不再天然成立

对 HC 跨层展开后，残差主干不再是简单的 \(x_l\)，而会变成一串混合矩阵的连乘：

\[
x_L
=
\left(\prod H^{\mathrm{res}}\right)x_l
+
\text{(residual terms)}.
\]

这时再看梯度，原来标准残差里的那个“干净的 \(I\)”不见了，取而代之的是

\[
\frac{\partial \mathcal L}{\partial x_l}
\sim
\frac{\partial \mathcal L}{\partial x_L}
\left(\prod H^{\mathrm{res}}\right)
+\cdots
\]

问题就在这里：

- 如果这些 \(H^{\mathrm{res}}\) 无约束地学，
- 多层连乘后就可能偏离 identity 很远，
- 于是 forward 的信号守恒和 backward 的稳定传播都会被破坏。

所以 HC 的思路可以概括成一句话：

> 它用“更强的连接表达力”换来了“identity 路径被污染”的风险。

---

### 5. mHC：不是放弃 HC，而是把它拉回“安全流形”

mHC 的核心不是否定 HC，而是给 \(H^{\mathrm{res}}\) 加上**几何约束**，让多流混合依然保留类似 identity 的稳定性。

它的关键思想是：

- 让 \(H^{\mathrm{res}}\) 不再是任意矩阵；
- 而是投影到一个受约束的集合上，例如双随机矩阵所在的 Birkhoff polytope。

直观理解：

- 行和为 1、列和为 1 的混合矩阵，本质更像“守恒型混合”；
- 它允许流之间重新分配信息，
- 但不至于在层层传播中把整体量级越放越大，或越缩越小。

于是 HC 的式子还在：

\[
x_{l+1}
=
H^{\mathrm{res}}_l x_l
+
(H^{\mathrm{post}}_l)^\top
F\!\left(H^{\mathrm{pre}}_l x_l\right),
\]

但现在 \(H^{\mathrm{res}}_l\) 被限制在一个“不会把 identity 完全玩坏”的空间里。

所以 mHC 相比 HC 的真正改进是：

- **HC 解决的是“连接太窄”**；
- **mHC 解决的是“连接太自由”**。

一句话总结：

> HC 把残差从“一条路”扩成“多车道立交桥”；  
> mHC 则给这些车道加上交通规则，保证再复杂也别翻车。

---

### 6. Attention-Residual：继续往前走，但思路变了

HC / mHC 仍然属于一种 **多状态递推**：

- 你维护的是一个“当前时刻的多流状态”；
- 下一层主要还是从这个“上一时刻的状态”里读、写、混。

Attention-Residual（最近这条线）进一步问了一个问题：

> 为什么我一定要只依赖“上一层压缩好的状态”？  
> 为什么不能直接、选择性地访问更早各层的输出？

于是它把“沿深度传播”的机制，改成了 **对历史层输出做 attention 聚合**。

也就是说，当前层不只是拿 \(x_{l-1}\) 或多流状态，而是更像：

\[
x_{l+1}
=
\mathrm{AttnDepth}\!\big(x_0,x_1,\dots,x_l\big)
+
F_l(\cdot).
\]

这里的关键变化不是“多几个流”，而是：

- **从状态混合** 变成 **历史检索**；
- **从线性递推** 变成 **按内容选择过去哪些层最重要**。

从这个视角看：

- HC / mHC：更像 **depth-wise linear attention**，只不过状态是矩阵/多流形式；
- Attention-Residual：更像 **depth-wise softmax attention**，直接对更早层做选择性读取。

这一步的改进点在于：

1. **不再只依赖立即前驱状态**；
2. **更早层贡献可以被显式检索，而不是先被压缩掉**；
3. **避免 PreNorm 那种深度累计导致的幅值线性增长，也避免 PostNorm 那种反复缩放导致的梯度衰减。**

---

### 7. 这一条演化线，真正变的是什么

如果把这几代方法放在一起看，本质是在不断放宽“层与层如何通信”的方式。

#### (a) 标准 Residual
只允许：

\[
x_{l+1}=x_l+F_l(x_l)
\]

特点：最稳，最干净，但连接表达力最低。

#### (b) HC
允许：

- 单流 \(\to\) 多流；
- 当前层与 residual stream 之间可学习读写；
- 流与流之间可学习混合。

特点：表达力大幅增强，但 identity 不再天然成立。

#### (c) mHC
在 HC 基础上约束混合矩阵，使多流通信保持“守恒型”和“稳定型”。

特点：尽量兼得 **HC 的表达力** 与 **Residual 的稳定性**。

#### (d) Attention-Residual
不再把“跨层通信”局限为多流递推，而是直接对过去各层输出做注意力检索。

特点：把“层深”本身当作一个可注意的维度，让历史层贡献变成 **可选择访问**，而不是 **被动压缩保存**。

---

### 8. 和你那条求导公式怎么连起来

你那条标准残差公式：

\[
\frac{\partial \mathcal L}{\partial x_l}
=
\frac{\partial \mathcal L}{\partial x_L}
\left(
I+
\frac{\partial}{\partial x_l}
\sum_{i=l}^{L-1}F_i(x_i)
\right)
\]

核心在那个 \(I\)。

所以后面所有方法，本质都在回答两个问题：

1. **我能不能让跨层通信更强？**
2. **我还能不能保住那个“像 \(I\) 一样安全”的通路？**

于是就形成了这条链：

- **Residual**：先把 \(I\) 立住；
- **HC**：发现光有 \(I\) 不够，通信太弱，于是扩成多流；
- **mHC**：发现多流太自由会把 \(I\) 弄丢，于是加几何约束把“安全通路”拉回来；
- **Attention-Residual**：进一步发现“安全通路”不一定非要写成局部加法，也可以写成对历史层的选择性聚合。

所以这几代方法不是彼此割裂，而是在不断回答同一个母问题：

> 如何在更强的跨层信息流动下，仍然保住深层网络最重要的训练稳定性。

---

### 9. 一句收束

这条演化线可以压成一句话：

> 标准残差解决“能训练”；  
>
> HC 解决“连得更丰富”； 
>
> mHC 解决“丰富之后别失稳”；  
>
> Attention-Residual 解决“别只混上一层，要能主动检索更早层”。
