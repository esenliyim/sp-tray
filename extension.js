'use strict';

const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { SpTrayButton } = Me.imports.panelButton;

class SpTrayExtension {
    constructor() {
        this.extensionButton = null;
    }

    enable() {
        this.extensionButton = new SpTrayButton();
        Main.panel.addToStatusArea('SpTray', this.extensionButton);
    }

    disable() {
        this.extensionButton.destroy();
        this.extensionButton = null;
    }
}

function init () {

    return new SpTrayExtension();
}