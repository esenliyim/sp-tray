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
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Gettext = imports.gettext;

const ExtensionUtils = imports.misc.extensionUtils;

// to keep track of the registered scopeclass
const registeredClass = [];

// gtk4 does things quite a bit differently, so we gots to know what we're dealing with
const _isGtk4 = _checkIfGtk4();

function init() {
    // init translations
    Gettext.bindtextdomain("sp-tray", Me.dir.get_child("locale").get_path());
    Gettext.textdomain("sp-tray");
}

function buildPrefsWidget() {
    let settings = ExtensionUtils.getSettings();
    let builder = new Gtk.Builder();
    // use Gtk.BuilderScope to attach signal handlers to buttons on gtk 4+
    if (_isGtk4) {
        // register a new scope class if it hasn't already been registered
        if (registeredClass.length === 0) {
            let SpBuilderScope = GObject.registerClass(
                {
                    Implements: [Gtk.BuilderScope],
                },
                class SpBuilderScope extends GObject.Object {
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
                        settings.reset("off");
                        settings.reset("paused");
                        settings.reset("stopped");
                        settings.reset("display-format");
                        settings.reset("shuffle");
                        settings.reset("loop-playlist");
                        settings.reset("loop-track");
                    }

                    on_resetNotRunning_clicked(connectObject) {
                        settings.reset("off");
                    }

                    on_resetPaused_clicked(connectObject) {
                        settings.reset("paused");
                    }

                    on_resetStopped_clicked(connectObject) {
                        settings.reset("stopped");
                    }

                    on_resetPosition_clicked(connectObject) {
                        settings.reset("position");
                    }

                    on_resetFormat_clicked(connectObject) {
                        settings.reset("display-format");
                    }

                    on_resetTitleLength_clicked(connectObject) {
                        settings.reset("title-max-length");
                    }

                    on_resetArtistLength_clicked(connectObject) {
                        settings.reset("artist-max-length");
                    }

                    on_resetAlbumLength_clicked(connectObject) {
                        settings.reset("album-max-length");
                    }

                    on_resetPodcastFormat_clicked(connectObject) {
                        settings.reset("podcast-format");
                    }

                    on_resetLogo_clicked(connectObject) {
                        settings.reset("logo-position");
                    }

                    on_resetShuffle_clicked(connectObject) {
                        settings.reset("shuffle");
                    }

                    on_resetLoopTrack_clicked(connectObject) {
                        settings.reset("loop-track");
                    }

                    on_resetLoopPlaylist_clicked(connectObject) {
                        settings.reset("loop-playlist");
                    }
                },
            );
            registeredClass.push(SpBuilderScope);
        }
        builder.set_scope(new registeredClass[0]());
    }
    builder.add_from_file(Me.dir.get_path() + "/prefs.xml");
    let box = builder.get_object("prefs_widget");

    // bind switches and text fields to their respective settings
    settings.bind(
        "display-format",
        builder.get_object("field_format"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "podcast-format",
        builder.get_object("podcast_format"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "title-max-length",
        builder.get_object("title_length"),
        "value",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "artist-max-length",
        builder.get_object("artist_length"),
        "value",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "album-max-length",
        builder.get_object("album_length"),
        "value",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "paused",
        builder.get_object("field_paused"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "stopped",
        builder.get_object("field_stopped"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "hidden-when-inactive",
        builder.get_object("field_hideInactive"),
        "active",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "hidden-when-paused",
        builder.get_object("field_hidePaused"),
        "active",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "hidden-when-stopped",
        builder.get_object("field_hideStopped"),
        "active",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "off",
        builder.get_object("field_notRunning"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "position",
        builder.get_object("box_position"),
        "active",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "logo-position",
        builder.get_object("logo_position"),
        "active",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "shuffle",
        builder.get_object("shuffle"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "loop-track",
        builder.get_object("loopTrack"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );
    settings.bind(
        "loop-playlist",
        builder.get_object("loopPlaylist"),
        "text",
        Gio.SettingsBindFlags.DEFAULT,
    );

    // use connect_signals_full to attach signal handlers to buttons on gtk <4
    if (!_isGtk4) {
        let SignalHandler = {
            on_defaults_clicked(w) {
                settings.reset("off");
                settings.reset("paused");
                settings.reset("stopped");
                settings.reset("display-format");
                settings.reset("loop-playlist");
                settings.reset("loop-track");
                settings.reset("shuffle");
            },

            on_resetNotRunning_clicked(w) {
                settings.reset("off");
            },

            on_resetPaused_clicked(w) {
                settings.reset("paused");
            },

            on_resetStopped_clicked(w) {
                settings.reset("stopped");
            },

            on_resetFormat_clicked(w) {
                settings.reset("display-format");
            },

            on_resetPosition_clicked(w) {
                settings.reset("position");
            },

            on_resetTitleLength_clicked(w) {
                settings.reset("title-max-length");
            },

            on_resetArtistLength_clicked(w) {
                settings.reset("artist-max-length");
            },

            on_resetAlbumLength_clicked(w) {
                settings.reset("album-max-length");
            },

            on_resetPodcastFormat_clicked(w) {
                settings.reset("podcast-format");
            },

            on_resetLogo_clicked(w) {
                settings.reset("logo-position");
            },

            on_resetShuffle_clicked(w) {
                settings.reset("shuffle");
            },

            on_resetLoopPlaylist_clicked(w) {
                settings.reset("loop-playlist");
            },

            on_resetLoopTrack_clicked(w) {
                settings.reset("loop-track");
            },
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
    return Number.parseInt(imports.misc.config.PACKAGE_VERSION.split(".")) >= 40;
}
