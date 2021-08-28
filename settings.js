const Gio = imports.gi.Gio;
const GioSSS = Gio.SettingsSchemaSource;
const Me = imports.misc.extensionUtils.getCurrentExtension();

//settings schema id
const schemaId = "org.gnome.shell.extensions.sp-tray";

var Settings = class Settings {

    static getSettings() {
        let schemaSource = GioSSS.new_from_directory(
            Me.dir.get_child("schemas").get_path(),
            GioSSS.get_default(),
            false
        );
        let schemaObj = schemaSource.lookup(schemaId, true);
        if (!schemaObj) {
            throw new Error('cannot find schema');
        }
        return new Gio.Settings({ settings_schema: schemaObj });
    }
}