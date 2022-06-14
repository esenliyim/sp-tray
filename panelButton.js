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

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const { St, Clutter, GObject, GLib, Gio } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { SpTrayDbus } = Me.imports.dbus;
const ExtensionUtils = imports.misc.extensionUtils;

//dbus constants
const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";
const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
</interface>
</node>`;

const supportedClients = [
    {
        name: "spotify version <1.84",
        pattern: "spotify:",
        idExtractor: (trackid) => trackid.split(":")[2],
    },
    {
        name: "spotify version >1.84",
        pattern: "/com/spotify",
        idExtractor: (trackid) => trackid.split("/")[3],
    },
    {
        name: "ncspot",
        pattern: "/org/ncspot",
        idExtractor: (trackid) => trackid.split("/")[4],
    },
];

var SpTrayButton = GObject.registerClass(
    { GTypeName: "SpTrayButton" },
    class SpTrayButton extends PanelMenu.Button {
        _init() {
            super._init(null, Me.metadata.name);

            this.ui = new Map();
            this._settingSignals = [];
            this._signals = [];

            this._initSettings();
            this._initDbus();
            this._initUi();

            // this.updateText();
        }

        _initSettings() {
            this.settings = ExtensionUtils.getSettings();

            // connect relevant settings to the button so that it can be instantly updated when they're changed
            // store the connected signals in an array for easy disconnection later on
            this._settingSignals.push(
                this.settings.connect(`changed::paused`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::off`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::hidden-when-inactive`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::hidden-when-paused`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::display-format`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::podcast-format`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::title-max-length`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::artist-max-length`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect(`changed::album-max-length`, this.updateText.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect("changed::position", this._positionChanged.bind(this)),
            );
            this._settingSignals.push(
                this.settings.connect("changed::logo-position", this._handleLogoDisplay.bind(this)),
            );
        }

        _initUi() {
            const box = new St.BoxLayout({
                style_class: "panel-status-menu-box",
            });
            this.ui.set("box", box);

            this.ui.set(
                "label",
                new St.Label({
                    text: this.settings.get_string("starting"),
                    y_align: Clutter.ActorAlign.CENTER,
                }),
            );
            this.ui.set(
                "icon",
                new St.Icon({
                    icon_name: "spotify",
                    style_class: "system-status-icon",
                }),
            );
            this._handleLogoDisplay();

            this._signals.push(
                (this._pressEvent = this.connect(
                    "button-press-event",
                    this.showSpotify.bind(this),
                )),
            );

            this.add_child(box);
        }

        _initDbus() {
            // let spotifyProxyWrapper = Gio.DBusProxy.makeProxyWrapper(spotifyDbus);
            // this.spotifyProxy = spotifyProxyWrapper(Gio.DBus.session, dest, path);
            this.dbus = new SpTrayDbus(this);
        }

        // if the spotify logo is to be shown, insert it where appropriate (sounded better in my head)
        _handleLogoDisplay() {
            let box = this.ui.get("box");
            switch (this.settings.get_int("logo-position")) {
                case 0:
                    box.remove_all_children();
                    box.add_child(this.ui.get("label"));
                    break;
                case 1:
                    box.remove_all_children();
                    box.add_child(this.ui.get("icon"));
                    box.add_child(this.ui.get("label"));
                    break;
                case 2:
                    box.remove_all_children();
                    box.add_child(this.ui.get("label"));
                    box.add_child(this.ui.get("icon"));
                    break;
            }
        }

        //move the label to its new location
        _positionChanged() {
            this.container.get_parent().remove_actor(this.container);

            let positions = [Main.panel._leftBox, Main.panel._centerBox, Main.panel._rightBox];

            let pos = this.settings.get_int("position");
            positions[pos].insert_child_at_index(this.container, pos === 2 ? 0 : -1);
        }

        destroy() {
            // disconnect all signals
            this._settingSignals.forEach((signal) => this.settings.disconnect(signal));
            this._signals.forEach((signal) => this.settings.disconnect(signal));
            // destroy all ui elements
            this.ui.forEach((element) => element.destroy());
            super.destroy();
        }

        showPaused(metadata) {
            const hidden = this.settings.get_boolean("hidden-when-paused");
            if (hidden) {
                if (this.visible) {
                    this.visible = false;
                }
                return;
            } else {
                if (!this.visible) {
                    this.visible = true;
                }
                let text = this.settings.get_string("paused");
                if (text.includes("{metadata}")) {
                    text = text.replace("{metadata}", this._makeTrackData(metadata));
                }
                const button = this.ui.get("label");
                button.set_text(text);
            }
        }

        showPlaying(metadata) {
            const button = this.ui.get("label");
            if (!this.visible) {
                this.visible = true;
            }
            button.set_text(this._makeTrackData(metadata));
        }

        showInactive() {
            if (this.settings.get_boolean("hidden-when-inactive") && this.visible) {
                if (this.visible) {
                    this.visible = false;
                }
            } else {
                const button = this.ui.get("label");
                if (!this.visible) {
                    this.visible = true;
                }
                button.set_text(this.settings.get_string("off"));
            }
        }

        // update the text on the tray display
        updateText() {
            if (!this.dbus.spotifyIsActive) {
                this.showInactive();
            }
            const metadata = this.dbus.extractMetadataInformation();
            if (this.dbus.isPlaying()) {
                this.showPlaying(metadata);
                return;
            }
            this.showPaused(metadata);
            // let button = this.ui.get("label");
            // let status = this.spotifyProxy.PlaybackStatus;
            // if (!status) {
            //     // spotify is inactive
            //     if (this.settings.get_boolean("hidden-when-inactive") && this.visible) {
            //         if (this.visible) {
            //             this.visible = false;
            //         }
            //     } else {
            //         if (!this.visible) {
            //             this.visible = true;
            //         }
            //         button.set_text(this.settings.get_string("off"));
            //     }
            // } else {
            //     //spotify is active and returning dbus thingamajigs
            //     const metadata = this.spotifyProxy.Metadata;
            //     const client = this.getSpotifyClient(metadata);
            //     if (!metadata || !client) {
            //         this.visible = false;
            //         return true;
            //     }
            //     let text = "";
            //     if (status === "Paused") {
            //     } else {
            //         // thanks benjamingwynn for this
            //         // check if spotify is actually running and the metadata is "correct"
            //
            //     }
            //     button.set_text(text);
            // }
            // return true;
        }

        _makeTrackData(metadata) {
            let format = this._getFormat(metadata.trackType);

            if (!format) {
                log("unknown track type");
                this.visible = false;
                return true;
            }

            return this._generateText(format, metadata);
        }

        _getFormat(trackType) {
            switch (trackType) {
                case "track":
                case "local":
                    return this.settings.get_string("display-format");
                case "episode":
                    return this.settings.get_string("podcast-format");
                default:
                    return null;
            }
        }

        _generateText(format, metadata) {
            let maxTitleLength = this.settings.get_int("title-max-length");
            let maxArtistLength = this.settings.get_int("artist-max-length");
            let maxAlbumLength = this.settings.get_int("album-max-length");

            if (metadata.title.length > maxTitleLength) {
                metadata.title = metadata.title.slice(0, maxTitleLength) + "...";
            }

            if (metadata.album.length > maxAlbumLength) {
                metadata.album = metadata.album.slice(0, maxAlbumLength) + "...";
            }

            // As of May 2022 podcasts return a blank string for this field, but I'm leaving this in, in case that
            // changes in the future and the artist field starts returning something
            if (metadata.artist.length > maxArtistLength) {
                metadata.artist = metadata.artist.slice(0, maxArtistLength) + "...";
            }
            return format
                .replace("{artist}", metadata.artist)
                .replace("{track}", metadata.title)
                .replace("{album}", metadata.album)
                .trim();
        }

        // many thanks to mheine's implementation
        showSpotify() {
            if (this._spotiWin && this._spotiWin.has_focus()) {
                // spotify is up and focused
                if (this._notSpotify) {
                    // hide spotify and pull up the last active window if possible
                    Main.activateWindow(this._notSpotify);
                }
            } else {
                // spotify is unfocused or the tray icon has never been clicked before
                this._spotiWin = this._notSpotify = null;
                let wins = global.get_window_actors(); // get all open windows
                for (let win of wins) {
                    if (typeof win.get_meta_window === "function") {
                        if (win.get_meta_window().get_wm_class() === "Spotify") {
                            this._spotiWin = win.get_meta_window(); // mark the spotify window
                        } else if (win.get_meta_window().has_focus()) {
                            this._notSpotify = win.get_meta_window(); // mark the window that was active when the button was pressed
                        }

                        if (this._spotiWin && this._notSpotify) {
                            break;
                        }
                    }
                }
                Main.activateWindow(this._spotiWin); // pull up the spotify window
            }
        }

        getSpotifyClient(metadata) {
            // There must be a 'trackid' field in the dbus reply, and it must start with either 'spotify:' or '/com/spotify'
            if (!metadata["mpris:trackid"]) {
                return null;
            }
            const trackId = metadata["mpris:trackid"].get_string()[0];
            const client = supportedClients.filter((client) => trackId.startsWith(client.pattern));
            return client.length > 0 ? client[0] : null;
        }
    },
);
