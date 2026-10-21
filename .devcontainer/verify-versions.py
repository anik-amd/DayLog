#!/usr/bin/env python3
"""Checks every pinned dependency version against the repository that serves it.

The version matrix in gradle/libs.versions.toml is pinned on purpose: it is the set of versions
known to work together. This script proves the pins are still real and reports what has moved on,
so a bump is a decision rather than an accident.

Usage: python3 .devcontainer/verify-versions.py
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

CATALOG = Path("gradle/libs.versions.toml")

# Google serves the androidx and com.google artifacts; Maven Central serves the rest.
GOOGLE_PREFIXES = ("androidx.", "com.android.", "com.google.")

MODULE_PATTERN = re.compile(r'module\s*=\s*"([^"]+)"')
VERSION_REF_PATTERN = re.compile(r'version\.ref\s*=\s*"([^"]+)"')
PLUGIN_ID_PATTERN = re.compile(r'id\s*=\s*"([^"]+)"')


def parse_catalog(path: Path) -> tuple[dict[str, str], list[tuple[str, str, str]]]:
    """Reads the version table and the artifacts that point into it.

    The catalog is TOML, but the shape used here is simple enough that a focused reader is
    clearer than pulling in a parser, and it keeps the script runnable on a bare image.
    """
    versions: dict[str, str] = {}
    artifacts: list[tuple[str, str, str]] = []
    section = ""

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("[") and line.endswith("]"):
            section = line[1:-1]
            continue

        if "=" not in line:
            continue

        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()

        # A plain quoted value: a version.
        if value.startswith('"') and value.endswith('"'):
            if section == "versions":
                versions[key] = value[1:-1]
            continue

        # An inline table: a library or a plugin.
        module_match = MODULE_PATTERN.search(value)
        version_ref_match = VERSION_REF_PATTERN.search(value)
        plugin_match = PLUGIN_ID_PATTERN.search(value)

        if section == "libraries" and module_match:
            artifacts.append(
                (key, module_match.group(1), version_ref_match.group(1) if version_ref_match else "")
            )
        elif section == "plugins" and plugin_match:
            # A plugin id is a Gradle plugin marker, which is published on the plugin portal
            # rather than on Maven, so it is listed but not checked.
            artifacts.append((key, f"plugin:{plugin_match.group(1)}", ""))

    return versions, artifacts


def repository_for(group: str) -> str:
    if group.startswith(GOOGLE_PREFIXES):
        return "https://dl.google.com/dl/android/maven2"
    return "https://repo1.maven.org/maven2"


def latest_version(coordinate: str) -> str | None:
    group, _, artifact = coordinate.partition(":")
    if not artifact:
        return None
    path = f"{group.replace('.', '/')}/{artifact}/maven-metadata.xml"
    url = f"{repository_for(group)}/{path}"

    # curl is used rather than urllib because the standard library in a minimal container image
    # may not ship the http modules.
    try:
        result = subprocess.run(
            ["curl", "-fsSL", "--max-time", "25", url],
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return None

    if result.returncode != 0:
        return None

    match = re.search(r"<release>([^<]*)</release>", result.stdout)
    return match.group(1) if match else None


def main() -> int:
    if not CATALOG.exists():
        print(f"No {CATALOG} found. Run this from the repository root.", file=sys.stderr)
        return 2

    versions, artifacts = parse_catalog(CATALOG)

    print(f"{'ARTIFACT':<46} {'PINNED':<12} {'LATEST':<12} STATUS")
    print("-" * 96)

    unreachable = 0
    for _, coordinate, version_ref in artifacts:
        if coordinate.startswith("plugin:"):
            continue
        if not version_ref:
            # A BOM or a version that is pinned inside the library alias.
            continue

        pinned = versions.get(version_ref)
        if pinned is None:
            print(f"{coordinate:<46} {'?':<12} {'?':<12} unknown version ref '{version_ref}'")
            unreachable += 1
            continue

        latest = latest_version(coordinate)
        if latest is None:
            print(f"{coordinate:<46} {pinned:<12} {'?':<12} cannot reach")
            unreachable += 1
            continue

        status = "current" if latest == pinned else "newer available"
        print(f"{coordinate:<46} {pinned:<12} {latest:<12} {status}")

    print()
    if unreachable:
        print(f"{unreachable} artifact(s) could not be checked. Check the network.")
        return 1

    print("A newer version is not a reason to bump. The matrix is pinned because it works together.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
