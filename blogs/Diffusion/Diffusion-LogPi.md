---
tag: Diffusion
title: Calculate $log \pi_\theta$ in code
---


# 扩散模型中$log \pi_\theta$是如何计算的?

在扩散模型（Diffusion  Model）的上下文中，$log\Pi_{\theta}$ 指的是<span style="background-color:#ff0000;color:#ffffff;">生成整张图片过程的对数概率</span>。它不是一次性计算出来的，而是反向扩散（去噪）过程中<span style="background-color:#ff0000;color:#ffffff;">每一步的对数概率的累加和</span>。

  这个计算主要发生在 `flow_grpo/diffusers_patch/pipeline_with_logprob.py` 文件中。

##  核心思想

  反向去噪过程可以看作是一个马尔可夫链：
$$
p(x_0) = \int p(x_0|x_1) p(x_1|x_2) \dots p(x_{T-1}|x_T) p(x_T) dx_{1 \dots T}
$$
  其中，$p(x_T)$ 通常是一个标准正态分布，而每一步 $p(x_{t-1}|x_t, \text{prompt})$ 都被建模成一个高斯分布。

  因此，生成一张完整图片 $x_0$ 的总对数概率 $log P(x_0)$ 就是从 $t=T$到 $t=1$ 每一步的对数概率 $log p(x_{t-1}|x_t)$ 的总和。

$$
\log \Pi = \log p(x_0) \approx \sum_{t=1}^{T} \log p(x_{t-1} | x_t, \text{prompt})
$$

## 具体实现

在您项目中的 `pipeline_with_logprob` 函数内，这个计算过程大致如下：

   1. 初始化: 在进入主要的去噪循环之前，会初始化一个 `log_prob` 累加器，通常是一个全零的张量，形状与批次大小 (`batch size`)
      相同。

   2. 去噪循环 (Denoising Loop): 代码会遍历所有的时间步 $t$ (从 $T$ 到 $1$)。在循环的每一步中：
       * 模型预测: 扩散模型（在您的代码中是 transformer 或 unet）以当前的噪声图像 latents ($x_t$) 和时间步 `t`作为输入，预测出在当前步骤应该被移除的噪声 `noise_pred`。
       * 计算上一步的分布参数: 使用 `noise_pred` 和当前的 latents ($x_t$)，以及调度器 (`scheduler`)的数学公式，可以计算出**上一步** latents_prev ($x_{t-1}$)的高斯分布的均值（mean）和方差（variance）/对数方差（`log_variance`）。
       * 获取实际的 `latents_prev`: 调度器的 step 函数会实际生成上一步的噪声图像 `latents_prev`。
       * 计算单步 `log_prob`: 现在我们有了 $p(x_{t-1}|x_t)$ 的高斯分布参数（均值和方差），也知道了实际生成的样本点`latents_prev`。于是，就可以使用高斯分布的概率密度函数 (PDF) 来计算 `latents_prev` 在这个分布下的对数概率。
         
         高斯分布的对数概率公式为：
         $$
         \log \mathcal{N}(x; \mu, \sigma^2) = -\frac{1}{2} \log(2\pi\sigma^2) - \frac{(x - \mu)^2}{2\sigma^2}
         $$
          代码里通常会计算每个像素的 `log_prob`，然后求和或求平均。

       * 累加: 将这一步计算出的 `log_prob` 加到总的累加器上。

   3. 返回结果: 循环结束后，`log_prob` 累加器里就存储了生成这批次中每张图片的总对数概率。

## 总结

简单来说，$log \Pi$ 的计算过程是：

   1. 在每个去噪步骤 $t$，模型会预测一个用于描述 $x_{t-1}$ 分布的“目标”（通常是均值）。
   2. 将实际生成的 $x_{t-1}$ 与这个分布进行比较，计算其在该分布下的对数概率。
   3. 将所有步骤的对数概率相加，得到最终生成整张图片的$ log\Pi$。

  这个值在强化学习微调中至关重要，因为它代表了策略（扩散模型）在给定状态（prompt）下，采取某个动作（生成特定图片）的概率 ，是策略梯度算法 (如 PPO) 所必需的核心要素。
