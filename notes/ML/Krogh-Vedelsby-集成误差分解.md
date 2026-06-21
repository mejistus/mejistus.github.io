---
title: Krogh-Vedelsby 集成误差分解
date: 2026-06-21
tag: ML
excerpt: Krogh-Vedelsby 集成误差分解说明，集成模型的误差可以表示为单模型平均误差减去模型之间的差异性，因此好的集成不仅依赖单模型准确性，也依赖模型之间的有效分歧。
---

# Krogh-Vedelsby 集成误差分解

Krogh-Vedelsby 集成误差分解，也称为 `Ambiguity Decomposition`，用于解释集成学习中一个重要现象：集成模型的性能提升不仅来自`单个模型本身的准确性`，也来自不同模型之间的`互补分歧`。

它的核心结论是：

$$
E_{\text{ens}} = \bar{E} - \bar{A}
$$

也就是说：

$$集成误差 = 单模型平均误差 - 模型分歧项$$

其中，**单模型平均误差越低越好，而模型之间的有效分歧越大，集成模型的误差就可能越低**。

## 1. 基本设定

假设有 $M$ 个基模型，第 $i$ 个模型对样本 $x$ 的预测为：

$$
f_i(x)
$$

集成模型采用加权平均：

$$
\bar{f}(x) = \sum_{i=1}^{M} w_i f_i(x)
$$

其中，权重满足：

$$
\sum_{i=1}^{M} w_i = 1
$$

真实标签为$y$，这里讨论的是平方误差，即：

$$
\left(\bar{f}(x)-y\right)^2
$$


## 2. 分解公式

Krogh-Vedelsby 分解指出，对于单个样本 $x$，集成模型的平方误差可以写成：

$$
\left(\bar{f}(x)-y\right)^2
=
\sum_{i=1}^{M} w_i\left(f_i(x)-y\right)^2
-
\sum_{i=1}^{M} w_i\left(f_i(x)-\bar{f}(x)\right)^2
$$

可以简写为：

$$
E_{\text{ens}} = \bar{E} - \bar{A}
$$

其中：

$$
E_{\text{ens}} = \left(\bar{f}(x)-y\right)^2
$$

表示`集成模型误差`。

$$
\bar{E} = \sum_{i=1}^{M} w_i\left(f_i(x)-y\right)^2
$$

表示`单个模型的加权平均误差`。

$$
\bar{A} = \sum_{i=1}^{M} w_i\left(f_i(x)-\bar{f}(x)\right)^2
$$

表示`模型之间的 ambiguity`，也就是模型分歧、多样性或互补性。


## 3. 每一项的含义

### 3.1 单模型平均误差

$\bar{E}$ 这一项表示各个基模型自身预测误差的加权平均。

如果每个模型本身都很弱，那么 $\bar{E}$ 会很大。即使模型之间存在分歧，集成模型也很难取得好的性能。

因此，集成模型的第一个要求是：
<div style="text-align: center; color: #D97757; font-family: '隶书', serif; font-weight: bold;">基模型本身需要具有一定准确性。</div>

### 3.2 模型分歧项

$\bar{A}$ 这一项表示每个模型输出与集成输出之间的差异。

如果所有模型的预测几乎完全相同，那么：

$$
f_i(x) \approx \bar{f}(x)
$$

此时：

$$
\bar{A} \approx 0
$$

说明模型之间几乎没有差异，集成带来的提升有限。

如果不同模型的预测存在差异，并且这种差异不是纯噪声，而是来自不同模型对样本不同证据的捕捉，那么 $\bar{A}$ 会变大，从而降低集成误差。

因此，集成模型的第二个要求是：

<div style="text-align: center; color: #D97757; font-family: '隶书', serif; font-weight: bold;">基模型之间需要具有有效的互补分歧。 </div>


## 4. 直观理解

假设有 5 个专家检测器，它们对同一张图像输出 fake probability。

一种情况是：

$$
[0.81,\ 0.82,\ 0.80,\ 0.83,\ 0.81]
$$

这说明多个专家的判断非常一致。虽然它们可能都比较强，但它们捕捉到的信息高度重复，因此模型分歧较小，集成提升也有限。

另一种情况是：

$$
[0.20,\ 0.25,\ 0.65,\ 0.75,\ 0.90]
$$

这说明专家之间存在明显分歧。不同专家可能关注到了不同类型的证据，例如低层纹理、频域伪影、语义异常、压缩痕迹或生成器特定模式。

如果这种分歧是有信息量的，那么融合模型就可以利用它提升最终判断。


## 5. 对多专家 AIGC 检测的启发

在多专家 AIGC 检测中，不同检测器可能关注不同证据：

- low-level artifact
- frequency artifact
- compression trace
- VAE reconstruction residual
- semantic inconsistency
- generator-specific cue

假设多个专家检测器输出为：

$$
[p_1, p_2, \dots, p_M]
$$

简单平均只会得到：

$$
\bar{p} = \frac{1}{M}\sum_{i=1}^{M} p_i
$$

但是，平均操作会丢失专家之间的结构化分歧信息。

例如，下面两个向量的平均值可能接近：

$$
[0.2,\ 0.2,\ 0.6,\ 0.7,\ 0.9]
$$

$$
[0.50,\ 0.51,\ 0.52,\ 0.53,\ 0.54]
$$

它们的平均分数接近，但含义完全不同。

第一组表示专家之间存在明显分歧，可能说明不同检测器捕捉到了不同证据。

第二组表示所有专家都比较犹豫，但意见基本一致。

因此，简单平均无法区分这两种情况，而 MLP fusion 可以学习这种专家意见模式：

$$
[p_1, p_2, \dots, p_M] \rightarrow y
$$

---

## 6. 为什么可以支持 MLP Fusion

Krogh-Vedelsby 分解说明：

$$
E_{\text{ens}} = \bar{E} - \bar{A}
$$

因此，集成提升来自两个方面：

1. 降低单个模型的平均误差；
2. 利用模型之间的有效分歧。

对于多专家 AIGC 检测而言，MLP fusion 的价值不只是平均多个专家的置信度，而是学习专家之间的结构化分歧模式。

换句话说，MLP fusion 可以学习：

- 哪些专家在某类生成器上更可靠；
- 哪些专家对压缩、resize、重建更鲁棒；
- low-level detector 和 high-level detector 分歧时应该如何判断；
- 多个专家一致时如何决策；
- 多个专家严重分歧时如何决策。

因此，MLP fusion 可以被理解为一种利用 ambiguity 的融合方法。

---

## 7. Logit Fusion 与 Embedding Fusion

如果使用 logit fusion，输入是各个专家的最终判断：

$$
[p_1, p_2, \dots, p_M]
$$

这种方式简单、稳定、不容易过拟合，但只能看到每个专家的最终分数。

如果使用 embedding fusion，输入是各个专家的中间特征：

$$
[z_1, z_2, \dots, z_M]
$$

这种方式可以保留更多检测证据，例如纹理伪影、频域异常、语义不一致、重建残差等。

但是 embedding fusion 也有风险：

- 特征维度更高；
- 更容易过拟合；
- 不同专家的 embedding 空间可能不对齐；
- 需要更多训练数据和正则化。

因此，一个稳妥的实验路线是：

$$
\text{Average Fusion}
\rightarrow
\text{Logit MLP Fusion}
\rightarrow
\text{Embedding MLP Fusion}
\rightarrow
\text{Logit + Embedding Fusion}
$$

---

## 8. 论文表述

可以在论文中这样表述：

According to the Krogh-Vedelsby ambiguity decomposition, the error of an ensemble can be expressed as the average error of individual predictors minus their diversity. This suggests that ensemble gains arise not only from strong individual detectors, but also from complementary disagreement among them. In our setting, different forensic detectors may respond to different evidence, such as low-level artifacts, semantic inconsistencies, compression traces, or generator-specific cues. Therefore, instead of simply averaging detector scores, we train a lightweight fusion network to learn the structured disagreement pattern across detectors.

对应中文含义是：

根据 Krogh-Vedelsby 集成误差分解，集成模型的误差可以表示为单个预测器的平均误差减去模型之间的差异性。这说明集成收益不仅来自单个检测器本身的准确性，也来自不同检测器之间的互补分歧。在 AIGC 检测中，不同检测器可能关注低层伪影、语义异常、压缩痕迹或生成器特定线索。因此，相比简单平均检测分数，我们使用轻量融合网络学习检测器之间的结构化分歧模式。

---

## 9. 总结

Krogh-Vedelsby 集成误差分解的核心思想是：

$$
\text{集成误差} = \text{单模型平均误差} - \text{模型分歧}
$$

因此，好的集成模型不是简单堆叠多个强模型，而是要同时满足：

- 单个模型本身足够准确；
- 不同模型之间具有有效互补分歧。

对于多专家 AIGC 检测，MLP fusion 的理论动机就在于：它可以学习专家之间的结构化分歧，而不是仅仅平均专家置信度。