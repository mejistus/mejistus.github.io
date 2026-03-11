# My i3wm setup: calm aesthetics for a busy mind

How a tiling window manager helped me find focus — and a colour palette that stays out of the way.

## Why i3wm

I've never been good at managing chaos. My desktop used to be a graveyard of overlapping terminals, half-read papers, and browser tabs I swore I'd come back to. Then I discovered i3wm — a tiling window manager that, by design, refuses to let windows pile up.

The appeal was immediate: **everything has its place**. No decorations, no distractions. Just screens split into logical regions, each holding exactly what I need.

## The Setup

This configuration is built on **i3-wm**, which uses the classic X11 display protocol. It may not be the flashiest option, but it's simple, stable, and gets out of the way.

I've collected and refined these configurations from various open-source projects, adding small tweaks to make the experience more usable. The goal wasn't to reinvent the wheel — it was to create something that works, day in and day out.

## What's Included

| Component | Purpose |
|-----------|---------|
| **i3** | Window manager core |
| **Polybar** | Status bar with customizable modules |
| **Rofi** | Application launcher and window switcher |
| **Kitty** | GPU-accelerated terminal emulator |
| **Picom** | Compositor for smooth shadows and transparency |
| **Dunst** | Lightweight notification daemon |
| **Conky** | System monitoring (slate theme) |
| **Btop** | Resource monitor |
| **Fastfetch** | System information display |
| **Cava** | Audio visualizer |
| **Qutebrowser** | Keyboard-driven web browser |
| **Neovim (NvChad)** | Customized editor with OneDark theme |

## Key Bindings That Matter

After two years, these are the bindings I actually use:

| Key | Action |
|-----|--------|
| `Mod+Enter` | Open terminal |
| `Mod+d` | Launch app menu (dmenu) |
| `Mod+[1-9]` | Switch workspace |
| `Mod+Shift+[1-9]` | Move window to workspace |
| `Mod+h/j/k/l` | Navigate windows (vim-style) |
| `Mod+Shift+q` | Close window |
| `Mod+r` | Reload config |
| `Mod+Shift+c` | Restart i3 |

The vim-style navigation was the hardest to build into muscle memory. Now I can't imagine going back to clicking.

## Polybar Customization

The status bar supports multiple configurations. For example, to activate style #2 with CPU monitoring:

```bash
python ~/.config/polybar/scripts/change.py --select 2
```

Or edit the configuration files directly to create your own combination.

## Neovim Integration

I use a customized **NvChad** configuration for a consistent experience across the setup. The theme is OneDark (though I personally use Dracula). 

Key mappings are defined in `mappings.lua`. Combined with qutebrowser, this setup lets you keep your hands on the keyboard for most tasks — freeing your mouse and neck from unnecessary strain.

> Note: The code hover key has been remapped to `F`. Double-tap `Shift+f` to activate.

## Directory Structure

```
~/.config/
├── i3/              # Window manager config
├── polybar/         # Status bar
├── rofi/            # Launcher
├── kitty/           # Terminal
├── picom/           # Compositor
├── dunst/           # Notifications
├── conky/           # System monitor
├── btop/            # Resource monitor
├── fastfetch/       # System info
├── cava/            # Audio visualizer
├── qutebrowser/     # Browser
└── nvim/            # Editor
```

## A Note on Colours

The accent colour (`#c47c5a` — a muted rust/orange) is the same one I use throughout my personal site. It's warm without being loud, and it pairs well with the cool greys that dominate my editor and terminal.

I've learned that **aesthetics isn't about adding more** — it's about knowing what to leave out. i3wm enforces that philosophy at the window-manager level. My mind, once scattered, now has room to breathe.

## Acknowledgments

This setup builds on the work of many great open-source projects:

- [i3-wm](https://i3wm.org/) — The foundation
- [Polybar](https://github.com/polybar/polybar) — Status bar
- [NvChad](https://github.com/NvChad/NvChad) — Neovim configuration
- [slate-conky-theme](https://github.com/slate-conky-theme) — Conky theme

Respect to all the developers who make this ecosystem possible.

---

*Full configuration files are available on [GitHub](https://github.com/mejistus/fantastic-i3).*
