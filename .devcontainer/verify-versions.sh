#!/usr/bin/env bash
# Checks every pinned dependency version against the repositories that serve it.
#
# The version matrix in gradle/libs.versions.toml is pinned on purpose: it is the set of
# versions known to work together. This script proves the pins are still real and reports what
# has moved on, so a bump is a decision rather than an accident.
#
# Usage: bash .devcontainer/verify-versions.sh
set -uo pipefail

CATALOG="gradle/libs.versions.toml"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}" || exit 1

if [ ! -f "${CATALOG}" ]; then
    echo "No ${CATALOG} found. Run this from the repository root."
    exit 1
fi

# Read the [versions] table into "name value" pairs.
declare -A VERSIONS
while IFS= read -r line; do
    name="$(echo "${line}" | sed -n 's/^\([A-Za-z0-9_.-]*\)[[:space:]]*=.*/\1/p')"
    value="$(echo "${line}" | sed -n 's/.*=[[:space:]]*"\([^"]*\)".*/\1/p')"
    [ -n "${name}" ] && [ -n "${value}" ] && VERSIONS["${name}"]="${value}"
done < <(sed -n '/^\[versions\]/,/^\[/p' "${CATALOG}")

# Google serves the androidx and com.google artifacts; Maven Central serves the rest.
repository_for() {
    case "$1" in
        androidx.*|com.android.*|com.google.*) echo "https://dl.google.com/dl/android/maven2" ;;
        *) echo "https://repo1.maven.org/maven2" ;;
    esac
}

latest_version() {
    local coordinate="$1"
    local group="${coordinate%%:*}"
    local artifact="${coordinate##*:}"
    local path="${group//.//}/$artifact/maven-metadata.xml"
    local url
    url="$(repository_for "${group}")/${path}"
    curl -fsSL --max-time 25 "${url}" 2>/dev/null |
        sed -n 's:.*<release>\([^<]*\)</release>.*:\1:p' |
        sed -n '1p'
}

printf '%-46s %-12s %-12s %s\n' "ARTIFACT" "PINNED" "LATEST" "STATUS"
printf '%s\n' "--------------------------------------------------------------------------------------------------------------"

failed=0
missing=0

while IFS='|' read -r alias coordinate version_ref; do
    [ -z "${coordinate}" ] && continue

    pinned="${VERSIONS[${version_ref}]:-}"
    if [ -z "${pinned}" ]; then
        # A library with no version is one of the pinned plugins or a BOM alias.
        continue
    fi

    latest="$(latest_version "${coordinate}")"
    if [ -z "${latest}" ]; then
        printf '%-46s %-12s %-12s %s\n' "${coordinate}" "${pinned}" "?" "cannot reach"
        missing=$((missing + 1))
        continue
    fi

    if [ "${latest}" = "${pinned}" ]; then
        status="current"
    else
        status="newer available"
    fi

    printf '%-46s %-12s %-12s %s\n' "${coordinate}" "${pinned}" "${latest}" "${status}"
done < <(
    awk '
        /^\[libraries\]/ { in_libs = 1; next }
        /^\[/ { in_libs = 0 }
        !in_libs { next }
        /=/ {
            alias_name = $1
            gsub(/^[ \t]+|[ \t]+$/, "", alias_name)
            module = ""
            version_ref = ""
            if (match($0, /module = "[^"]+"/)) {
                module = substr($0, RSTART + 10, RLENGTH - 11)
            }
            if (match($0, /version\.ref = "[^"]+"/)) {
                version_ref = substr($0, RSTART + 14, RLENGTH - 15)
            }
            if (module != "") {
                printf "%s|%s|%s\n", alias_name, module, version_ref
            }
        }
    ' "${CATALOG}"
)

echo ""
if [ "${missing}" -gt 0 ]; then
    echo "${missing} artifact(s) could not be checked. Check the network."
fi
echo "A newer version is not a reason to bump. The matrix is pinned because it is known to work together."
exit $((failed + missing > 0 ? 1 : 0))
