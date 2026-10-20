#!/bin/bash
# Bring the dev container to "FreeIPA + freeipa-server-gpo, live sources" state.
# Safe to run repeatedly; VS Code runs it on every container start.
set -euo pipefail

WORKSPACE=${WORKSPACE:-/workspaces/freeipa-server-gpo}
DOMAIN=${IPA_DOMAIN:-ipa.test}
REALM=${IPA_REALM:-IPA.TEST}
ADMIN_PASSWORD=${IPA_ADMIN_PASSWORD:?IPA_ADMIN_PASSWORD is not set}
DS_PASSWORD=${IPA_DS_PASSWORD:?IPA_DS_PASSWORD is not set}
FQDN=$(hostname --fqdn)
STATE_DIR="$WORKSPACE/.devcontainer/.state"
LOG=/var/log/ipa-gpo-dev-setup.log

exec > >(tee -a "$LOG") 2>&1
log() { printf '\n==> %s\n' "$*"; }

log "Waiting for systemd"
systemctl is-system-running --wait >/dev/null 2>&1 || true
systemctl is-system-running || true

# Where FreeIPA itself lives (/usr/lib64/python3/site-packages on ALT).
SITELIB=$(python3 -c 'import ipaserver, os; print(os.path.dirname(os.path.dirname(ipaserver.__file__)))')

# devcontainer.json passes --hosts-file=image so podman does not copy the
# host's /etc/hosts (server.ipa.test -> 127.0.0.1). Enforce the mapping anyway
# for containers started without it: the IP must map to the server name only,
# both ways, otherwise ipa-server-install fails. /etc/hosts is a bind mount,
# so rewrite it in place.
IP=$(ip -4 -o addr show scope global | awk '{split($4, a, "/"); print a[1]; exit}')
HOSTS=$(awk -v ip="$IP" -v fqdn="$FQDN" \
    '$1 == ip { next } { for (i = 2; i <= NF; i++) if ($i == fqdn) next } 1' /etc/hosts)
printf '%s\n%s %s %s\n' "$HOSTS" "$IP" "$FQDN" "${FQDN%%.*}" > /etc/hosts

if [ ! -f /etc/ipa/default.conf ]; then
    log "Installing FreeIPA server $FQDN ($IP), realm $REALM. This takes several minutes."
    ipa-server-install --unattended \
        --hostname="$FQDN" --ip-address="$IP" \
        --domain="$DOMAIN" --realm="$REALM" \
        --ds-password="$DS_PASSWORD" --admin-password="$ADMIN_PASSWORD" \
        --no-ntp --no-host-dns --no-ssh --no-sshd
fi

log "Waiting for IPA services"
for _ in $(seq 1 60); do
    ipactl status >/dev/null 2>&1 && break
    sleep 2
done
ipactl status || true

log "Obtaining admin Kerberos ticket"
printf '%s\n' "$ADMIN_PASSWORD" | kinit admin >/dev/null
klist -s

if [ ! -f /var/lib/ipa-gpo-dev/installed ]; then
    log "Installing freeipa-server-gpo from the workspace"
    make -C "$WORKSPACE" install PREFIX=/usr PYTHON_SITELIBDIR="$SITELIB"
    systemctl restart oddjobd
    ipa-gpo-install --debuglevel=1
    mkdir -p /var/lib/ipa-gpo-dev && touch /var/lib/ipa-gpo-dev/installed
fi

log "Attaching live sources"
"$WORKSPACE/.devcontainer/scripts/dev-mounts.sh"

mkdir -p "$STATE_DIR"
cp /etc/ipa/ca.crt "$STATE_DIR/ipa-ca.crt"

cat <<MSG

FreeIPA dev server is ready.
  Web UI:  https://$FQDN/ipa/ui/   (admin / \$IPA_ADMIN_PASSWORD)
  CA cert: .devcontainer/.state/ipa-ca.crt
  UI edits in plugin/ui/grouppolicy/ are live: reload the browser page.
  After Python plugin edits run: ipa-dev-reload
MSG
