import os
import json
from pathlib import Path

base_dir = Path(__file__).resolve().parent

folders = [
    child for child in base_dir.iterdir()
    if child.is_dir() and not child.name.startswith('.')
]

for folder in folders:
    files = sorted(
        name for name in os.listdir(folder)
        if os.path.isfile(folder / name) and name != "media.json"
    )

    with open(folder / "media.json", "w", encoding="utf-8") as f:
        json.dump(files, f, indent=2)
