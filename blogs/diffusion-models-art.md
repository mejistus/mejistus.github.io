# On diffusion models and the art of generation

What generative models taught me about creativity, randomness, and the space between intention and emergence.

## The Dance of Noise

When I first started working with diffusion models, I was struck by a peculiar irony: to create something beautiful, we must first learn to embrace noise. The process is almost meditative — we take an image, drown it in static until nothing remains but white noise, and then train a neural network to reverse this destruction.

The forward diffusion process can be described mathematically. At each timestep $t$, we gradually add Gaussian noise to an image $\mathbf{x}_0$:

$$
\mathbf{x}_t = \sqrt{\bar{\alpha}_t} \mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t} \boldsymbol{\epsilon}, \quad \text{where } \boldsymbol{\epsilon} \sim \mathcal{N}(0, \mathbf{I})
$$

Here, $\bar{\alpha}_t = \prod_{s=1}^t (1 - \beta_s)$ is the cumulative product of the noise schedule. The beauty lies in its simplicity: as $t \to T$, the image becomes pure noise.

```python
# A simple diffusion forward process
def add_noise(image, t, T):
    """Gradually add noise to an image."""
    beta = torch.linspace(0.0001, 0.02, T)
    alpha = 1. - beta
    alpha_cumprod = torch.cumprod(alpha, dim=0)

    noise = torch.randn_like(image)
    noisy_image = torch.sqrt(alpha_cumprod[t]) * image + \
                  torch.sqrt(1 - alpha_cumprod[t]) * noise
    return noisy_image
```

## The Reverse Process

The magic happens when we learn to reverse this process. We train a neural network $\boldsymbol{\epsilon}_\theta$ to predict the noise that was added:

$$
\mathcal{L}_{\text{simple}} = \mathbb{E}_{t, \mathbf{x}_0, \boldsymbol{\epsilon}} \left[ \| \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \|^2 \right]
$$

Once trained, we can generate images by sampling from pure noise and iteratively denoising:

$$
\mathbf{x}_{t-1} = \frac{1}{\sqrt{\alpha_t}} \left( \mathbf{x}_t - \frac{1 - \alpha_t}{\sqrt{1 - \bar{\alpha}_t}} \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t) \right) + \sigma_t \mathbf{z}
$$

where $\mathbf{z} \sim \mathcal{N}(0, \mathbf{I})$ is random noise.

## The Philosophy of Generation

There's something deeply philosophical about this process. We're not *creating* in the traditional sense — we're *discovering*. The model learns a landscape of possibilities, and each generation is a journey through that latent space.

I've spent countless nights watching these models generate images, and I'm always reminded of a line from classical Chinese poetry:

> 煙花散落升絢麗，霎時紫粉霎時紅。

Fireworks burst upward in radiant splendour — one moment violet, the next a blaze of red. Is this not what happens in the latent space of a diffusion model?

## What This Means for Creativity

The question I keep returning to: if a machine can learn to create beauty from noise, what does that say about the nature of creativity itself? Perhaps creativity isn't about conjuring something from nothing, but about learning to navigate the noise — to find signal in chaos.

This is what I've learned from my research: **creation is subtraction**. We don't add; we remove the unnecessary until what remains is meaningful.

---

*This essay was originally published in my research blog, 2025.*
