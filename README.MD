
# sp-tray

sp-tray is GNOME Shell extension that displays current track information using Spotify's dbus interface without using the web API. Like this. 
![tray](https://github.com/esenliyim/sp-tray/blob/master/tray.png)

## Installation 

From GitHub:

1. Clone this repo anywhere on your computer

2. Run the install script from anywhere with `./<path_to_dir>/install.sh`

2. Restart gnome shell and enable the extension via gnome-tweaks under the "extensions" tab

Or from my ppa:

1. `sudo add-apt-repository ppa:esenliyim/ubuntu-things`

2. `sudo apt update`

3. `sudo apt install sp-tray`

## Dependencies 

* [ligbtop][libgtop] to load/install shell extensions. `sudo apt install libgtop2-dev`

## TODO

* Icons?

## License 

MIT

[libgtop]: https://developer.gnome.org/libgtop/stable/