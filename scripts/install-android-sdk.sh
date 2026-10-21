#!/usr/bin/env bash
# Installs the Android SDK and its command line tools.
#
# This is the one place the SDK is installed. The Codespace and the CI workflows both call it, so
# they always end up with the same toolchain.
#
# The Android CLI (`android sdk install`) is used rather than `sdkmanager`, which Google has
# deprecated in favour of it.
#
# Usage: bash scripts/install-android-sdk.sh [sdk-root]
set -uo pipefail

SDK_ROOT="${1:-${ANDROID_SDK_ROOT:-${ANDROID_HOME:-/usr/local/lib/android/sdk}}}"
CMDLINE_TOOLS_VERSION="16111833"
BUILD_TOOLS_VERSION="${ANDROID_BUILD_TOOLS:-36.0.0}"
PLATFORM_VERSION="${ANDROID_PLATFORM:-36}"

if [ -d "${SDK_ROOT}/platforms/android-${PLATFORM_VERSION}" ] \
    && [ -d "${SDK_ROOT}/build-tools/${BUILD_TOOLS_VERSION}" ]; then
    echo "Android SDK ${PLATFORM_VERSION} is already installed at ${SDK_ROOT}."
    exit 0
fi

mkdir -p "${SDK_ROOT}/cmdline-tools"

TMP_DIR="$(mktemp -d)"
echo "Downloading the Android command line tools ${CMDLINE_TOOLS_VERSION}..."
if ! curl -fsSL -o "${TMP_DIR}/cmdline-tools.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip"; then
    rm -rf "${TMP_DIR}"
    echo "Could not download the command line tools." >&2
    exit 1
fi

unzip -q "${TMP_DIR}/cmdline-tools.zip" -d "${TMP_DIR}/unzipped" || {
    rm -rf "${TMP_DIR}"
    echo "Could not unpack the command line tools." >&2
    exit 1
}

rm -rf "${SDK_ROOT}/cmdline-tools/latest"
mv "${TMP_DIR}/unzipped/cmdline-tools" "${SDK_ROOT}/cmdline-tools/latest"
rm -rf "${TMP_DIR}"

export ANDROID_HOME="${SDK_ROOT}"
export ANDROID_SDK_ROOT="${SDK_ROOT}"
export PATH="${SDK_ROOT}/cmdline-tools/latest/bin:${SDK_ROOT}/platform-tools:${PATH}"

echo "Installing platform ${PLATFORM_VERSION} and build tools ${BUILD_TOOLS_VERSION}..."
if ! android sdk install \
    "platforms/android-${PLATFORM_VERSION}" \
    "build-tools/${BUILD_TOOLS_VERSION}" \
    "platform-tools"; then
    echo "The Android CLI could not install the SDK." >&2
    exit 1
fi

echo "Android SDK ready at ${SDK_ROOT}."
