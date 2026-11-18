"""Export temporary transparent WebP game assets from user-supplied concept PNGs.

Run with `.venv/Scripts/python.exe tools/export_assets.py`. Only Pillow is needed.
White connected to the image border is removed; enclosed pale motifs may need hand cleanup.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "characters"
DESTINATION = ROOT / "packages" / "client" / "public" / "units"


def remove_white_border(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    raw = rgb.tobytes()
    count = width * height
    visited = bytearray(count)
    alpha = bytearray(b"\xff") * count
    queue: deque[int] = deque()

    def is_background(index: int) -> bool:
        offset = index * 3
        return raw[offset] >= 245 and raw[offset + 1] >= 245 and raw[offset + 2] >= 245

    def visit(index: int) -> None:
        if not visited[index]:
            visited[index] = 1
            if is_background(index):
                alpha[index] = 0
                queue.append(index)

    for x in range(width):
        visit(x)
        visit((height - 1) * width + x)
    for y in range(height):
        visit(y * width)
        visit(y * width + width - 1)

    while queue:
        index = queue.popleft()
        x = index % width
        y = index // width
        if x > 0:
            visit(index - 1)
        if x + 1 < width:
            visit(index + 1)
        if y > 0:
            visit(index - width)
        if y + 1 < height:
            visit(index + width)

    result = rgb.convert("RGBA")
    result.putalpha(Image.frombytes("L", (width, height), bytes(alpha)))
    return result


def export_unit(unit_id: str, bounds: dict[str, int]) -> None:
    source = SOURCE / unit_id / "concept.png"
    if not source.is_file():
        raise FileNotFoundError(source)
    image = remove_white_border(Image.open(source))
    top = bounds["bodyTop"]
    bottom = bounds["bodyBottom"]
    if not (0 <= top < bottom <= image.height):
        raise ValueError(f"Invalid body bounds for {unit_id}")

    alpha = image.getchannel("A")
    foreground = alpha.crop((0, top, image.width, bottom)).getbbox()
    if foreground is None:
        raise ValueError(f"No foreground left for {unit_id}")
    left = max(0, foreground[0] - 8)
    right = min(image.width, foreground[2] + 8)
    body = image.crop((left, top, right, bottom))
    scale = 512 / (bottom - top)
    battle = body.resize((max(1, round(body.width * scale)), 512), Image.Resampling.LANCZOS)

    output = DESTINATION / unit_id
    output.mkdir(parents=True, exist_ok=True)
    battle.save(output / "battle.webp", "WEBP", quality=92, method=6)

    # Temporary portrait/icon crops until separately painted gacha art is supplied.
    portrait_top = top
    portrait_bottom = min(bottom, top + round((bottom - top) * 0.68))
    portrait = image.crop((max(0, image.width // 2 - 300), portrait_top, min(image.width, image.width // 2 + 300), portrait_bottom))
    portrait.thumbnail((384, 512), Image.Resampling.LANCZOS)
    portrait.save(output / "portrait.webp", "WEBP", quality=92, method=6)
    icon = image.crop((max(0, image.width // 2 - 145), top, min(image.width, image.width // 2 + 145), top + 290))
    icon = icon.resize((128, 128), Image.Resampling.LANCZOS)
    icon.save(output / "icon.webp", "WEBP", quality=92, method=6)
    print(f"{unit_id}: battle {battle.width}x{battle.height}; portrait/icon placeholders")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", help="Export one unit id instead of all manifest entries")
    args = parser.parse_args()
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf-8"))
    ids = [args.id] if args.id else list(manifest)
    for unit_id in ids:
        if unit_id not in manifest:
            raise ValueError(f"Unknown unit id: {unit_id}")
        export_unit(unit_id, manifest[unit_id])


if __name__ == "__main__":
    main()
