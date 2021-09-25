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

'use strict';

const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { SpTrayButton } = Me.imports.panelButton;

class SpTrayExtension {
    constructor() {
        this.extensionButton = null;
        this.settings = imports.misc.extensionUtils.getSettings();
    }

    enable() {
        this.extensionButton = new SpTrayButton();
        //this._settingSignal = this.settings.connect('changed::position', this._positionChanged.bind(this));
        this._addToTray();
    }

    _addToTray() {
        let pos = this.settings.get_int('position');
        Main.panel.addToStatusArea('SpTray', this.extensionButton, pos == 2 ? 0 : -1, this._getPosition(pos));
    }

    disable() {
        this.extensionButton.destroy();
        this.extensionButton = null;
        //this.settings.disconnect(this._settingSignal);
    }

    _getPosition(pos) {
        let positions = ['left' , 'center', 'right'];
        return positions[pos];
    }

    // _positionChanged() {
    //     this.extensionButton.get_parent().remove_actor(this.extensionButton);
    //     this._addToTray();
    // }
}

function init () {
    return new SpTrayExtension();
}