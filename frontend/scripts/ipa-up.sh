#!/bin/bash
# Brings the FreeIPA dev container (.devcontainer/) to the "ready, live sources
# attached" state for `npm run test:ipa`. Idempotent; leaves the container running.
# Prerequisites: .devcontainer/host-setup.sh was run once, and the container
# `freeipa-gpo-dev` exists (created by "Dev Containers: Reopen in Container").
set -euo pipefail

CONTAINER=${IPA_CONTAINER:-freeipa-gpo-dev}
WORKSPACE=/workspaces/freeipa-server-gpo

if ! podman container exists "$CONTAINER"; then
    echo "Container $CONTAINER does not exist. Create it once with VS Code 'Dev Containers: Reopen in Container'" >&2
    echo "(see .devcontainer/devcontainer.json); the first start installs FreeIPA, about 10 minutes." >&2
    exit 1
fi

if [ "$(podman inspect -f '{{.State.Running}}' "$CONTAINER")" != true ]; then
    podman network exists ipa-gpo-dev || podman network create --subnet 10.89.77.0/24 ipa-gpo-dev >/dev/null
    podman start "$CONTAINER" >/dev/null
fi

# setup-ipa.sh waits for systemd and IPA, re-binds the workspace sources, restarts httpd.
podman exec \
    -e IPA_DOMAIN=ipa.test -e IPA_REALM=IPA.TEST \
    -e IPA_ADMIN_PASSWORD="${IPA_ADMIN_PASSWORD:-DevAdmin-Password-1!}" \
    -e IPA_DS_PASSWORD="${IPA_DS_PASSWORD:-DevDirectory-Password-1!}" \
    "$CONTAINER" "$WORKSPACE/.devcontainer/scripts/setup-ipa.sh" >/dev/null

echo "FreeIPA is ready: https://server.ipa.test/ipa/ui/"
