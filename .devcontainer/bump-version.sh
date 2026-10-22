#!/usr/bin/env bash
# Bumps the version for the next stage of work.
#
# The rewrite is released in stages, one patch version at a time: 0.3.0, 0.3.1, 0.3.2 and so on
# until the roadmap is done. Each stage is a release, so each stage needs its own version and its
# own version code — the version code has to keep rising or the APK cannot install over the last
# one.
#
# Usage: bash .devcontainer/bump-version.sh            # bump the patch version
#        bash .devcontainer/bump-version.sh --minor    # bump the minor version and reset the patch
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CATALOG="${REPO_ROOT}/gradle/libs.versions.toml"
cd "${REPO_ROOT}"

mode="${1:-patch}"

current_name="$(grep -E '^versionName\s*=' "${CATALOG}" | head -1 | cut -d'"' -f2)"
current_code="$(grep -E '^versionCode\s*=' "${CATALOG}" | head -1 | cut -d'"' -f2)"

if [ -z "${current_name}" ] || [ -z "${current_code}" ]; then
    echo "Could not read the version from ${CATALOG}."
    exit 1
fi

major="${current_name%%.*}"
rest="${current_name#*.}"
minor="${rest%%.*}"
patch="${rest##*.}"

case "${mode}" in
    --minor)
        minor=$((minor + 1))
        patch=0
        ;;
    --major)
        major=$((major + 1))
        minor=0
        patch=0
        ;;
    *)
        patch=$((patch + 1))
        ;;
esac

new_name="${major}.${minor}.${patch}"
new_code=$((current_code + 1))

sed -i.bak \
    -e "s/^versionName\s*=.*/versionName = \"${new_name}\"/" \
    -e "s/^versionCode\s*=.*/versionCode = \"${new_code}\"/" \
    "${CATALOG}"
rm -f "${CATALOG}.bak"

echo "versionName ${current_name} -> ${new_name}"
echo "versionCode ${current_code} -> ${new_code}"
echo
echo "Now write the changelog entry for ${new_name} in CHANGELOG.md, commit, and tag it:"
echo "  git tag -a v${new_name} -m \"DayLog ${new_name}\" && git push origin v${new_name}"
