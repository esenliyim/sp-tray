#!/bin/bash

#consts
EXT_NAME="sp-tray@esenliyim.com"
EXT_PATH="$HOME/.local/share/gnome-shell/extensions/"
SCRIPTPATH=`dirname $(realpath $0)`
SCRIPTNAME=`basename $0`

[ ! -d $EXT_PATH ] && mkdir $EXT_PATH
[ -d $EXT_PATH$EXT_NAME ] && rm -rf $EXT_PATH$EXT_NAME

echo $(basename $0)
rsync -rv $SCRIPTPATH $EXT_PATH$EXT_NAME --exclude=$SCRIPTNAME