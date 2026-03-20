---
tag: Math
title: 富比尼定理
---

# 富比尼定理

**富比尼定理**（英語：Fubini's theorem）是[數學分析](https://zh.wikipedia.org/wiki/数学分析)中有關重積分的一個定理，由數學家[圭多·富比尼](https://zh.wikipedia.org/wiki/圭多·富比尼)在1907年提出。富比尼定理給出了使用[逐次積分](https://zh.wikipedia.org/wiki/逐次积分)的方法計算[雙重積分](https://zh.wikipedia.org/wiki/双重积分)的條件。在這些條件下，不僅能夠用逐次積分計算雙重積分，而且交換逐次積分的順序時，積分結果不變。「托內利定理」由數學家[列奧尼達·托內利](https://zh.wikipedia.org/wiki/列奧尼達·托內利)在1909年提出，與富比尼定理相似，但是是應用於非負函數而不是可積函數。[[1\]](https://zh.wikipedia.org/wiki/富比尼定理#cite_note-1)

## 定理

若
$$
{\displaystyle \int _{A\times B}|f(x,y)|\,d(x,y)<\infty }
$$


其中*A*和*B*都是[σ-有限測度](https://zh.wikipedia.org/wiki/Σ-有限测度)空間，$ {\displaystyle A\times B}$是$A$和$B$的[積可測空間](https://zh.wikipedia.org/wiki/积测度)，${\displaystyle f:A\times B\mapsto \mathbb {C} }$是[可測函數](https://zh.wikipedia.org/wiki/可测函数)，那麼
$$
{\displaystyle \int _{A}\left(\int _{B}f(x,y)\,dy\right)\,dx=\int _{B}\left(\int _{A}f(x,y)\,dx\right)\,dy=\int _{A\times B}f(x,y)\,d(x,y)}
$$


前二者是在兩個測度空間上的[逐次積分](https://zh.wikipedia.org/wiki/逐次积分)，但積分次序不同；第三個是在乘積空間上關於乘積測度的積分。

特別地，如果${\displaystyle f(x,y)=h(x)g(y)}$，則
$$
{\displaystyle \int _{A}h(x)\,dx\int _{B}g(y)\,dy=\int _{A\times B}f(x,y)\,d(x,y)}
$$
如果條件中絕對值積分值不是有限，那麼上述兩個逐次積分的值可能不同。

## 非負函數的Tonelli定理

[托內利](https://zh.wikipedia.org/wiki/列奧尼達·托內利)定理延續了富比尼定理。托內利定理的結論與富比尼定理一樣，但是條件從 ${\displaystyle |f|}$ 積分有限改為了${\displaystyle f}$ 非負。

## 應用

富比尼定理一個應用是計算[高斯積分](https://zh.wikipedia.org/wiki/高斯积分)。高斯積分是很多概率論結果的基礎：
$$
{\displaystyle \int _{-\infty }^{\infty }e^{-\alpha x^{2}}\,dx={\sqrt {\frac {\pi }{\alpha }}}}
$$

## 參考文獻

1.  [Tonelli, Leonida](https://zh.wikipedia.org/wiki/列奧尼達·托內利) (1909). "Sull'integrazione per parti". *Atti della Accademia Nazionale dei Lincei*. (5). **18** (2): 246–253.