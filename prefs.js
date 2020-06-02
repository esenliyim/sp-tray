const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const SpTrayPrefsWidget = new GObject.Class({
    Name: "SP.Prefs.Widget",
    GTypeName: "SPPrefsWidget",
    Extends: Gtk.ScrolledWindow,

    _init: function(params) {
        this.parent(params);
        
        let builder = new Gtk.Builder();
        builder.add_from_file(Me.path + '/prefs.ui');

        this.add(builder.get_object('main_prefs'));

    }
});

function init() {

}

function buildPrefsWidget() {
    let widget = new SpTrayPrefsWidget();
    widget.show_all();
    return widget;
}