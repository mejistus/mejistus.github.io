---
name: visual-html
description: Create, audit, or revise visual HTML deliverables that contain images, figures, charts, screenshots, diagrams, paper cards, or visual reports. Use when Codex is asked to produce a downloadable/offline/single-file HTML, a report with embedded images, a visual literature survey, or any HTML where external image/style/script dependencies should be avoided.
---

# Visual HTML

## Core Rule

Deliver visual HTML as a single self-contained `.html` file whenever the user asks for a downloadable, offline, portable, or dependency-free artifact.

- Embed every image as a `data:image/...;base64,...` URI in the HTML.
- Inline CSS in `<style>` and avoid external stylesheets, fonts, scripts, or relative asset paths.
- External hyperlinks for references are fine, but they must not be required for rendering the page.
- In the final response, give the absolute path to the HTML file.

## Workflow

1. Gather or create visual assets from authoritative local or source files.
2. Select only task-relevant visuals. For papers or technical reports, prefer method, framework, architecture, overview, or pipeline figures; avoid unrelated result plots, examples, or ablation charts unless explicitly requested.
3. Convert assets to browser-safe formats, preferably PNG or JPEG. Keep figures readable, but resize/compress large images when needed to keep the HTML practical.
4. Base64 encode each image and write it directly into the `src` attribute:

```html
<img src="data:image/png;base64,..." alt="Descriptive text">
```

5. Preserve provenance in visible captions when assets come from papers, PDFs, source archives, websites, or generated intermediate files.
6. Build a polished HTML layout with clear visual hierarchy, responsive sizing, and no text/image overlap.

## Useful Commands

Use local tools as available; adapt paths and formats to the project.

```bash
# PDF figure to PNG
pdftoppm -png -r 180 -singlefile figure.pdf output_prefix

# Trim, remove alpha, resize, and compress
magick input.png -background white -alpha remove -trim +repage -resize '1500x1100>' -strip -quality 88 output.png

# Static self-contained checks
python3 - <<'PY'
from bs4 import BeautifulSoup
from pathlib import Path
import base64
p = Path("report.html")
soup = BeautifulSoup(p.read_text(encoding="utf-8"), "html.parser")
imgs = soup.find_all("img")
assert imgs, "no images found"
for img in imgs:
    src = img.get("src", "")
    assert src.startswith("data:image/"), src[:80]
    base64.b64decode(src.split(",", 1)[1], validate=True)
print("ok", len(imgs), "embedded images")
PY
```

## Validation

Before calling the task complete:

- Confirm the requested filename exists.
- Confirm every `<img>` uses a base64 `data:image/...` URI.
- Search for accidental relative asset references in `src`, `href`, CSS `url(...)`, scripts, or stylesheets.
- Decode base64 images to catch malformed data.
- If a browser is available, render or screenshot the HTML to verify it is not blank and the images load.
- For ordered reports, verify the card/order requirement directly from the HTML, not just from the generation data.

## Final Response

Report the absolute path to the HTML file and the key validation facts, such as image count, card count, and self-contained status. Keep the response concise.
