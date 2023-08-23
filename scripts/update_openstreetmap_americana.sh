#!/usr/bin/bash

# Copies files from openstreetmap-americana project

if [ $# -ne 1 ]; then
    echo "Usage: $0 <path to openstreetmap-americana project>"
    exit 1
fi

SRC="$1"
if [ ! -d "$SRC" ]; then
    echo "Error: $SRC is not a directory"
    exit 1
fi

DEST="$(dirname "$0")/../src/thirdparty/openstreetmap-americana"

mkdir -p "$DEST/src/constants"
mkdir -p "$DEST/src/js"
mkdir -p "$DEST/src/layer"
mkdir -p "$DEST/scripts"
mkdir -p "$DEST/icons"
cp "$SRC"/src/constants/color.js "$DEST"/src/constants/color.js
cp "$SRC"/src/js/shield_defs.js "$DEST"/src/js/shield_defs.js
cp "$SRC"/src/js/shield_format.ts "$DEST"/src/js/shield_format.ts
cp "$SRC"/src/layer/highway_shield.js "$DEST"/src/layer/highway_shield.js
cp "$SRC"/scripts/sprites.js "$DEST"/scripts/sprites.js

rm "$DEST"/icons/shield*.svg
cp "$SRC"/icons/shield*.svg "$DEST"/icons/
