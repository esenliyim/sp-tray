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

const { GObject, Gtk, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext;

const { settingsFields } = Me.imports.settingsFields;

// to keep track of the registered scopeclass
const registeredClass = [];

function init() {
    // init translations
    Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
    Gettext.textdomain("sp-tray");
}

function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings();
    let builder = new Gtk.Builder();
    const resetAllToDefault = () => {
        settingsFields.forEach((field) => {
            if (field.resettable) settings.reset(field.setting);
        });
    };
    // register a new scope class if it hasn't already been registered
    if (registeredClass.length === 0) {
        let SpBuilderScope = GObject.registerClass(
            {
                Implements: [Gtk.BuilderScope],
            },
            class SpBuilderScope extends GObject.Object {
                constructor() {
                    super();
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

                on_defaults_clicked(connectObject) {
                    resetAllToDefault();
                }
            },
        );
        registeredClass.push(SpBuilderScope);
    }
    builder.set_scope(new registeredClass[0]());
    builder.add_from_file(Me.dir.get_path() + "/prefs.xml");
    let box = builder.get_object("prefs_widget");

    // bind switches and text fields to their respective settings
    settingsFields.forEach((field) =>
        settings.bind(
            field.setting,
            builder.get_object(field.fieldId),
            field.type,
            Gio.SettingsBindFlags.DEFAULT,
        ),
    );

    return box;
}
