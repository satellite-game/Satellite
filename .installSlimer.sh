#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
    cd ~
    brew install slimerjs
    curl https://ftp.mozilla.org/pub/mozilla.org/firefox/releases/24.2.0esr/mac/en-US/Firefox%2024.2.0esr.dmg -o firefox_24.2.0esr.dmg
    open firefox_24.2.0esr.dmg
    echo "export SLIMERJSLAUNCHER=/Applications/Firefox.app/Contents/MacOS/firefox" >> ~/.bash_profile
    echo "export SLIMERJS_BIN=/Applications/Firefox.app/Contents/MacOS/firefox" >> ~/.bash_profile
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # No need for support
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    export SLIMERJSLAUNCHER="/cygdrive/c/program files/mozilla firefox/firefox.exe"
    SET SLIMERJSLAUNCHER="c:\Program Files\Mozilla Firefox\firefox.exe"
fi