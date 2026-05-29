---
title: Nabla Operator
date: 2026-04-01
tag: Notes
excerpt: 哈密顿算子的一些直观理解
---

# 哈密顿算子
哈密顿算子是一种常用的**矢量微分算符**，定义$\hat{x},\hat{y},\hat{z}$为三维空间内的三个正交基，其中哈密顿算子的定义为：
$$ 
\nabla=\hat{x}\frac{\partial}{\partial x} + \hat{y}\frac{\partial}{\partial y} + \hat{z}\frac{\partial}{\partial z}
$$
由于包含有微分算子，因此其可以用来`分析数学和物理对象的动态状态`，例如函数的变化、流量的变化。
可以理解为欧几里得空间$(\hat{x},\hat{y},\hat{z})$下的对描述对象`某一方向上的一种瞬时动态`。
下面介绍个人对三种基本物理量的直观理解。
## 梯度
梯度描述了**标量函数**$T=t(x,y,z)$在某一点（描述对象）上函数值上升最快的方向，是个矢量。
定义为：
$$
\begin{align}
\nabla T 
&=\hat{x}\frac{\partial t(x,y,z)}{\partial x} + \hat{y}\frac{\partial t(x,y,z)}{\partial y} + \hat{z}\frac{\partial t(x,y,z)}{\partial z}
\end{align}
$$
即描述了函数$T=t(x,y,z)$在欧式空间上的某一动态变化趋势，且大小指向增加的方向。
## 散度
散度可以看做矢量微分算子`点乘`一个矢量场，得到的结果为一个标量。这个标量反映了`向量点乘的性质，即相关量之间的相互作用`。类比于做功，做功大小实际上是矢量力在运动矢量上的内积，无关的位移不计算，相关的分量被不断累积。
$$
\begin{align}
\nabla \cdot v &=\big(\hat{x}\frac{\partial}{\partial x} + \hat{y}\frac{\partial}{\partial y} + \hat{z}\frac{\partial}{\partial z}\big)\cdot (v_x\hat{x}+v_y\hat{y}+v_z\hat{z}) \\
&= \frac{\partial v_x}{\partial x}+ \frac{\partial v_y}{\partial y} + \frac{\partial v_z}{\partial z}\\
&=空间 \cdot 向量场
\end{align}
$$
前面提到了，哈密顿算子的物理含义是空间上研究对象的瞬时变化矢量，同样地，散度可以看做，某一个矢量场（例如流），在空间内的各个矢量方向做累积后得到的净值。显然对于流体来说，这就是我们平时所说的散度。很直观地可以联想到`汇聚`，对于若干个流的矢量$v_i(x,y,z)$，空间上的某一个特点这些流都`涌向这里`（散度大于0）或者这些流都`远离这里`（散度小于0）。

## 旋度
旋度的理解同样有很强的物理直观。
旋度可以被认为是矢量和矢量之间的叉乘，其结果也是个矢量，它的定义是：
$$
\begin{align}
\nabla \times \mathbf{v}
&=\left(\hat{x}\frac{\partial}{\partial x} + \hat{y}\frac{\partial}{\partial y} + \hat{z}\frac{\partial}{\partial z}\right)\times
\left(v_x\hat{x}+v_y\hat{y}+v_z\hat{z}\right) \\
&=
\begin{vmatrix}
\hat{x} & \hat{y} & \hat{z} \\
\dfrac{\partial}{\partial x} & \dfrac{\partial}{\partial y} & \dfrac{\partial}{\partial z} \\
v_x & v_y & v_z
\end{vmatrix}
\end{align}
$$
前问提到，哈密顿微分算子描述了空间上的运动状态（空间内某点处增长最快的方向，但是需要注意，$\nabla$算子表示的空间并不是物理上的空间，而是作用到具体函数的抽象的函数空间），而叉乘与点乘不同的一点是，其描述的是矢量场法向上的累计（而点乘时切向），同样是以流体作类比。如果叉乘得到的向量为正，其实这代表了一种”倾向“。
根据右手定则，产生这种“倾向”会要求若干流的速度场$v_i(x,y,z)$的切向方向同时向一个点聚拢，而这个点便是涡流的中心。

