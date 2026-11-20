#!/usr/bin/env python3
"""Claude Code status line: ASCII crab, robbyrussell prompt, token speed, task."""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime

RESET = "\033[0m"
CYAN = "\033[36m"
BLUE = "\033[1;34m"
RED = "\033[31m"
YELLOW = "\033[1;33m"
ORANGE = "\033[38;2;215;119;87m"
BLACK_BG = "\033[48;2;0;0;0m"
BG_RESET = "\033[49m"
DIM = "\033[38;5;245m"

# Official Clawd from Claude Code's startup screen (v2.1.327): orange body
# with a black background inside the shell. Frame 1 blinks and shifts a leg.
CRAB_FRAMES = [
    [
        f"{ORANGE} ▐{BLACK_BG}▛███▛█{BG_RESET}{RESET}",
        f"{ORANGE}▝▜{BLACK_BG}█████{BG_RESET}█▀{RESET}",
        f"{ORANGE} ▝▝   ▝▝{RESET}",
    ],
    [
        f"{ORANGE} ▐{BLACK_BG}▜███▜█{BG_RESET}{RESET}",
        f"{ORANGE}▝▜{BLACK_BG}█████{BG_RESET}█▀{RESET}",
        f"{ORANGE}  ▝▝ ▝▝{RESET}",
    ],
]
CRAB_WIDTH = 10
TEXT_COL = CRAB_WIDTH + 2

ANSI_RE = re.compile(r"\033\[[0-9;]*m")


def visible_len(text: str) -> int:
    return len(ANSI_RE.sub("", text))


def parse_time(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def git_segment(cwd: str) -> str:
    if not cwd or not os.path.isdir(cwd):
        return ""
    try:
        inside = subprocess.run(
            ["git", "-C", cwd, "--no-optional-locks", "rev-parse", "--is-inside-work-tree"],
            capture_output=True,
            text=True,
            timeout=1,
        )
        if inside.returncode != 0 or inside.stdout.strip() != "true":
            return ""
        branch = subprocess.run(
            ["git", "-C", cwd, "--no-optional-locks", "symbolic-ref", "--short", "HEAD"],
            capture_output=True,
            text=True,
            timeout=1,
        )
        name = branch.stdout.strip() if branch.returncode == 0 else ""
        if not name:
            detached = subprocess.run(
                ["git", "-C", cwd, "--no-optional-locks", "rev-parse", "--short", "HEAD"],
                capture_output=True,
                text=True,
                timeout=1,
            )
            name = detached.stdout.strip() if detached.returncode == 0 else ""
        if not name:
            return ""
        status = subprocess.run(
            [
                "git",
                "-C",
                cwd,
                "--no-optional-locks",
                "status",
                "--porcelain",
                "--ignore-submodules=all",
            ],
            capture_output=True,
            text=True,
            timeout=1,
        )
        dirty = " ✗" if status.returncode == 0 and status.stdout.strip() else ""
        return f" {BLUE}git({RED}{name}{BLUE}){RESET}{YELLOW}{dirty}{RESET}"
    except (OSError, subprocess.SubprocessError):
        return ""


def user_text(entry) -> str:
    content = (entry.get("message") or {}).get("content")
    if isinstance(content, str):
        text = content
    elif isinstance(content, list):
        parts = [
            block.get("text")
            for block in content
            if isinstance(block, dict)
            and block.get("type") == "text"
            and isinstance(block.get("text"), str)
        ]
        text = " ".join(parts)
    else:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def transcript_metrics(payload):
    """Return (last_response_tokens_per_second, latest_user_prompt)."""
    path = payload.get("transcript_path")
    if not path or not os.path.isfile(path):
        return None, ""
    try:
        size = os.path.getsize(path)
        with open(path, "rb") as handle:
            handle.seek(max(0, size - 262144))
            chunk = handle.read().decode("utf-8", "replace")
        lines = chunk.splitlines()
        if lines and not chunk.startswith("{"):
            lines = lines[1:]
    except OSError:
        return None, ""

    assistants = []
    users = []
    latest_prompt = ""
    for line in lines:
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        moment = parse_time(entry.get("timestamp"))
        if not moment:
            continue
        if entry.get("type") == "assistant":
            message = entry.get("message") or {}
            usage = message.get("usage") or {}
            output = usage.get("output_tokens")
            message_id = message.get("id")
            if isinstance(output, (int, float)) and output > 0 and message_id:
                assistants.append((moment, output, message_id))
        elif entry.get("type") == "user":
            users.append(moment)
            text = user_text(entry)
            if text:
                latest_prompt = text

    speed = None
    if assistants:
        by_message = {}
        for moment, output, message_id in assistants:
            by_message[message_id] = (moment, output)
        last_moment, last_output = max(
            by_message.values(), key=lambda item: item[0]
        )
        earlier_users = [moment for moment in users if moment < last_moment]
        elapsed = (
            (last_moment - max(earlier_users)).total_seconds()
            if earlier_users
            else 0
        )
        if elapsed <= 0.2:
            api_ms = (payload.get("cost") or {}).get("total_api_duration_ms") or 0
            elapsed = api_ms / 1000.0
        if elapsed > 0.2:
            speed = last_output / elapsed
    return speed, latest_prompt


def truncate(text: str, limit: int) -> str:
    if limit <= 1:
        return ""
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        payload = {}

    cwd = (
        (payload.get("workspace") or {}).get("current_dir")
        or payload.get("cwd")
        or os.getcwd()
    )
    home = os.path.expanduser("~")
    directory = "~" if cwd == home else (os.path.basename(cwd.rstrip("/")) or "/")

    speed, latest_prompt = transcript_metrics(payload)
    speed_text = (
        f"{YELLOW}⚡ {speed:.1f} tok/s{RESET}"
        if speed is not None
        else f"{DIM}— tok/s{RESET}"
    )

    try:
        columns = int(os.environ.get("COLUMNS") or 0)
    except ValueError:
        columns = 0
    if columns <= 0:
        columns = 120

    task = latest_prompt or (payload.get("session_name") or "ready")
    task = truncate(task, max(24, columns - TEXT_COL - 2))

    git = git_segment(cwd)
    frame = CRAB_FRAMES[int(time.time()) % len(CRAB_FRAMES)]
    art = [
        f"{line}{' ' * max(0, CRAB_WIDTH - visible_len(line))}"
        for line in frame
    ]
    rows = [
        f"{art[0]}  {CYAN}{directory}{RESET}{git}",
        f"{art[1]}  {speed_text}",
        f"{art[2]}  {CYAN}▸{RESET} {DIM}{task}{RESET}",
    ]
    for row in rows:
        print(row)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(f"{CYAN}{os.path.basename(os.getcwd()) or '~'}{RESET}")
