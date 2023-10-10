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

import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

import {
    ExtensionPreferences,
    gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import settingsFields from "./settingsFields.js";

const SpBuilderScope = GObject.registerClass(
    {
        Implements: [Gtk.BuilderScope],
    },
    class extends GObject.Object {
        constructor(settings) {
            super();
            this.settings = settings;
            settingsFields.forEach((field) => {
                if (!field.resettable) {
                    return;
                }
                this[field.resetCallback] = (connectObject) => {
                    settings.reset(field.setting);
                };
            });
        }

        vfunc_create_closure(builder, handlerName, flags, connectObject) {
            if (flags & Gtk.BuilderClosureFlags.SWAPPED) {
                throw new Error('Unsupported template signal flag "swapped"');
            }
            if (typeof this[handlerName] === "undefined") {
                throw new Error(`${handlerName} is undefined`);
            }
            return this[handlerName].bind(connectObject || this);
        }

        resetAllToDefault() {
            settingsFields.forEach((field) => {
                if (field.resettable) this.settings.reset(field.setting);
            });
        }

        on_defaults_clicked(connectObject) {
            this.resetAllToDefault();
        }
    },
);

export default class SpTrayPrefs extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    getPreferencesWidget() {
        const settings = this.getSettings();

        const builder = new Gtk.Builder();
        // builder.set_scope(new RegisteredClass(settings));
        builder.set_scope(new SpBuilderScope(settings));
        builder.add_from_file(this.path + "/prefs.xml");

        // bind switches and text fields to their respective settings
        settingsFields.forEach((field) =>
            settings.bind(
                field.setting,
                builder.get_object(field.fieldId),
                field.type,
                Gio.SettingsBindFlags.DEFAULT,
            ),
        );

        return builder.get_object("prefs_widget");
    }
}
