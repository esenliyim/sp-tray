const { GLib, Gio } = imports.gi;

//dbus constants
const dest = "org.mpris.MediaPlayer2.spotify";
const path = "/org/mpris/MediaPlayer2";
const interfaceName = "org.mpris.MediaPlayer2.Player";
const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
</interface>
</node>`;

const supportedClients = [
    {
        name: "Spotify",
        dest: "org.mpris.MediaPlayer2.spotify",
        signal: null,
        watchId: null,
        isOnline: false, // to keep track of who appears and disappears in case multiple different clients are running
        versions: [
            {
                name: "spotify version >1.84",
                pattern: "/com/spotify",
                idExtractor: (trackid) => trackid.split("/")[3],
            },
            {
                name: "spotify version <1.84",
                pattern: "spotify:",
                idExtractor: (trackid) => trackid.split(":")[2],
            },
        ],
    },
    {
        name: "ncspot",
        dest: "org.mpris.MediaPlayer2.ncspot",
        signal: null,
        watchId: null,
        isOnline: false,
        versions: [
            {
                name: "ncspot",
                pattern: "/org/ncspot",
                idExtractor: (trackid) => trackid.split("/")[4],
            },
        ],
    },
];

Promise.timeout = function (priority = GLib.PRIORITY_DEFAULT, interval = 100) {
    return new Promise((resolve) =>
        GLib.timeout_add(priority, interval, () => {
            resolve();
            return GLib.SOURCE_REMOVE;
        }),
    );
};

var SpTrayDbus = class SpTrayDbus {
    constructor(panelButton) {
        this.proxy = null;
        this.panelButton = panelButton;
        this.activeClient = null;
        this.startWatching();
    }

    destroy() {
        if (this.activeClient && this.proxy) {
            this.proxy.disconnect(this.activeClient.signal);
        }
        this.proxy.disconnect(this.activeClient);
        for (const client in supportedClients) {
            Gio.bus_unwatch_name(client.watchId);
        }
        this.watchIds.map((id) => {
            Gio.bus_unwatch_name(id);
        });
    }

    startWatching() {
        supportedClients.forEach((client) => {
            client.watchId = Gio.bus_watch_name(
                Gio.BusType.SESSION,
                client.dest,
                Gio.BusNameWatcherFlags.NONE,
                this.onClientAppeared.bind(this, client),
                this.onClientVanished.bind(this, client),
            );
        });
    }

    async onClientAppeared(client) {
        log(`${client.name} appeared on DBus.`);
        this.makeProxyForClient(client);
        if (this.shouldCorrectMetadata()) {
            log(`Bad metadata, querying again.`);
            try {
                this.correctMetadata();
            } catch (error) {
                logError(error);
            }
        }
        this.panelButton.updateText();
    }

    shouldCorrectMetadata() {
        try {
            const md = this.extractMetadataInformation();
            if (!md) {
                return true;
            }
            return this.shouldRetry(md);
        } catch (error) {
            logError(error);
        }
    }

    async correctMetadata() {
        const maxAttempts = 5;
        let attempt = 1;
        do {
            const resp = this.queryMetadata();
            const unpacked = resp.deepUnpack();
            const newMetadata = {
                trackId: unpacked["mpris:trackid"].unpack(),
                title: unpacked["xesam:title"].unpack(),
                artist: unpacked["xesam:artist"].get_strv()[0],
                album: unpacked["xesam:album"].unpack(),
            };
            if (!this.shouldRetry(newMetadata)) {
                log(`Got good metadata on attempt ${attempt}`);
                try {
                    this.proxy.set_cached_property("Metadata", resp);
                } catch (error) {
                    logError(error);
                }
                return;
            } else {
                try {
                    await Promise.timeout();
                } catch (e) {
                    logError(e);
                }
                attempt++;
            }
        } while (attempt <= maxAttempts);
    }

    shouldRetry(metadata) {
        // Metadata is considered bad iif trackType set AND at least one of artist-title-album is missing
        return (
            metadata.trackType !== "" &&
            (metadata.title === "" || metadata.album === "" || !("artist" in metadata))
        );
    }

    queryMetadata() {
        const reply = Gio.DBus.session.call_sync(
            dest,
            path,
            "org.freedesktop.DBus.Properties",
            "GetAll",
            new GLib.Variant("(s)", [interfaceName]),
            new GLib.VariantType("(a{sv})"),
            Gio.DBusCallFlags.NONE,
            -1,
            null,
        );
        return reply.deepUnpack()[0]["Metadata"];
    }

    makeProxyForClient(client) {
        if (this.activeClient && this.activeClient.name === client.name) {
            return;
        }
        this.proxy = Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusProxyFlags.GET_INVALIDATED_PROPERTIES,
            Gio.DBusInterfaceInfo.new_for_xml(spotifyDbus),
            client.dest,
            path,
            interfaceName,
            null,
        );

        client.signal = this.proxy.connect(
            "g-properties-changed",
            (proxy, changed, invalidated) => {
                const props = changed.deepUnpack();
                if (!("PlaybackStatus" in props || "Metadata" in props)) {
                    // Playback status or metadata hasn't changed, nothing to do
                    // This happens when the shuffle or loop setting or whatever is changed, for example.
                    // Not relevant to us
                    return;
                }
                if (invalidated.length !== 0) {
                    // TODO figure out how it works between onVanished and this
                    return;
                }
                this.panelButton.updateText();
                return;
                if (
                    Object.keys(props).includes("PlaybackStatus") &&
                    props["PlaybackStatus"].unpack() === "Paused"
                ) {
                    this.panelButton.showPaused(this.extractMetadataInformation());
                    return;
                }
                this.panelButton.showPlaying(this.extractMetadataInformation());
            },
        );
        client.isOnline = true;
        if (this.activeClient) {
            this.proxy.disconnect(this.activeClient.signal);
        }
        this.activeClient = client;
    }

    onClientVanished(client) {
        client.isOnline = false;
        // Nothing to do if the client that vanished wasn't the one we were watching
        if (this.proxy && client.dest !== this.proxy.get_name()) {
            log(`${client.name} vanished from DBus.`);
            return;
        }
        log(`disconnecting ${client.signal}`);
        this.proxy.disconnect(client.signal);
        log(`${client.name} vanished from DBus, looking for another client.`);
        const otherClient = this.checkForOnlineClients();
        if (otherClient) {
            this.proxy = null;
        } else {
            this.makeProxyForClient(client);
        }
    }

    checkForOnlineClients() {
        for (const client of supportedClients) {
            if (client.isOnline) {
                log(`${client.name} is still online. Making it the primary.`);
                return client;
            }
        }
        log("No other Spotify clients online.");
        return null;
    }

    extractMetadataInformation() {
        if (!this.proxy.Metadata || !this.proxy.Metadata["mpris:trackid"]) {
            return null;
        }
        const trackId = this.proxy.Metadata["mpris:trackid"].get_string()[0];
        for (const version of this.activeClient.versions) {
            if (!trackId.startsWith(version.pattern)) {
                continue;
            }
            return {
                trackType: version.idExtractor(trackId),
                title: this.proxy.Metadata["xesam:title"].unpack(),
                album: this.proxy.Metadata["xesam:album"].unpack(),
                artist: this.proxy.Metadata["xesam:artist"].get_strv()[0],
            };
        }
    }

    spotifyIsActive() {
        return this.proxy !== null
    }

    isPlaying() {
        return this.proxy.PlaybackStatus === "Playing"
    }
};
