---
tag: Diffusion
date: 2025/11/12
title: the RCGM framework
---

# the RCGM framework

# Distillation

所谓蒸馏即对已有的扩散模型$\theta$， 减少其采样步数从而提高生成性能。

典型方法包括DDIM， Reflow等。

# Consistency Model

Noise schedule略有不同， $x_t=x_0+tx_1$，常规的One Step蒸馏的训练目标是：
$$
\min \mathbf{E}\|f_{\theta}(x_1,1)-x_0\|
$$
一致性模型的主要创新在于：
$$
\|f_{\theta^*}(x_1,1)-x_0\|=\|\large\sum_{k=1}^{n}[f_{\theta^*}(x_{t_k},t_k)-f_{\theta^*}(x_{t_{k-1}},t_{k-1})]\|
\le \large\sum_{k=1}^{n}\|[f_{\theta^*}(x_{t_k},t_k)-f_{\theta^*}(x_{t_{k-1}},t_{k-1})]\|
$$
边界条件这里$t=0$时，$f_\theta(x_0,0)=x_0$，那么：
$$
f_\theta(x_{t_1},t_1) \to x_0 \\
f_\theta(x_{t_k},t_k) \to f_\theta(x_{t_{k-1}},t_{k-1})
$$
最终也会引起：
$$
f_\theta(x_1,1) \approx x_0
$$
因此如果Reflow可以被看成一种蒸馏方法，那么Consistency Model既可以被看成是一种蒸馏方法，也可以看成一种自训练的方法。

# Short-cut Model





## Progressive Distillation

## Rectified flow

## InstraFlow

**InstaFlow** 與 **Rectified Flow (Rect Flow)** 的關係，可以用一句話概括：

**Rectified Flow 是「技術原理」，而 InstaFlow 是使用了這個技術做出來的「具體模型（成品）」。**

你可以把它們想像成 **「渦輪增壓技術 (Turbo)」** 與 **「某款特定的渦輪跑車」** 的關係。

以下是詳細的區別：

### 1. Rectified Flow (Rect Flow) —— 核心技術

這是一個通用的數學框架和訓練方法（由 Liu et al. 提出）。

- **核心目標**：把擴散模型原本彎彎曲曲的生成路徑（Trajectory），「拉直」成一條直線。
- **為什麼要做這個？**
    - 原本的擴散模型（SDE/ODE）路徑很彎，所以採樣時需要走很多小碎步（例如 20-50 步）才不會走歪。
    - Rectified Flow 通過一種叫 **"Reflow" (重流)** 的反覆訓練過程，讓雜訊到圖片的路徑變成直線。
    - **結果**：雖然變直了，但通常還是一個「少步數」模型（例如能從 50 步減少到 4-8 步），理論上還不是專門為了「一步生成」設計的。

### 2. InstaFlow —— 具體模型

這是一篇論文（基於 Stable Diffusion 改進）提出的一個具體模型名稱。

- **核心目標**：**極致的「一步生成」 (One-Step Generation)**。

- 它是怎麼做到的？

    它是 Rectified Flow 技術的進階應用版。它不僅僅是用 Rectified Flow 把線拉直，還多加了一步 「蒸餾 (Distillation)」。

    - **Step 1 (Reflow)**: 先用 Rectified Flow 技術把 Stable Diffusion 的路徑拉直（這時候可能還需要 2-3 步）。
    - **Step 2 (Distillation)**: 再進行一次蒸餾，強迫模型必須在 **1 步** 內走完這條直線。

- **結果**：InstaFlow 是一個專門的 1-step 生成模型，速度極快（約 0.1 秒一張圖）。

------

### 總結對比表

| **特性**     | **Rectified Flow (Rect Flow)**   | **InstaFlow**                        |
| ------------ | -------------------------------- | ------------------------------------ |
| **定義**     | 一種**訓練方法 / 數學框架**      | 一個**具體的模型 / 論文成果**        |
| **數學本質** | 讓生成軌跡變直 (Straightening)   | Rectified Flow + 蒸餾 (Distillation) |
| **主要目的** | 減少採樣步數，提高 ODE 穩定性    | **實現 1 步生成 (One-Step)**         |
| **生成步數** | 通常 2~8 步 (視 Reflow 次數而定) | **嚴格 1 步**                        |
| **關係**     | 它是 InstaFlow 的地基            | 它是 Rectified Flow 的具體應用       |

簡單來說：

如果你在看論文或技術文檔，提到 Rect Flow 通常是在講「把線拉直」這個數學技巧；而提到 InstaFlow，則是指那個「用 Rect Flow 技術做出來的、能一步出圖的 Stable Diffusion 改版模型」。

### 3. InstaFlow Step 2 - Distillation

InstaFlow 的第二步 **Distillation（蒸餾）** 之所以能成功實現高品質的「一步生成」，其關鍵並不單純在於蒸餾算法本身，而在於 **Step 1 (Reflow)** 已經把問題簡化了。

這是一個 **「前人栽樹（拉直），後人乘涼（蒸餾）」** 的過程。

以下是具體的實現細節與數學直覺：

#### 1. 核心邏輯：為什麼能蒸餾？

在傳統的擴散模型（如 SD 1.5/2.0）中，從雜訊 $z$ 到圖像 $x$ 的映射路徑是非常彎曲且複雜的非線性函數。要讓一個模型直接用一步預測出終點，難度極高（Underfitting，學不起來）。

但經過 **Step 1: Reflow (Rectified Flow)** 之後，模型的傳輸軌跡變成了 **直線 (Straight Line)**。

- **直線的好處：** 如果軌跡是直線，那麼 $x$ 和 $z$ 的關係就退化成簡單的線性關係（或接近線性）。
- **神經網絡的特性：** <span style="background-color:#0000dd;color:#ffffff">神經網絡非常擅長擬合線性或平滑的映射</span>。

因此，InstaFlow 的蒸餾並不需要像 Consistency Distillation (CD) 那樣複雜的各種自洽性約束，它使用的是最樸素的 **直接蒸餾 (Direct Distillation)**。

#### 2. 具體實現步驟

InstaFlow 的蒸餾過程是一個標準的 **Teacher-Student** 架構：

- **Teacher 模型 ($T$)**：這是經過 Step 1 訓練好的 **Reflowed Model** (通常稱為 2-Rectified Flow)。它的特點是生成的軌跡已經很直了。
- **Student 模型 ($S$)**：這是我們要訓練的 InstaFlow 模型 (One-step model)，初始權重通常複製自 Teacher。

##### 訓練流程 (Algorithm)

對於每一次訓練迭代：

1. 採樣 (Sampling)：

    隨機抽取一個高斯雜訊 $z \sim \mathcal{N}(0, I)$ 和對應的文本提示 $c$。

2. 老師生成<span style="background-color:#dd0000;color:#ffffff"> "偽真值" (Teacher Generation)</span>：

    使用 Teacher 模型，通過常微分方程求解器 (ODE Solver，例如 Euler method)，用較多的步數（例如 25-50 步）從 $z$ 生成一張圖像 $x_{teacher}$。
    $$
    x_{teacher} = \text{ODESolve}(T, z, t=1 \rightarrow 0, c)
    $$
    注意：這裡的 $x_{teacher}$ 被視為 Ground Truth。

3. 學生預測 (Student Prediction)：

    將同樣的雜訊 $z$ 和提示 $c$ 輸入給 Student 模型，要求它 一步 (One-step) 直接輸出圖像 $x_{student}$。

    
    $$
    x_{student} = S(z, c)
    $$

4. 計算損失 (Loss Calculation)：

    直接計算兩者之間的 L2 損失 (或 LPIPS 感知損失)：

    
    $$
    \mathcal{L} = \| x_{student} - x_{teacher} \|^2
    $$

5. **反向傳播**：更新 Student 模型的參數。

#### 3. <span style="background-color:#dd0000;color:#ffffff">與傳統蒸餾 (Progressive Distillation) 的區別</span>

你可能會問，這跟 Salimans 提出的 Progressive Distillation 有什麼不同？

- **Progressive Distillation**：是「步數減半」的策略（64步 $\to$ 32步 $\to$ 16步...）。因為原始軌跡是彎的，不能直接跳到底，必須慢慢合併步數。

- **InstaFlow Distillation**：是 **直接折疊** (Direct Collapse)。因為軌跡已經是直線了，理論上：

  
    $$
    \text{位移} = \text{平均速度} \times \text{時間}
    $$
    

    對於直線運動，瞬時速度等於平均速度。所以 Student 模型只需要學會預測這個恆定的速度（或直接預測終點），就能一步到位。

#### 4. 總結公式

InstaFlow 的蒸餾本質上是在解這樣一個優化問題：
$$
\min_\theta \mathbb{E}_{z \sim \mathcal{N}(0, I)} \left[ \| S_\theta(z) - \text{Reflowedode}(z) \|^2 \right]
$$
其中 $\text{Reflowedode}(z)$ 是那個已經被「拉直」過的老師模型的輸出。

一句話總結：

<span style="background-color:#dd0000;color:#ffffff">InstaFlow 的蒸餾之所以有效，不是因為蒸餾方法有多花俏，而是因為老師模型 ($T$) 已經把路鋪直了，學生模型 ($S$) 只需要學會「油門踩到底」就能精準到達終點，而不需要學轉彎。</span>

## Distribution Matching Distillation

這篇論文 **DMD (Distribution Matching Distillation)** 的核心在於解決 **SDS (Score Distillation Sampling)** 的缺陷，並將其轉化為一個穩定的單步生成訓練框架。

以下是針對「博士生版本」的詳細拆解：

------

### 1. 研究背景 (Research Background)

**核心問題：** 如何將一個多步的 Diffusion Model（老師）蒸餾成一個單步的 Generator（學生），同時不損失畫質？

<span style="background-color:#dd0000;color:#ffffff">蒸馏的两种范式：基于采样轨迹的，基于采样分布的</span>

- **既有路徑的死胡同：** 傳統的蒸餾（如 Progressive Distillation）大多依賴 **MSE Loss**（$L_2$ 範數）。
    - 對於一個輸入噪聲 $z$，老師模型對應的真實分佈 $p(x|z)$ 往往是多模態的（Multimodal）。例如，給定一個模糊的輪廓，它既可能變成貓，也可能變成狗。
    - MSE Loss 的最優解是這些模態的 **期望值 (Mean)**。
    - **後果：** 期望值通常位於高概率密度區域的中間（低概率區域），在圖像上表現為所有可能結果的疊加，即**模糊 (Blurry)**。
- **SDS 的啟示與不足：** DreamFusion 提出的 SDS Loss 試圖通過 Score Function 來引導生成，避免了 MSE 的模糊問題。但 SDS 忽略了生成分佈自身的熵項（Score of the fake distribution），導致生成的圖像飽和度過高、紋理怪異（Janus problem）。

### 2. 研究動機 (Research Motivation)

**核心假設：** 我們不需要學生模型 $G_\theta(z)$ 的輸出與老師的軌跡完全重合（Pixel-wise alignment），我們只需要學生生成的**圖像集合** $p_{fake}$ 與真實數據分佈 $p_{real}$ 在統計上無法區分。

- 數學目標： 最小化兩個分佈的 KL 散度 (Kullback-Leibler Divergence)：
    $$
    \min_\theta D_{KL}(p_{fake} \| p_{real}) = \mathbb{E}_{x \sim p_{fake}} \left[ \log p_{fake}(x) - \log p_{real}(x) \right]
    $$

- **痛點：** 計算這個損失的梯度非常困難，因為我們無法直接寫出 $p_{fake}(x)$ 的解析式（它是學生網絡 $G_\theta$ 定義的隱式分佈），也無法直接獲得 $p_{real}(x)$。

**DMD 的動機就是：** 找到一個可計算的、穩定的梯度估計方法，來優化上述的 KL 散度。

### 3. 研究方法 (Research Method) 

DMD 將總損失分為兩部分：$\mathcal{L}_{total} = \mathcal{L}_{dist} + \lambda \mathcal{L}_{reg}$。讓我們重點看這兩部分是怎麼推導出來的。

#### 第一部分：分佈匹配損失 (Distribution Matching Loss)

這是論文最精彩的部分。作者利用**預訓練的擴散模型（老師）**來估計 KL 散度的梯度。

A. 梯度的推導

我們想優化 generator 參數 $\theta$。對於 KL 散度 $J = D_{KL}(p_\theta \| p_{real})$，其梯度可以推導為（省略部分鏈式法則細節）：

$$\nabla_\theta J \approx \mathbb{E}_{z \sim \mathcal{N}(0,I)} \left[ \nabla_\theta G(z) \cdot (\underbrace{\nabla_x \log p_{fake}(G(z))}_{\text{Fake Score}} - \underbrace{\nabla_x \log p_{real}(G(z))}_{\text{Real Score}}) \right]$$



這是一個直觀的力學平衡：

- **Real Score** 拉著生成點 $x$ 往真實數據的高密度區域走。
- **Fake Score** (熵項) 推著生成點 $x$ 遠離當前生成的擁擠區域（防止 Mode Collapse）。

B. 怎麼算 Real Score？

這是擴散模型的強項。根據 Tweedie's Formula 或 Score Matching 的定義，預訓練的老師模型 $\epsilon_\phi(x_t, t)$ 本質上就是真實分佈的 Score 估計器（在噪聲等級 $t$ 下）：

$$\nabla_{x_t} \log p_{real}(x_t) \propto - \epsilon_\phi(x_t, t)$$

所以，我們隨機採樣一個時間步 $t$，把學生生成的圖 $x_{fake}$ 加噪得到 $x_t$，丟給老師模型算 $\epsilon$，就得到了真實分數的方向。

C. 怎麼算 Fake Score？（DMD 的關鍵 Trick）

$p_{fake}$ 是學生自己定義的，很難算 Score。DMD 這裡做了一個近似：

它將 Fake Score 近似為一個高斯分佈的 Score。

具體來說，它假設在加噪後的 $x_t$ 空間中，學生的分佈 $p_{fake}(x_t)$ 可以局部近似為一個中心在 $\mu_{fake}$ 的高斯分佈。

於是，Fake Score 就變成了：



$$\nabla_{x_t} \log p_{fake}(x_t) \approx \frac{x_t - \mu_{fake}}{\sigma_t^2}$$



而 $\frac{x_t - \mu_{fake}}{\sigma_t}$ 其實就是我們加進去的噪聲 $\epsilon$！

D. 最終的梯度形式

將 B 和 C 結合，DMD 實際上是在計算：



$$\nabla_\theta \mathcal{L}_{dist} \propto \mathbb{E}_{t, \epsilon} \left[ \nabla_\theta G(z) \cdot (\epsilon_\phi(G(z)_t, t) - \epsilon) \right]$$

- $\epsilon_\phi(\dots)$：老師認為這個噪聲應該長什麼樣（代表真實圖像結構）。
- $\epsilon$：實際加進去的物理噪聲（代表學生當前的分佈結構）。

**物理意義：** 如果老師預測的噪聲與實際噪聲不一致，說明這張圖「不夠真」，梯度就會推動 $G(z)$ 去修正這個差異。這其實就是 **SDS Loss 的修正版**，或者說是把擴散模型當成了 GAN 的 Discriminator。

#### 第二部分：回歸損失 (Regression Loss)

$$\mathcal{L}_{reg} = \| G_\theta(z) - \mu_\phi(z, T_{step}) \|^2$$

雖然我們要做分佈匹配，但純粹的 KL 優化非常不穩定（容易產生幻覺或與 Prompt 不符）。

作者保留了一個「弱約束」：利用老師模型進行一步或多步的確定性採樣（例如用 DDIM 跑幾步），作為 $y_{target}$。

- **作用：** 這是一個 Anchor（錨點）。它告訴學生：「你可以自由發揮細節（由 Dist Loss 負責），但大體的構圖和顏色（低頻信息）要跟著老師走。」

#### 訓練流程總結

1. 採樣噪聲 $z$。
2. **Student Forward:** $x_{fake} = G_\theta(z)$。
3. **Regression Branch:** 計算 $x_{fake}$ 和老師生成的粗糙軌跡之間的 MSE。
4. **Distribution Branch:**
    - 隨機選一個 $t$。
    - 給 $x_{fake}$ 加噪得到 $x_t$。
    - 讓老師模型看 $x_t$，吐出 $\epsilon_{teacher}$。
    - 計算梯度差值 $(\epsilon_{teacher} - \epsilon_{noise})$ 並反向傳播。
5. 更新 $\theta$。

### 4. 研究結論與價值 (Conclusion & Insights)

除了方法本身，這篇論文對於博士生來說有幾個重要的 Takeaway：

1. **FP16 訓練的可行性：** 這是工程上的重大發現。之前的蒸餾方法（如 CD）對數值精度非常敏感，通常需要 FP32。DMD 證明了通過合理的 Loss 設計，可以在半精度下穩定訓練，這對資源有限的實驗室非常重要。

2. **解耦了「內容」與「質感」：** DMD 揭示了生成模型的訓練可以拆解為兩個正交的任務：

    - MSE 負責 **低頻內容 (Content/Structure)**。

    - Score Distillation 負責 高頻紋理 (Texture/Realism)。

        這種解耦思想對後續設計新的 Loss Function 非常有啟發性。

3. **GAN 與 Diffusion 的統一視角：** DMD 實際上是把 Diffusion Model 變成了一個「完美的 Discriminator」。GAN 的判別器容易訓練崩潰，但預訓練的 Diffusion Model 提供的梯度場是平滑且魯棒的。這暗示了未來生成模型可能會走向 **Generator (One-step) + Diffusion-based Critic** 的架構。

給你的建議：

如果你要復現或改進這個工作，請重點關注 Fake Score 的近似那部分。DMD 用高斯近似是一個簡化，如果能在那裡引入更精確的 Entropy 估計（例如引入一個額外的 Head 來預測 entropy），可能會是下一個 Paper 的點。

## MeanFlow



## Drifting Model



