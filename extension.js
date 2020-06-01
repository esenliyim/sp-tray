const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

let panelButton, panelButtonText, timeout;
let counter = 0;

/*
let metadataReq = "dbus-send --print-reply" + 
 " --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 " + 
 "org.freedesktop.DBus.Properties.Get string:\"org.mpris.MediaPlayer2.Player\""
 + " string:'Metadata' | grep -Ev \"^metho\"" 
 + " | grep -Eo '(\"(.*)\")|(\b[0-9][a-zA-Z0-9.]*\b)'"
 + " | sed -E '2~2 a|' | tr -d '\n' | sed -E 's/\|/\n/g'" 
 + " | sed -E 's/(xesam:)|(mpris:)//' | sed -E 's/^\"//'"
 + " | sed -E 's/\"$//' | sed -E  's/\"+/|/' | sed -E 's/ +/ /g'\"";
*/

function init () {
    panelButton = new St.Bin({
        style_class : "panel-button"
    });

    panelButtonText = new St.Label({
        style_class : "taskbarPanelText",
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

    //let artist, track;

    //var [ok, out, err, exit] = GLib.spawn_command_line_sync(metadataReq);

    //out = out.toString();

    /*
    if (out.includes("Error: ")) {
        panelButtonText.set_text("");
    } else {
        out = out.toString();

        artist = out.substring(out.indexOf("artist"), out.indexOf("autoRating", out.indexOf("artist")));
        artist = artist.substring(artist.indexOf("|") + 1).replace("\n", "");

        track = out.substring(out.indexOf("title"), out.indexOf("trackNumber", out.indexOf("title")));
        track = track.substring(track.indexOf("|") + 1).replace("\n", "");

        panelButtonText.set_text(artist + " - " + track);
    }*/
    
    panelButton.set_text(counter.toString());
    counter++;
    return true;
}