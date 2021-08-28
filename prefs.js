const { GObject, Gtk, Gio } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext;

Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
Gettext.textdomain("sp-tray");
const _ = Gettext.gettext;

const { Settings } = Me.imports.settings;

let settings, builder;

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
        settings.reset("artist-indicator");
        settings.reset("track-indicator");
        settings.reset("separator");
    }

    on_resetSeparator_clicked(connectObject) {
        settings.reset("separator");
    }

    on_resetNotRunning_clicked(connectObject) {
        settings.reset("off");
    }

    on_resetPaused_clicked(connectObject) {
        settings.reset("paused");
    }

    on_resetArtist_clicked(connectObject) {
        settings.reset("artist-indicator");
    }

    on_resetTrack_clicked(connectObject) {
        settings.reset("track-indicator");
    }
}); 

function init() {
    settings = Settings.getSettings();
}

function buildPrefsWidget() {

    builder = new Gtk.Builder();
    builder.set_scope(new SpBuilderScope());
    builder.add_from_file(Me.dir.get_path() + '/prefs.xml');
    let box = builder.get_object('prefs_widget');

    settings.bind('paused', builder.get_object('field_paused'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('artist-indicator', builder.get_object('field_artist'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('track-indicator', builder.get_object('field_track'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('separator', builder.get_object('field_separator'), 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('hidden-when-inactive', builder.get_object('field_hideInactive'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('off', builder.get_object('field_notRunning'), 'text', Gio.SettingsBindFlags.DEFAULT);

    return box;
}