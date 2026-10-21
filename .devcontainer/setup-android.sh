#!/usr/bin/env bash
# Installs the Android SDK into the Codespace.
#
# The SDK is not in any official devcontainer image, so it is installed here. The work itself is
# in scripts/install-android-sdk.sh, which the CI workflows use too, so the Codespace and CI
# always end up with the same toolchain.
#
# This script must never fail the Codespace creation. If the SDK cannot be installed the
# container still comes up and the error is printed, because a half-built container is more
# useful than no container: the SDK can be installed by hand afterwards.
set -uo pipefail

ANDROID_SDK_ROOT="/usr/local/lib/android/sdk"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail() {
    echo ""
    echo "!! Android SDK setup did not complete: $1"
    echo "!! The Codespace is still usable. Re-run this script once the cause is fixed:"
    echo "!!   bash .devcontainer/setup-android.sh"
    echo ""
    exit 0
}

echo "Installing the tools the SDK installer needs..."
sudo apt-get update -qq || true
sudo apt-get install -y --no-install-recommends unzip zip curl ca-certificates || \
    fail "could not install unzip/curl"

sudo mkdir -p "${ANDROID_SDK_ROOT}"
sudo chown -R "$(id -u):$(id -g)" "${ANDROID_SDK_ROOT}"

export ANDROID_HOME="${ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT}"

if ! bash "${REPO_ROOT}/scripts/install-android-sdk.sh" "${ANDROID_SDK_ROOT}"; then
    fail "the SDK installer failed"
fi

# Put the Android CLI on the PATH for every shell, including the ones `gh codespace ssh` opens.
# It is the supported way to install SDK packages and to drive an emulator or a device.
sudo ln -sf "${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/android" /usr/local/bin/android
sudo ln -sf "${ANDROID_SDK_ROOT}/platform-tools/adb" /usr/local/bin/adb 2>/dev/null || true

# Gradle reads the SDK location from local.properties. ANDROID_HOME would do, but writing the
# file keeps the build working in a plain shell that has not inherited the container's
# environment - which is how the CI and the gh CLI both invoke it.
echo "sdk.dir=${ANDROID_SDK_ROOT}" > "${REPO_ROOT}/local.properties"

echo "Android SDK ready."
android sdk list 2>&1 | tail -20 || true
