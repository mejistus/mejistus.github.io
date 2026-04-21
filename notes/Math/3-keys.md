---
title: 泛函与优化
date: 2026-04-21
tag: Math
excerpt: 本文介绍了3个泛函优化的典型问题.
---
## 泛函优化
$$
J[y]=\int_a^b F(x,y,y',y'',\dots)\,dx,
\qquad
\text{s.t.}\quad
K[y]=\int_a^b G(x,y,y',y'',\dots)\,dx=C,
$$
而不是把约束也写成同一个 $F$。
对应的增广泛函是
$$
\tilde J[y,\lambda]
=\int_a^b \big(F+\lambda G\big)\,dx-\lambda C .
$$
下面是 3 个覆盖不同类型的例题，并都写到“列出增广泛函—写出欧拉方程—解出 $y(x)$”这一步。

## 例 1：最基础的积分约束问题

求函数 `$y(x)$`，使 `$J[y]=\int_0^1 (y')^2\,dx$`取极小，并满足约束
$$
\int_0^1 y(x)\,dx=m,
\qquad
y(0)=y(1)=0.
$$
### 第一步：构造增广泛函
$$
\tilde J[y,\lambda]=\int_0^1 \Big((y')^2+\lambda y\Big)\,dx-\lambda m.
$$
这里`增广被积函数`是$$\mathcal L=(y')^2+\lambda y.$$

### 第二步：写欧拉–拉格朗日方程
$$
\frac{\partial \mathcal L}{\partial y}
-
\frac{d}{dx}\frac{\partial \mathcal L}{\partial y'}
=0.
$$
代入得
$$
\lambda-\frac{d}{dx}(2y')=0
\quad\Longrightarrow\quad
2y''=\lambda.
$$
即
$$y''=\frac{\lambda}{2}.$$

### 第三步：求通解并代边界条件

积分两次： $y(x)=\frac{\lambda}{4}x^2+c_1x+c_2$.
由 $y(0)=0$ 得 $c_2=0$；
由 $y(1)=0$ 得$$\frac{\lambda}{4}+c_1=0
\quad\Longrightarrow\quad
c_1=-\frac{\lambda}{4}.$$

所以
$$
y(x)=\frac{\lambda}{4}(x^2-x).
$$
## 第四步：利用积分约束确定 $\lambda$
$$
\int_0^1 y(x)\,dx
=
\frac{\lambda}{4}\int_0^1 (x^2-x)\,dx
=
\frac{\lambda}{4}\left(\frac13-\frac12\right)
=
-\frac{\lambda}{24}.
$$
令其等于 $m$，得
$$
-\frac{\lambda}{24}=m
\quad\Longrightarrow\quad
\lambda=-24m.$$

因此极值函数为
$$
\boxed{
y(x)=6m\,x(1-x)
}.
$$
### 这个例题说明什么

这是最典型的“目标泛函 + 线性积分约束”问题。
最后得到的是一个抛物线解。



## 例 2：带归一化约束的问题，会导出特征值问题

求函数 $y(x)$，使

$$ J[y]=\int_0^\pi (y')^2\,dx$$

取极小，并满足

$$ \int_0^\pi y^2(x)\,dx=1,
\qquad
y(0)=y(\pi)=0.$$

这个例子很重要，因为它会自然导出“特征值问题”。

### 第一步：构造增广泛函

$$\tilde J[y,\lambda]
=
\int_0^\pi \Big((y')^2+\lambda y^2\Big)\,dx-\lambda.
$$
对应
$$
\mathcal L=(y')^2+\lambda y^2.
$$
第二步：写欧拉–拉格朗日方程
$$
\frac{\partial \mathcal L}{\partial y}
-
\frac{d}{dx}\frac{\partial \mathcal L}{\partial y'}
=0
$$
即
$$
2\lambda y-\frac{d}{dx}(2y')=0
\quad\Longrightarrow\quad
y''=\lambda y.
$$
### 第三步：讨论 $\lambda$ 的符号

若 $\lambda>0$，解是指数型，一般难满足两端齐次边界并保持非零；
为得到非平凡解，令

$$\lambda=-\mu^2,\qquad \mu>0.$$

则方程变为 $y''+\mu^2 y=0.$

通解为
$$
y(x)=A\sin(\mu x)+B\cos(\mu x).
$$
由 $y(0)=0$ 得 $B=0$；
由 $y(\pi)=0$ 得

$$A\sin(\mu\pi)=0.$$

非零解要求
$$
\mu=n,\qquad n=1,2,3,\dots
$$
所以
$$
y_n(x)=A\sin(nx).
$$
第四步：由约束归一化
$$
\int_0^\pi y_n^2(x)\,dx
=
A^2\int_0^\pi \sin^2(nx)\,dx
=
A^2\frac{\pi}{2}
=1.
$$
故
$$
A=\sqrt{\frac{2}{\pi}}.
$$
于是归一化解为
$$
y_n(x)=\sqrt{\frac{2}{\pi}}\sin(nx).
$$
### 第五步：选出使 $J[y]$ 最小的那个
$$
J[y_n]=\int_0^\pi (y_n')^2\,dx=n^2.
$$
因此最小值对应 $n=1$，故极小解为
$$
\boxed{
y(x)=\sqrt{\frac{2}{\pi}}\sin x
}.
$$
### 这个例题说明什么

这个例子覆盖的是“二次型约束 / 归一化约束”。
拉格朗日乘子 \lambda 不再只是一个辅助常数，而会变成特征值。



## 例 3：高阶导数泛函

求函数$y(x)$，使

$$J[y]=\int_0^1 (y'')^2\,dx$$

取极小，并满足 $\int_0^1 y(x)\,dx=M,$

以及夹持边界条件$$ y(0)=y(1)=0,\qquad y'(0)=y'(1)=0.$$

这类问题对应“弯曲能量最小”，比前两个高一阶。

### 第一步：构造增广泛函
$$
\tilde J[y,\lambda]
=
\int_0^1 \Big((y'')^2+\lambda y\Big)\,dx-\lambda M.
$$
这里
$$
\mathcal L=(y'')^2+\lambda y.
$$
### 第二步：使用高阶欧拉方程

若被积函数含 $y''$，则欧拉方程为
$$
\frac{\partial \mathcal L}{\partial y}
-
\frac{d}{dx}\frac{\partial \mathcal L}{\partial y'}
+
\frac{d^2}{dx^2}\frac{\partial \mathcal L}{\partial y''}
=0.
$$
代入得
$$
\lambda+ \frac{d^2}{dx^2}(2y'')=0
\quad\Longrightarrow\quad
\lambda+2y^{(4)}=0.
$$
即
$$
y^{(4)}=-\frac{\lambda}{2}.
$$
### 第三步：积分四次

设
$$
c=-\frac{\lambda}{2},
$$
则
$$
y^{(4)}=c.
$$
积分得
$$
y(x)=\frac{c}{24}x^4+\frac{A}{6}x^3+\frac{B}{2}x^2+Cx+D.
$$
由 $y(0)=0,\ y'(0)=0$ 得
$$
D=0,\qquad C=0.
$$
再由 $y(1)=0,\ y'(1)=0$，可解得
$$
A=-\frac{c}{2},\qquad B=\frac{c}{12}.
$$
所以
$$
y(x)
=
\frac{c}{24}\big(x^4-2x^3+x^2\big)
=
\frac{c}{24}x^2(1-x)^2.
$$
### 第四步：利用积分约束确定$ c$
$$
\int_0^1 y(x)\,dx
=
\frac{c}{24}\int_0^1 x^2(1-x)^2\,dx.
$$
而
$$
\int_0^1 x^2(1-x)^2\,dx=\frac{1}{30},
$$
所以
$$
\int_0^1 y(x)\,dx
=
\frac{c}{24}\cdot\frac{1}{30}
=
\frac{c}{720}.
$$
令其等于 $M$，得
$$
c=720M.
$$
最终
$$
\boxed{
y(x)=30M\,x^2(1-x)^2
}.
$$
### 这个例题说明什么

这个例子覆盖的是“高阶导数泛函 + 积分约束”。
对应的欧拉方程不再是二阶，而是四阶。


## 三个例题的覆盖点总结

### 例 1：线性积分约束
$$\int y\,dx = \text{常数}$$
得到常系数二阶方程，解通常是多项式。

### 例 2：二次归一化约束
$$\int y^2\,dx = 1$$
会自然导出特征值问题，解常为正弦/余弦基函数。

### 例 3：高阶导数泛函
$$\int (y'')^2\,dx$$
对应高阶欧拉方程，适合展示“高阶变分”的形式。

总体结构如下：
$$
J[y]=\int_a^b F(x,y,y',\dots)\,dx,
\qquad
K[y]=\int_a^b G(x,y,y',\dots)\,dx=C, \\
\tilde J[y,\lambda]
=
\int_a^b \big(F+\lambda G\big)\,dx-\lambda C.
$$

