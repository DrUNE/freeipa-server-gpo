#!/bin/bash
# One-time host preparation for the FreeIPA dev container. Run with sudo:
#   sudo .devcontainer/host-setup.sh
#
# 1. Sub-UID/GID ranges: rootless podman needs them to map the many system
#    users FreeIPA creates (dirsrv, ipaapi, kdcproxy, ...).
# 2. Lets unprivileged users bind port 443, so the container can publish the
#    Web UI on https://server.ipa.test/ (FreeIPA rejects other ports via its
#    Referer and Host checks).
# 3. Resolves server.ipa.test to the published port on this machine.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo" >&2; exit 1; }
TARGET_USER=${SUDO_USER:?Run through sudo from your normal account}

if ! grep -q "^$TARGET_USER:" /etc/subuid; then
    echo "$TARGET_USER:100000:65536" >> /etc/subuid
    echo "added /etc/subuid range for $TARGET_USER"
fi
if ! grep -q "^$TARGET_USER:" /etc/subgid; then
    echo "$TARGET_USER:100000:65536" >> /etc/subgid
    echo "added /etc/subgid range for $TARGET_USER"
fi

echo 'net.ipv4.ip_unprivileged_port_start = 443' > /etc/sysctl.d/90-ipa-gpo-dev.conf
echo 443 > /proc/sys/net/ipv4/ip_unprivileged_port_start
echo "unprivileged ports now start at 443"

if ! grep -q '[[:space:]]server\.ipa\.test\b' /etc/hosts; then
    echo '127.0.0.1 server.ipa.test' >> /etc/hosts
    echo "added server.ipa.test to /etc/hosts"
fi

sudo -u "$TARGET_USER" XDG_RUNTIME_DIR="/run/user/$(id -u "$TARGET_USER")" podman system migrate
echo "podman storage migrated for $TARGET_USER"
