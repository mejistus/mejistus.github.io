---
name: statusline-crab
description: Install, customize, or troubleshoot the Claude Code status line. It renders an animated official Clawd crab, the current directory and git branch, the last response's token speed, and the current task. Use when the user mentions the status line, the crab, tok/s, or asks to change, fix, or remove the status line.
---

# Statusline Clawd

A local Claude Code status line. Three left-aligned rows:

```
 ▐▛███▛█    claude-prism git(main)
▝▜██████▀   ⚡ 66.3 tok/s
 ▝▝   ▝▝    ▸ current task
```

The crab is the official Clawd from Claude Code's startup screen (v2.1.327), colored `#D77757` with a black background inside the shell. It switches between two frames while a turn is active, then rests on the official pose when the turn ends.

## Install

1. Copy the script:

   ```bash
   mkdir -p ~/.claude
   cp scripts/statusline-crab.py ~/.claude/statusline-crab.py
   ```

2. Merge this into `~/.claude/settings.json`; do not replace the existing settings:

   ```json
   "statusLine": {
     "type": "command",
     "command": "python3 /Users/<you>/.claude/statusline-crab.py",
     "padding": 0,
     "refreshInterval": 1
   }
   ```

3. Restart Claude Code or reload the session.

## Data sources

- Directory: `workspace.current_dir` or `cwd`.
- Git: `git symbolic-ref --short HEAD`, falling back to the short SHA; the dirty marker comes from `git status --porcelain`.
- Token speed: reads the tail of `transcript_path`, takes the last unique assistant message, and divides `usage.output_tokens` by the time since the user prompt that started the turn.
- Task: the latest user text in the transcript, truncated to the terminal width; falls back to `session_name` or `ready`.
- Working: the last transcript event is a user or tool message, or the last assistant message still has `stop_reason` `tool_use` (or no terminal stop reason). The crab animates only while this is true.

## Customize

- Frames live in `CRAB_FRAMES`; each frame is three strings. Keep each line 10 columns wide including padding.
- The animation is driven by the transcript's working state; removing `refreshInterval` makes it event-driven instead of checking every second.
- `TEXT_COL` controls where the text after the crab starts.
- The status line is plain text. While working, `refreshInterval` 1 is the fastest supported animation (1 fps); idle output stays on frame 0.

## Limits

- Multi-line ANSI output can occasionally garble while the UI redraws. If that happens, drop to one line or remove the animation.
- The bypass permissions indicator is built into Claude Code. Do not duplicate it in the status line.
- This skill is independent of the writing-quality and scientific skills in `~/.claude/skills`; installing it does not modify them.
