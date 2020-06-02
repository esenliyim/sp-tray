const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Variant = imports.gi.GLib.Variant;

let panelButton, panelButtonText, timeout;

const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";

const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
</interface>
</node>`;

//org.freedesktop.DBus.Properties.Get( s:interface_name, s:property_name ) -> ( v:value )
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

let spotfyProxy = spotifyProxyWrapper(Gio.DBus.session, dest, path);
let freedesktopProxy = freedesktopProxyWrapper(Gio.DBus.session, dest, path);

function init () {
    panelButton = new St.Bin({
        style_class : "panel-button"
    });

    panelButtonText = new St.Label({
        style_class : "taskbarPanelText",
        text: "⚙️⚙️⚙️",
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

    //var [ok, out, err, exit] = GLib.spawn_command_line_sync('./.sp.sh current');

    //out = out.toString();

  /*  if (out.includes("Error: ")) {
        setButtonText("");
        return true;
    } else {
*/
        let status = spotfyProxy.PlaybackStatus;
        let metadata = spotfyProxy.Metadata;

        if (status == "Paused") {
            setButtonText("⏸️ Paused");
        } else {
            let title = metadata['xesam:title'].get_string()[0];
            let artist = metadata['xesam:albumArtist'].get_strv()[0];
            //log(title + " | " + artist);
            //setButtonText(metadata['xesam:title'].value);
            let output = "🧑‍🦲 " + artist + " - 🎶 " + title;
            setButtonText(output);
        }

        return true;

        /*
        let artist = out.substring(out.indexOf("AlbumArtist") + 11,
            out.indexOf("\n", out.indexOf("AlbumArtist"))).trim();
        let track = out.substring(out.indexOf("Title") + 5).trim();

        panelButtonText.set_text(artist + " | " + track);
        */
//    }

}

function setButtonText (output) {

    panelButtonText.set_text(output);

}