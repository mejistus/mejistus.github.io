---
title: Infinite Dimensions™
date: 2026-04-07
tag: Math
excerpt: Recalling version with bad notions from \href{https://www.cnblogs.com/qizhou/p/18564508}
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
To understand a $\textbf{functional}$, it is helpful to compare it with the finite-dimensional case.
In finite dimensions, a function $f:\mathbf{R}^n \to \mathbf{R}$ changes at a point $x_0$ along a direction $v$ according to the `$\textbf{directional derivative}$`, i.e.,
`$\nabla f(x_0)\cdot v$`.

For a functional, the analogous concept is the $\textbf{variation}$. We denote by `$\delta y(x)$` an admissible perturbation of the function `$y(x)$`. To satisfy the endpoint constraints, we require `$\delta y(a)=\delta y(b)=0$`.

Then the first-order variation of the functional $J$ at the function $y$ along the direction `$\delta y$` is defined by
$$
\delta J[y;\delta y]:=\left.\frac{d}{d\epsilon}J[y+\epsilon\delta y]\right|_{\epsilon=0}. \tag{2}
$$

To simplify the discussion, we assume that the first variation is linear and continuous with respect to `$\delta y$`.
Then there exists a quantity `$\frac{\partial J}{\partial y(x)}$`, called the `$\textbf{functional derivative}$ of $J$`, such that
$$
\delta J[y;\delta y]=\int_a^b \frac{\partial J}{\partial y(x)}\,\delta y(x)\,dx. \tag{3}
$$

For the functional
$$
J[y]=\int_a^b L(x,y,y')\,dx,
$$
the first variation `$\delta J[y;\delta y]$ is $\textbf{the differential on the direction}$ $\delta y$`, can be computed explicitly as
$$
\begin{align}
\delta J[y;\delta y]
&=\left.\frac{d}{d\epsilon}J[y+\epsilon\delta y]\right|_{\epsilon=0} \\
&=\left.\frac{d}{d\epsilon}\int_a^b
L\big(x,\,y+\epsilon\delta y,\,(y+\epsilon\delta y)'\big)\,dx\right|_{\epsilon=0} \\
&=\left.\int_a^b
\frac{d}{d\epsilon}
L\big(x,\,y+\epsilon\delta y,\,y'+\epsilon\delta y'\big)\,dx\right|_{\epsilon=0} \\
&=\int_a^b
\left(
\frac{\partial L}{\partial y}\,\delta y
+
\frac{\partial L}{\partial y'}\,\delta y'
\right)dx.
\end{align} \tag{4}
$$

For part 2 `$\int_a^b \frac{\partial L}{\partial y'}\delta y'dx $`, we can integrate it by parts:
$$
\begin{align}
\int_a^b \frac{\partial L}{\partial y'}\delta y'dx &=\int_a^b \frac{\partial L}{\partial y'}d\delta y  \\
&=\frac{\partial L}{\partial y'}\delta y \large|_a^b - \int_a^b \frac{d }{dx} \frac{\partial L}{\partial y'} \delta ydx \\
&= -\int_a^b \frac{d }{dx} \frac{\partial L}{\partial y'} \delta y dx 
\end{align} \tag{5}
$$
So merge it to formula (4) we have `derivative of functional`: 
$$
\begin{aligned}
\delta J[y;\delta y]
&= \int_a^b \left(\frac{\partial L}{\partial y}\delta y+\frac{\partial L}{\partial y'}\delta y'\right)dx \\
&= \int_a^b \frac{\partial L}{\partial y}\delta y\,dx
+ \int_a^b \frac{\partial L}{\partial y'}\frac{d}{dx}(\delta y)\,dx \\
&= \int_a^b \frac{\partial L}{\partial y}\delta y\,dx
+ \left[\frac{\partial L}{\partial y'}\delta y\right]_a^b
- \int_a^b \frac{d}{dx}\left(\frac{\partial L}{\partial y'}\right)\delta y\,dx \\
&= \left[\frac{\partial L}{\partial y'}\delta y\right]_a^b
+ \int_a^b \left(\frac{\partial L}{\partial y}-\frac{d}{dx}\frac{\partial L}{\partial y'}\right)\delta y\,dx.
\end{aligned}
$$
Thus, 
$$
\frac{\partial J}{\partial y(x)} = \int_a^b\big ( \frac{\partial L}{\partial y} - \frac{d }{dx} \frac{\partial L}{\partial y'} \big ) dx
$$
To find the function $y$ leads to extremum, one necessary condition is `$\frac{\partial J}{\partial y(x)}=0\quad \forall x \in [a,b]$`.




