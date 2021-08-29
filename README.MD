
# sp-tray

sp-tray is GNOME Shell extension that displays current track information in the system tray using Spotify's dbus interface without using the web API. Like this: 
![tray](https://raw.githubusercontent.com/esenliyim/sp-tray/multi-gtk/example.png)

## Features

- Shows the track, artist and album information, and allows you to customize how it's shown

- Works on both Wayland and X11

- It uses Spotify's exposed dbus interface to fetch metadata, doesn't use the web API

- No premium account necessary

## Installation 

Preferably, you should:

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][extlink]


Alternatively, you could:

1. Clone this repo anywhere on your computer

2. Run the install script with `./<path_to_dir>/install.sh`

2. On X11, restart gnome-shell and activate the extension via gnome-tweaks. On Wayland you might have to log out and back in.

## Dependencies 

* `ligbtop` and gnome-tweaks as usual to load/install GNOME shell extensions.

## Translations 

I have provided English, German and Turkish translations. If you'd like to contribute translations, please contact me. There are like 7 strings in total.

## License 

GPLv2+

[extlink]: https://extensions.gnome.org/extension/4472/spotify-tray/
