---
tag: Diffusion
title: Calculate Log Probability of Diffusion
---

## 推导


在流匹配中，使用策略模型$θ$下的条件对数概率$logp_θ(x_{t−1}∣x_t,c)$通过高斯概率公式计算：
$$
 \log p _ {\theta} \left(x _ {t - 1} \mid x _ {t}, \boldsymbol {c}\right) = - \frac {\left\| x _ {t - 1} - \mu_ {\theta} \left(x _ {t} , t\right) \right\| ^ {2}}{2 \sigma_ {t} ^ {2} d t} - C _ {t}, \tag {6}
$$
这里  $x_{t - 1} = \mu_{\theta_{old}}(x_t,t) + \sigma_t\sqrt{dt}\cdot \pmb {\epsilon},\pmb {\epsilon}\sim \mathcal{N}(0,\pmb {I})$  和  $C_t$  是一个常数。

因此，我们可以得到后验重要性比例的对数  $\log r_t(\theta)$  的表达式如下，为了简化，我们用 $\Delta \mu_{\theta} = \mu_{\theta_{old}}(x_t,t) - \mu_{\theta}(x_t,t)$ 表示：
$$
\begin{align}
\log r_t(\theta)
&= \log p_{\theta}(x_{t-1} \mid x_t, \boldsymbol{c})
 - \log p_{\theta_{\text{old}}}(x_{t-1} \mid x_t, \boldsymbol{c}) \\
&= - \frac{\| \mu_{\theta_{\text{old}}}(x_t, t) - \mu_{\theta}(x_t, t) + \sigma_t \sqrt{dt}\cdot \boldsymbol{\epsilon} \|^2}{2 \sigma_t^2 dt} \\
&\quad + \frac{\| \mu_{\theta_{\text{old}}}(x_t, t) - \mu_{\theta_{\text{old}}}(x_t, t) + \sigma_t \sqrt{dt}\cdot \boldsymbol{\epsilon} \|^2}{2 \sigma_t^2 dt} \\
&= - \frac{\| \Delta \mu_\theta + \sigma_t \sqrt{dt}\cdot \boldsymbol{\epsilon} \|^2}{2 \sigma_t^2 dt}
 + \frac{\| \boldsymbol{\epsilon} \|^2}{2} \\
&= - \frac{\| \Delta \mu_\theta \|^2}{2 \sigma_t^2 dt}
 - \frac{\Delta \mu_\theta \cdot \boldsymbol{\epsilon}}{\sigma_t \sqrt{dt}}
\tag{7}
\end{align}
$$
由于 $\epsilon \sim \mathcal{N}(0,I)$，我们用一维高斯分布来说明推导过程（不失一般性）。然后我们有：
$$
\mathbb{E}_{\epsilon \sim \mathcal{N}(0,I)}[\log r_t(\theta)] = -\frac{\|\Delta\mu_\theta\|^2}{2\sigma_t^2\Delta t}
$$
这种分析揭示了与LLMs的一个<span style="background-color:#dd0000;color:#ffffff">关键区别</span>：与语言模型中离散令牌概率不同，扩散模型计算高斯状态转换概率。<span style="background-color:#dd0000;color:#ffffff">由此产生的二次项在对数重要性比中引入了依赖时间步的负偏置</span>，如图2(b)所示。由于预期比率通常低于1，具有正优势的样本很少超过上剪辑边界。因此，来自过于自信的正预测的梯度大多被保留，而来自负样本的梯度则受到更严格的约束，从而使策略容易过度优化。

此外，重要性比例的方差取决于去噪调度器参数，如 $\sigma_t$和 $dt$ ，导致其在不同时间步长上差异显著。这种方差不一致进一步放大了剪裁不平衡：在低噪声步骤中，剪裁阈值经常被超过，而在高噪声步骤中，它很少被触发，最终促使策略向时间步长特定的过度优化方向发展。

[^ 来源]:FlowGRPO
