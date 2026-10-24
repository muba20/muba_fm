# Station logos

Every station with a logo has two files, named after its `id` in `js/stations.js`:

- `<id>.webp`: small version (up to 160 px) used in the station list and the mini-player
- `<id>-lg.webp`: larger version (up to 480 px) used in the main player (optional)

Every station now has a logo. A station without one would show a branded initials tile.
The player card also uses the small logo as a blurred backdrop and takes its glow colour from it, so square images work best.
Lofi Music only came as a small original (about 170 px), so it has no `-lg` file.
If a logo file is missing or fails to load, the initials appear automatically (never a broken image).

To add or replace a logo:

1. Make a square image and save it as WebP (or PNG) in this folder, for example `logos/lofi-music.webp`.
2. In `js/stations.js`, set that station's `logo` (and optionally `logoLarge`) to the file path.

A few logos (Bisrat FM, EthiOldies, FM Addis, Mirt Radio, Tirta FM) only came as small originals,
so they look a little soft in the large player. Send a bigger version to improve them.
