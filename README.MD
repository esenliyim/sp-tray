
# sp-tray

sp-tray is GNOME Shell extension that displays current track information using Spotify's dbus interface without using the web API. Like this: 
![tray](https://github.com/esenliyim/sp-tray/blob/master/tray.png)

## Features

- Shows the track and artist on the system tray

- Allows you to customize how the information is displayed

- It uses Spotify's exposed dbus interface to fetch metadata, doesn't use the web API

## Installation 

Preferably, you should install it from extensions.gnome.org

Alternatively, you could clone this repo anywhere on your computer and run the installation script, which creates a symbolic link in `$HOME/.local/share/gnome-shell/extensions`

### (preferred) Gnome extensions:

1. Go to LINK

2. Install as usual

### From GitHub:

1. Clone this repo anywhere on your computer

2. Run the install script with `./<path_to_dir>/install.sh`

2. Restart gnome shell and enable the extension via gnome-tweaks under the "extensions" tab

## Dependencies 

* `ligbtop` as usual to load/install GNOME shell extensions.

## TODO

* locale test
* clean install script -> SYMLINK
* album option
* metadata order in tray

## License 

MIT