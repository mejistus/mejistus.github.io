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