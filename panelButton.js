const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { St, Clutter, GObject, GLib, Gio } = imports.gi;
const Gettext = imports.gettext;

const { Settings } = Me.imports.settings;

Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
Gettext.textdomain("sp-tray");
const _ = Gettext.gettext;

//dbus constants
const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";
//settings schema id
const schemaId = "org.gnome.shell.extensions.sp-tray";

//define required dbus interfaces with relevant methods and properties
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

let panelButtonText, settings;

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
            settings = Settings.getSettings();

            settings.connect(`changed::separator`, this.updateText);
            settings.connect(`changed::paused`, this.updateText);
            settings.connect(`changed::off`, this.updateText);
            settings.connect(`changed::artist-indicator`, this.updateText);
            settings.connect(`changed::track-indicator`, this.updateText);
            settings.connect(`changed::hidden-when-inactive`, this.updateText);
        }

        _initUi() {
            const box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
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

            spotifyProxy.connect("g-properties-changed", this.updateText);

            this.connect('button-press-event', () => {
                imports.misc.extensionUtils.openPrefs();
            });

            this.add_child(box);
        }

        destroy() {
            this.ui.forEach(element => element.destroy());
            super.destroy();
        }

        updateText() {
            global.log('anne');

            let status = typeof(spotifyProxy.PlaybackStatus);

            if (status !== 'string') {
                let hidden = settings.get_boolean("hidden-when-inactive");
                panelButtonText.set_text(hidden ? "" : this.settings.get_string("off"));
            } else {
                let status = spotifyProxy.PlaybackStatus;
                let metadata = spotifyProxy.Metadata;

                if (status == "Paused") {
                    panelButtonText.set_text(settings.get_string("paused"));
                } else {
                    let artistIndicator = settings.get_string("artist-indicator");
                    let trackIndicator = settings.get_string("track-indicator");
                    let separator = settings.get_string("separator");
                    let title = metadata['xesam:title'].get_string()[0];
                    let artist = metadata['xesam:albumArtist'].get_strv()[0];
                    let output = artistIndicator + " " + artist + " " + separator
                        + " " + trackIndicator + " " + title;
                    panelButtonText.set_text(output);
                }
            }
            return true;
        }
    }
)