#!/usr/bin/env python3
"""Lint frontmatter of survey pages.

Checks every survey/<dir>/*.md page (apps, components, plugins) for: parseable YAML frontmatter, a `type`
matching its directory, only known keys, required keys present, keys in schema
order, value types (including closed value sets), an H1 title, and unique URLs.
Uncommon `storage` values are reported as warnings.

Usage: python3 survey/lint.py   (exit code 1 if any problem is found)
"""

import datetime
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent

# Key order per type. Keys marked optional may be absent; all others are required.
SCHEMAS = {
    "apps": {
        "type": "App",
        "keys": ["type", "url", "repo", "flathub", "flathub_arch", "overview", "doc_model", "outliner", "parent_child",
                 "markdown_flavor", "wikilinks", "format", "storage", "tech", "editor", "shell", "pricing", "license", "why", "stars",
                 "last_release", "last_release_date", "last_commit", "archived", "checked", "sources", "unverified"],
        "optional": {"flathub", "flathub_arch", "markdown_flavor", "wikilinks", "stars", "archived", "unverified"},
    },
    "components": {
        "type": "Component",
        "keys": ["type", "url", "repo", "overview", "tech", "license", "why", "stars",
                 "last_release", "last_release_date", "last_commit", "archived", "checked", "sources", "unverified"],
        "optional": {"stars", "archived", "unverified"},
    },
    "plugins": {
        "type": "Plugin",
        "keys": ["type", "url", "repo", "host", "overview", "tech", "license", "why", "stars",
                 "last_release", "last_release_date", "last_commit", "archived", "checked", "sources", "unverified"],
        "optional": {"tech", "stars", "archived", "unverified"},
    },
}

# Closed value sets (errors if violated).
ENUMS = {
    "doc_model": {"freeform", "blocks", "outline", "canvas", "ink"},
    "outliner": {"none", "plugin", "lists", "headings", "lists+headings", "blocks", "full"},
    "parent_child": {"none", "structural", "indexed"},
    "flathub_arch": {"x86_64", "aarch64"},
    "host": {"obsidian", "logseq", "vscode", "neovim", "vim", "emacs"},
    "shell": {"electron", "tauri", "native", "web", "flutter", "qt", "gtk", "wx", "compose",
              "terminal", "emacs", "neovim", "vscode", "sublime", "android"},
}
# Open vocabulary for `storage`: parts joined by " + ". Unknown parts are warnings, not errors.
STORAGE_PARTS = {"md-files", "org-files", "text-files", "json-files", "own-files",
                 "sqlite", "local-db", "server-db", "crdt", "cloud", "index"}

URL = re.compile(r"^https?://\S+$")
SLUG = re.compile(r"^[a-z0-9][a-z0-9+-]*$")
NULLABLE = {"repo", "license", "editor", "last_release", "last_release_date", "last_commit"}
DATES = {"last_release_date", "last_commit", "archived", "checked"}
TEXT = {"markdown_flavor", "overview", "format", "tech", "pricing", "why", "storage"}


def check_value(key, value, keys):
    if value is None:
        return None if key in NULLABLE else "must not be null"
    if key == "wikilinks":
        # true / false, or a short note when supported with caveats
        ok = isinstance(value, bool) or (isinstance(value, str) and value.strip())
        return None if ok else f"must be true, false or a caveat note, got {value!r}"
    if key in DATES:
        return None if isinstance(value, datetime.date) else f"must be a YYYY-MM-DD date, got {value!r}"
    if key in ("url", "repo", "flathub"):
        return None if isinstance(value, str) and URL.match(value) else f"must be an http(s) URL, got {value!r}"
    if key in ENUMS:
        return None if value in ENUMS[key] else f"{value!r} not one of: {', '.join(sorted(ENUMS[key]))}"
    if key == "editor":
        return None if isinstance(value, str) and SLUG.match(value) else f"must be a lowercase slug, got {value!r}"
    if key == "stars":
        return None if isinstance(value, int) and not isinstance(value, bool) and value >= 0 else f"must be a non-negative integer, got {value!r}"
    if key == "sources":
        if not isinstance(value, list) or not value:
            return "must be a non-empty list of URLs"
        bad = [v for v in value if not (isinstance(v, str) and URL.match(v))]
        return f"not URLs: {bad}" if bad else None
    if key == "unverified":
        if not isinstance(value, list) or not value:
            return "must be a non-empty list of key names"
        bad = [v for v in value if v not in keys]
        return f"not keys of this schema: {bad}" if bad else None
    if key in TEXT | {"license", "last_release", "type"}:
        if not isinstance(value, str):
            return f"must be a string, got {type(value).__name__} {value!r} (quote it)"
        if not value.strip():
            return "must not be empty"
    return None


def warnings_for(fm):
    out = []
    storage = fm.get("storage")
    if isinstance(storage, str):
        unknown = [p for p in storage.split(" + ") if p not in STORAGE_PARTS]
        if unknown:
            out.append(f"storage: uncommon part(s) {unknown}; usual: {', '.join(sorted(STORAGE_PARTS))}")
    return out


def lint_file(path, schema):
    errors = []
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return ["missing frontmatter (file must start with '---')"], None
    try:
        raw, body = text[4:].split("\n---\n", 1)
    except ValueError:
        return ["unterminated frontmatter"], None
    try:
        fm = yaml.safe_load(raw)
    except yaml.YAMLError as e:
        return [f"invalid YAML: {e}"], None
    if not isinstance(fm, dict):
        return ["frontmatter is not a mapping"], None

    keys = list(fm)
    allowed = schema["keys"]
    unknown = [k for k in keys if k not in allowed]
    missing = [k for k in allowed if k not in fm and k not in schema["optional"]]
    if unknown:
        errors.append(f"unknown keys: {', '.join(unknown)}")
    if missing:
        errors.append(f"missing keys: {', '.join(missing)}")
    known = [k for k in keys if k in allowed]
    expected = [k for k in allowed if k in known]
    if known != expected:
        errors.append(f"key order: expected {', '.join(expected)}")

    if fm.get("type") != schema["type"]:
        errors.append(f"type: expected {schema['type']!r}, got {fm.get('type')!r}")
    for k in known:
        problem = check_value(k, fm[k], allowed)
        if problem:
            errors.append(f"{k}: {problem}")
    if fm.get("last_release") is None and fm.get("last_release_date") is not None:
        errors.append("last_release_date set without last_release")

    errors += [f"warning: {w}" for w in warnings_for(fm)]
    if not re.search(r"^# \S", body, re.M):
        errors.append("missing '# Title' heading in body")
    return errors, fm.get("url")


def main():
    problems = 0
    warnings = 0
    checked = 0
    urls = {}
    for dirname, schema in SCHEMAS.items():
        for path in sorted((ROOT / dirname).glob("*.md")):
            checked += 1
            errors, url = lint_file(path, schema)
            rel = path.relative_to(ROOT.parent)
            if url:
                if url in urls:
                    errors.append(f"duplicate url, also in {urls[url]}")
                urls.setdefault(url, rel)
            for e in errors:
                print(f"{rel}: {e}")
            warnings += sum(e.startswith("warning:") for e in errors)
            problems += sum(not e.startswith("warning:") for e in errors)
    print(f"{checked} files checked, {problems} problem(s), {warnings} warning(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
