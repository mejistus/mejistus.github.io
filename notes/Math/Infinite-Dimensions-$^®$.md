---
title: Infinite Dimensions™
date: 2026-04-07
tag: Math
excerpt: 無限維度
---

# Calculus of Variations
Suggest `$J$` is the functional in `Function Space` $\mathcal{F}[a,b]$. 
Then the functional `$J$` has formula following as:
$$
J[y] = \int_{a}^{b}L(x,y(x),y'(x))dx \tag{1}
$$

whereas `$y$` belongs to some permitted function which has continued `1-order derivative`, with constraints `$y(a)=A, \quad y(b)=b$`.

The classical Calculus of Variations is to find the $y$ to let its functional to be minimum.

---
To understand **`functional`**, we reconsider it in the **space with some dimension**. Generally, in finite dimension, we have one function `$f$` who make mappings from `$\mathbf{R}^n \to \mathbf{R}$`, its divergence rate at `$x_0$` for direction `$v$` is determined by the **Directional Derivative** `$\Delta f(x_0) \cdot v$`.
For functional, we proposal a concept `Variations` (which could be regarded as function itself with tiny disturbations), we note it as `$\delta y(x)$`. To meet the constraints ahead, obviously `$\delta y(a)=\delta y(b) = 0$`.
So the functional `J` at function instance point `$y$` following the direction `$\delta y$` (1-order variation) can be defined as: $$\delta J[y;\delta y]:=\frac{d}{d\epsilon}J[y+\epsilon\delta y]\big|_{\epsilon=0} \tag{2}$$

To make problem simple, we take `$\delta y$` as `linear continued functional`, which indicate there is one only object `$\frac{\partial{J}}{\partial y(x)}$` (**Derivative of Functional**) to make the following equal:
$$
\delta J[y;\delta y]=\int_a^b \frac{\partial{J}}{\partial y(x)} \delta y(x) dx \tag{3}
$$
> just take it as Taylor Expansion, in which $\Delta y = y'(x) \Delta x$.

And in detail, formula $(3)$ can be written as:
$$
\begin{align}
\delta J[y;\delta y] &= \int_a^b\frac{\partial L(x, y+\epsilon \delta y, (y+\epsilon \delta y)')}{\partial \epsilon} \delta \epsilon dx \\
&=\int_a^b\frac{\partial L(x, y+\epsilon \delta y, y'+\epsilon \delta y')}{\partial \epsilon} \delta \epsilon dx\\
&=\lim_{\epsilon \to 0}\int_a^b  \big(\frac{\partial L}{\partial y} \delta y + \frac{\partial L}{\partial y'} \delta y'\big)dx \\
&=
\end{align} 
$$

