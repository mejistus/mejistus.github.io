---
tag: RL
title: GRPO, DAPO and λGRPO
---

# 简介
This blog is a summary of GRPO, DAPO and λGRPO.
## GRPO

$$\mathcal{J}_{GRPO}(\theta) = \frac{1}{\sum_{i=1}^{G} \mid o_i \mid} \sum_{i=1}^{G} \cdot \textcolor{yellow}{\frac{\text{mean}(o)}{\mid o_i \mid}} \cdot \sum_{t=1}^{|o_i|} r_{i,t}(\theta) \widehat{A_{i,t}}$$

## DAPO

$$\mathcal{J}_{DAPO}(\theta) = \frac{1}{\sum_{i=1}^{G} \mid o_i \mid} \sum_{i=1}^{G} \cdot \text{\textcolor{green}{1}} \cdot \sum_{t=1}^{|o_i|} r_{i,t}(\theta) \widehat{A_{i,t}}$$

## $\lambda$\-GRPO

$$
\mathcal{J}_{\lambda-\mathit{GRP}O}(\theta) = \frac{1}{\sum_{i=1}^{G} |o_i|} \sum_{i=1}^{G} \cdot \textcolor{blue}{\mathbf{f}(o_i, \lambda)} \cdot \sum_{t=1}^{|o_i|} r_{i,t}(\theta) \widehat{A_{i,t}}
$$

**GRPO 不像传统 RLHF 那样额外训练“价值模型(value)”和“奖励模型(reward model)”，而是直接用一个规则验证器(verifier) 给答案判对/判错（或给分）来当训练信号。**

## **1) 这些名词分别是什么**

**Policy（策略/生成模型）**

就是你的 LLM，本质是 $\pi_\theta(y|x)$：给定问题 $x$，生成回答$y$。

****Reward Model（奖励模型 RM）****

一个单独训练的模型 $R_\phi(x,y)$，输入“问题+回答”，输出一个标量分数，近似“人类偏好/好坏”。

- 在经典 RLHF 里，人类做成对偏好数据（$A$ 比$B$ 好），RM 学会打分。

**Value Model（价值模型/critic）**

用来估计“从当前生成状态继续下去，最终能拿到多大回报”，记作 $V_\psi(\text{state})$。

- 在语言生成里，$state$ 可以理解为“$prompt$ + 已生成前缀”。
- 它的主要作用：**做基线(baseline)降低方差**，算 $advantage$：$A = R - V$

**Verifier（规则验证器）**

不是学出来的偏好模型，而是“可程序化/可验证”的判分器。

- 典型：数学题用答案是否正确、是否满足格式；代码题用单元测试是否通过；推理题用规则检查。
- 输出通常是 0/1 或可解释的分数。

## **2) 以往（PPO/RLHF）怎么做？**

典型 RLHF + PPO 流程（简化版）：

1. **采样**：用当前策略生成回答 $y$。
2. **打分**：用奖励模型 RM 得到 $R_\phi(x,y)$。
3. **价值估计**：价值模型给 $V_\psi(x, y_{<t})$。
4. **算优势**：$A_t \approx R - V_t$（可能还有 GAE 等）。
5. **PPO 更新**：用 $clip$ 目标更新 $policy$，同时通常还会加 **KL 约束**，别偏离参考模型太远。

问题是：

- 你得训练/维护 **RM + Value** 两个额外模型（算力和工程复杂度都高）；
- PPO 本身也比较敏感、容易不稳定。

## **3) GRPO 为什么说“去掉 value model 和 reward model”？**

**去掉 Reward Model**：

GRPO 不用“学出来的偏好打分器”，而用 **规则 verifier** 直接给 reward（例如“答案对=1，不对=0”）。

**去掉 Value Model**：

GRPO 用“**组内相对比较**”来当 $baseline$，替代 $critic/value$。做法是：

- 对同一个问题 $x$，一次生成一组候选回答$ \{y^{(1)},...,y^{(G)}\}$

- verifier 分别打分 $\{r^{(i)}\}$

- 用组内均值/标准差构造相对优势（直觉：比同组平均好就正优势，比平均差就负优势），例如：
    $$
    \hat A^{(i)} = \frac{r^{(i)} - \text{mean}(r)}{\text{std}(r)+\epsilon}
    $$
    

这样就不需要训练一个 $V_\psi$ 来做 $baseline$ 了——$baseline$ 直接来自“同题同组的其他回答”。

## **4) 一句话对比总结**

- **PPO/RLHF**：人类偏好 → 训练 RM；再用 PPO + Value(critic) 稳定更新。
- **GRPO**：同题采样多答案 → 用规则 verifier 直接给分；用组内相对分数当 advantage → **不训练 RM，也不训练 Value**。
