# Cricket Ad Muter for Hotstar

An unofficial open-source Chrome/Chromium extension that mutes advertisement audio during Hotstar live cricket streams and restores audio after the ad slot.

## Open source

This project is released under the **MIT License**. You are free to use, copy, modify, publish, distribute, sublicense, and sell copies of the software, subject to the MIT License terms.

Please retain the original copyright and license notice when redistributing the software.

**Original author:** Navaneeth Krishnan S.

## Features

- Detects Hotstar `ct_impression` ad signals.
- Uses the ad duration embedded in `adName`.
- Mutes the browser tab during the detected ad interval.
- Uses `chrome.alarms` for reliable delayed unmute with Manifest V3 service-worker suspension.
- Preserves an already-muted tab state.
- No inline JavaScript.
- No remote code.
- No analytics or user-data collection.

## Install from source

1. Download or clone this repository.
2. Open `chrome://extensions/` in Chrome or a Chromium-based browser.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extension folder containing `manifest.json`.
6. Open Hotstar and start a live cricket stream.

## Disclaimer

This project is unofficial and is not affiliated with, sponsored by, or endorsed by Hotstar, JioStar, or any broadcaster.

The extension only controls the browser tab's mute state. It does not block, skip, download, or modify advertisement video.
