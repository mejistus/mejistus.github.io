---
title: Mixture Distribution's Variance
date: 2026-04-10
tag: Math
excerpt: This post introduces a concept about mixture distribution's variance.
---

# 混合分佈的方差

定義當前分佈Y是來自於兩個高斯分佈$G$的混合分佈，並假設二者各佔一半，其中: `$G_1: X\sim \mathcal N(-1,1),\quad G_2: X\sim \mathcal N(1,1)$`。
那麼混合分佈$Y$的方差`$Var(Y)$`可以表達為：
$$
\mathrm{Var}(X)=\underbrace{\boxed{ \mathbb E[\mathrm{Var}(X\mid G)]}}_{\text{類內方差}} + \underbrace{\boxed{\mathrm{Var}(\mathbb E[X\mid G])}}_{\text{類間方差}}

$$
這裡：
$$
\mathbb E[\mathrm{Var}(X\mid G)] = 1 \\
\mathrm{Var}(\mathbb E[X\mid G]) = \mathrm{Var}(-1,1)=1
$$

---
$$
\mathrm{Var}(X\mid G)
=
\mathbb{E}_{M\mid G}\!\left[\mathrm{Var}(X\mid G,M)\right]
+
\mathrm{Var}_{M\mid G}\!\left(\mathbb{E}[X\mid G,M]\right)
$$
左边是$ \mathrm{Var}(X\mid G=g) $ 就是：当 $G=g$ 固定时，$X$ 的总条件方差。

但在固定 $G=g$ 后，$X$ 的随机性仍然不是单一来源，因为 $M$ 还在变。
所以你必须把“给定 $g$”下的总体分布写成对 $M$ 的混合：
$$ p(x\mid g)=\sum_m p(x\mid g,m)p(m\mid g)$$ 
连续情形则是：
$$ p(x\mid g)=\int p(x\mid g,m)\,p(m\mid g)\,dm$$
这一步非常关键：
`在给定 $G=g$ 时，$X$ 的分布是由各个子分布 $p(x\mid g,m)$ 按权重 $p(m\mid g)$ 混合出来的。`

所以你要算 \mathrm{Var}(X\mid G=g)，当然不能只看 p(x\mid g,m)，还必须再对 m 的分布加权。

⸻

2. 为什么不是只对 p(x\mid g,m) 取期望

因为

\mathrm{Var}(X\mid G=g)

描述的是整个条件分布 p(x\mid g) 的方差，
而不是某个固定 m 下的方差。

⸻

固定 m 时

如果 m 也固定了，那你算的是：

\mathrm{Var}(X\mid G=g,M=m)

这时才是只对

p(x\mid g,m)

取期望。

⸻

但现在 m 没固定

你要的是：

\mathrm{Var}(X\mid G=g)

而给定 g 后，m 仍然是随机变量，所以总体上要对

p(m\mid g)

再做一次平均。

所以这里一定会出现：
	•	内层对 p(x\mid g,m)
	•	外层对 p(m\mid g)

⸻

3. 直接写成积分你就能看清楚

先看条件均值：

\mathbb{E}[X\mid G=g]
=
\int x\,p(x\mid g)\,dx

代入混合形式：

p(x\mid g)=\int p(x\mid g,m)p(m\mid g)\,dm

得到：

\mathbb{E}[X\mid G=g]
=
\int x\left(\int p(x\mid g,m)p(m\mid g)\,dm\right)dx

交换积分顺序：

=
\int \left(\int x\,p(x\mid g,m)\,dx\right)p(m\mid g)\,dm

而

\int x\,p(x\mid g,m)\,dx = \mathbb{E}[X\mid G=g,M=m]

所以

\mathbb{E}[X\mid G=g]
=
\int \mathbb{E}[X\mid G=g,M=m]\,p(m\mid g)\,dm

这就是

\mathbb{E}[X\mid G]
=
\mathbb{E}_{M\mid G}\big[\mathbb{E}[X\mid G,M]\big]

看见了吗？
	•	里面的 \mathbb{E}[X\mid G,M] 才是对 p(x\mid g,m) 积分
	•	外面的 \mathbb{E}_{M\mid G} 是对 p(m\mid g) 积分

⸻

4. 方差项也是同样两层

先看第一项：

\mathbb{E}_{M\mid G}\!\left[\mathrm{Var}(X\mid G,M)\right]

展开到 g：

\mathbb{E}_{M\mid G=g}\!\left[\mathrm{Var}(X\mid G=g,M)\right]
=
\int \mathrm{Var}(X\mid g,m)\,p(m\mid g)\,dm

而对每个固定的 m，

\mathrm{Var}(X\mid g,m)
=
\int (x-\mathbb{E}[X\mid g,m])^2\,p(x\mid g,m)\,dx

所以你看到这里其实是：
	•	先对 p(x\mid g,m) 算每个子分布的方差
	•	再对 p(m\mid g) 做平均

⸻

第二项：

\mathrm{Var}_{M\mid G}\!\left(\mathbb{E}[X\mid G,M]\right)

展开到 g：

\mathrm{Var}_{M\mid G=g}\!\left(\mathbb{E}[X\mid g,M]\right)

这时 \mathbb{E}[X\mid g,M] 已经是关于 M 的一个函数了。
设

\mu(g,m)=\mathbb{E}[X\mid g,m]

那么

\mathrm{Var}_{M\mid G=g}(\mu(g,M))
=
\int \big(\mu(g,m)-\mathbb{E}_{M\mid g}[\mu(g,M)]\big)^2\,p(m\mid g)\,dm

这里已经没有对 x 积分了，因为对 x 的积分已经包含在 \mu(g,m) 里面做完了。

⸻

5. 所以到底“对谁取期望”

最准确地说：

内层

\mathbb{E}[X\mid G,M],\quad \mathrm{Var}(X\mid G,M)

是对 X\mid G,M，也就是对 p(x\mid g,m) 取的。

⸻

外层

\mathbb{E}_{M\mid G}[\cdot],\quad \mathrm{Var}_{M\mid G}(\cdot)

是对 M\mid G，也就是对 p(m\mid g) 取的。

⸻

6. 你提到的 p(g\mid m) 为什么不对

因为我们现在讨论的是：

\mathrm{Var}(X\mid G)

也就是“在 G 已知的条件下，X 的方差”。

既然是“给定 G”，那此时剩余的不确定性来自 M，所以外层权重必然是：

p(m\mid g)

而不是 p(g\mid m)。

⸻

如果你写成 p(g\mid m)，那对应的是另一种条件化方向。
例如你要从 M 出发去平均 G 的贡献，才会出现 p(g\mid m)。
但这里不是那个问题。

⸻

7. 一个特别直观的离散例子

假设固定某个 g 后，M 只有两个可能值：

P(M=1\mid g)=0.7,\qquad P(M=2\mid g)=0.3

并且
	•	当 M=1 时，X\mid g,1 的均值是 2，方差是 1
	•	当 M=2 时，X\mid g,2 的均值是 10，方差是 4

那么：

\mathbb{E}[X\mid g]
=0.7\times 2 + 0.3\times 10 = 4.4

第一项：

\mathbb{E}_{M\mid g}[\mathrm{Var}(X\mid g,M)]
=0.7\times 1 + 0.3\times 4 = 1.9

第二项：

\mathrm{Var}_{M\mid g}(\mathbb{E}[X\mid g,M])

也就是

0.7(2-4.4)^2 + 0.3(10-4.4)^2
=0.7\times 5.76 + 0.3\times 31.36
=13.44

所以：

\mathrm{Var}(X\mid g)=1.9+13.44=15.34

你看：
	•	1.9 来自每个子分布内部对 x 的波动
	•	13.44 来自两个子分布均值 2 和 10 差得很远

如果你只对 p(x\mid g,m) 积分，而不对 p(m\mid g) 加权，那你根本得不到 X\mid g 的总体方差。

⸻

8. 一句话概括

你这条式子里：

\mathrm{Var}(X\mid G)
=
\mathbb{E}_{M\mid G}\!\left[\mathrm{Var}(X\mid G,M)\right]
+
\mathrm{Var}_{M\mid G}\!\left(\mathbb{E}[X\mid G,M]\right)

并不是“期望不对 p(x\mid g,m) 取”，而是：
	•	内层已经对 p(x\mid g,m) 取了
	•	外层还要再对 p(m\mid g) 取

因为 X\mid G 本身就是一个关于 M\mid G 的混合分布。

⸻

如果你愿意，我下一条可以直接把它写成离散求和形式：

\mathrm{Var}(X\mid G=g)
=
\sum_m p(m\mid g)\,\mathrm{Var}(X\mid g,m)
+
\sum_m p(m\mid g)\big(\mathbb{E}[X\mid g,m]-\mathbb{E}[X\mid g]\big)^2

这样会更直观。