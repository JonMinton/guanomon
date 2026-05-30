#!/usr/bin/env python3
"""Scan the Obsidian vault and emit site/data.js for the Experiment mode.

Produces `window.GUANOMON_DATA = {notes:[...], edges:[...], generated:"..."}`.
- notes: {slug, title, folder, md}  (raw markdown; rendered client-side by marked.js)
- edges: {from, to}  (one per resolvable [[wikilink]])

No third-party deps; runs on the GitHub Actions ubuntu runner and locally.
Pass an ISO timestamp as argv[1] to stamp the build (Actions passes one).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {".git", ".archive", ".obsidian", ".github", "site", "tools", "node_modules"}
WIKILINK = re.compile(r"\[\[([^\]]+?)\]\]")


def slug_of(path):
    return os.path.splitext(os.path.basename(path))[0]


def title_of(md, slug):
    for line in md.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s[2:].strip()
    return slug


def folder_of(rel):
    parts = rel.split(os.sep)
    return parts[0] if len(parts) > 1 else "(root)"


def link_target(inner):
    # inner forms: target | target|alias | target\|alias | target#heading(|alias)
    target = re.split(r"\\?\||#", inner, maxsplit=1)[0]
    return target.strip()


def main():
    generated = sys.argv[1] if len(sys.argv) > 1 else ""
    notes = []
    slugs = set()
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if not fn.endswith(".md"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, ROOT)
            with open(full, encoding="utf-8") as fh:
                md = fh.read()
            slug = slug_of(fn)
            if slug in slugs:  # filenames are unique across the vault; guard anyway
                continue
            slugs.add(slug)
            notes.append({
                "slug": slug,
                "title": title_of(md, slug),
                "folder": folder_of(rel),
                "md": md,
            })

    edges = []
    seen = set()
    for n in notes:
        for m in WIKILINK.finditer(n["md"]):
            tgt = link_target(m.group(1))
            if tgt in slugs and tgt != n["slug"]:
                key = (n["slug"], tgt)
                if key not in seen:
                    seen.add(key)
                    edges.append({"from": n["slug"], "to": tgt})

    notes.sort(key=lambda x: (x["folder"], x["slug"]))
    data = {"generated": generated, "notes": notes, "edges": edges}
    out = os.path.join(ROOT, "site", "data.js")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("window.GUANOMON_DATA = ")
        json.dump(data, fh, ensure_ascii=False)
        fh.write(";\n")
    print(f"wrote {out}: {len(notes)} notes, {len(edges)} edges")


if __name__ == "__main__":
    main()
