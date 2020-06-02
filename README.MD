
# sp-tray

sp-tray is GNOME Shell extension that displays current track information using Spotify's dbus interface without using the web API. Like this. 
![tray][tray]

Tested on GNOME 3.36.2

## Installation 

1. Copy [wandernauta's script sp][sp_repo]
to /\<user>/home directory. 

2. Make the script executable. Test that it works with `./<script_name>.sh current`.

3. Clone this repo to /\<user>/.local/share/gnome-shell/extensions/sp-tray@esenliyim.com

4. Restart gnome shell and enable the extension via gnome-tweaks under the "extensions" tab


## Dependencies 

* [ligbtop][libgtop] to load/install shell extensions

* dbus-send for the sp bash script

## TODO

* Move on to GDBus

* Icons?

## License 

MIT

[sp_repo]: https://gist.github.com/wandernauta/6800547

[libgtop]: https://developer.gnome.org/libgtop/stable/

[tray][https://github.com/esenliyim/sp-tray/blob/master/tray.png]