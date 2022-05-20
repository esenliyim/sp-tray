# sp-tray

sp-tray is a very simple GNOME Shell extension that displays current track information in the system tray using Spotify's dbus interface without using the web API. There are no playback controls and/or album art display, and there never will be. This is intended to be nothing more than a simple label for Spotify only.

Screenshot:
![tray](https://raw.githubusercontent.com/esenliyim/sp-tray/multi-gtk/example.png)

## Features

- Shows the title, artist and album information, and allows you to customize how it's shown. Can set separate display formats for podcasts and songs.

- Can choose which part of the top panel it will live in

- Uses Spotify's exposed dbus interface to fetch metadata, doesn't use the web API or require a premium account

- Works on Wayland as well as X

## Installation

Preferably, you should:

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][extlink]

Alternatively, you could:

1. Clone this repo anywhere on your computer

2. Run the install script with `./<path_to_dir>/install.sh`. By default the files are copied into a new directory under `~/.local/share/gnome-shell/extensions/`.

3. Restart gnome-shell (xorg) and activate the extension via gnome-tweaks. Gnome-shell cannot be restarted under Wayland, so you may have to log out and back in.

## Dependencies

- `libgtop` and gnome-tweaks as usual to load/install GNOME shell extensions.

## Notes

I haven't tested it with any shell version older than 3.36 because I can't be bothered. If you have tested it and can confirm that it works, let me know.

English, German and Turkish translations are provided by me. If you'd like to contribute translations, please contact me.

## License

GPLv2+

[extlink]: https://extensions.gnome.org/extension/4472/spotify-tray/
