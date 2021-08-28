#!/bin/bash

#consts
EXT_NAME="sp-tray@esenliyim.com"
EXT_PATH="$HOME/.local/share/gnome-shell/extensions/"
SCRIPTPATH=`dirname $(realpath $0)`
SCRIPTNAME=`basename $0`

# clear existing dirs
[ ! -d $EXT_PATH ] && mkdir $EXT_PATH
[ -d $EXT_PATH$EXT_NAME ] && rm -rf $EXT_PATH$EXT_NAME

# create symlink
ln -s $SCRIPTPATH $EXT_PATH$EXT_NAME