---
title: Mixture Distribution's Variance
date: 2026-04-10
tag: Math
excerpt: This post introduces a concept about mixture distribution's variance.
---

## 混合分佈的方差

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

## 1. Formula

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
所以你要算 $\mathrm{Var}(X\mid G=g)$，当然不能只看 $p(x\mid g,m)$，还必须再对 $m$ 的分布加权。

## 2. 为什么不是只对 $p(x\mid g,m)$ 取期望

因为$\mathrm{Var}(X\mid G=g)$描述的是整个条件分布 $p(x\mid g)$ 的方差，而不是某个固定 $m$ 下的方差。
固定 $m$ 时，如果 $m$ 也固定了，那你算的是：
$$\mathrm{Var}(X\mid G=g,M=m)$$
这时才是只对$p(x\mid g,m)$取期望。
但现在 $m$ 没固定，你要的是：$\mathrm{Var}(X\mid G=g)$
`而给定 $g$ 后，$m$ 仍然是随机变量，所以总体上要对$p(m\mid g)$再做一次平均。`

所以这里一定会出现：
* 内层对 $p(x\mid g,m)$
* 外层对 $p(m\mid g)$

## 3. 直接写成积分你就能看清楚

先看条件均值：
$$
\mathbb{E}[X\mid G=g]
=
\int x\,p(x\mid g)\,dx
$$
代入混合形式：
$$
p(x\mid g)=\int p(x\mid g,m)p(m\mid g)\,dm
$$
得到：
$$
\mathbb{E}[X\mid G=g]
=
\int x\left(\int p(x\mid g,m)p(m\mid g)\,dm\right)dx
$$
交换积分顺序：
$$
=
\int \left(\int x\,p(x\mid g,m)\,dx\right)p(m\mid g)\,dm
$$
而
$$
\int x\,p(x\mid g,m)\,dx = \mathbb{E}[X\mid G=g,M=m]
$$
所以
$$
\mathbb{E}[X\mid G=g]
=
\int \mathbb{E}[X\mid G=g,M=m]\,p(m\mid g)\,dm$$
这就是
`$$
\mathbb{E}[X\mid G]
=
\mathbb{E}_{M\mid G}\big[\mathbb{E}[X\mid G,M]\big]$$`
所以
* 里面的 $\mathbb{E}[X\mid G,M]$ 才是对 $p(x\mid g,m)$ 积分
* 外面的 $\mathbb{E}_{M\mid G}$ 是对 $p(m\mid g)$ 积分
