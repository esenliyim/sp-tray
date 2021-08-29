#!/bin/bash

#consts
EXT_NAME="sp-tray@sp-tray.esenliyim.github.com"
EXT_PATH="$HOME/.local/share/gnome-shell/extensions/"
SCRIPTPATH=`dirname $(realpath $0)`
SCRIPTNAME=`basename $0`

# clear existing dirs
[ ! -d $EXT_PATH ] && mkdir $EXT_PATH
[ -d $EXT_PATH$EXT_NAME ] && rm -rf $EXT_PATH$EXT_NAME

# copy files
# TODO filter pls
cp -r $SCRIPTPATH $EXT_PATH$EXT_NAME