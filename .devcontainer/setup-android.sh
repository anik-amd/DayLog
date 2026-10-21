#!/usr/bin/env bash
# Installs the Android SDK into the Codespace.
#
# The SDK is not in any official devcontainer image, so it is installed here. Everything is
# pinned to exact versions so a rebuild produces the same toolchain every time.
#
# This script must never fail the Codespace creation. If the SDK cannot be installed the
# container still comes up and the error is printed, because a half-built container is more
# useful than no container: the SDK can be installed by hand afterwards.
set -uo pipefail

ANDROID_SDK_ROOT="/usr/local/lib/android/sdk"
CMDLINE_TOOLS_VERSION="16111833"
BUILD_TOOLS_VERSION="36.0.0"
PLATFORM_VERSION="36"

fail() {
    echo ""
    echo "!! Android SDK setup did not complete: $1"
    echo "!! The Codespace is still usable. Re-run this script once the cause is fixed:"
    echo "!!   bash .devcontainer/setup-android.sh"
    echo ""
    exit 0
}

if [ -d "${ANDROID_SDK_ROOT}/platforms/android-${PLATFORM_VERSION}" ]; then
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
cd "${TMP_DIR}" || fail "could not create a temporary directory"

echo "Downloading the Android command line tools..."
if ! curl -fsSL -o cmdline-tools.zip \
    "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip"; then
    rm -rf "${TMP_DIR}"
    fail "could not download the command line tools"
fi

unzip -q cmdline-tools.zip -d "${TMP_DIR}/unzipped" || {
    rm -rf "${TMP_DIR}"
    fail "could not unpack the command line tools"
}

rm -rf "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
mv "${TMP_DIR}/unzipped/cmdline-tools" "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
rm -rf "${TMP_DIR}"

export ANDROID_HOME="${ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT}"
export PATH="${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}"

echo "Accepting the SDK licences..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo "Installing platform ${PLATFORM_VERSION} and build tools ${BUILD_TOOLS_VERSION}..."
if ! sdkmanager --install \
    "platform-tools" \
    "platforms;android-${PLATFORM_VERSION}" \
    "build-tools;${BUILD_TOOLS_VERSION}"; then
    fail "sdkmanager could not install the platform"
fi

echo "Android SDK ready."
sdkmanager --list_installed || true
