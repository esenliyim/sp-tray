// Copyright(C) 2021  Emre Şenliyim

// This program is free software: you can redistribute it and / or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

// This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
// GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
// along with this program.If not, see < http://www.gnu.org/licenses/>.

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const { St, Clutter, GObject, GLib, Gio } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;
let settings = ExtensionUtils.getSettings();

//dbus constants
const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";

const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
</interface>
</node>`;

const freedesktopDbus = `<node>
<interface name="org.freedesktop.DBus.Properties">
    <method name="Get">
        <arg type="s" direction="in" name="interface_name"/>
        <arg type="s" direction="in" name="property_name"/>
        <arg type="v" direction="out" name="value"/>
    </method>
</interface>
</node>`;

const spotifyProxyWrapper = Gio.DBusProxy.makeProxyWrapper(spotifyDbus);
const freedesktopProxyWrapper = Gio.DBusProxy.makeProxyWrapper(freedesktopDbus);

let spotifyProxy = spotifyProxyWrapper(Gio.DBus.session, dest, path);
let freedesktopProxy = freedesktopProxyWrapper(Gio.DBus.session, dest, path);

let panelButtonText;

var SpTrayButton = GObject.registerClass(
    { GTypeName: 'SpTrayButton' },
    class SpTrayButton extends PanelMenu.Button {

        _init() {
            super._init(null, Me.metadata.name);

            this.ui = new Map();

            this._initSettings();
            this._initUi();

            this.updateText();
        }

        _initSettings() {
             // the display on the system tray is instantly updated when the settings are changed
            settings.connect(`changed::paused`, this.updateText);
            settings.connect(`changed::off`, this.updateText);
            settings.connect(`changed::hidden-when-inactive`, this.updateText);
            settings.connect(`changed::display-format`, this.updateText);
        }

        _initUi() {
            const box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            // the 'text' variable below is what's actually shown on the tray
            panelButtonText = new St.Label({
                style_class: "taskbarPanelText",
                text: settings.get_string('starting'),
                y_align: Clutter.ActorAlign.CENTER
            });

            this.ui.set(
                'label',
                panelButtonText,
            );

            this.ui.forEach(element => box.add_child(element));
            this.ui.set('box', box);

            // listen to spotify status changes to update the tray display immediately. no busy waiting
            spotifyProxy.connect("g-properties-changed", this.updateText);

            // launch the settings menu when the tray display is clicked
            this.connect('button-press-event', () => {
                imports.misc.extensionUtils.openPrefs();
            });

            this.add_child(box);
        }

        destroy() {
            //TODO disconnects
            settings.disconnect(`changed::paused`, this.updateText);
            settings.disconnect(`changed::off`, this.updateText);
            settings.disconnect(`changed::hidden-when-inactive`, this.updateText);
            settings.disconnect(`changed::display-format`, this.updateText);
            spotifyProxy.disconnect("g-properties-changed", this.updateText);
            
            this.ui.forEach(element => element.destroy());
            super.destroy();
        }

        // update the text on the tray display
        updateText() {
            let status = typeof(spotifyProxy.PlaybackStatus);

            if (status !== 'string') {
                let hidden = settings.get_boolean("hidden-when-inactive");
                //HACK
                panelButtonText.set_text(hidden ? "" : settings.get_string("off"));
            } else {
                let status = spotifyProxy.PlaybackStatus;
                let metadata = spotifyProxy.Metadata;

                if (status == "Paused") {
                    let hidden = settings.get_boolean("hidden-when-paused");
                    //HACK
                    panelButtonText.set_text(hidden ? "" : settings.get_string("paused"));
                } else {
                    let displayFormat = settings.get_string("display-format");

                    let title = metadata['xesam:title'].get_string()[0];
                    let album = metadata['xesam:album'].get_string()[0];
                    let artist = metadata['xesam:albumArtist'].get_strv()[0];
                    
                    let output = displayFormat.replace("{artist}", artist).replace("{track}", title).replace("{album}", album);
                    panelButtonText.set_text(output);
                }
            }
            return true;
        }
    }
)