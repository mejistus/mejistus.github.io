---
tag: Diffusion
title: Latent Consistency Models（LCM）技术说明
---

# Latent Consistency Models（LCM）技术说明

## 1. 引言

扩散模型（Diffusion Models）在图像生成任务中表现出优异性能，但其推理过程通常依赖多步逐次去噪，计算开销较大。为降低推理成本，Latent Consistency Models（LCMs）通过蒸馏方法学习扩散模型的概率流动力学，从而在极少步数内完成高质量生成。

---

## 2. 扩散模型与概率流 ODE

扩散模型的生成过程可表示为从高斯噪声逐步还原至数据分布的过程，其连续形式可等价为概率流常微分方程（Probability Flow ODE）：

\[
\frac{dx}{dt} = f_\theta(x, t)
\]

其中：
- \(x\) 表示当前状态（通常为带噪数据或 latent 表示）
- \(t\) 表示时间变量
- \(f_\theta\) 为由神经网络参数化的向量场

该 ODE 的解描述了从初始噪声 \(x_T\) 到目标数据 \(x_0\) 的确定性轨迹。

---

## 3. LCM 的建模目标

LCM 的目标是学习一个映射函数：

\[
F_\theta(x_t, t) \approx x_0
\]

即从任意时间步 \(t\) 的状态 \(x_t\) 直接预测最终无噪声结果 \(x_0\)。

该建模方式绕过了逐步积分 ODE 的过程，转而直接近似其终点解。

---

## 4. 一致性约束（Consistency Constraint）

为保证模型在不同时间步输入下的预测一致性，LCM 引入一致性约束：

\[
F_\theta(x_{t_1}, t_1) \approx F_\theta(x_{t_2}, t_2)
\]

其中 \(t_1, t_2\) 为不同时间步，对应同一数据样本的不同噪声版本。

该约束确保模型预测结果在不同噪声条件下保持稳定。

---

## 5. 蒸馏过程

LCM 通过蒸馏预训练扩散模型（teacher）来训练学生模型（student）：

1. 从 teacher 模型生成中间状态：
   \[
   x_t, x_{t'}
   \]

2. 使用 teacher 模型计算目标输出：
   \[
   x_0^{\text{target}}
   \]

3. 优化 student 模型：
   \[
   \mathcal{L}_{\text{distill}} = \|F_\theta(x_t, t) - x_0^{\text{target}}\|^2
   \]

4. 同时加入一致性损失：
   \[
   \mathcal{L}_{\text{consistency}} = \|F_\theta(x_t, t) - F_\theta(x_{t'}, t')\|
   \]

---

## 6. Latent Space 表示

LCM 通常在 latent space 中进行建模，例如结合变分自编码器（VAE）：

\[
z = \mathcal{E}(x), \quad x = \mathcal{D}(z)
\]

其中：
- \(\mathcal{E}\)：编码器
- \(\mathcal{D}\)：解码器

在 latent 空间中建模可显著降低计算复杂度。

---

## 7. 推理过程

LCM 推理过程可表示为：

\[
x_0 = F_\theta(x_T, T)
\]

在实践中，可采用少量离散时间步进行迭代更新：

\[
x_{t_{k-1}} = F_\theta(x_{t_k}, t_k)
\]

其中步数通常为 1–4 步。

---

## 8. 方法对比

| 方法 | 建模目标              | 推理方式 | 推理步数 |
| ---- | --------------------- | -------- | -------- |
| DDPM | 噪声预测 \(\epsilon\) | 逐步去噪 | 50–1000  |
| DDIM | 确定性轨迹            | 加速采样 | 10–50    |
| LCM  | ODE 解近似            | 直接映射 | 1–4      |

---

## 9. 理论解释

LCM 本质上将扩散模型中的数值积分问题：

\[
x_0 = x_T + \int_T^0 f_\theta(x_t, t) dt
\]

转化为函数逼近问题：

\[
F_\theta(x_t, t) \approx x_0
\]

即用神经网络直接近似 ODE 的积分结果。

---

## 10. 优势与局限

### 优势
- 推理速度显著提升
- 与现有扩散模型兼容
- 可用于实时生成场景

### 局限
- 极少步数下生成质量可能略低
- 依赖高质量 teacher 模型
- 对复杂条件输入的稳定性有限

---

## 11. 结论

Latent Consistency Models 通过蒸馏扩散模型的概率流动力学，学习从任意中间状态到最终结果的直接映射。该方法避免了逐步去噪过程，实现了在极少推理步数下的高效生成，是扩散模型加速的重要方向之一。