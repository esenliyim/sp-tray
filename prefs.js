const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const schemaId = "org.gnome.shell.extensions.sp-tray";

let settings;

const SpTrayPrefsWidget = new GObject.Class({
    Name: "SP.Prefs.Widget",
    GTypeName: "SPPrefsWidget",
    Extends: Gtk.Frame,

    _init: function(params) {
        this.parent(params);
        
        let builder = new Gtk.Builder();
        builder.add_from_file(Me.path + '/prefs.ui');
        this.connect("destroy", Gtk.main_quit);

        this.runningSwitch = builder.get_object("runningSwitch");
        this.notRunningRow = builder.get_object("notRunningRow");
        this.notRunningInput = builder.get_object("notRunningInput");
        this.pausedInput = builder.get_object("pausedInput");
        this.artistInput = builder.get_object("artistInput");
        this.trackInput = builder.get_object("trackInput");
        this.separatorInput = builder.get_object("separatorInput");

        hidden = settings.get_boolean("hidden-when-inactive");
        this.runningSwitch.set_active(hidden);
        this.notRunningRow.set_sensitive(!hidden);
        this.notRunningInput.set_text(settings.get_string("off"));
        this.pausedInput.set_text(settings.get_string("paused"));
        this.artistInput.set_text(settings.get_string("artist-indicator"));
        this.trackInput.set_text(settings.get_string("track-indicator"));
        this.separatorInput.set_text(settings.get_string("separator"));

        let SignalHandler = {

            on_hidden_state_set(w) {
                newHidden = w.get_active();
                this.notRunningRow.set_sensitive(!newHidden);
                settings.set_boolean("hidden-when-inactive", newHidden);
            },

            on_defaults_clicked(w) {
                settings.reset("off");
                settings.reset("paused");
                settings.reset("artist-indicator");
                settings.reset("track-indicator");
                settings.reset("separator");

                this.notRunningInput.set_text(settings.get_string("off"));
                this.pausedInput.set_text(settings.get_string("paused"));
                this.artistInput.set_text(settings.get_string("artist-indicator"));
                this.trackInput.set_text(settings.get_string("track-indicator"));
                this.separatorInput.set_text(settings.get_string("separator"));
            },

            //TODO clean this
            on_apply_clicked(w) {
                settings.set_string("off", this.notRunningInput.get_text());
                settings.set_string("paused", this.pausedInput.get_text());
                settings.set_string("artist-indicator", 
                 this.artistInput.get_text());
                settings.set_string("track-indicator", 
                 this.trackInput.get_text());
                settings.set_string("separator",
                 this.separatorInput.get_text());
            },

            on_ok_clicked(w) {
                settings.set_string("off", this.notRunningInput.get_text());
                settings.set_string("paused", this.pausedInput.get_text());
                settings.set_string("artist-indicator", 
                 this.artistInput.get_text());
                settings.set_string("track-indicator", 
                 this.trackInput.get_text());
                settings.set_string("separator",
                 this.separatorInput.get_text());
                this.get_toplevel().destroy();
            },

            on_cancel_clicked(w) {
                this.get_toplevel().destroy();
            }

        };

        builder.connect_signals_full((builder, object, signal, handler) => {
            object.connect(signal, SignalHandler[handler].bind(this));
        });

        this.add(builder.get_object('main_prefs'));

    }

    

});

function init() {
    settings = getSettings();
}

function buildPrefsWidget() {
    let widget = new SpTrayPrefsWidget();
    widget.show_all();
    
    return widget;
}

function getSettings() {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup("org.gnome.shell.extensions.sp-tray",
     true);
    if (!schemaObj) {
        throw new Error('cannot find schema');
    }
    return new Gio.Settings({ settings_schema : schemaObj });
}