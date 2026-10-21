#!/usr/bin/env bash
# Installs the Android SDK into the Codespace.
#
# The SDK is not in any official devcontainer image, so it is installed here. Everything is
# pinned to exact versions so a rebuild produces the same toolchain every time.
set -euo pipefail

ANDROID_SDK_ROOT="/usr/local/lib/android/sdk"
CMDLINE_TOOLS_VERSION="16111833"
BUILD_TOOLS_VERSION="36.0.0"
PLATFORM_VERSION="36"

if [ -d "${ANDROID_SDK_ROOT}/platforms/android-${PLATFORM_VERSION}" ]; then
    echo "Android SDK already present, skipping."
    exit 0
fi

echo "Installing Android SDK ${PLATFORM_VERSION} (build-tools ${BUILD_TOOLS_VERSION})..."

sudo mkdir -p "${ANDROID_SDK_ROOT}/cmdline-tools"
sudo chown -R "$(id -u):$(id -g)" "${ANDROID_SDK_ROOT}"

TMP_DIR="$(mktemp -d)"
cd "${TMP_DIR}"

curl -fsSL -o cmdline-tools.zip \
    "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip"

unzip -q cmdline-tools.zip -d "${TMP_DIR}/unzipped"
rm -rf "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
mv "${TMP_DIR}/unzipped/cmdline-tools" "${ANDROID_SDK_ROOT}/cmdline-tools/latest"
rm -rf "${TMP_DIR}"

export ANDROID_HOME="${ANDROID_SDK_ROOT}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT}"
export PATH="${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}"

yes | sdkmanager --licenses > /dev/null 2>&1 || true

sdkmanager --install \
    "platform-tools" \
    "platforms;android-${PLATFORM_VERSION}" \
    "build-tools;${BUILD_TOOLS_VERSION}"

echo "Android SDK ready."
sdkmanager --list_installed || true
