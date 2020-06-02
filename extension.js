const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

let panelButton, panelButtonText, timeout;

function init () {
    panelButton = new St.Bin({
        style_class : "panel-button"
    });

    panelButtonText = new St.Label({
        style_class : "examplePanelText",
        text : "Yerim yerim yerim",
        y_align : Clutter.ActorAlign.CENTER
    });
    panelButton.set_child(panelButtonText);
}

function enable () {
    Main.panel._rightBox.insert_child_at_index(panelButton, 1);
    timeout = Mainloop.timeout_add_seconds(1, setButtonText);
}

function disable () {
    Mainloop.source_remove(timeout);
    Main.panel._rightBox.remove_child(panelButton);
}

function setButtonText () {

    let artist, track;

    var [ok, out, err, exit] = GLib.spawn_command_line_sync('./.sp.sh current');

    out = out.toString();

    if (out.includes("Error: ")) {
        panelButtonText.set_text("");
    } else {

        track = out.substring(out.indexOf("Title") + 5).trim();

        artist = out.substring(out.indexOf("artist"), out.indexOf("autoRating", out.indexOf("artist")));
        artist = artist.substring(artist.indexOf("|") + 1).replace("\n", "");

        panelButtonText.set_text(track);
    }
    
    return true;
}