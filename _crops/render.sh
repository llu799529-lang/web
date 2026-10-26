#!/bin/bash
# usage: render.sh <html-file> <out-png>
F="$1"; OUT="$2"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1.4722 --window-size=360,638 \
  --screenshot="$OUT" "file:///$(echo "$F" | sed 's|^C:/|/C:/|')" 2>/dev/null | tail -1
