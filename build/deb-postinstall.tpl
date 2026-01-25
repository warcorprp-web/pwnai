#!/bin/bash

if type update-alternatives 2>/dev/null >&1; then
    # Remove previous link if it doesn't use update-alternatives
    if [ -L '/usr/bin/iskra-terminal' -a -e '/usr/bin/iskra-terminal' -a "`readlink '/usr/bin/iskra-terminal'`" != '/etc/alternatives/iskra-terminal' ]; then
        rm -f '/usr/bin/iskra-terminal'
    fi
    update-alternatives --install '/usr/bin/iskra-terminal' 'iskra-terminal' '/opt/iskra-terminal/iskra-terminal' 100 || ln -sf '/opt/iskra-terminal/iskra-terminal' '/usr/bin/iskra-terminal'
else
    ln -sf '/opt/iskra-terminal/iskra-terminal' '/usr/bin/iskra-terminal'
fi

chmod 4755 '/opt/iskra-terminal/chrome-sandbox' || true

if hash update-mime-database 2>/dev/null; then
    update-mime-database /usr/share/mime || true
fi

if hash update-desktop-database 2>/dev/null; then
    update-desktop-database /usr/share/applications || true
fi
