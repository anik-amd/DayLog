#!/usr/bin/env bash
# Installs the Android SDK into the Codespace.
#
# The SDK is not in any official devcontainer image, so it is installed here. Everything is
# pinned to exact versions so a rebuild produces the same toolchain every time.
#
# The Android CLI (`android sdk install`) is used rather than `sdkmanager`, which Google has
# deprecated in favour of it.
#
# This script must never fail the Codespace creation. If the SDK cannot be installed the
# container still comes up and the error is printed, because a half-built container is more
# useful than no container: the SDK can be installed by hand afterwards.
set -uo pipefail

ANDROID_SDK_ROOT="/usr/local/lib/android/sdk"
CMDLINE_TOOLS_VERSION="16111833"
BUILD_TOOLS_VERSION="36.0.0"
PLATFORM_VERSION="36"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail() {
    echo ""
    echo "!! Android SDK setup did not complete: $1"
    echo "!! The Codespace is still usable. Re-run this script once the cause is fixed:"
    echo "!!   bash .devcontainer/setup-android.sh"
    echo ""
    exit 0
}

if [ -d "${ANDROID_SDK_ROOT}/platforms/android-${PLATFORM_VERSION}" ] \
    && [ -d "${ANDROID_SDK_ROOT}/build-tools/${BUILD_TOOLS_VERSION}" ]; then
    echo "Android SDK already present, skipping."
    exit 0
fi

echo "Installing the tools the SDK installer needs..."
sudo apt-get update -qq || true
sudo apt-get install -y --no-install-recommends unzip zip curl ca-certificates || \
    fail "could not install unzip/curl"

sudo mkdir -p "${ANDROID_SDK_ROOT}/cmdline-tools"
sudo chown -R "$(id -u):$(id -g)" "${ANDROID_SDK_ROOT}"

TMP_DIR="$(mktemp -d)"
echo "Downloading the Android command line tools..."
if ! curl -fsSL -o "${TMP_DIR}/cmdline-tools.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip"; then
    rm -rf "${TMP_DIR}"
    fail "could not download the command line tools"
fi

unzip -q "${TMP_DIR}/cmdline-tools.zip" -d "${TMP_DIR}/unzipped" || {
    rm -rf "${TMP_DIR}"
    fail "could not unpack the command line tools"
}

rm -rf "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
mv "${TMP_DIR}/unzipped/cmdline-tools" "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
rm -rf "${TMP_DIR}"

export ANDROID_HOME="${ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT}"
export PATH="${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}"

# Put the Android CLI on the PATH for every shell, including the ones `gh codespace ssh` opens.
# It is the supported way to install SDK packages and to drive an emulator or a device.
sudo ln -sf "${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/android" /usr/local/bin/android
sudo ln -sf "${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/adb" /usr/local/bin/adb 2>/dev/null || true
sudo ln -sf "${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager" /usr/local/bin/sdkmanager 2>/dev/null || true
sudo ln -sf "${ANDROID_SDK_ROOT}/platform-tools/adb" /usr/local/bin/adb 2>/dev/null || true

echo "Installing platform ${PLATFORM_VERSION} and build tools ${BUILD_TOOLS_VERSION}..."
if ! android sdk install \
    "platforms/android-${PLATFORM_VERSION}" \
    "build-tools/${BUILD_TOOLS_VERSION}" \
    "platform-tools"; then
    fail "the Android CLI could not install the platform"
fi

# Gradle reads the SDK location from local.properties. ANDROID_HOME would do, but writing the
# file keeps the build working in a plain shell that has not inherited the container's
# environment - which is how the CI and the gh CLI both invoke it.
echo "sdk.dir=${ANDROID_SDK_ROOT}" > "${REPO_ROOT}/local.properties"

echo "Android SDK ready."
android sdk list 2>&1 | tail -20 || true
