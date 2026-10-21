#!/bin/bash
# Bind workspace sources over the installed copies so edits take effect
# without reinstalling. Bind mounts vanish on container restart, so
# setup-ipa.sh calls this on every start.
set -euo pipefail

WORKSPACE=${WORKSPACE:-/workspaces/freeipa-server-gpo}
# Where FreeIPA itself lives (/usr/lib64/python3/site-packages on ALT).
SITELIB=$(python3 -c 'import ipaserver, os; print(os.path.dirname(os.path.dirname(ipaserver.__file__)))')

bind() {
    local source=$1 target=$2
    [ -e "$target" ] || { echo "skip: $target is not installed"; return; }
    mountpoint -q "$target" && umount "$target"
    mount --bind "$source" "$target"
    echo "bound $target -> $source"
}

bind "$WORKSPACE/frontend/dist" /usr/share/ipa/ui/js/plugins/chain
for plugin in gpo chain gpmaster; do
    bind "$WORKSPACE/plugin/ipaserver/plugins/$plugin.py" "$SITELIB/ipaserver/plugins/$plugin.py"
done
bind "$WORKSPACE/ipa_gpo_install" "$SITELIB/ipa_gpo_install"

# Disable browser caching of the plugin so a page reload picks up edits.
HTTPD_CONF_DIR=$(python3 -c 'from ipaplatform.paths import paths; print(paths.HTTPD_CONF_D_DIR)')
DEV_CONF="$HTTPD_CONF_DIR/zz-ipa-gpo-dev.conf"
cat > "$DEV_CONF" <<'CONF'
# freeipa-server-gpo dev container: never cache the GPO UI plugin.
# ipa.conf sets a one-year mod_expires lifetime for /ipa/ui; switch it off here.
<LocationMatch "^/ipa/ui/js/plugins/chain/">
    ExpiresActive Off
    FileETag None
    <IfModule mod_headers.c>
        Header unset Cache-Control
        Header unset Expires
        Header unset ETag
        Header always set Cache-Control "no-store, must-revalidate"
        RequestHeader unset If-Modified-Since
        RequestHeader unset If-None-Match
    </IfModule>
</LocationMatch>
CONF
echo "wrote $DEV_CONF"

install -m 755 "$WORKSPACE/.devcontainer/scripts/ipa-dev-reload" /usr/local/bin/ipa-dev-reload
ipa-dev-reload
