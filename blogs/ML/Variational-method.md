---
tag: ML
title: Variational Method
---

#  變分法

**变分法** （或称**变分法** ）是[数学分析](https://en.wikipedia.org/wiki/Mathematical_analysis)的一个领域，利用变分，变分是[函数](https://en.wikipedia.org/wiki/Function_(mathematics))中的微小变化 以及[泛函 ](https://en.wikipedia.org/wiki/Functional_(mathematics))，用于求函数的极大值和最小值：从[一组函数](https://en.wikipedia.org/wiki/Function_(mathematics))映射到[实数](https://en.wikipedia.org/wiki/Real_number)的[映射 ](https://en.wikipedia.org/wiki/Map_(mathematics))。[[a\]](https://en.wikipedia.org/wiki/Calculus_of_variations#cite_note-2) 泛函通常表示为包含函数及其[导](https://en.wikipedia.org/wiki/Derivative)数的[确定积分 ](https://en.wikipedia.org/wiki/Definite_integral)。最大化或最小泛函的函数可以通过变分法的[欧拉-拉格朗日方程](https://en.wikipedia.org/wiki/Euler–Lagrange_equation)找到。


## 例子
一个简单的例子是找到连接两点的==最短长度曲线==。如果没有约束，解就是点之间的[直线 ](https://en.wikipedia.org/wiki/Straight_line)。然而，如果曲线被限制在空间中的某个曲面上，那么解就不那么明显，可能存在许多解。这种解被称为*[测地线 ](https://en.wikipedia.org/wiki/Geodesic)*。[费马原理](https://en.wikipedia.org/wiki/Fermat's_principle)提出了一个相关问题：光沿着连接两点的最短[光学长度](https://en.wikipedia.org/wiki/Optical_length)路径前行，这取决于介质的材料。[力学](https://en.wikipedia.org/wiki/Mechanics)中对应的一个概念是[最小作用量/静止作用量原理 ](https://en.wikipedia.org/wiki/Principle_of_least_action)。



# 欧拉-泊松方程（Euler–Poisson equation）

如果$S$ 取决于的 $y(x)$的更高阶导数，即如果对于
$$
S=\int_a^b{f(x,y(x),y'(x),\cdots y^{(n)}(x))}dx
$$
则 $y$ 必须满足欧拉-[ 泊松](https://en.wikipedia.org/wiki/Siméon_Denis_Poisson)方程，
$$
\frac{\partial f}{\partial y}-\frac{\partial}{\partial x}\frac{\partial f}{\partial y'}+\frac{\partial^2}{\partial x^2}\frac{\partial f}{\partial y''}-\cdots+(-1)^n\cdot \frac{\partial^n}{\partial x^n}\left[\frac{\partial f}{\partial y^{(n)}}\right]=0
$$

## 示例

求连接两点$( x_1 , y_1)$ 和$( x_2 , y_2)$ 的最短曲线$y$的表达式, 曲线的[弧长](https://en.wikipedia.org/wiki/Arc_length)为:
$$
A[y]=\int_{x_1}^{x_2}{\sqrt{1+[y'(x)]^2}}dx
$$
所以
$$
\frac{\partial f}{\partial y}=\frac{\partial}{\partial x}\frac{\partial f}{\partial y'}=0
$$
即
$$
\frac{\partial}{\partial x}\left[\frac{y'(x)}{\sqrt{1+[y'(x)]^2}}\right]=0
$$

$$
\frac{y'(x)}{\sqrt{1+[y'(x)]^2}}=C \\
[y'(x)]^2=C(1+[y'(x)]^2) \\
$$

即有
$$
y'(x)=C
$$
两点之间直线最短，特别地，在本例中使用的一阶情况为**欧拉-拉格朗日方程**.
