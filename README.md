# mubaFM

Live Ethiopian and Islamic radio in one place. Plain HTML, CSS and JavaScript: no build step, no dependencies.

Live site: <https://mubafm.vercel.app/>

## Project layout

```
.
├── index.html               Page structure and the SVG icon sprite
├── manifest.webmanifest     Installable-app (PWA) metadata
├── sw.js                    Service worker (must stay in the root so it covers the whole site)
├── css/
│   └── styles.css           Design system: colours, type, layout, states
├── js/
│   ├── stations.js          Station catalog (data only)
│   └── app.js               Player logic: playback, search, favorites, sharing, sleep timer, mini-player
├── icons/                   Favicons and app icons (favicon.*, apple-touch-icon, icon-192/512, maskable)
└── logos/                   Station logos (see logos/README.md)
```

## Run it locally

Service workers and the install prompt need `http://localhost` or `https`, not `file://`:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

Any static host works (Vercel, GitHub Pages, Netlify). Publish the repository root as it is. All paths are
relative, so it also works from a sub-folder such as `https://<user>.github.io/<repo>/`.

If the site moves to another domain, update the absolute URLs in the `<head>` of `index.html`
(`canonical`, `og:url`, `og:image`, `twitter:image`). Link previews need absolute URLs.

## Add or edit a station

Edit `js/stations.js` only. Each station needs `id`, `name`, `category` and `url`; the rest is optional:

- `nameAm`: Amharic name. Add it only when you can verify the spelling.
- `freq`: FM frequency, or `null` for web-only streams.
- `initials`: two letters for the fallback artwork.
- `logo` / `logoLarge`: small logo for the list and larger logo for the player, e.g. `logos/sheger-fm.webp`
  (see `logos/README.md`).
- `altUrls`: backup stream URLs, tried when the main one keeps failing.

The order in the file is the order on screen: Ethiopian Radio and Islamic / Quran are alphabetical, and Music
Channels uses a hand-picked order (move a line to re-order it). Stream URLs must be `https://` (browsers block
`http://` audio on secure pages). Saved favorites and shared links use the station `id`, so never change an `id`
once published.

## How it behaves

- **Previous / next** (buttons, arrow keys, lock-screen controls) walk the whole station list in on-screen order,
  whatever the search box or tabs show.
- **Now-playing card**: the station's logo is blurred into a frosted-glass backdrop, and its main colour tints the
  glow behind the page. Text contrast over the backdrop was checked for every station; re-check it after adding
  a logo with very bright or unusual colours.
- **Share**: the share button uses the phone's share sheet, or copies a link such as `/?station=sheger-fm`.
  Opening that link selects the station (browsers don't allow autoplay, so the listener taps play).
- **Stream failures**: a failing stream is retried three times (using `altUrls` if present), then shows an
  "unavailable" message. A stream that connects but sends no audio is treated the same way. Offline, the player says
  so immediately and resumes by itself when the connection returns.

## Installable app / offline

`sw.js` caches the app shell so the page opens offline. Live streams are never cached or intercepted, so radio still
needs an internet connection. After a deploy, the service worker fetches new files first (network first), so updates
appear on the next load. To force old caches out, bump `CACHE` in `sw.js`, and add any new top-level file to `SHELL`.

On iOS there is no install prompt: use Share, then Add to Home Screen.
