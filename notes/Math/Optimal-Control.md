---
tag: Math
date: 2025/12/31
title: 最优控制（Optimal Control）
---

# 最优控制（Optimal Control）

## 1. 介绍

**最优控制理论**是[控制理论](https://en.wikipedia.org/wiki/Control_theory)的一个分支，研究在一段时间内寻找动力[系统的](https://en.wikipedia.org/wiki/Dynamical_system)[控制 ](https://en.wikipedia.org/wiki/Control_(optimal_control_theory))，从而优化[目标函数 ](https://en.wikipedia.org/wiki/Objective_function)。[[1\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-:0-1) 它在科学、工程和运筹学中有广泛的应用。

例如，动力系统可能是一艘带有火箭推进器控制装置的[航天器 ](https://en.wikipedia.org/wiki/Spacecraft)，目标可能是以最小燃料消耗抵达[月](https://en.wikipedia.org/wiki/Moon)球。[[2\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-2) 或者，动力系统可以是一个国家[的经济](https://en.wikipedia.org/wiki/Economy)体，目标是最小[化失业 ](https://en.wikipedia.org/wiki/Unemployment);在这种情况下，控制措施可能是[财政](https://en.wikipedia.org/wiki/Fiscal_policy)和[货币政策 ](https://en.wikipedia.org/wiki/Monetary_policy)。[[3\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-3) 动力学系统也可以被引入，将[运筹学问题](https://en.wikipedia.org/wiki/Operations_research)嵌入最优控制理论框架内。

最优控制是[变分法](https://en.wikipedia.org/wiki/Calculus_of_variations)的扩展，是一种用于推导[控制策略](https://en.wikipedia.org/wiki/Control_theory)的数学优化方法。[[6\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-6) 该方法主要得益于 20 世纪 50 年代 [Lev Pontryagin](https://en.wikipedia.org/wiki/Lev_Pontryagin) 和 [Richard Bellman](https://en.wikipedia.org/wiki/Richard_Bellman) 的工作，继 [Edward J. McShane](https://en.wikipedia.org/wiki/Edward_J._McShane) 对变分法的贡献之后。最优控制可以被视为[控制理论](https://en.wikipedia.org/wiki/Control_theory)中的[一种控制策略 ](https://en.wikipedia.org/wiki/Control_strategy)。

## 2.一般方法

### 介绍

最优控制处理的是为给定系统寻找一个控制定律，从而实现某个[最优性准则](https://en.wikipedia.org/wiki/Optimality_criterion)的问题。控制问题包括一个成本[泛函 ](https://en.wikipedia.org/wiki/Cost_functional)，它是状态变量和控制变量的[函数 ](https://en.wikipedia.org/wiki/Function_(mathematics))。 **最优控制**是一组描述控制变量路径的微[分方程 ](https://en.wikipedia.org/wiki/Differential_equation)，使成本函数最小化。最优控制可以通过庞[特里亚金最大原理 ](https://en.wikipedia.org/wiki/Pontryagin's_maximum_principle)[（也称为](https://en.wikipedia.org/wiki/Necessary_condition)庞特里亚金最小原则或简称庞特里亚金原理）来推导，[[8\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-8)，或者通过求解[汉密尔顿–雅可比–贝尔曼方程 ](https://en.wikipedia.org/wiki/Hamilton–Jacobi–Bellman_equation)（[ 充分条件 ](https://en.wikipedia.org/wiki/Sufficient_condition)）。

我们从一个简单的例子开始。想象一辆汽车在丘陵路上直线行驶。问题是，司机应该如何踩油门踏板，以*最小化*总行驶时间？在这个例子中， *控制律*一词特指驾驶员踩下油门和换挡的方式。 *该系统*由汽车和道路组成，最*优性准则*是总行驶时间的最小化。控制问题通常包含辅助[约束 ](https://en.wikipedia.org/wiki/Constraint_(mathematics))。例如，可用燃油量可能有限，油门踏板无法穿过车底，限速等。

适当的成本函数是一个数学表达式，表示旅行时间随速度、几何因素和[系统初始条件](https://en.wikipedia.org/wiki/Initial_condition)变化而变化。[ 约束](https://en.wikipedia.org/wiki/Constraint_(mathematics))通常与成本函数互换。

另一个相关的最优控制问题可能是寻找驾驶方式以最小化燃油消耗，前提是汽车必须在不超过一定时间内完成某一赛程。另一个相关的控制问题可能是在假设时间和燃料的经济成本下，最小化完成行程的总经济成本。

一个更抽象的框架如下。[[1\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-:0-1) 最小化连续时间成本函数
$$
{\displaystyle J[{\textbf {x}}(\cdot ),{\textbf {u}}(\cdot ),t_{0},t_{f}]:=E\,[{\textbf {x}}(t_{0}),t_{0},{\textbf {x}}(t_{f}),t_{f}]+\int _{t_{0}}^{t_{f}}F\,[{\textbf {x}}(t),{\textbf {u}}(t),t]\,\mathrm {d} t}
$$


受一阶动力学约束（ **状态方程** ）x 约束:
$$
{\displaystyle {\dot {\textbf {x}}}(t)={\textbf {f}}\,[\,{\textbf {x}}(t),{\textbf {u}}(t),t],}
$$


代数*路径约束*
$$
{\displaystyle {\textbf {h}}\,[{\textbf {x}}(t),{\textbf {u}}(t),t]\leq {\textbf {0}},}
$$


以及[终点条件](https://en.wikipedia.org/wiki/Boundary_condition)
$$
{\displaystyle {\textbf {e}}[{\textbf {x}}(t_{0}),t_{0},{\textbf {x}}(t_{f}),t_{f}]=0}
$$
其中 $x ( t )$ 是*状态* ，$u ( t )$ 是*控制，*$T$ 是自变量（一般来说，时间），$T_ 0$ 是初始时间，且$ T_ f$ 是终端时间。 项 $E$ 以及 $F$ 分别称为*端点成本*和*运行成本* 。在变分法中，$E$ 以及 $F$分别称为迈耶项和*[拉格朗日量 ](https://en.wikipedia.org/wiki/Lagrange_multiplier)*。 此外，需要注意的是，路径约束通常属于*不等式*约束，因此在最优解处可能不具备激活（即不等于零）。 还需要注意，上述最优控制问题可能有多个解（即解可能不唯一）。 因此，通常情况下，任何解$[ x^∗ ( t ) , u^∗ ( t ) , t_0^∗ , t_f^∗ ]$ 最优控制问题是**局部最小化**的。



### 线性二次控制（Linear quadratic control ）

上节给出的一般非线性最优控制问题的一个特例是[*线性二次* （LQ）最优控制问题 ](https://en.wikipedia.org/wiki/Linear-quadratic_regulator)。 LQ 问题表述如下。 最小化*二次*连续时间代价泛函：
$$
{\displaystyle J={\tfrac {1}{2}}\mathbf {x} ^{\mathsf {T}}(t_{f})\mathbf {S} _{f}\mathbf {x} (t_{f})+{\tfrac {1}{2}}\int _{t_{0}}^{t_{f}}[\,\mathbf {x} ^{\mathsf {T}}(t)\mathbf {Q} (t)\mathbf {x} (t)+\mathbf {u} ^{\mathsf {T}}(t)\mathbf {R} (t)\mathbf {u} (t)]\,\mathrm {d} t}
$$
受限于**线性一阶动力学约束**
$$
{\displaystyle {\dot {\mathbf {x} }}(t)=\mathbf {A} (t)\mathbf {x} (t)+\mathbf {B} (t)\mathbf {u} (t),}
$$
以及初始条件
$$
{\displaystyle \mathbf {x} (t_{0})=\mathbf {x} _{0}}
$$
在有限视界情况下，矩阵在 Q 下受到限制 以及 R 分别是正半定和正定。 然而，在无限视界情况下，矩[阵 ](https://en.wikipedia.org/wiki/Matrix_(mathematics))Q 以及 R 不仅是正半定和正定，而且是*常数*的。 这些额外的限制 Q 以及 R 在无限视野情况下，强制执行以确保成本泛函保持正值。 此外，为了确保成本函数有*界* ，还额外限制了对$( A , B )$ *[是可控](https://en.wikipedia.org/wiki/Controllability)* 的。 注意，LQ 或 LQR 成本泛函在物理上可以理解为试图最小化*控制能量* （以二次型测量）。
$$

$$
无限视界问题（即 LQR）可能显得过于限制且基本无用，因为它假设算符将系统驱动至零状态，从而使系统输出归零。这确实是正确的。然而， *在输出为*零之后，将输出驱动到期望的非零电平的问题可以解决。事实上，可以证明这个次级 LQR 问题可以用非常直接的方式解决。 在经典最优控制理论中已证明，LQ（或 LQR）的最优控制具有反馈形式
$$
{\displaystyle \mathbf {u} (t)=-\mathbf {K} (t)\mathbf {x} (t)}
$$
 其中${\displaystyle \mathbf {K} (t)}$是一个适当维度矩阵，给出为
$$
{\displaystyle \mathbf {K} (t)=\mathbf {R} ^{-1}\mathbf {B} ^{\mathsf {T}}\mathbf {S} (t)}
$$
以及 $S ( t )$ 是微分[里卡蒂方程](https://en.wikipedia.org/wiki/Riccati_equation)的解。 微分里卡蒂方程给出为
$$
{\displaystyle {\dot {\mathbf {S} }}(t)=-\mathbf {S} (t)\mathbf {A} -\mathbf {A} ^{\mathsf {T}}\mathbf {S} (t)+\mathbf {S} (t)\mathbf {B} \mathbf {R} ^{-1}\mathbf {B} ^{\mathsf {T}}\mathbf {S} (t)-\mathbf {Q} }
$$
对于有限视界 LQ 问题，利用末端边界条件对 Ricati 方程进行时间逆向积分
$$
{\displaystyle \mathbf {S} (t_{f})=\mathbf {S} _{f}}
$$
对于无限视平面 LQR 问题，微分里卡蒂方程被代*数*里卡蒂方程（ARE）替代，后者给出如下
$$
{\displaystyle \mathbf {0} =-\mathbf {S} \mathbf {A} -\mathbf {A} ^{\mathsf {T}}\mathbf {S} +\mathbf {S} \mathbf {B} \mathbf {R} ^{-1}\mathbf {B} ^{\mathsf {T}}\mathbf {S} -\mathbf {Q} }
$$
理解 ARE 源自无限视界问题，矩阵 A 为 ， B ， Q ，以及 R 这些都*保持恒定* 。 值得注意的是，代数里卡蒂方程通常有多个解，而正*定*解（或正半正定解）用于计算反馈增益。 LQ（LQR）问题由[鲁道夫·E·卡尔曼](https://en.wikipedia.org/wiki/Rudolf_E._Kálmán)优雅地解决。[[9\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-9)

### 最优控制的数值方法（Numerical methods for optimal control）

最优控制问题通常是非线性的，因此通常没有解析解（例如线性-二次最优控制问题）。 因此，必须采用数值方法来解决最优控制问题。 在最优控制的早期（ 约 1950 年代至 1980 年代），解决最优控制问题的首选方法是间*接方法* 。 在间接方法中，利用变分法获得一阶最优条件。 这些条件导致一个两点（或在复杂问题中为多点）边界[值问题 ](https://en.wikipedia.org/wiki/Boundary-value_problem)。 这个边界值问题实际上具有特殊的结构，因为它源自对[哈密顿量](https://en.wikipedia.org/wiki/Hamiltonian_(control_theory))的导数。 因此，所得[的动力系统](https://en.wikipedia.org/wiki/Dynamical_system)是一个形式为 [[1\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-:0-1) 的[哈密顿系统 ](https://en.wikipedia.org/wiki/Hamiltonian_system)。
$$
{\displaystyle {\begin{aligned}{\dot {\textbf {x}}}&={\frac {\partial H}{\partial {\boldsymbol {\lambda }}}}\\[1.2ex]{\dot {\boldsymbol {\lambda }}}&=-{\frac {\partial H}{\partial {\textbf {x}}}}\end{aligned}}}
$$
其中 H = F + λ T f − μ T h 是*增强哈密顿量* ，在间接方法中，边界值问题得以解决（使用适当的边界或*横截条件* ）。 使用间接方法的优点在于状态和伴随（即λ ）被求解，所得解很容易被验证为极值轨迹。 间接方法的缺点是边界值问题通常极难求解（尤其是跨越较长时间区间或带有内部点约束的问题）。 一个著名的间接方法实现软件程序是 BNDSCO。[[10\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-10)

自 20 世纪 80 年代以来，在数值最优控制中逐渐流行起来的方法就是所谓*的直接方法* 。在直接方法中，状态或控制，或两者都用合适的函数近似（例如多项式近似或分段常数参数化）进行近似。同时，成本泛函被近似为*成本函数* 。然后，函数近似的系数被视为优化变量，问题被“转录”为形式为非线性优化问题：

最小化：
$$
{\displaystyle F(\mathbf {z} )}
$$
约束：
$$
{\displaystyle {\begin{aligned}\mathbf {g} (\mathbf {z} )&=\mathbf {0} \\\mathbf {h} (\mathbf {z} )&\leq \mathbf {0} \end{aligned}}}
$$
根据所采用的直接方法类型，非线性优化问题的规模可以非常小（例如直接射击法或[准声波化](https://en.wikipedia.org/wiki/Quasilinearization)方法），中等规模（例如伪[谱最优控制 ](https://en.wikipedia.org/wiki/Pseudospectral_optimal_control)[[11\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-ReviewPOC-11)），也可能相当大（例如直接[配址法 ](https://en.wikipedia.org/wiki/Collocation_method)[[12\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-12)).在后一种情况下（即搭配方法），非线性优化问题可能包含数千到数万个变量和约束。鉴于许多由直接方法产生的自然语言处理（NLP）规模庞大，解非线性优化问题比解决边界值问题更容易似乎有些反直觉。然而，NLP 比边界值问题更容易求解。计算相对容易的原因，尤其是直接搭配方法，是因为自然语言处理是*稀疏的* ，且有许多知名软件（如 [SNOPT](https://en.wikipedia.org/wiki/SNOPT)[[13\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-13)）用于解决大型稀疏自然语言处理。因此，通过直接方法（尤其是如今非常流行的直接*搭配法* ）解决的问题范围，远大于通过间接方法解决的问题范围。事实上，直接方法如今变得如此流行，以至于许多人编写了复杂的软件程序来采用这些方法。 特别是，许多此类项目包括 *DIRCOL，*[[14\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-14) SOCS，[[15\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-15) OTIS，[[16\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-16) GESOP/[ASTOS](https://en.wikipedia.org/wiki/ASTOS)，[[17\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-17) DITAN。[[18\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-18) 以及 PyGMO/PyKEP。[[19\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-19) 近年来，由于 [MATLAB](https://en.wikipedia.org/wiki/MATLAB) 编程语言的出现，MATLAB 中的最优控制软件变得越来越普遍。学术开发的 MATLAB 软件工具实现直接方法的例子包括 *RIOTS*，[[20\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-20)*[DIDO](https://en.wikipedia.org/wiki/DIDO_(optimal_control))*，[[21\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-21)DIRECT，[[22\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-22) FALCON.m，[[23\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-23) 和 *GPOPS，*[[24\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-24)，同时也是一个行业发展的例子 MATLAB 工具是 *[PROPT](https://en.wikipedia.org/wiki/PROPT)*。[[25\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-25) 这些软件工具极大地增加了人们探索复杂最优控制问题的机会，无论是在学术研究还是工业领域。[[26\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-26) 最后，值得注意的是，通用的 MATLAB 优化环境如 [TOMLAB](https://en.wikipedia.org/wiki/TOMLAB) 使编写复杂最优控制问题变得比以往 C 和 [FORTRAN](https://en.wikipedia.org/wiki/FORTRAN) 等语言更容易。



### 离散时间最优控制（Discrete-time optimal control）

迄今为止的例子展示了[连续时间](https://en.wikipedia.org/wiki/Continuous_time)系统和控制解。事实上，随着最优控制解常以[数字](https://en.wikipedia.org/wiki/Digital_data)方式实现，现代控制理论主要关注[离散时间](https://en.wikipedia.org/wiki/Discrete_time)系统和解。[ 一致近似](https://en.wikipedia.org/w/index.php?title=Consistent_Approximations&action=edit&redlink=1)理论 [[27\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-27)[[28\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-28) 提供了条件，使得一系列越来越精确的离散化最优控制问题的解最终收敛于原始连续时间问题的解。并非所有离散化方法都具有这种特性，即使是看似显而易见的。[[29\]](https://en.wikipedia.org/wiki/Optimal_control#cite_note-29) 例如，使用可变步长例程积分问题的动态方程，可能生成一个梯度，在接近解时不会收敛到零（或指向正确方向）。直接方法 *[RIOTS](http://www.schwartz-home.com/RIOTS)* 基于一致近似理论。
