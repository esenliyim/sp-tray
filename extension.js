const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Variant = imports.gi.GLib.Variant;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let panelButton, panelButtonText, timeout, settings;

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

function init () {

    settings = getSettings();

    panelButton = new St.Bin({
        style_class : "panel-button"
    });

    panelButtonText = new St.Label({
        style_class : "taskbarPanelText",
        text: settings.get_string('starting'),
        y_align : Clutter.ActorAlign.CENTER
    });
    panelButton.set_child(panelButtonText);
}

function enable () {
    Main.panel._rightBox.insert_child_at_index(panelButton, 1);
    timeout = Mainloop.timeout_add_seconds(1, decideText);
}

function disable () {
    Mainloop.source_remove(timeout);
    Main.panel._rightBox.remove_child(panelButton);
}

function decideText () {
    if (!isSpotifyRunning()) {
        let hidden = settings.get_boolean("hidden-when-inactive");
        setButtonText(hidden ? "" : settings.get_string("off"));
    } else {

        let status = spotifyProxy.PlaybackStatus;
        let metadata = spotifyProxy.Metadata;

        if (status == "Paused") {
            setButtonText(settings.get_string("paused"));
        } else {
            let artistIndicator = settings.get_string("artist-indicator");
            let trackIndicator = settings.get_string("track-indicator");
            let separator = settings.get_string("separator");
            let title = metadata['xesam:title'].get_string()[0];
            let artist = metadata['xesam:albumArtist'].get_strv()[0];
            let output = artistIndicator + " " + artist + " " + separator 
            + " " + trackIndicator + " " + title;
            setButtonText(output);
        }
    }
    return true;
}

function isSpotifyRunning() {
    let status = spotifyProxy.PlaybackStatus;
    return (typeof(status) === 'string');
}

function setButtonText (output) {

    panelButtonText.set_text(output);

}

function getSettings() {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(schemaId, true);
    if (!schemaObj) {
        throw new Error('cannot find schema');
    }
    return new Gio.Settings({ settings_schema : schemaObj });
}