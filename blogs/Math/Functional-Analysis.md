---
tag: Math
title: Functional Analysis
date: 2026/3/25
---


# Functional Analysis

This note is my study for Function Analysis.
## Chap 0
### Inner Product & Outer Product 
| Operation         | Scalar or Vector? | Measures                        | Physical Examples                        |
| ----------------- | ----------------- | ------------------------------- | ---------------------------------------- |
| **Dot product**   | Scalar            | Alignment along a direction     | Work, flux, projection                   |
| **Cross product** | Vector            | Rotation / perpendicular effect | Torque, angular momentum, magnetic force |

### Dinstinct from Matrix Theory 
> Functional analysis is the extension of finite-dimensional linear algebra (matrix theory) to infinite-dimensional spaces of functions and general operators. 

What fundamentally changes:

* **From vectors to functions**
  Objects are no longer ( $\mathbb{R}^n$ ), but spaces like ($L^2$), ($C([a,b])$).

* **From matrices to operators**
  Linear maps become general operators (often not representable as matrices, possibly unbounded).

* **Infinite-dimensional effects**
  Many finite-dimensional facts break:
  bounded ≠ compact, norms are not equivalent, bases behave differently.

* **Richer notions of convergence**
  Not just norm convergence, but also weak and weak-* convergence.

* **Spectral theory generalizes**
  Eigenvalues → spectrum (can be continuous, not just discrete).

* **Structure via topology**
  Norms, completeness (Banach spaces), inner products (Hilbert spaces) become central tools.

> In short: functional analysis studies linear structure in settings where **dimension, convergence, and operators become genuinely more subtle than in matrix theory**.

### Definition for InProduct in Function Space
$\mathbf{L}^2(-\pi,\pi)$ : 

$$
(f,g)=\int_{-\pi}^{\pi}f(x)g(x)dx 
$$


For Fourier series, the **orthogonal basis** comes from **trigonometric functions**. Here’s a concise summary:

---

### **Orthogonal Basis of Fourier Series**

For a function ( $f(x)$ ) defined on ( $[-L, L]$ ):

$$
f(x) \sim \frac{a_0}{2} + \sum_{n=1}^{\infty} \big(a_n \cos\frac{n\pi x}{L} + b_n \sin\frac{n\pi x}{L}\big)
$$

The **orthogonal basis functions** are:

$$
{ 1, \cos\frac{n\pi x}{L}, \sin\frac{n\pi x}{L} }_{n=1}^{\infty}
$$

---

#### **Orthogonality Relations**


* Over the interval ($[-L, L]$):
<br>


$$
  \int_{-L}^{L} cos \frac{m\pi x}{L} cos \frac{n\pi x}{L},dx = 0 \quad (m \ne n)    \\ 
  \int_{-L}^{L} sin \frac{m\pi x}{L} sin \frac{n\pi x}{L},dx = 0 \quad (m \ne n)    \\
  \int_{-L}^{L} cos \frac{m\pi x}{L} sin \frac{n\pi x}{L},dx = 0 \quad (\forall m,n)
$$

* The constant function (1) is orthogonal to all ($\sin$) and ($\cos$) functions for ($ n \ge 1$ ).

---

#### **Intuition**

* Each basis function represents a **“pure frequency”**.
* Orthogonality means the projection of one basis onto another is zero — no overlap in “energy” between different frequencies.
* Fourier coefficients $(a_n, b_n)$ are just **projections onto these orthogonal directions**, analogous to a vector decomposition in a Euclidean space.

---

#### **One-line summary**

> Fourier series uses the orthogonal trigonometric functions ( ${1, \cos(n\pi x/L), \sin(n\pi x/L)}$ ) as a basis, allowing any square-integrable function on ($[-L,L]$) to be expressed as a sum of non-overlapping frequency components.


#### Decomposition 
One function can be regarded as the decomposition on each axis.
$$
    f(x) \sim \sum_{k=0}^{n}(f,e_k)e_k
$$


### **Fourier series convergency**

For a (2L)-periodic function ($f(x)$), the (N)-th partial sum is


$$S_N(x) = \frac{a_0}{2} + \sum_{n=1}^{N} \left(a_n \cos \frac{n\pi x}{L} + b_n \sin \frac{n\pi x}{L}\right)$$


It can also be written using the **Dirichlet kernel** (D_N):

$$S_N(x) = \int_{-L}^{L} f(y) D_N(x-y) , dy$$

where

$$
D_N(t) = \frac{1}{2L} \frac{\sin\left((N+\frac12)\pi t / L\right)}{\sin(\pi t / 2L)}
$$

---

#### **Convolution with Dirichlet kernel**

* The Fourier partial sum is a **convolution** of ($f$) with ($D_N$):

$$
S_N(x) = \int_{-L}^{L} f(x - t) D_N(t) , dt
$$

* ($D_N(t)$) is an **approximate identity**: as ($N \to \infty$), it behaves like a delta function, averaging symmetrically around (t=0).

---

#### **Split around the point (x)**

Assume (f) is piecewise continuously differentiable, so the left and right limits exist:


$$f(x^+) = \lim_{t \to 0^+} f(x+t), \quad f(x^-) = \lim_{t \to 0^-} f(x+t)
$$

Then we can write the integral as

$$S_N(x) = \int_{-δ}^{δ} f(x-t) D_N(t) dt + \int_{|t|>δ} f(x-t) D_N(t) dt
$$

* The second integral goes to 0 as ($N \to \infty$) (Dirichlet kernel decays away from $0$).

* The first integral (around (t=0)) gives the **average of the left and right limits**:


$$\lim_{N \to \infty} \int_{-δ}^{δ} f(x-t) D_N(t) dt = \frac{f(x^+) + f(x^-)}{2}$$


This uses the **Dirichlet integral formula**:


$$\lim_{N \to \infty} \int_{-ε}^{ε} g(t) \frac{\sin((N+\frac12)t)}{\sin(t/2)} dt = \pi \cdot \frac{g(0^+) + g(0^-)}{2}$$


---

#### **Conclusion**

$$
\boxed{
\lim_{N \to \infty} S_N(x) = \frac{f(x^+) + f(x^-)}{2}
}
$$
* If (f) is continuous at (x), this reduces to (f(x)).
* At jump discontinuities, the Fourier series converges to the midpoint of the jump.

---

**Key points:**

1. Piecewise differentiability ensures **bounded variation**, which controls the kernel integral.
2. Dirichlet kernel acts as an **approximate delta**, giving the symmetric average.
3. This is the classical **Dirichlet convergence theorem** for Fourier series.

### Week Convergence and Riemann integrals


#### **Weak Convergence**

Let $(X, |\cdot|)$ be a Banach space, and let ${x_n} \subset X$. We say:

* **Weak convergence**: $x_n \rightharpoonup x$ if

$$
f(x_n) \to f(x) \quad \text{for all } f \in X^*,
$$

where $X^*$ is the dual space (continuous linear functionals).

* **Weak-\* convergence**: $x_n \stackrel{*}{\rightharpoonup} x$ in $X^*$ if

$$
x_n(y) \to x(y) \quad \text{for all } y \in X
$$

This is common in spaces like $L^\infty$ where the dual is bigger than the space itself.

---

#### **Connection to Riemann Integrals**

* Consider $f_n \in L^1([a,b])$.

* **Weak convergence of functions**: $f_n \rightharpoonup f$ in $L^1$ means

$$
\int_a^b f_n(x) g(x) dx \to \int_a^b f(x) g(x) dx \quad \forall g \in L^\infty([a,b])
$$

* **Interpretation**: The $f_n$ may **not converge pointwise** or in norm, but **all integrals against bounded test functions converge**.

* This is a generalization of the **Riemann integral idea**: the integral is the linear functional, and weak convergence ensures “convergence under integration.”

---

#### **Intuition**

* Strong convergence: functions converge in norm (area under |f_n - f| goes to 0).
* Weak convergence: functions converge **on average**, via integration against test functions.
* Weak-* convergence: dual-level convergence, typical in spaces of measures or $L^\infty$.

---

**One-line summary:**

> Weak convergence generalizes convergence under the integral: $f_n$ may not converge pointwise, but all integrals $\int f_n g$ converge to $\int f g$, connecting naturally to the concept of the Riemann integral as a linear functional.



