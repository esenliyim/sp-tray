const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;

var dest = "org.mpris.MediaPlayer2.spotify"
var path = "/org/mpris/MediaPlayer2"
var iface = "org.mpris.MediaPlayer2.Player"
var propertiesIface = "org.freedesktop.DBus.Properties"

var dbus = require('dbus-next');

let panelButton, panelButtonText, timeout;

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

    let obj = await dbus.getProxyObject(dest, path);
    let props = obj.getInterface(propertiesIface);
    let metadata = await props.Get(iface, 'Metadata');
    
    let artist = metadata.value['xesam:artist'] ? metadata.value['xesam:artist'].value : 'unknown';
    let title = metadata.value['xesam:title'] ? metadata.value['xesam:title'].value : 'unknown';
    
    panelButtonText.set_text(artist + " - " + title);
    return true;
}