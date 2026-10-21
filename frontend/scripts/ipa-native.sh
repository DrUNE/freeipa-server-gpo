#!/bin/bash
# Runs the whole mock-based suite (unit + integration) inside the FreeIPA dev container, which has
# what a plain host lacks: the real libadmix, the SDMX catalog, the policy definitions and
# FreeIPA's own jQuery. Tests that are skipped on a plain host run here, so nothing is skipped.
# Call after scripts/ipa-up.sh (npm run test:ipa does). The workspace is bind-mounted, so the
# container uses the host's node_modules and frontend/.test-root.
set -euo pipefail

CONTAINER=${IPA_CONTAINER:-freeipa-gpo-dev}
WORKSPACE=/workspaces/freeipa-server-gpo

# The image can be older than the spec; fail with a clear message instead of cryptic
# ImportErrors from the native-contract tests.
admix=$(podman exec "$CONTAINER" rpm -q --qf '%{VERSION}' python3-module-admix)
case "$admix" in
    0.3.*) ;;
    *) echo "Container has python3-module-admix $admix, but ipa-gpo-install.spec requires 0.3.x." >&2
       echo "Update it: podman exec $CONTAINER bash -c 'mkdir -p /var/lib/apt/lists/partial && apt-get update && apt-get install -y python3-module-admix'" >&2
       echo "(or rebuild the image: the Containerfile installs whatever the repository offers at build time)." >&2
       exit 1 ;;
esac

# Chromium: the container image has the system libraries (package chromium); Playwright needs its own build on top.
if ! podman exec "$CONTAINER" bash -c 'rpm -q chromium >/dev/null'; then
    echo "Container lacks the chromium package: podman exec $CONTAINER apt-get install -y chromium (or rebuild the image)." >&2
    exit 1
fi
podman exec "$CONTAINER" bash -c "cd $WORKSPACE/frontend && npx playwright install chromium >/dev/null"

# Chromium needs a real /dev/shm; containers created before devcontainer.json set --shm-size have 64 MB.
podman exec "$CONTAINER" bash -c 'mount -o remount,size=2g /dev/shm 2>/dev/null || true'

echo "== unit + integration inside $CONTAINER (admix $admix)"
podman exec -e FORCE_COLOR=0 "$CONTAINER" bash -c "cd $WORKSPACE/frontend \
    && node scripts/build-test-root.mjs >/dev/null \
    && npx vitest run --project unit --project integration --project stories --reporter=default --reporter=json --outputFile.json=test-results.json \
    && node scripts/assert-no-skips.mjs"
