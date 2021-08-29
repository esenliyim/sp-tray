const { GObject, Gtk, Gio } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// set up translations
const Gettext = imports.gettext;
Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
Gettext.textdomain("sp-tray");
const _ = Gettext.gettext;

const { Settings } = Me.imports.settings;
const settings = Settings.getSettings();

// gtk4 does things quite a bit differently, so we gots to know what we're dealing with
const _isGtk4 = _checkIfGtk4();

let builder;

function init() {}

function buildPrefsWidget() {

    builder = new Gtk.Builder();
    // use Gtk.BuilderScope to attach signal handlers to buttons on gtk 4+
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

    // bind switches and text fields to their respective settings
    settings.bind('display-format', builder.get_object('field_format'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('paused', builder.get_object('field_paused'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('hidden-when-inactive', builder.get_object('field_hideInactive'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('hidden-when-paused', builder.get_object('field_hidePaused'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('off', builder.get_object('field_notRunning'), 'text', Gio.SettingsBindFlags.DEFAULT);

    // use connect_signals_full to attach signal handlers to buttons on gtk <4
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

        // gtk4 doesn't need show_all(), but lower versions do
        box.show_all();
    }
    return box;
}

function _checkIfGtk4() {
    return Number.parseInt(imports.misc.config.PACKAGE_VERSION.split('.')) >= 40;
}