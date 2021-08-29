
# sp-tray

sp-tray is GNOME Shell extension that displays current track information in the system tray using Spotify's dbus interface without using the web API. Like this: 
![tray](https://github.com/esenliyim/sp-tray/blob/master/tray.png)

## Features

- Shows the track, artist and album information, and allows you to customize how it's shown

- Works on both Wayland and X11

- It uses Spotify's exposed dbus interface to fetch metadata, doesn't use the web API

- No premium account necessary

## Installation 

Preferably, you should install it from extensions.gnome.org

Alternatively, you could clone this repo anywhere on your computer and run the installation script, which creates a symbolic link in `$HOME/.local/share/gnome-shell/extensions`

### Gnome extensions:

1. Go to LINK

2. Install as you'd install any other extension

### From GitHub:

1. Clone this repo anywhere on your computer

2. Run the install script with `./<path_to_dir>/install.sh`

2. On X11, restart gnome-shell and activate the extension via gnome-tweaks. On Wayland you might have to log out and back in.

## Dependencies 

* `ligbtop` as usual to load/install GNOME shell extensions.

## Translations 

I have provided English, German and Turkish translations. If you'd like to contribute translations, please contact me. There are like 7 strings in total.

## TODO

* fix //HACKs
* code compliance with extensions.gnome

## License 

GPLv2+