/* ======================================================================
   mubaFM — player logic. Station data lives in js/stations.js.
   ====================================================================== */
'use strict';

const KEY_FAVORITES = 'mubaFM_favorites_v2';
const KEY_LAST = 'mubaFM_lastStation_v2';
const OLD_KEY_FAVORITES = 'mubaFM_favorites'; // indices into the old, unsorted list
const OLD_KEY_LAST = 'mubaFM_lastStation';
const MAX_RETRIES = 3;
const OFFLINE_MESSAGE = 'You’re offline. Live radio needs an internet connection.';
const DEFAULT_TITLE = 'mubaFM — Ethiopian & Islamic Live Radio';

const stations = STATIONS;
stations.forEach(station => {
  station.search = [station.name, station.nameAm || '', station.freq || 'live', station.category, station.initials || ''].join(' ').toLowerCase();
});

/* ---------- DOM ---------- */
const $ = id => document.getElementById(id);
const audio = $('main-player');
const nowCard = $('now-card');
const nowArt = $('now-art');
const nowBackdrop = $('np-backdrop');
const btnShare = $('btn-share');
const shareStatus = $('share-status');
const nowTitle = $('now-title');
const nowCategory = $('now-category');
const nowSub = $('now-sub');
const playerStatus = $('player-status');
const btnPrev = $('btn-prev');
const btnPlay = $('btn-play');
const btnNext = $('btn-next');
const volumeControl = $('volume-control');
const volumeValue = $('volume-value');
const volumeIcon = $('volume-icon');
const sleepBox = $('sleep');
const sleepStatus = $('sleep-status');
const sleepBar = $('sleep-bar');
const sleepFill = $('sleep-bar-fill');
const sleepPresets = $('sleep-presets');
const searchInput = $('search-input');
const searchClear = $('search-clear');
const favoritesToggle = $('favorites-toggle');
const categoryTabs = $('category-tabs');
const stationGroups = $('station-groups');
const stationCount = $('station-count');
const countLabel = $('station-count-label');
const installButton = $('install-button');
const miniPlayer = $('mini-player');
const miniInfo = $('mini-info');
const miniArt = $('mini-art');
const miniTitle = $('mini-title');
const miniSub = $('mini-sub');
const miniPlay = $('mini-play');
const miniPrev = $('mini-prev');
const miniNext = $('mini-next');

/* ---------- State ---------- */
const state = {
  currentIndex: -1,
  status: 'idle', // idle | ready | loading | playing | buffering | paused | reconnecting | error
  statusNote: '',
  retries: 0,
  searchTerm: '',
  activeCategory: 'All',
  favoritesOnly: false,
  favorites: new Set(), // station ids
  sleepTimer: null,
  sleepCountdown: null,
  sleepEnd: 0,
  sleepDuration: 0,
  userPaused: false,
  lastNonZeroVolume: 0.75,
  fadeInterval: null,
  fadeStartVolume: null,
  deferredPrompt: null,
  stallTimeout: null,
  retryTimeout: null,
  driftInterval: null,
  keepaliveContext: null,
  keepaliveSource: null
};
let nowCardVisible = true;
let renderedArtIndex = -2;

/* ---------- Helpers ---------- */
const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = name => `<svg class="ic" aria-hidden="true"><use href="#${name}"/></svg>`;
const SPINNER = '<svg class="spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>';
const freqLabel = station => station.freq || 'Live';
const isBusy = () => ['loading', 'buffering', 'reconnecting'].includes(state.status);
const isActive = () => state.status === 'playing' || isBusy();

function deriveInitials(name) {
  const words = name.split(/[\s-]+/).filter(word => /[a-z]/i.test(word));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name[0] + (name[1] || '')).replace(/^./, ch => ch.toUpperCase());
}

/* Logo when one is available, branded initials otherwise. The player uses the larger
   logo (falling back to the small one); a logo that fails to load is removed, which
   reveals the initials underneath (no broken-image icons). */
function artMarkup(station, { large = false } = {}) {
  if (!station) return `<span class="art-fallback">${icon('i-radio')}</span>`;
  const initials = esc(station.initials || deriveInitials(station.name));
  const fallback = `<span class="art-fallback"><span class="art-initials">${initials}</span></span>`;
  if (!station.logo) return fallback;
  const main = large && station.logoLarge ? station.logoLarge : station.logo;
  const backup = main !== station.logo ? ` data-fallback="${esc(station.logo)}"` : '';
  const loading = large ? 'fetchpriority="high"' : 'loading="lazy"';
  return `${fallback}<img class="art-img" src="${esc(main)}"${backup} alt="" ${loading} decoding="async">`;
}
document.addEventListener('error', event => {
  const image = event.target;
  if (!image.classList || !image.classList.contains('art-img')) return;
  const backup = image.dataset.fallback;
  if (backup) {
    image.removeAttribute('data-fallback');
    image.src = backup;
  } else {
    image.remove();
  }
}, true);

/* ---------- Storage (ids, with a one-time migration from the old index-based keys) ---------- */
function loadFavorites() {
  try {
    const saved = localStorage.getItem(KEY_FAVORITES);
    let ids;
    if (saved !== null) {
      ids = JSON.parse(saved);
    } else {
      const old = JSON.parse(localStorage.getItem(OLD_KEY_FAVORITES) || '[]');
      ids = (Array.isArray(old) ? old : []).map(index => LEGACY_STATION_ORDER[index]);
    }
    const known = new Set(stations.map(station => station.id));
    const kept = (Array.isArray(ids) ? ids : []).filter(id => known.has(id)); // drops stations that were removed
    state.favorites = new Set(kept);
    if (saved === null ? kept.length : kept.length !== ids.length) saveFavorites();
  } catch {
    state.favorites = new Set();
  }
}

function saveFavorites() {
  try { localStorage.setItem(KEY_FAVORITES, JSON.stringify([...state.favorites])); } catch {}
}

function loadLastStation() {
  try {
    let id = localStorage.getItem(KEY_LAST);
    if (id === null) {
      const oldIndex = localStorage.getItem(OLD_KEY_LAST);
      if (oldIndex !== null) id = LEGACY_STATION_ORDER[Number(oldIndex)] || null;
    }
    const index = stations.findIndex(station => station.id === id);
    if (index >= 0) state.currentIndex = index;
  } catch {}
}

/* A shared link looks like /?station=<id>. It selects that station (browsers won't autoplay, so the
   listener taps play) and then tidies the address bar. */
function loadSharedStation() {
  const id = new URLSearchParams(location.search).get('station');
  if (id === null) return;
  const index = stations.findIndex(station => station.id === id);
  if (index >= 0) {
    state.currentIndex = index;
    saveLastStation(index);
  }
  try { history.replaceState(null, '', location.pathname + location.hash); } catch {}
}

function saveLastStation(index) {
  try { localStorage.setItem(KEY_LAST, stations[index].id); } catch {}
}

/* ---------- Filtering and rendering ---------- */
function getFilteredStations() {
  const tokens = state.searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  return stations
    .map((station, index) => ({ station, index }))
    .filter(({ station }) => {
      if (state.favoritesOnly && !state.favorites.has(station.id)) return false;
      if (state.activeCategory !== 'All' && station.category !== state.activeCategory) return false;
      return tokens.every(token => station.search.includes(token));
    });
}

function stationRow(station, index) {
  const isFav = state.favorites.has(station.id);
  const am = station.nameAm ? `<span class="station-am" lang="am">${esc(station.nameAm)}</span>` : '';
  return `<li class="station" data-index="${index}">
    <button type="button" class="station-main" data-action="play" aria-label="Play ${esc(station.name)}">
      <span class="art art-sm">${artMarkup(station)}</span>
      <span class="station-text">
        <span class="station-name" title="${esc(station.name)}">${esc(station.name)}</span>
        <span class="station-meta">${am}<span class="station-freq">${esc(freqLabel(station))}</span></span>
      </span>
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
    <button type="button" class="fav" data-action="fav" aria-pressed="${isFav}" aria-label="${isFav ? 'Remove' : 'Add'} ${esc(station.name)} ${isFav ? 'from' : 'to'} favorites">${icon('i-star')}</button>
  </li>`;
}

let stationRows = [];
let stationGroupEls = [];
let emptyState = null;

function buildStationList() {
  stationGroups.innerHTML = STATION_CATEGORIES.map(category => `<section class="group" aria-label="${esc(category)}">
      <header class="group-head"><h3>${esc(category)}</h3><span class="group-count"></span></header>
      <ul class="station-list">${stations.map((station, index) => (station.category === category ? stationRow(station, index) : '')).join('')}</ul>
    </section>`).join('') + '<div class="empty" id="empty-state" hidden></div>';
  stationRows = [...stationGroups.querySelectorAll('.station')];
  stationGroupEls = [...stationGroups.querySelectorAll('.group')];
  emptyState = $('empty-state');
}

function emptyStateMarkup() {
  const query = state.searchTerm.trim();
  let title = 'No stations here yet';
  let hint = 'Try another category.';
  let action = '';
  if (query) {
    title = `No stations match “${esc(query)}”`;
    hint = 'Check the spelling, or search by frequency, such as 102.1.';
    action = '<button type="button" class="chip" data-action="clear-search">Clear search</button>';
  } else if (state.favoritesOnly) {
    title = 'No favorites yet';
    hint = 'Tap the star beside any station to keep it here.';
  }
  return `${icon('i-search')}<strong>${title}</strong><p>${hint}</p>${action}`;
}

function applyFilters() {
  let total = 0;
  const visibleIds = new Set(getFilteredStations().map(({ index }) => index));
  stationRows.forEach(row => {
    const show = visibleIds.has(Number(row.dataset.index));
    row.hidden = !show;
    if (show) total += 1;
  });
  stationGroupEls.forEach(group => {
    const count = group.querySelectorAll('.station:not([hidden])').length;
    group.hidden = count === 0;
    group.querySelector('.group-count').textContent = count;
  });
  stationCount.textContent = total;
  countLabel.textContent = total === 1 ? 'station' : 'stations';
  emptyState.hidden = total > 0;
  if (!total) emptyState.innerHTML = emptyStateMarkup();
}

/* Update row state in place so keyboard focus is never lost while playing. */
function syncRows() {
  const rowState = state.status === 'playing' ? 'playing' : isBusy() ? 'buffering' : 'idle';
  stationRows.forEach(row => {
    const index = Number(row.dataset.index);
    const isCurrent = index === state.currentIndex;
    row.classList.toggle('is-current', isCurrent);
    row.dataset.state = isCurrent ? rowState : '';
    const main = row.querySelector('.station-main');
    const name = stations[index].name;
    if (isCurrent) {
      main.setAttribute('aria-current', 'true');
      main.setAttribute('aria-label', `${isActive() ? 'Pause' : 'Play'} ${name}`);
    } else {
      main.removeAttribute('aria-current');
      main.setAttribute('aria-label', `Play ${name}`);
    }
  });
}

/* ---------- Ambient backdrop and colour tint ---------- */
const DEFAULT_TINT = 'rgb(217, 189, 130)';
let backdropToken = 0;
let backdropActive = -1;

/* Average colour of an image, weighted towards saturated mid-bright pixels, so a white or black
   logo background doesn't wash the tint out. Returns null when the logo has no real colour. */
function dominantColor(image) {
  try {
    const size = 24;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0, g = 0, b = 0, weight = 0;
    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      const min = Math.min(data[i], data[i + 1], data[i + 2]);
      if (max < 40) continue;
      const w = ((max - min) / max) ** 2 * (max / 255);
      r += data[i] * w; g += data[i + 1] * w; b += data[i + 2] * w; weight += w;
    }
    if (weight < 0.6) return null;
    r /= weight; g /= weight; b /= weight;
    const lift = Math.min(2, 205 / Math.max(r, g, b, 1)); // keep the glow visible on dark logos
    return `rgb(${Math.round(Math.min(255, r * lift))}, ${Math.round(Math.min(255, g * lift))}, ${Math.round(Math.min(255, b * lift))})`;
  } catch {
    return null; // unreadable image: keep the default gold
  }
}

function setBackdrop(station) {
  const token = ++backdropToken;
  const layers = [...nowBackdrop.children];
  const root = document.documentElement.style;
  const src = station && station.logo;
  const clear = () => {
    layers.forEach(layer => layer.classList.remove('is-on'));
    backdropActive = -1;
    root.setProperty('--tint', DEFAULT_TINT);
  };
  if (!src) { clear(); return; }
  const probe = new Image();
  probe.decoding = 'async';
  probe.onload = () => {
    if (token !== backdropToken) return; // a newer station was picked meanwhile
    const next = backdropActive === 0 ? 1 : 0;
    layers[next].style.backgroundImage = `url("${encodeURI(src)}")`;
    layers[next].classList.add('is-on');
    if (backdropActive >= 0) layers[backdropActive].classList.remove('is-on');
    backdropActive = next;
    root.setProperty('--tint', dominantColor(probe) || DEFAULT_TINT);
  };
  probe.onerror = () => { if (token === backdropToken) clear(); };
  probe.src = src;
}

/* ---------- Status and now-playing UI ---------- */
function statusText() {
  if (state.statusNote) return state.statusNote;
  switch (state.status) {
    case 'ready': return 'Ready to play';
    case 'loading': return 'Connecting…';
    case 'buffering': return 'Buffering…';
    case 'reconnecting': return `Connection lost. Reconnecting (${state.retries}/${MAX_RETRIES})…`;
    case 'playing': return 'Streaming live';
    case 'paused': return 'Paused';
    case 'error': return 'This stream is unavailable right now. Try another station.';
    default: return 'Select a station to begin.';
  }
}

function setStatus(status, note = '') {
  state.status = status;
  state.statusNote = note;
  syncUI();
}

function setPlayIcons() {
  const busy = isBusy();
  const playing = state.status === 'playing' || busy;
  const content = busy ? SPINNER : icon(playing ? 'i-pause' : 'i-play');
  const label = playing ? 'Pause' : 'Play';
  [btnPlay, miniPlay].forEach(button => {
    button.innerHTML = content;
    button.setAttribute('aria-label', label);
  });
}

function syncUI() {
  const station = stations[state.currentIndex];
  nowCard.dataset.status = state.status;
  miniPlayer.dataset.status = state.status;
  btnShare.hidden = !station;

  if (renderedArtIndex !== state.currentIndex) {
    // only redraw artwork when the station changes, so logos never reload or flicker
    renderedArtIndex = state.currentIndex;
    nowArt.innerHTML = artMarkup(station, { large: true });
    miniArt.innerHTML = artMarkup(station);
    setBackdrop(station);
  }

  if (station) {
    nowTitle.textContent = station.name;
    nowTitle.title = station.name;
    nowCategory.textContent = station.category;
    nowSub.innerHTML = station.nameAm
      ? `<span lang="am">${esc(station.nameAm)}</span> · ${esc(freqLabel(station))}`
      : esc(freqLabel(station));
    miniTitle.textContent = station.name;
    const showInfo = state.status === 'playing' || state.status === 'ready';
    miniSub.textContent = showInfo ? `${station.category} · ${freqLabel(station)}` : statusText();
  } else {
    nowTitle.textContent = 'Choose a station';
    nowCategory.textContent = 'Live radio';
    nowSub.textContent = 'Pick one from the list to start listening';
  }

  playerStatus.textContent = statusText();
  document.title = station && state.status === 'playing' ? `${station.name} — mubaFM` : DEFAULT_TITLE;
  setPlayIcons();
  syncRows();
  refreshMiniVisibility();
  updateMediaSession(station);
}

/* ---------- Playback ---------- */
function streamUrl(station, attempt = 0) {
  const urls = [station.url, ...(station.altUrls || [])];
  return urls[attempt % urls.length];
}

function setStation(index, { autoplay = false, remember = true } = {}) {
  const station = stations[index];
  if (!station) return;
  clearStallTimeout();
  clearRetryTimeout();
  state.currentIndex = index;
  state.retries = 0;
  state.userPaused = false;
  audio.src = streamUrl(station);
  audio.load();
  if (remember) saveLastStation(index);
  setStatus(autoplay ? 'loading' : 'ready');
  if (autoplay) playStation();
}

function playStation() {
  state.userPaused = false;
  if (state.currentIndex < 0) {
    const visible = getFilteredStations();
    if (visible.length) setStation(visible[0].index, { autoplay: true });
    return;
  }
  if (!navigator.onLine) {
    setStatus('error', OFFLINE_MESSAGE); // say so at once instead of retrying a stream that can't load
    return;
  }
  if (!audio.src) {
    setStation(state.currentIndex, { autoplay: true });
    return;
  }
  if (state.status === 'error') {
    state.retries = 0;
    tryReloadStation();
    return;
  }
  if (audio.paused && audio.readyState < 3) setStatus('loading');
  audio.play().catch(error => {
    if (error && error.name === 'AbortError') return;
    if (error && error.name === 'NotAllowedError') {
      setStatus('paused', 'Playback was blocked. Tap play to start.');
    } else {
      handleStreamError();
    }
  });
}

/* A pause the listener asked for must stay a pause: cancel every pending
   reconnect / reload so nothing restarts the stream a few seconds later. */
function pauseStation() {
  state.userPaused = true;
  clearStallTimeout();
  clearRetryTimeout();
  state.retries = 0;
  audio.pause();
  if (state.currentIndex >= 0) setStatus('paused');
}

function togglePlayback() {
  if (state.currentIndex < 0 || !audio.src) { playStation(); return; }
  if (isActive()) pauseStation(); else playStation();
}

/* Previous / next walk the whole catalog in on-screen order, whatever the search box or tabs show. */
function changeStation(direction) {
  const total = stations.length;
  if (!total) return;
  const next = state.currentIndex >= 0
    ? (state.currentIndex + direction + total) % total
    : (direction > 0 ? 0 : total - 1);
  setStation(next, { autoplay: true });
}

function handleStreamError() {
  if (state.userPaused || state.currentIndex < 0) return;
  if (!navigator.onLine) {
    clearRetryTimeout();
    clearStallTimeout();
    setStatus('error', OFFLINE_MESSAGE);
    audio.pause();
    stopKeepalive();
    return;
  }
  // The element's 'error' event and the rejected play() promise report the same failure:
  // if a retry is already scheduled, don't count it twice.
  if (state.retryTimeout) return;
  clearStallTimeout();
  if (state.retries < MAX_RETRIES) {
    state.retries += 1;
    setStatus('reconnecting');
    state.retryTimeout = setTimeout(() => {
      state.retryTimeout = null;
      tryReloadStation();
    }, 3000);
  } else {
    setStatus('error');
    audio.pause();
    stopKeepalive();
  }
}

function tryReloadStation() {
  if (state.userPaused) return;
  const station = stations[state.currentIndex];
  if (!station) return;
  if (state.status !== 'reconnecting') setStatus('loading');
  audio.src = streamUrl(station, state.retries); // later attempts rotate through backup URLs
  audio.load();
  audio.play().catch(error => {
    if (error && error.name === 'AbortError') return;
    handleStreamError();
  });
}

function clearStallTimeout() {
  if (state.stallTimeout) { clearTimeout(state.stallTimeout); state.stallTimeout = null; }
}

function clearRetryTimeout() {
  if (state.retryTimeout) { clearTimeout(state.retryTimeout); state.retryTimeout = null; }
}

function startDriftWatcher() {
  if (state.driftInterval) clearInterval(state.driftInterval);
  state.driftInterval = setInterval(() => {
    if (audio.paused || audio.ended || state.userPaused) return;
    if (audio.buffered.length > 0) {
      const end = audio.buffered.end(audio.buffered.length - 1);
      if (Math.abs(end - audio.currentTime) > 10) tryReloadStation();
    }
  }, 60000);
}

function stopDriftWatcher() {
  if (state.driftInterval) { clearInterval(state.driftInterval); state.driftInterval = null; }
}

/* Silent audio loop that helps some mobile browsers keep the audio session alive.
   Only runs while playing, and is closed again on pause or error. */
function startKeepalive() {
  if (state.keepaliveContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const context = new AudioCtx();
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(context.destination);
    source.start(0);
    state.keepaliveContext = context;
    state.keepaliveSource = source;
  } catch {
    state.keepaliveContext = null;
    state.keepaliveSource = null;
  }
}

function stopKeepalive() {
  if (state.keepaliveSource) {
    try { state.keepaliveSource.stop(); } catch {}
    state.keepaliveSource = null;
  }
  if (state.keepaliveContext) {
    state.keepaliveContext.close().catch(() => {});
    state.keepaliveContext = null;
  }
}

/* ---------- Volume ---------- */
function updateVolumeUI() {
  const volume = Number(audio.volume.toFixed(2));
  const muted = audio.muted || volume === 0;
  if (!audio.muted && volume > 0) state.lastNonZeroVolume = volume;
  const shown = muted ? 0 : volume;
  volumeValue.textContent = `${Math.round(shown * 100)}%`;
  volumeIcon.innerHTML = icon(muted ? 'i-vol-mute' : volume < 0.4 ? 'i-vol-low' : 'i-vol-high');
  volumeIcon.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  volumeControl.style.setProperty('--fill', `${Math.round(shown * 100)}%`);
}

function toggleMute() {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    if (audio.volume === 0) audio.volume = state.lastNonZeroVolume || 0.75;
    volumeControl.value = audio.volume;
  } else {
    state.lastNonZeroVolume = audio.volume;
    audio.muted = true;
  }
  updateVolumeUI();
}

/* ---------- Sleep timer ---------- */
function formatSleep(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

function markSleepPreset(minutes) {
  sleepPresets.querySelectorAll('.chip').forEach(button => {
    const active = Number(button.dataset.mins) === minutes;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function resetSleepUI() {
  state.sleepDuration = 0;
  sleepStatus.textContent = 'Off';
  sleepBox.dataset.active = 'false';
  sleepBar.hidden = true;
  markSleepPreset(0);
}

/* Stops the countdown and, if a fade-out is under way, cancels it and puts the volume back. */
function clearSleepTimer() {
  clearInterval(state.sleepCountdown);
  state.sleepCountdown = null;
  if (state.fadeInterval) {
    clearInterval(state.fadeInterval);
    state.fadeInterval = null;
    if (state.fadeStartVolume != null) {
      audio.volume = state.fadeStartVolume;
      volumeControl.value = state.fadeStartVolume;
      updateVolumeUI();
    }
    state.fadeStartVolume = null;
  }
}

function setSleepTimer(minutes) {
  clearSleepTimer();
  if (minutes === 0) { resetSleepUI(); return; }

  markSleepPreset(minutes);
  state.sleepDuration = minutes * 60 * 1000;
  state.sleepEnd = Date.now() + state.sleepDuration;
  sleepBox.dataset.active = 'true';
  sleepBar.hidden = false;
  sleepFill.style.width = '100%';
  sleepStatus.textContent = formatSleep(state.sleepDuration);

  state.sleepCountdown = setInterval(() => {
    const remaining = Math.max(0, state.sleepEnd - Date.now());
    sleepFill.style.width = `${(remaining / state.sleepDuration) * 100}%`;
    sleepStatus.textContent = formatSleep(remaining);
    if (remaining <= 0) {
      clearInterval(state.sleepCountdown);
      state.sleepCountdown = null;
      fadeOutAndStop();
    }
  }, 1000);
}

function fadeOutAndStop() {
  const startVolume = audio.volume;
  const steps = 20;
  const stepAmount = startVolume / steps;
  let currentStep = 0;
  state.fadeStartVolume = startVolume;
  state.fadeInterval = setInterval(() => {
    currentStep += 1;
    audio.volume = Math.max(0, audio.volume - stepAmount);
    updateVolumeUI();
    if (currentStep >= steps) {
      clearInterval(state.fadeInterval);
      state.fadeInterval = null;
      state.fadeStartVolume = null;
      pauseStation();
      audio.volume = startVolume;
      volumeControl.value = startVolume;
      updateVolumeUI();
    }
  }, 120);
  resetSleepUI();
}

/* ---------- Favorites ---------- */
function toggleFavorite(index) {
  const station = stations[index];
  if (!station) return;
  if (state.favorites.has(station.id)) state.favorites.delete(station.id); else state.favorites.add(station.id);
  saveFavorites();
  const isFav = state.favorites.has(station.id);
  const row = stationRows.find(item => Number(item.dataset.index) === index);
  const button = row.querySelector('.fav');
  button.setAttribute('aria-pressed', String(isFav));
  button.setAttribute('aria-label', `${isFav ? 'Remove' : 'Add'} ${station.name} ${isFav ? 'from' : 'to'} favorites`);

  if (state.favoritesOnly && !isFav) {
    // the row leaves the list: keep keyboard focus somewhere sensible
    const hadFocus = row.contains(document.activeElement);
    applyFilters();
    if (hadFocus) {
      const visible = stationRows.filter(item => !item.hidden);
      const next = visible.find(item => stationRows.indexOf(item) > stationRows.indexOf(row)) || visible[visible.length - 1];
      (next ? next.querySelector('.station-main') : favoritesToggle).focus();
    }
  }
}

/* ---------- Mini player, brand link, media session ---------- */
function refreshMiniVisibility() {
  miniPlayer.classList.toggle('is-visible', state.currentIndex >= 0 && !nowCardVisible);
}

function setupMiniPlayer() {
  miniPlay.addEventListener('click', togglePlayback);
  miniPrev.addEventListener('click', () => changeStation(-1));
  miniNext.addEventListener('click', () => changeStation(1));
  miniInfo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  // The mini player floats over the list: when keyboard / screen-reader focus lands underneath it,
  // nudge the page so the focused control stays visible (scroll-padding alone doesn't do this in every browser).
  document.addEventListener('focusin', event => {
    if (!miniPlayer.classList.contains('is-visible') || miniPlayer.contains(event.target)) return;
    const overlap = event.target.getBoundingClientRect().bottom - miniPlayer.getBoundingClientRect().top;
    if (overlap > -8) window.scrollBy({ top: overlap + 16, behavior: 'instant' });
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      nowCardVisible = entries[0].isIntersecting;
      refreshMiniVisibility();
    }, { threshold: 0.2 }).observe(nowCard);
  }
}

function setupBrandHome() {
  $('brand-home').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateMediaSession(station) {
  if (!('mediaSession' in navigator) || !station) return;
  try {
    const artwork = [
      ...(station.logo ? [{ src: station.logoLarge || station.logo, type: 'image/webp' }] : []),
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.nameAm ? `${station.nameAm} · ${station.category}` : station.category,
      album: 'mubaFM Live',
      artwork
    });
    navigator.mediaSession.playbackState = isActive() ? 'playing' : 'paused';
  } catch {}
}

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const handlers = {
    play: () => playStation(),
    pause: () => pauseStation(),
    stop: () => pauseStation(),
    previoustrack: () => changeStation(-1),
    nexttrack: () => changeStation(1)
  };
  Object.entries(handlers).forEach(([action, handler]) => {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch {}
  });
}

/* ---------- Sharing ---------- */
function stationShareUrl(station) {
  const url = new URL('./', location.href); // works from the site root or a sub-folder
  url.search = '';
  url.hash = '';
  url.searchParams.set('station', station.id);
  return url.href;
}

let shareResetTimer = null;
function announceShare(message) {
  clearTimeout(shareResetTimer);
  btnShare.dataset.state = 'done';
  btnShare.querySelector('use').setAttribute('href', '#i-check');
  shareStatus.textContent = message;
  shareResetTimer = setTimeout(() => {
    delete btnShare.dataset.state;
    btnShare.querySelector('use').setAttribute('href', '#i-share');
    shareStatus.textContent = '';
  }, 2200);
}

/* Native share sheet where the browser has one (phones), otherwise copy the link. */
async function shareStation() {
  const station = stations[state.currentIndex];
  if (!station) return;
  const data = {
    title: `${station.name} · mubaFM`,
    text: `Listen to ${station.name} live on mubaFM`,
    url: stationShareUrl(station),
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') return; // the listener closed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    announceShare('Link copied');
  } catch {
    window.prompt('Copy this link', data.url);
  }
}

/* ---------- Connectivity, install, service worker ---------- */
/* When the connection returns after an offline stop, pick the stream back up on its own. */
function handleBackOnline() {
  if (state.statusNote !== OFFLINE_MESSAGE || state.userPaused || state.currentIndex < 0) return;
  state.retries = 0;
  tryReloadStation();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.warn('Service worker registration failed:', error);
  });
}

/* ---------- Events ---------- */
function setCategory(category) {
  state.activeCategory = category;
  categoryTabs.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  applyFilters();
}

function clearSearch() {
  state.searchTerm = '';
  searchInput.value = '';
  searchClear.hidden = true;
  applyFilters();
}

function attachEventListeners() {
  btnPlay.addEventListener('click', togglePlayback);
  btnShare.addEventListener('click', shareStation);
  btnPrev.addEventListener('click', () => changeStation(-1));
  btnNext.addEventListener('click', () => changeStation(1));

  volumeControl.addEventListener('input', event => {
    audio.volume = Number(event.target.value);
    if (audio.muted && audio.volume > 0) audio.muted = false;
    updateVolumeUI();
  });
  volumeIcon.addEventListener('click', toggleMute);

  searchInput.addEventListener('input', event => {
    state.searchTerm = event.target.value;
    searchClear.hidden = !state.searchTerm;
    applyFilters();
  });
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Escape' && searchInput.value) { event.preventDefault(); clearSearch(); }
  });
  searchClear.addEventListener('click', () => { clearSearch(); searchInput.focus(); });

  favoritesToggle.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
    applyFilters();
  });

  categoryTabs.addEventListener('click', event => {
    const tab = event.target.closest('.tab');
    if (tab) setCategory(tab.dataset.category);
  });

  stationGroups.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    if (target.dataset.action === 'clear-search') { clearSearch(); searchInput.focus(); return; }
    const row = target.closest('.station');
    if (!row) return;
    const index = Number(row.dataset.index);
    if (target.dataset.action === 'fav') toggleFavorite(index);
    else if (index === state.currentIndex && state.status !== 'error') togglePlayback();
    else setStation(index, { autoplay: true });
  });

  sleepPresets.addEventListener('click', event => {
    const button = event.target.closest('.chip');
    if (button) setSleepTimer(Number(button.dataset.mins));
  });

  audio.addEventListener('play', () => {
    if (state.status !== 'reconnecting') setStatus(audio.readyState >= 3 ? 'playing' : 'loading');
    updateMediaSession(stations[state.currentIndex]);
    startKeepalive();
    startDriftWatcher();
  });

  audio.addEventListener('playing', () => {
    clearStallTimeout();
    clearRetryTimeout();
    state.retries = 0;
    setStatus('playing');
  });

  audio.addEventListener('pause', () => {
    stopKeepalive();
    stopDriftWatcher();
    if (state.currentIndex < 0) return;
    // A failing stream also makes the element pause itself. The error path (retry, then
    // 'error') owns that state, so don't cancel its timers or overwrite its status.
    if (audio.error && !state.userPaused) return;
    clearStallTimeout();
    clearRetryTimeout();
    if (state.status === 'error' && !state.userPaused) return;
    setStatus('paused');
  });

  const onStall = () => {
    if (audio.paused || state.userPaused) return;
    if (audio.readyState >= 3) return; // the browser still has audio ready to play: not a real stall
    if (state.status !== 'reconnecting') setStatus('buffering');
    if (state.stallTimeout || state.retryTimeout) return; // already counting down
    // A stream that connects but never delivers audio uses the same retry budget as an error,
    // so it ends in the "unavailable" message instead of reloading forever.
    state.stallTimeout = setTimeout(() => {
      state.stallTimeout = null;
      if (audio.paused || state.userPaused || audio.readyState >= 3) return;
      handleStreamError();
    }, 4000);
  };
  audio.addEventListener('waiting', onStall);
  audio.addEventListener('stalled', onStall);

  audio.addEventListener('canplay', () => {
    clearStallTimeout();
    if (!audio.paused && state.status !== 'playing') setStatus('playing');
  });

  audio.addEventListener('error', handleStreamError);
  audio.addEventListener('ended', () => {
    // a live stream should never end: treat it as a dropped connection
    if (!state.userPaused) handleStreamError();
  });

  window.addEventListener('keydown', event => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SUMMARY', 'A'].includes(tag)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return; // leave browser shortcuts alone
    if (event.code === 'Space') { event.preventDefault(); togglePlayback(); }
    if (event.code === 'ArrowLeft') { event.preventDefault(); changeStation(-1); }
    if (event.code === 'ArrowRight') { event.preventDefault(); changeStation(1); }
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.deferredPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    installButton.hidden = true;
    state.deferredPrompt = null;
  });
  window.addEventListener('appinstalled', () => { installButton.hidden = true; });
}

/* ---------- Init ---------- */
function init() {
  registerServiceWorker();
  attachEventListeners();
  setupMiniPlayer();
  setupBrandHome();
  setupMediaSession();
  loadFavorites();
  loadLastStation();
  loadSharedStation();
  audio.volume = Number(volumeControl.value);
  updateVolumeUI();
  buildStationList();
  applyFilters();
  setStatus(state.currentIndex >= 0 ? 'ready' : 'idle');
  window.addEventListener('online', handleBackOnline);
}

init();
