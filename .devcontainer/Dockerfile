FROM mcr.microsoft.com/devcontainers/java:1-21-bookworm

# The base image ships a Yarn APT source whose signing key has expired. Every
# `apt-get update` therefore exits non-zero on it, which breaks every devcontainer
# feature that installs a package — and a failed feature aborts the whole image
# build, leaving the Codespace on the bare fallback image with no JDK.
#
# Removing the stale source before anything else runs keeps the feature builds
# working. Yarn is not needed to build an Android project.
USER root

RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        unzip \
        zip \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

USER vscode
