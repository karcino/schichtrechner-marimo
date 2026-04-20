"""Build step: generate self-contained notebooks for WASM export.

Reads `htv_calc.py` and each notebook; replaces a marker line in a prelude
cell with code that injects htv_calc into sys.modules via base64-decoded exec.
This makes the exported WASM bundle work without runtime file fetches.

Usage:
    python build_wasm.py

Outputs:
    _build/notebook.py
    _build/notebook_monat.py
"""

from __future__ import annotations

import base64
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent
BUILD_DIR = ROOT / "_build"
MARKER = "# BUILD_INLINE: htv_calc"

NOTEBOOKS = ["notebook.py", "notebook_monat.py"]


def inline_prelude(b64_src: str) -> str:
    """Code that replaces the marker — injects htv_calc into sys.modules."""
    return (
        f'import sys, types, base64\n'
        f'    if "htv_calc" not in sys.modules:\n'
        f'        _htv_src = base64.b64decode("{b64_src}").decode()\n'
        f'        _htv_mod = types.ModuleType("htv_calc")\n'
        f'        exec(compile(_htv_src, "htv_calc.py", "exec"), _htv_mod.__dict__)\n'
        f'        sys.modules["htv_calc"] = _htv_mod'
    )


def build() -> int:
    calc_path = ROOT / "htv_calc.py"
    if not calc_path.exists():
        print(f"ERROR: {calc_path} not found.", file=sys.stderr)
        return 1

    htv_src = calc_path.read_text(encoding="utf-8")
    b64 = base64.b64encode(htv_src.encode("utf-8")).decode("ascii")

    BUILD_DIR.mkdir(exist_ok=True)

    for nb_name in NOTEBOOKS:
        src_path = ROOT / nb_name
        if not src_path.exists():
            print(f"skip (missing): {nb_name}")
            continue
        src = src_path.read_text(encoding="utf-8")
        if MARKER not in src:
            print(f"WARN: no `{MARKER}` marker in {nb_name} — copy verbatim")
            out = src
        else:
            out = src.replace(MARKER, inline_prelude(b64))
            print(f"inlined htv_calc.py -> {nb_name} ({len(htv_src):,} bytes src)")

        dst = BUILD_DIR / nb_name
        dst.write_text(out, encoding="utf-8")

    # Copy the raw htv_calc.py too, so that `marimo run` from _build/ also works
    (BUILD_DIR / "htv_calc.py").write_text(htv_src, encoding="utf-8")
    print(f"wrote {BUILD_DIR}/")
    return 0


if __name__ == "__main__":
    sys.exit(build())
