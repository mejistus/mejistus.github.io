---
title: Expectation Maximization Algorithm
date: 2026-05-28
tag: Notes
excerpt: Recapped from https://zhuanlan.zhihu.com/p/484134651
---

## 簡述

在統計計算中，最大期望算法（Expectation Maximization Algorithm, EM）是一類用於在含有隱變量的機率模型中尋找參數最大概似估計（Maximum Likelihood Estimation, MLE）的算法。EM 算法常用於機器學習與計算機視覺中的數據聚類（Data Clustering）問題，尤其適合處理具有隱變量的混合模型。

EM 算法交替執行兩個步驟：

- **E-step（Expectation Step）**：在當前參數下，計算隱變量的後驗分布，並構造觀測對數似然函數的下界；
- **M-step（Maximization Step）**：最大化該下界，得到新的參數估計。

M-step 中得到的新參數會被用於下一輪 E-step。這一過程不斷交替進行，使觀測數據的對數似然值單調不下降。

---

## 算法過程

考慮以下情景：可觀測隨機變量 $X$ 與不可觀測隨機變量 $Z$ 被聯合建模。令

\begin{equation}
P_{\theta}(X=x, Z=z) = f(x,z;\theta).
\label{eq:joint_distribution}
\end{equation}

這裡的 $f(\cdot)$ 滿足概率分布的基本定義，即

\begin{equation}
\sum_{x,z} f(x,z;\theta)=1,
\qquad
f(x,z;\theta)\ge 0.
\label{eq:probability_condition}
\end{equation}

對於 $n$ 個觀測樣本 $\{x_1,x_2,\cdots,x_n\}$，參數 $\theta$ 的觀測數據對數似然函數為

\begin{equation}
\ell(\theta)
=
\ln\left(
\prod_{i=1}^{n} P_{\theta}(X=x_i)
\right).
\label{eq:log_likelihood_product}
\end{equation}

由於隱變量 $Z$ 不可觀測，需要對所有可能的隱變量取值求和，因此

\begin{equation}
P_{\theta}(X=x_i)
=
\sum_{j} f(x_i,z_j;\theta).
\label{eq:marginal_likelihood}
\end{equation}

代入可得

\begin{equation}
\ell(\theta)
=
\ln\left(
\prod_{i=1}^{n}
\sum_{j} f(x_i,z_j;\theta)
\right)
=
\sum_{i=1}^{n}
\ln\left(
\sum_j f(x_i,z_j;\theta)
\right).
\label{eq:observed_log_likelihood}
\end{equation}

直接最大化式 \eqref{eq:observed_log_likelihood} 通常比較困難，因為對數函數內部包含了對隱變量的求和。EM 算法的核心思想是：通過 Jensen 不等式構造對數似然函數的下界，然後交替更新該下界與模型參數。

---

## Jensen 不等式構造下界

假設當前參數為

\begin{equation}
a = \theta^{(t)}.
\label{eq:current_theta}
\end{equation}

對於每一個樣本 $x_i$，定義隱變量的後驗分布

\begin{equation}
q_{ij}
=
P_a(Z=z_j \mid X=x_i)
=
\frac{
f(x_i,z_j;a)
}{
\sum_k f(x_i,z_k;a)
}.
\label{eq:posterior_q}
\end{equation}

顯然，

\begin{equation}
q_{ij}\ge 0,
\qquad
\sum_j q_{ij}=1.
\label{eq:q_condition}
\end{equation}

因此可以將觀測對數似然改寫為

\begin{equation}
\ell(\theta)
=
\sum_i
\ln\left(
\sum_j f(x_i,z_j;\theta)
\right).
\label{eq:ll_original}
\end{equation}

由於 $\sum_j q_{ij}=1$，有

\begin{equation}
\ell(\theta)
=
\sum_i
\ln\left(
\sum_j
q_{ij}
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}
}
\right).
\label{eq:ll_with_q}
\end{equation}

由於 $\ln(\cdot)$ 是凹函數，根據 Jensen 不等式，

\begin{equation}
\ln\left(
\sum_j q_{ij}
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}
}
\right)
\ge
\sum_j
q_{ij}
\ln
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}
}.
\label{eq:jensen_single}
\end{equation}

因此，

\begin{equation}
\ell(\theta)
\ge
\sum_i
\sum_j
q_{ij}
\ln
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}
}.
\label{eq:lower_bound}
\end{equation}

記右側為對數似然函數的下界：

\begin{equation}
\mathcal{L}(\theta,q)
=
\sum_i
\sum_j
q_{ij}
\ln
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}
}.
\label{eq:lower_bound_definition}
\end{equation}

因此有

\begin{equation}
\ell(\theta)
\ge
\mathcal{L}(\theta,q).
\label{eq:ll_ge_lower_bound}
\end{equation}

---

## 為什麼當前參數處下界與似然相等

由式 \eqref{eq:posterior_q} 可知，當 $\theta=a$ 時，

\begin{equation}
q_{ij}
=
\frac{
f(x_i,z_j;a)
}{
\sum_k f(x_i,z_k;a)
}.
\label{eq:q_at_a}
\end{equation}

因此，

\begin{equation}
\frac{
f(x_i,z_j;a)
}{
q_{ij}
}
=
\sum_k f(x_i,z_k;a).
\label{eq:jensen_constant}
\end{equation}

注意右側與 $j$ 無關。也就是說，對於固定的樣本 $x_i$，Jensen 不等式中的各項

\begin{equation}
\frac{
f(x_i,z_j;a)
}{
q_{ij}
}
\label{eq:jensen_term}
\end{equation}

在不同 $j$ 上相等，因此 Jensen 不等式取等號。於是得到

\begin{equation}
\ell(a)
=
\mathcal{L}(a,q).
\label{eq:tight_bound}
\end{equation}

這說明，在當前參數 $a$ 處，EM 構造出的下界與真實的觀測對數似然函數相切。

---

## E-step 與 M-step

### E-step

在第 $t$ 輪迭代中，給定當前參數

\begin{equation}
\theta^{(t)} = a,
\label{eq:e_step_theta}
\end{equation}

計算隱變量的後驗分布

\begin{equation}
q_{ij}^{(t)}
=
P_{\theta^{(t)}}(Z=z_j \mid X=x_i)
=
\frac{
f(x_i,z_j;\theta^{(t)})
}{
\sum_k f(x_i,z_k;\theta^{(t)})
}.
\label{eq:e_step}
\end{equation}

### M-step

在 E-step 得到 $q_{ij}^{(t)}$ 後，最大化下界

\begin{equation}
\theta^{(t+1)}
=
\arg\max_{\theta}
\mathcal{L}(\theta,q^{(t)}).
\label{eq:m_step}
\end{equation}

也就是

\begin{equation}
\theta^{(t+1)}
=
\arg\max_{\theta}
\sum_i
\sum_j
q_{ij}^{(t)}
\ln
\frac{
f(x_i,z_j;\theta)
}{
q_{ij}^{(t)}
}.
\label{eq:m_step_expanded}
\end{equation}

由於 $q_{ij}^{(t)}$ 在 M-step 中被固定，因此其中與 $\theta$ 無關的項可以忽略。於是 M-step 等價於最大化

\begin{equation}
\theta^{(t+1)}
=
\arg\max_{\theta}
\sum_i
\sum_j
q_{ij}^{(t)}
\ln
f(x_i,z_j;\theta).
\label{eq:m_step_simplified}
\end{equation}

這就是通常所說的最大化完整數據對數似然的期望。

---

## 似然值單調不下降的證明

令當前參數為

\begin{equation}
a=\theta^{(t)},
\label{eq:a_theta}
\end{equation}

經過 M-step 更新後得到

\begin{equation}
b=\theta^{(t+1)}.
\label{eq:b_theta}
\end{equation}

由 E-step 的構造可知，下界在當前參數 $a$ 處與原對數似然相等：

\begin{equation}
\ell(a)
=
\mathcal{L}(a,q).
\label{eq:proof_step_1}
\end{equation}

由 M-step 的定義，$b$ 是使下界最大的參數，因此

\begin{equation}
\mathcal{L}(b,q)
\ge
\mathcal{L}(a,q).
\label{eq:proof_step_2}
\end{equation}

另一方面，對於任意參數 $\theta$，由 Jensen 不等式構造出的下界都滿足

\begin{equation}
\ell(\theta)
\ge
\mathcal{L}(\theta,q).
\label{eq:proof_step_3}
\end{equation}

因此，當 $\theta=b$ 時，有

\begin{equation}
\ell(b)
\ge
\mathcal{L}(b,q).
\label{eq:proof_step_4}
\end{equation}

將上述不等式連接起來，得到

\begin{equation}
\ell(b)
\ge
\mathcal{L}(b,q)
\ge
\mathcal{L}(a,q)
=
\ell(a).
\label{eq:proof_chain}
\end{equation}

因此，

\begin{equation}
\ell(\theta^{(t+1)})
\ge
\ell(\theta^{(t)}).
\label{eq:monotonicity}
\end{equation}

這說明 EM 算法每次迭代後，觀測數據的對數似然值不會下降。

---

## 收斂性說明

EM 算法可以保證觀測數據的對數似然值單調不下降：

\begin{equation}
\ell(\theta^{(0)})
\le
\ell(\theta^{(1)})
\le
\ell(\theta^{(2)})
\le
\cdots.
\label{eq:monotone_sequence}
\end{equation}

如果對數似然函數存在上界，則根據單調有界收斂定理，序列

\begin{equation}
\left\{
\ell(\theta^{(t)})
\right\}_{t=0}^{\infty}
\label{eq:likelihood_sequence}
\end{equation}

收斂。

需要注意的是，EM 算法通常只能保證收斂到局部最優點、鞍點或駐點，而不能保證收斂到全局最優解。EM 對初始化較為敏感，不同的初始參數可能會導致不同的收斂結果。

---

## 總結

EM 算法的核心可以概括為：

1. 對含有隱變量的觀測對數似然函數直接最大化通常比較困難；
2. E-step 根據當前參數計算隱變量的後驗分布；
3. 利用 Jensen 不等式構造觀測對數似然函數的下界；
4. M-step 最大化該下界，得到新的參數；
5. 每次迭代都能保證觀測對數似然值單調不下降；
6. 在似然函數有上界時，似然值序列收斂。

因此，EM 算法本質上是一種通過交替構造並最大化下界來求解含隱變量模型最大概似估計的方法。