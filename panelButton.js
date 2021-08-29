<<<<<<< HEAD
=======
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

>>>>>>> multi-gtk
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const { St, Clutter, GObject, GLib, Gio } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
<<<<<<< HEAD
const { Settings } = Me.imports.settings;

const Gettext = imports.gettext;
Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
Gettext.textdomain("sp-tray");
const _ = Gettext.gettext;
=======
const ExtensionUtils = imports.misc.extensionUtils;
>>>>>>> multi-gtk

//dbus constants
const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";

const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
</interface>
</node>`;

<<<<<<< HEAD
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

let panelButtonText, settings;

=======
>>>>>>> multi-gtk
var SpTrayButton = GObject.registerClass(
    { GTypeName: 'SpTrayButton' },
    class SpTrayButton extends PanelMenu.Button {

        _init() {
            super._init(null, Me.metadata.name);

            this.ui = new Map();

            this._initSettings();
<<<<<<< HEAD
=======
            this._initDbus();
>>>>>>> multi-gtk
            this._initUi();

            this.updateText();
        }

        _initSettings() {
<<<<<<< HEAD
            settings = Settings.getSettings();

            settings.connect(`changed::paused`, this.updateText);
            settings.connect(`changed::off`, this.updateText);
            settings.connect(`changed::hidden-when-inactive`, this.updateText);
            settings.connect(`changed::display-format`, this.updateText);
=======
            this.settings = ExtensionUtils.getSettings();
            
             // the display on the system tray is instantly updated when the settings are changed
            this.settings.connect(`changed::paused`, this.updateText.bind(this));
            this.settings.connect(`changed::off`, this.updateText.bind(this));
            this.settings.connect(`changed::hidden-when-inactive`, this.updateText.bind(this));
            this.settings.connect(`changed::display-format`, this.updateText.bind(this));
>>>>>>> multi-gtk
        }

        _initUi() {
            const box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
<<<<<<< HEAD
            panelButtonText = new St.Label({
                style_class: "taskbarPanelText",
                text: settings.get_string('starting'),
=======
            // the 'text' variable below is what's actually shown on the tray
            let panelButtonText = new St.Label({
                style_class: "taskbarPanelText",
                text: this.settings.get_string('starting'),
>>>>>>> multi-gtk
                y_align: Clutter.ActorAlign.CENTER
            });

            this.ui.set(
                'label',
                panelButtonText,
            );

            this.ui.forEach(element => box.add_child(element));
            this.ui.set('box', box);

<<<<<<< HEAD
            spotifyProxy.connect("g-properties-changed", this.updateText);

=======
            // listen to spotify status changes to update the tray display immediately. no busy waiting
            this.spotifyProxy.connect("g-properties-changed", this.updateText.bind(this));

            // launch the settings menu when the tray display is clicked
>>>>>>> multi-gtk
            this.connect('button-press-event', () => {
                imports.misc.extensionUtils.openPrefs();
            });

            this.add_child(box);
        }
<<<<<<< HEAD

        destroy() {
=======
        
        _initDbus() {
            let spotifyProxyWrapper = Gio.DBusProxy.makeProxyWrapper(spotifyDbus);
            this.spotifyProxy = spotifyProxyWrapper(Gio.DBus.session, dest, path);
        }

        destroy() {
            //TODO disconnects foreach
            this.settings.disconnect(`changed::paused`, this.updateText);
            this.settings.disconnect(`changed::off`, this.updateText);
            this.settings.disconnect(`changed::hidden-when-inactive`, this.updateText);
            this.settings.disconnect(`changed::display-format`, this.updateText);
            spotifyProxy.disconnect("g-properties-changed", this.updateText);
            
>>>>>>> multi-gtk
            this.ui.forEach(element => element.destroy());
            super.destroy();
        }

<<<<<<< HEAD
        updateText() {
            global.log('anne');

            let status = typeof(spotifyProxy.PlaybackStatus);

            if (status !== 'string') {
                let hidden = settings.get_boolean("hidden-when-inactive");
                //HACK
                panelButtonText.set_text(hidden ? "" : this.settings.get_string("off"));
            } else {
                let status = spotifyProxy.PlaybackStatus;
                let metadata = spotifyProxy.Metadata;

                if (status == "Paused") {
                    let hidden = settings.get_boolean("hidden-when-paused");
                    //HACK
                    panelButtonText.set_text(hidden ? "" : settings.get_string("paused"));
                } else {
                    let displayFormat = settings.get_string("display-format");
=======
        // update the text on the tray display
        updateText() {
            let status = this.spotifyProxy.PlaybackStatus;
            let button = this.ui.get('label');

            if (typeof(status) !== 'string') {
                let hidden = this.settings.get_boolean("hidden-when-inactive");
                if (hidden) {
                    button.visible = false;
                } else {
                    button.set_text(this.settings.get_string("off"));
                }
            } else {
                let metadata = this.spotifyProxy.Metadata;

                if (status == "Paused") {
                    let hidden = this.settings.get_boolean("hidden-when-paused");
                    if (hidden) {
                        this.visible = false;
                    } else {
                        button.set_text(this.settings.get_string("paused"));
                    }
                } else {
                    if (!this.visible) {
                        this.visible = true;
                    }
                    let displayFormat = this.settings.get_string("display-format");
>>>>>>> multi-gtk

                    let title = metadata['xesam:title'].get_string()[0];
                    let album = metadata['xesam:album'].get_string()[0];
                    let artist = metadata['xesam:albumArtist'].get_strv()[0];
                    
                    let output = displayFormat.replace("{artist}", artist).replace("{track}", title).replace("{album}", album);
<<<<<<< HEAD
                    panelButtonText.set_text(output);
=======
                    button.set_text(output);
>>>>>>> multi-gtk
                }
            }
            return true;
        }
    }
)