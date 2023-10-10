Here be the notable changes to the extension's function.

## Version 23 | 2023-10-10

Added:

- Support for GNOME 45

## Version 18 | 2022-11-02

Added:

- Option to display track metadata as a configurable, horizontally scrolling marquee.
- Support for GNOME 43

Changed:

- Setting to show metadata when paused is now a toggle switch instead of a placeholder string

Removed:

- Support for GNOME 3.xx, meaning no more Gtk3 because I can't test them.

## Version 16 | 2022-06-22

Added:

- new Dutch translations

Changed:

- some of the old Dutch translations

## Version 15 | 2022-06-17

Added:

- Option to show loop and shuffle status.
- A stopped playback indicator.
- Option to change all of the above.

Changed:

- Extended the character limits for inactive and paused texts.
- Support for different clients was improved. Now it (probably) shows correct text when clients are launched and closed. 

## Version 14 | 2022-05-12

Added:

- Support for [ncspot](https://github.com/hrkfdn/ncspot)
- Can now keep displaying track info even when playback is paused.

Changed:

- Now respects the `{artist}` placeholder for podcasts, even though currently Spotify returns nothing for that field.

## Version 13 | 2022-05-01

Added:

- A changelog, finally.
- Support for Spotify version 1.1.84.

Changed:

- Spotify logo now hidden by default.
