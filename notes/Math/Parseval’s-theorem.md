---
title: Parseval’s theorem
date: 2026-06-01
tag: Math
excerpt: Parseval’s theorem states that the total energy of a signal is preserved under an orthonormal change of basis, especially under Fourier transform.
---

# Parseval’s Theorem

## 1. Motivation

Parseval’s theorem is one of the most important results connecting the spatial domain and the frequency domain.

Informally, it says:

`The total energy of a signal in the original domain is equal to the total energy of its representation in an orthonormal frequency basis.`

In signal processing, this means that `a Fourier transform does not create or destroy energy`. It only redistributes the same energy among different frequency components.

For example, if a signal has large high-frequency Fourier coefficients, then a significant part of its total energy is carried by high-frequency oscillations. `If a denoising or compression method removes those coefficients, the loss can be measured either in the spatial domain or in the frequency domain`. Parseval’s theorem guarantees that these two measurements are `consistent`.


## 2. Parseval’s theorem in finite-dimensional vector spaces

The cleanest way to understand Parseval’s theorem is through linear algebra.

Before discussing Fourier transform, consider an ordinary finite-dimensional vector space. Let

$$
x \in \mathbb{C}^N
$$

be a vector, and let

$$
{u_0,u_1,\dots,u_{N-1}}
$$

be an orthonormal basis of $\mathbb{C}^N$.

Here, “orthonormal” means two things:

1. each basis vector has length $1$;
2. different basis vectors are perpendicular to each other.

Using the complex inner product

$$
\langle x,y\rangle
=
\sum_{n=0}^{N-1}
x_n \overline{y_n},
$$

orthonormality can be written as

$$
\langle u_k,u_l\rangle
=
\begin{cases}
1, & k=l,\\
0, & k\ne l.
\end{cases}
$$

Because these basis vectors form a complete coordinate system, every vector $x$ can be decomposed as

$$
x
=
\sum_{k=0}^{N-1}
c_k u_k.
$$

The coefficient $c_k$ is the projection of $x$ onto the basis direction $u_k$:

$$
c_k
=
\langle x,u_k\rangle.
$$

Therefore,

$$
x
=
\sum_{k=0}^{N-1}
\langle x,u_k\rangle u_k.
$$

This equation simply says:

> A vector can be reconstructed by adding up its projections onto all orthonormal basis directions.

Now consider the squared length, or energy, of $x$:

$$
\|x\|_2^2
=
\langle x,x\rangle.
$$

Substituting the orthonormal expansion of $x$, we get

$$
\|x\|_2^2
=
\left\langle
\sum_{k=0}^{N-1} c_k u_k,
\sum_{l=0}^{N-1} c_l u_l
\right\rangle.
$$

Expanding the inner product gives

$$
\|x\|_2^2
=
\sum_{k=0}^{N-1}
\sum_{l=0}^{N-1}
c_k \overline{c_l}
\langle u_k,u_l\rangle.
$$

Because the basis is orthonormal, all cross terms vanish:

$$
\langle u_k,u_l\rangle=0
\qquad
(k\ne l).
$$

Only the terms with $k=l$ remain:

$$
\|x\|_2^2
=
\sum_{k=0}^{N-1}
c_k \overline{c_k}
=
\sum_{k=0}^{N-1}
\|c_k\|^2.
$$

Since

$$
c_k=\langle x,u_k\rangle,
$$

we obtain

$$
\boxed{
\|x\|_2^2
=
\sum_{k=0}^{N-1}
|\langle x,u_k\rangle|^2
}
$$

This is the finite-dimensional form of Parseval’s theorem.

Its meaning is:

> The energy of a vector is equal to the sum of the energies of its coordinates under any orthonormal basis.

In other words, `changing from the standard basis to another orthonormal basis may change the coordinates of the vector, but it does not change the total energy of the vector`.

This is exactly what happens in Fourier analysis. The Fourier transform represents a signal using sinusoidal basis functions. Parseval’s theorem says that the signal’s total energy is the same whether we compute it in the original domain or in the Fourier domain.

## 3. Discrete Fourier transform version

For a discrete signal $x[n]$, where $n=0,1,\dots,N-1$, define the discrete Fourier transform as

$$
X[k]=

\sum_{n=0}^{N-1}
x[n]
\exp\left(
-\frac{2\pi i kn}{N}
\right),
\qquad
k=0,1,\dots,N-1.
$$

The inverse discrete Fourier transform is

$$
x[n]=

\frac{1}{N}
\sum_{k=0}^{N-1}
X[k]\
\exp\left(
\frac{2\pi i kn}{N}
\right).
$$

Under this common normalization, Parseval’s theorem becomes

$$
\boxed{
\sum_{n=0}^{N-1}
|x[n]|^2
=
\frac{1}{N}
\sum_{k=0}^{N-1}
|X[k]|^2
}
$$

The factor $1/N$ appears because the above definition puts no normalization factor in the forward DFT and puts the full normalization factor $1/N$ in the inverse DFT.

If instead we use the orthonormal DFT convention,

$$
\widehat{x}[k]
=
\frac{1}{\sqrt{N}}
\sum_{n=0}^{N-1}
x[n]
\exp\left(
-\frac{2\pi i kn}{N}
\right),
$$

then the transform is unitary, and Parseval’s theorem becomes

$$
\boxed{
\sum_{n=0}^{N-1}
|x[n]|^2
=
\sum_{k=0}^{N-1}
|\widehat{x}[k]|^2
}
$$

This is exactly the same statement as the finite-dimensional orthonormal basis result.



## 4. Fourier series version

Let $f$ be a square-integrable periodic function on $[-\pi,\pi]$. Its complex Fourier series is

$$
f(x)
\sim
\sum_{n=-\infty}^{\infty}
c_n e^{inx},
$$

where the Fourier coefficients are

$$
c_n=

\frac{1}{2\pi}
\int_{-\pi}^{\pi}
f(x)e^{-inx}dx.
$$

The functions

$$
\frac{1}{\sqrt{2\pi}}e^{inx}
$$

form an orthonormal basis of $L^2[-\pi,\pi]$. Therefore, Parseval’s theorem gives

$$
\boxed{
\frac{1}{2\pi}
\int_{-\pi}^{\pi}
|f(x)|^2dx
=
\sum_{n=-\infty}^{\infty}
|c_n|^2
}
$$

Equivalently,

$$
\boxed{
\int_{-\pi}^{\pi}
|f(x)|^2dx
=
2\pi
\sum_{n=-\infty}^{\infty}
|c_n|^2
}
$$

This means that the average energy of a periodic signal over one period equals the sum of the energies of all its Fourier modes.



## 5. Continuous Fourier transform version

For a non-periodic signal $f(x)$ on $\mathbb{R}$, define the Fourier transform by

$$
F(\omega)
=
\int_{-\infty}^{\infty}
f(x)e^{-i\omega x}dx.
$$

The inverse transform is

$$
f(x)
=
\frac{1}{2\pi}
\int_{-\infty}^{\infty}
F(\omega)e^{i\omega x},d\omega.
$$

Under this convention, Parseval’s theorem is

$$
\boxed{
\int_{-\infty}^{\infty}
|f(x)|^2dx
=
\frac{1}{2\pi}
\int_{-\infty}^{\infty}
|F(\omega)|^2,d\omega
}
$$

If we instead use the frequency variable $\nu$ with the convention

$$
F(\nu)
=
\int_{-\infty}^{\infty}
f(x)e^{-2\pi i\nu x}dx
$$

and

$$
f(x)=
\int_{-\infty}^{\infty}
F(\nu)e^{2\pi i\nu x}d\nu,
$$

then the formula becomes

$$
\boxed{
\int_{-\infty}^{\infty}
|f(x)|^2dx
=
\int_{-\infty}^{\infty}
|F(\nu)|^2d\nu
}
$$

The difference between these formulas is only a matter of normalization.



## 6. Parseval’s theorem and Plancherel’s theorem

Parseval’s theorem is often closely related to Plancherel’s theorem.

Roughly speaking:

* Parseval’s theorem usually refers to the equality of energy between a function and its expansion coefficients under an orthonormal basis.
* Plancherel’s theorem states that the Fourier transform extends to a unitary operator on $L^2$ spaces.

In the language of Hilbert spaces, Plancherel’s theorem says that the Fourier transform preserves inner products:

$$
\langle f,g\rangle
=
\langle \widehat{f},\widehat{g}\rangle.
$$

Taking $g=f$, we obtain Parseval’s identity:

$$
|f|_2^2
=
|\widehat{f}|_2^2.
$$

Therefore, Parseval’s theorem can be viewed as the energy-preservation case of the more general inner-product-preservation property.


## 7. Geometric interpretation

The most important geometric idea is:

Fourier transform is a change of orthonormal coordinates.

In Euclidean geometry, if we rotate a vector, its coordinates change, but its length does not change.

For example, a vector may be represented in the standard basis or in a rotated basis. The coordinate values are different, but the total squared length remains the same.

Fourier analysis does something similar. It represents a signal not by its values at each spatial location, but by its projections onto sinusoidal basis functions. Parseval’s theorem says that this representation preserves total energy.

Thus, the spatial-domain quantity

$$
\int |f(x)|^2dx
$$

and the frequency-domain quantity

$$
\int |\widehat{f}(\xi)|^2d\xi
$$

measure the same energy, only expressed in different coordinate systems.



## 8. Application to images

For a digital image $I[m,n]$, the two-dimensional DFT is

$$
\mathcal{F}[u,v]
=
\sum_m
\sum_n
I[m,n]
\exp\left(
-2\pi i
\left(
\frac{um}{M}
+
\frac{vn}{N}
\right)
\right).
$$

Under a suitable normalization, Parseval’s theorem states that

$$
\sum_m
\sum_n
|I[m,n]|^2
=
\sum_u
\sum_v
|\widehat{I}[u,v]|^2.
$$

This is especially useful because image information can be decomposed into frequency bands:

* low frequencies describe global color, illumination, and coarse structure;
* middle frequencies describe edges, contours, local textures, and material patterns;
* high frequencies describe noise, sharp discontinuities, compression artifacts, and fine-grained pixel-level details.

If we split the Fourier spectrum into several frequency regions, then the total image energy can be decomposed as

$$
E_{\mathrm{total}}
=
E_{\mathrm{low}}
+
E_{\mathrm{mid}}
+
E_{\mathrm{high}}.
$$

This decomposition is mathematically meaningful because Parseval’s theorem guarantees that frequency-domain energy corresponds to spatial-domain energy.



## 9. Application to reconstruction error

Suppose an image $x$ is reconstructed as $\hat{x}$ by some model, such as a VAE. Define the reconstruction residual as

$$
r
=
x-\hat{x}.
$$

The spatial reconstruction error is

$$
|r|_2^2
=
\sum_{m,n}
|x[m,n]-\hat{x}[m,n]|^2.
$$

By Parseval’s theorem, this is equal to the frequency-domain residual energy:

$$
|r|_2^2
=
|\widehat{r}|_2^2.
$$

Therefore,

$$
\sum_{m,n}
|x[m,n]-\hat{x}[m,n]|^2
=
\sum_{u,v}
|\widehat{x}[u,v]-\widehat{\hat{x}}[u,v]|^2.
$$

This means that reconstruction error can be analyzed frequency by frequency.

For example, one may define

$$
E_{\mathrm{mid}}
=
\sum_{(u,v)\in \Omega_{\mathrm{mid}}}
|\widehat{r}[u,v]|^2,
$$

where $\Omega_{\mathrm{mid}}$ is a middle-frequency region. If $E_{\mathrm{mid}}$ is large, then the reconstruction model loses or changes a significant amount of middle-frequency information.

This is useful for studying compression models such as VAEs. A VAE with a higher spatial compression ratio may preserve low-frequency semantic structure while weakening the precise reconstruction of middle- and high-frequency details. Parseval’s theorem provides a rigorous way to quantify this loss.



## 10. Why normalization matters

When using FFT libraries, one must be careful about normalization.

Different libraries use different conventions:

1. no normalization in the forward transform and $1/N$ in the inverse transform;
2. $1/N$ in the forward transform and no normalization in the inverse transform;
3. $1/\sqrt{N}$ in both directions.

Parseval’s theorem remains true under all conventions, but the scaling factor changes.

For example, NumPy’s default FFT uses

$$
X[k]
=
\sum_{n=0}^{N-1}
x[n]e^{-2\pi i kn/N},
$$

and

$$
x[n]
=
\frac{1}{N}
\sum_{k=0}^{N-1}
X[k]e^{2\pi i kn/N}.
$$

Therefore,

$$
\sum_n |x[n]|^2
=
\frac{1}{N}
\sum_k |X[k]|^2.
$$

If one uses an orthonormal FFT, then the factor disappears:

$$
\sum_n |x[n]|^2
=
\sum_k |\widehat{x}[k]|^2.
$$

Thus, when comparing frequency-domain energy across images, it is important to keep the normalization convention fixed.



## 11. Summary

Parseval’s theorem states that the total energy of a signal is preserved under an orthonormal transform.

In finite-dimensional spaces,

$$
|x|_2^2
=
\sum_k
|\langle x,u_k\rangle|^2.
$$

For the DFT,

$$
\sum_n |x[n]|^2
=
\frac{1}{N}
\sum_k |X[k]|^2
$$

under the common non-unitary normalization.

For the continuous Fourier transform,

$$
\int |f(x)|^2dx
=
\frac{1}{2\pi}
\int |F(\omega)|^2d\omega.
$$

The theorem shows that spatial-domain energy and frequency-domain energy are two equivalent descriptions of the same quantity.

This is why Parseval’s theorem is fundamental in Fourier analysis, signal processing, image analysis, compression, and reconstruction error evaluation.