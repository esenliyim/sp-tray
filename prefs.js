const { GObject, Gtk, Gio } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext;

Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
Gettext.textdomain("sp-tray");
const _ = Gettext.gettext;

const { Settings } = Me.imports.settings;
const settings = Settings.getSettings();

const _isGtk4 = _checkIfGtk4();

let builder;

const SpTrayPrefsWidget = new GObject.Class({
    Name: "SP.Prefs.Widget",
    GTypeName: "SPPrefsWidget",
    Extends: Gtk.Frame,

    _init: function(params) {
        this.parent(params);
        
        let builder = new Gtk.Builder();
        builder.add_from_file(Me.path + '/prefs.xml');
        this.connect("destroy", Gtk.main_quit);

        this.runningSwitch = builder.get_object("runningSwitch");
        this.notRunningRow = builder.get_object("notRunningRow");
        this.notRunningInput = builder.get_object("notRunningInput");
        this.pausedInput = builder.get_object("pausedInput");

        hidden = settings.get_boolean("hidden-when-inactive");
        this.runningSwitch.set_active(hidden);
        this.notRunningRow.set_sensitive(!hidden);
        this.notRunningInput.set_text(settings.get_string("off"));
        this.pausedInput.set_text(settings.get_string("paused"));

        let SignalHandler = {

            on_hidden_state_set(w) {
                newHidden = w.get_active();
                this.notRunningRow.set_sensitive(!newHidden);
                settings.set_boolean("hidden-when-inactive", newHidden);
                Me.decideText();
            },

            on_defaults_clicked(w) {
                settings.reset("off");
                settings.reset("paused");

                this.notRunningInput.set_text(settings.get_string("off"));
                this.pausedInput.set_text(settings.get_string("paused"));
                this.artistInput.set_text(settings.get_string("artist-indicator"));
                this.trackInput.set_text(settings.get_string("track-indicator"));
                this.separatorInput.set_text(settings.get_string("separator"));
            },

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

function init() {}

function buildPrefsWidget() {

    builder = new Gtk.Builder();
    if (_isGtk4) {
        const SpBuilderScope = GObject.registerClass({
            Implements: [Gtk.BuilderScope],
        }, class SpBuilderScope extends GObject.Object {
        
            vfunc_create_closure(builder, handlerName, flags, connectObject) {
                if (flags & Gtk.BuilderClosureFlags.SWAPPED) {
                    throw new Error('Unsupported template signal flag "swapped"');
                }
                if (typeof this[handlerName] === 'undefined') {
                    throw new Error(`${handlerName} is undefined`);
                }
                return this[handlerName].bind(connectObject || this);
            }
        
            on_defaults_clicked(connectObject) {
                settings.reset("off");
                settings.reset("paused");
                settings.reset("display-format");
            }
        
            on_resetNotRunning_clicked(connectObject) {
                settings.reset("off");
            }
        
            on_resetPaused_clicked(connectObject) {
                settings.reset("paused");
            }
        
            on_resetFormat_clicked(connectObject) {
                settings.reset("display-format");
            }
        });
        builder.set_scope(new SpBuilderScope());
    }
    builder.add_from_file(Me.dir.get_path() + '/prefs.xml');
    let box = builder.get_object('prefs_widget');

    settings.bind('display-format', builder.get_object('field_format'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('paused', builder.get_object('field_paused'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('hidden-when-inactive', builder.get_object('field_hideInactive'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('hidden-when-paused', builder.get_object('field_hidePaused'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('off', builder.get_object('field_notRunning'), 'text', Gio.SettingsBindFlags.DEFAULT);

    if (!_isGtk4) {
        let SignalHandler = {

            on_defaults_clicked(w) {
                settings.reset("off");
                settings.reset("paused");
                settings.reset('display-format');
            },

            on_resetNotRunning_clicked(w) {
                settings.reset("off");
            },

            on_resetPaused_clicked(w) {
                settings.reset("paused");
            },

            on_resetFormat_clicked(w) {
                settings.reset("display-format");
            }

        };

        builder.connect_signals_full((builder, object, signal, handler) => {
            object.connect(signal, SignalHandler[handler].bind(this));
        });

        box.show_all();
    }
    return box;
}

function _checkIfGtk4() {
    return Number.parseInt(imports.misc.config.PACKAGE_VERSION.split('.')) >= 40;
}