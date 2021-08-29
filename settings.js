// Copyright(C) 2021  Emre Şenliyim

// This program is free software: you can redistribute it and / or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

// This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
// GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
// along with this program.If not, see < http://www.gnu.org/licenses/>.

const Gio = imports.gi.Gio;
const GioSSS = Gio.SettingsSchemaSource;
const Me = imports.misc.extensionUtils.getCurrentExtension();

//settings schema ID
const schemaId = "org.gnome.shell.extensions.sp-tray";

var Settings = class Settings {

    //TODO static var

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