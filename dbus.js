import GLib from "gi://GLib";
import Gio from "gi://Gio";

//dbus constants
const path = "/org/mpris/MediaPlayer2";
const interfaceName = "org.mpris.MediaPlayer2.Player";
const spotifyDbus = `<node>
<interface name="org.mpris.MediaPlayer2.Player">
    <property name="PlaybackStatus" type="s" access="read"/>
    <property name="Metadata" type="a{sv}" access="read"/>
    <property name="Shuffle" type="b" access="read"/>
    <property name="LoopStatus" type="s" access="read"/>
</interface>
</node>`;

/**
 * This be the "list" of supported clients. At init, the extensions starts watching the session bus for each
 * supported client.
 */
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
                idExtractor: (trackid) => trackid.split(":")[1],
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

const SpTrayDbus = class SpTrayDbus {
    constructor(panelButton) {
        this.proxy = null;
        this.panelButton = panelButton;
        this.activeClient = null;
        this.timeouts = [];
        this.startWatching();
    }

    destroy() {
        if (this.activeClient && this.proxy) {
            this.proxy.disconnect(this.activeClient.signal);
        }
        for (const client in supportedClients) {
            if (client.watchId) {
                Gio.bus_unwatch_name(client.watchId);
            }
        }
        for (const to of this.timeouts) {
            GLib.Source.remove(to);
        }
    }

    timeout() {
        return new Promise((resolve) =>
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                resolve();
                return GLib.SOURCE_REMOVE;
            }),
        );
    }

    startWatching() {
        // Start the watch for the supported clients.
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

    /**
     * When a supported Spotify client's name appears on the session bus, create a proxy for it.
     * This overrides the current proxy if there is one. Meaning the proxy is always for the most recently
     * appeared client.
     */
    async onClientAppeared(client) {
        log(`${client.name} appeared on DBus.`);
        this.makeProxyForClient(client);
        // This is necessary because the proxy's property cache might be initialized with incomplete values,
        // which needs to be updated after a short delay
        try {
            this.shouldRetry(this.proxy.Metadata);
        } catch (error) {
            logError(error);
        }
        if (!this.proxy.Metadata || this.shouldRetry(this.proxy.Metadata)) {
            log(`Bad metadata, querying again.`);
            try {
                this.correctMetadata();
            } catch (error) {
                logError(error);
                this.panelButton.updateLabel(true);
            }
        } else {
            this.panelButton.updateLabel(true);
        }
    }

    shouldRetry(metadata) {
        // Don't check artist field, because it will be null/undefined for podcasts
        return (
            metadata["mpris:trackid"].unpack() == "" ||
            metadata["xesam:album"].unpack() == "" ||
            metadata["xesam:title"].unpack() == ""
        );
    }

    /**
     * Attempt to correct the proxy's incomplete Metadata cache
     * Makes 5 attempts at 100ms intervals. Sets the panelButton text if succeeds.
     */
    async correctMetadata() {
        const maxAttempts = 5;
        let attempt = 1;
        do {
            const resp = this.queryMetadata();
            const unpacked = resp.deepUnpack();
            if (!this.shouldRetry(unpacked)) {
                log(`Got good metadata on attempt ${attempt}`);

                try {
                    this.proxy.set_cached_property("Metadata", resp);
                } catch (error) {
                    logError(error);
                    return;
                }
                this.panelButton.updateLabel(true);
                return;
            } else {
                try {
                    this.timeouts.push(await this.timeout());
                } catch (e) {
                    logError(e);
                }
                attempt++;
            }
        } while (attempt <= maxAttempts);
        this.panelButton.showStopped();
    }

    /**
     * Explicitly query the metadata property via DBus, instead of using the proxy cache.
     */
    queryMetadata() {
        // For some reason the "Get" DBus method returns weird stuff. Had to go with GetAll and
        // pull Metadata out of it instead
        const reply = Gio.DBus.session.call_sync(
            this.activeClient.dest,
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

    /**
     * Create a proxy for a supported client, and connect the listen signal.
     * Overrides the existing proxy, if there is one. Sets the currently active client to the most recently
     * appeared.
     */
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
                // TODO simplify this mess
                if (
                    !(
                        "PlaybackStatus" in props ||
                        "Metadata" in props ||
                        "LoopStatus" in props ||
                        "Shuffle" in props
                    )
                ) {
                    // None of the extension-relevant properties changed, nothing to do
                    return;
                }
                this.panelButton.updateLabel("Metadata" in props);
                return;
            },
        );
        client.isOnline = true;
        if (this.activeClient) {
            this.proxy.disconnect(this.activeClient.signal);
        }
        this.activeClient = client;
    }

    /**
     * Runs when a client's name vanished from the session bus. Marks the vanished client as inactive.
     * If the vanished client was the currently active one, looks for a replacement.
     */
    onClientVanished(client) {
        client.isOnline = false;
        // Nothing to do if the client that vanished wasn't the one we were watching
        if (this.proxy && client.dest !== this.proxy.get_name()) {
            log(`${client.name} vanished from DBus.`);
            return;
        }
        this.proxy.disconnect(client.signal);
        this.activeClient = null;
        log(`${client.name} vanished from DBus, looking for another client.`);
        const otherClient = this.checkForOnlineClients();
        if (!otherClient) {
            log("No other Spotify clients online.");
            this.proxy = null;
        } else {
            log(`${otherClient.name} is still online. Making it the primary.`);
            this.makeProxyForClient(otherClient);
        }
        this.panelButton.updateLabel(true);
    }

    // Checks if any other supported client is online
    checkForOnlineClients() {
        for (const client of supportedClients) {
            if (client.isOnline) {
                return client;
            }
        }
        return null;
    }

    /**
     * Creates a metadata object that contains relevant information
     * @returns title, artist, album and trackType. Artist is blank when it's a podcast.
     */
    extractMetadataInformation() {
        if (!this.proxy.Metadata || !this.proxy.Metadata["mpris:trackid"]) {
            return null;
        }
        return {
            trackType: this.getTrackType(this.proxy.Metadata["mpris:trackid"].get_string()[0]),
            title: this.proxy.Metadata["xesam:title"].unpack(),
            album: this.proxy.Metadata["xesam:album"].unpack(),
            artist: this.proxy.Metadata["xesam:artist"].get_strv()[0],
            url: this.proxy.Metadata["xesam:url"].unpack(),
        };
    }

    getTrackType(trackId) {
        for (const version of this.activeClient.versions) {
            if (!trackId.startsWith(version.pattern)) {
                continue;
            }
            return version.idExtractor(trackId);
        }
        return null;
    }

    spotifyIsActive() {
        return this.proxy !== null;
    }

    getPlaybackStatus() {
        return this.proxy.PlaybackStatus;
    }

    getPlaybackControl() {
        if (!this.proxy || !this.proxy.Shuffle || !this.proxy.LoopStatus) {
            return null;
        }
        return {
            shuffle: this.proxy.Shuffle,
            loop: this.proxy.LoopStatus,
        };
    }
};

export default SpTrayDbus;