const STORAGE_FAVORITES = 'mubaFM_favorites';
const STORAGE_LAST = 'mubaFM_lastStation';

const stations = [
  { name: 'Tirta FM', freq: 'Live', url: 'https://stream.zeno.fm/x751reg18zhvv', gradient: 'linear-gradient(135deg, #f5c842, #e8a020)', category: 'Ethiopian Radio', icon: '🏞' },
  { name: 'Awash FM 90.7', freq: '90.7 MHz', url: 'https://stream.zeno.fm/655zm6w4vc9uv', gradient: 'linear-gradient(135deg, #e8a020, #c97d10)', category: 'Ethiopian Radio', icon: '🌊' },
  { name: 'Bisrat FM 101', freq: '101 MHz', url: 'https://bisratfm-atunwadigital.streamguys1.com/bisratfm', gradient: 'linear-gradient(135deg, #c97d10, #f5c842)', category: 'Ethiopian Radio', icon: '🎧' },
  { name: 'Sheger FM 102.1', freq: '102.1 MHz', url: 'https://stream.zenolive.com/y91n1vtbaw5tv', gradient: 'linear-gradient(135deg, #f5c842, #ffb547)', category: 'Ethiopian Radio', icon: '🌆' },
  { name: 'FM Addis 97.1', freq: '97.1 MHz', url: 'https://stream.zeno.fm/rb6wbrap7yzuv', gradient: 'linear-gradient(135deg, #e8a020, #d38d1d)', category: 'Ethiopian Radio', icon: '🌟' },
  { name: 'Ethio FM 107.8', freq: '107.8 MHz', url: 'https://stream.zeno.fm/b8skbyqeqeruv', gradient: 'linear-gradient(135deg, #f5c842, #da9c2a)', category: 'Ethiopian Radio', icon: '🎶' },
  { name: 'Ahadu Radio', freq: 'Live', url: 'https://stream.zeno.fm/txxpndf1wwzuv', gradient: 'linear-gradient(135deg, #e8a020, #f5c842)', category: 'Ethiopian Radio', icon: '📻' },
  { name: 'Mirt Radio', freq: 'Live', url: 'https://stream.zeno.fm/akmuznguawzuv', gradient: 'linear-gradient(135deg, #c97d10, #e8a020)', category: 'Ethiopian Radio', icon: '🎤' },
  { name: 'EthiopikaLink', freq: 'Live', url: 'https://stream.zeno.fm/67x9n638rfeuv', gradient: 'linear-gradient(135deg, #f5c842, #c97d10)', category: 'Ethiopian Radio', icon: '🔗' },
  { name: 'Taem Radio', freq: 'Live', url: 'https://stream-158.zeno.fm/ffg8htkh1k0uv', gradient: 'linear-gradient(135deg, #e8a020, #ffcc56)', category: 'Ethiopian Radio', icon: '🪕' },
  { name: 'Jano FM', freq: 'Live', url: 'https://stream.zeno.fm/1cyn1as4v68uv', gradient: 'linear-gradient(135deg, #c97d10, #f5c842)', category: 'Ethiopian Radio', icon: '🎷' },
  { name: 'Arada FM', freq: 'Live', url: 'https://stream.zeno.fm/prvemoptrjttv', gradient: 'linear-gradient(135deg, #f5c842, #e8a020)', category: 'Ethiopian Radio', icon: '🏙' },
  { name: 'Anchoye Musica', freq: 'Live', url: 'https://stream.zeno.fm/um5wuf4spwzuv', gradient: 'linear-gradient(135deg, #e8a020, #c97d10)', category: 'Ethiopian Radio', icon: '🎼' },
  { name: 'Merkato FM', freq: 'Live', url: 'https://stream.zeno.fm/x6orbkpip6vvv', gradient: 'linear-gradient(135deg, #f5c842, #d18b1f)', category: 'Ethiopian Radio', icon: '🛍' },
  { name: 'Yenevibe Radio', freq: 'Live', url: 'https://stream.zeno.fm/5mz3qqftsnhvv', gradient: 'linear-gradient(135deg, #e8a020, #f5c842)', category: 'Ethiopian Radio', icon: '💫' },
  { name: 'Qesht FM', freq: 'Live', url: 'https://stream.zeno.fm/nimqkyamhmzvv', gradient: 'linear-gradient(135deg, #c97d10, #ffb547)', category: 'Ethiopian Radio', icon: '🔥' },
  { name: 'Agelgl Radio', freq: 'Live', url: 'https://stream.zeno.fm/nyhmvyax1d1tv', gradient: 'linear-gradient(135deg, #f5c842, #c97d10)', category: 'Ethiopian Radio', icon: '🌙' },
  { name: 'Addis Music', freq: 'Live', url: 'https://stream.zeno.fm/umguj2baxdctv', gradient: 'linear-gradient(135deg, #a8f5ed, #7ae6c2)', category: 'Music Channels', icon: '🎵' },
  { name: 'J FM', freq: 'Live', url: 'https://stream.zeno.fm/w8knfk1w7bhvv', gradient: 'linear-gradient(135deg, #d6b5f2, #f5c842)', category: 'Music Channels', icon: '🎚' },
  { name: 'Foreign Music', freq: 'Live', url: 'https://stream.zeno.fm/k9hdn9trkrhvv', gradient: 'linear-gradient(135deg, #8ee4ff, #4fa7ff)', category: 'Music Channels', icon: '🌍' },
  { name: 'Ethio Oldies', freq: 'Live', url: 'https://www.ethioldies.com/listen/ethioldies/radio.mp3', gradient: 'linear-gradient(135deg, #f5c842, #c97d10)', category: 'Music Channels', icon: '🎷' },
  { name: 'DJ Yared', freq: 'Live', url: 'https://stream.zeno.fm/szp8h3kc3c9uv', gradient: 'linear-gradient(135deg, #ff8a5c, #ffcc4f)', category: 'Music Channels', icon: '🎛' },
  { name: 'Asmaaxx', freq: 'Live', url: 'https://stream.zeno.fm/nkukhjz4vgtuv', gradient: 'linear-gradient(135deg, #f5c842, #e8a020)', category: 'Music Channels', icon: '🎧' },
  { name: 'Remix-S-DJ', freq: 'Live', url: 'https://stream.zeno.fm/pdeizhgrtrstv', gradient: 'linear-gradient(135deg, #ff4e8b, #f5c842)', category: 'Music Channels', icon: '🔥' },
  { name: 'Turkish Music', freq: 'Live', url: 'https://stream.zeno.fm/sudbfh4c2oftv', gradient: 'linear-gradient(135deg, #4d7cfe, #a78bfa)', category: 'Music Channels', icon: '🇹🇷' },
  { name: 'Saudi Quran 1', freq: 'Live', url: 'http://n01.radiojar.com/0tpy1h0kxtzuv?rj-ttl=5&rj-tok=AAABjrUiYUAAxwNU2wDdcOap9w', gradient: 'linear-gradient(135deg, #1f2937, #0f172a)', category: 'Islamic / Quran', icon: '📖' },
  { name: 'Sheikh Abd al-Rahman al-Sudais', freq: 'Live', url: 'https://stream.zeno.fm/qwl2utnbv0pvv', gradient: 'linear-gradient(135deg, #0f172a, #2d3748)', category: 'Islamic / Quran', icon: '🕋' },
  { name: 'Sheikh Saad Al-Ghamdi', freq: 'Live', url: 'https://stream.zeno.fm/jonj2q5xdo2vv', gradient: 'linear-gradient(135deg, #2d3748, #4a5568)', category: 'Islamic / Quran', icon: '🎙' },
  { name: 'Islam Soobhi Quran', freq: 'Live', url: 'https://stream.zeno.fm/zorvpgdqfzbuv', gradient: 'linear-gradient(135deg, #1e293b, #334155)', category: 'Islamic / Quran', icon: '🛎' }
];

const audio = document.getElementById('main-player');
const installButton = document.getElementById('install-button');
const searchInput = document.getElementById('search-input');
const favoritesToggle = document.getElementById('favorites-toggle');
const categoryTabs = document.getElementById('category-tabs');
const stationGroups = document.getElementById('station-groups');
const stationCount = document.getElementById('station-count');
const nowTitle = document.getElementById('now-title');
const nowCategory = document.getElementById('now-category');
const nowFrequency = document.getElementById('now-frequency');
const livePill = document.getElementById('live-pill');
const nowAvatar = document.getElementById('now-avatar');
const nowWaveform = document.getElementById('now-waveform');
const btnPrev = document.getElementById('btn-prev');
const btnPlay = document.getElementById('btn-play');
const btnNext = document.getElementById('btn-next');
const volumeControl = document.getElementById('volume-control');
const volumeValue = document.getElementById('volume-value');
const volumeIcon = document.getElementById('volume-icon');
const playerStatus = document.getElementById('player-status');
const sleepStatus = document.getElementById('sleep-status');
const sleepBar = document.getElementById('sleep-bar');
const sleepFill = document.getElementById('sleep-bar-fill');
const sleepTimeLeft = document.getElementById('sleep-time-left');
const sleepPresets = document.getElementById('sleep-presets');
const networkStrength = document.getElementById('network-strength');

const state = {
  currentIndex: -1,
  isPlaying: false,
  searchTerm: '',
  activeCategory: 'All',
  favoritesOnly: false,
  favorites: new Set(),
  sleepTimer: null,
  sleepCountdown: null,
  sleepEnd: 0,
  sleepDuration: 0,
  wakeLock: null,
  deferredPrompt: null,
  stallTimeout: null,
  retryTimeout: null,
  driftInterval: null,
  keepaliveContext: null,
  keepaliveSource: null
};

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]');
    state.favorites = new Set(Array.isArray(saved) ? saved : []);
  } catch {
    state.favorites = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify([...state.favorites]));
}

function loadLastStation() {
  const value = localStorage.getItem(STORAGE_LAST);
  const index = Number(value);
  if (!Number.isNaN(index) && index >= 0 && index < stations.length) {
    state.currentIndex = index;
  }
}

function saveLastStation(index) {
  localStorage.setItem(STORAGE_LAST, String(index));
}

function getFilteredStations() {
  return stations
    .map((station, index) => ({ ...station, index }))
    .filter(station => {
      if (state.favoritesOnly && !state.favorites.has(station.index)) return false;
      if (state.activeCategory !== 'All' && station.category !== state.activeCategory) return false;
      const term = state.searchTerm.toLowerCase();
      if (!term) return true;
      return station.name.toLowerCase().includes(term) || station.category.toLowerCase().includes(term);
    });
}

function renderStationGroups() {
  const filtered = getFilteredStations();
  stationCount.textContent = filtered.length;
  stationGroups.innerHTML = '';

  const categories = state.activeCategory === 'All'
    ? ['Ethiopian Radio', 'Music Channels', 'Islamic / Quran']
    : [state.activeCategory];

  categories.forEach(category => {
    const group = filtered.filter(station => station.category === category);
    if (!group.length) return;

    const block = document.createElement('div');
    block.className = 'group-block';

    const title = document.createElement('div');
    title.className = 'group-title';
    title.innerHTML = `<span>${category}</span><span>${group.length} stations</span>`;
    block.appendChild(title);

    group.forEach(station => {
      const card = document.createElement('article');
      card.className = 'station-card';
      if (station.index === state.currentIndex) card.classList.add('active');
      card.dataset.index = station.index;
      card.tabIndex = 0;

      const avatar = document.createElement('div');
      avatar.className = 'card-avatar-small';
      avatar.style.background = station.gradient;
      avatar.innerHTML = `
        <div class="radio-pulse ${state.currentIndex === station.index && state.isPlaying ? 'playing' : 'idle'}">
          <span class="radio-ring"></span>
          <span class="radio-ring"></span>
          <span class="radio-ring"></span>
          <span class="radio-ring"></span>
          <span class="radio-center"></span>
        </div>
      `;

      const copy = document.createElement('div');
      copy.className = 'station-copy';
      copy.innerHTML = `
        <div class="station-name">${station.icon} ${station.name}</div>
        <div class="station-details">${station.freq} • ${station.category}</div>
      `;

      const actions = document.createElement('div');
      actions.className = 'station-actions';
      actions.innerHTML = `
        <button type="button" class="favorite-toggle ${state.favorites.has(station.index) ? 'active' : ''}" data-index="${station.index}" aria-label="Toggle favorite">★</button>
      `;

      card.append(avatar, copy, actions);
      stationGroups.appendChild(card);
    });
  });

  if (!filtered.length) {
    stationGroups.innerHTML = `<p class="empty-state">No stations found. Adjust search or category.</p>`;
  }
}

function setStation(index, { autoplay = false, remember = true } = {}) {
  const station = stations[index];
  if (!station) return;
  state.currentIndex = index;
  audio.src = station.url;
  audio.load();
  if (remember) saveLastStation(index);
  updateNowPlaying(station);
  renderStationGroups();
  if (autoplay) playStation();
}

function updateNowPlaying(station) {
  nowTitle.textContent = station.name;
  nowCategory.textContent = station.category;
  nowFrequency.textContent = station.freq;
  nowAvatar.style.background = station.gradient;
  document.title = state.isPlaying ? `${station.name} — mubaFM` : 'mubaFM — Premium Ethiopian & Islamic Live Radio';
  playerStatus.textContent = state.isPlaying ? `Streaming ${station.name}` : `Ready to play ${station.name}`;
  livePill.classList.toggle('hidden', !state.isPlaying);
  nowWaveform.classList.toggle('hidden', !state.isPlaying);
  nowAvatar.classList.toggle('playing', state.isPlaying);
  nowAvatar.classList.toggle('idle', !state.isPlaying);
  btnPlay.textContent = state.isPlaying ? '▮▮' : '▶';
}

function updatePlayState() {
  state.isPlaying = !audio.paused && !audio.ended;
  const station = stations[state.currentIndex];
  if (station) updateNowPlaying(station);
  renderStationGroups();
}

function playStation() {
  if (!audio.src) {
    const visible = getFilteredStations();
    if (!visible.length) return;
    setStation(state.currentIndex >= 0 ? state.currentIndex : visible[0].index, { autoplay: false });
  }
  audio.play().catch(() => {
    playerStatus.textContent = 'Playback blocked. Tap to start.';
  });
}

function pauseStation() {
  audio.pause();
}

function togglePlayback() {
  if (!audio.src) {
    setStation(state.currentIndex, { autoplay: true });
    return;
  }
  if (audio.paused) playStation(); else pauseStation();
}

function updateVolumeUI() {
  const volume = Number(audio.volume.toFixed(2));
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
  volumeIcon.textContent = volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊';
}

function setSleepTimer(minutes) {
  clearTimeout(state.sleepTimer);
  clearInterval(state.sleepCountdown);
  sleepPresets.querySelectorAll('.sleep-preset').forEach(btn => btn.classList.remove('active'));

  const button = sleepPresets.querySelector(`[data-mins="${minutes}"]`);
  if (button) button.classList.add('active');

  if (minutes === 0) {
    state.sleepDuration = 0;
    sleepStatus.textContent = 'Off';
    sleepBar.classList.add('hidden');
    return;
  }

  state.sleepDuration = minutes * 60 * 1000;
  state.sleepEnd = Date.now() + state.sleepDuration;
  sleepBar.classList.remove('hidden');

  state.sleepCountdown = setInterval(() => {
    const remaining = Math.max(0, state.sleepEnd - Date.now());
    const pct = (remaining / state.sleepDuration) * 100;
    sleepFill.style.width = `${pct}%`;
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    const label = `${m}:${s.toString().padStart(2, '0')}`;
    sleepStatus.textContent = label;
    sleepTimeLeft.textContent = label;
    if (remaining <= 0) {
      clearInterval(state.sleepCountdown);
      fadeOutAndStop();
    }
  }, 1000);

  state.sleepTimer = setTimeout(() => {
    clearInterval(state.sleepCountdown);
    fadeOutAndStop();
  }, state.sleepDuration);
}

function fadeOutAndStop() {
  const startVolume = audio.volume;
  const steps = 20;
  const stepAmount = startVolume / steps;
  let currentStep = 0;
  const fade = setInterval(() => {
    currentStep += 1;
    audio.volume = Math.max(0, audio.volume - stepAmount);
    updateVolumeUI();
    if (currentStep >= steps) {
      clearInterval(fade);
      audio.pause();
      audio.volume = startVolume;
      volumeControl.value = startVolume;
      updateVolumeUI();
    }
  }, 120);
  state.sleepDuration = 0;
  sleepBar.classList.add('hidden');
  sleepStatus.textContent = 'Off';
}

function handleFavorite(index) {
  if (state.favorites.has(index)) state.favorites.delete(index); else state.favorites.add(index);
  saveFavorites();
  renderStationGroups();
}

function updateNetworkSignal() {
  const down = navigator.connection?.downlink;
  const bars = Array.from(networkStrength.querySelectorAll('span'));
  let activeCount = 0;
  if (typeof down === 'number') {
    activeCount = down >= 10 ? 3 : down >= 3 ? 2 : 1;
  }
  bars.forEach((bar, idx) => bar.classList.toggle('active', idx < activeCount));
}

async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    state.wakeLock = await navigator.wakeLock.request('screen');
    state.wakeLock.addEventListener('release', () => { state.wakeLock = null; });
  } catch {}
}

function releaseWakeLock() {
  if (state.wakeLock) {
    state.wakeLock.release().catch(() => {});
    state.wakeLock = null;
  }
}

function clearStallTimeout() {
  if (state.stallTimeout) { clearTimeout(state.stallTimeout); state.stallTimeout = null; }
}

function clearRetryTimeout() {
  if (state.retryTimeout) { clearTimeout(state.retryTimeout); state.retryTimeout = null; }
}

function tryReloadStation() {
  const station = stations[state.currentIndex];
  if (!station) return;
  audio.src = station.url;
  audio.load();
  audio.play().catch(() => { playerStatus.textContent = 'Retrying stream...'; });
}

function startDriftWatcher() {
  if (state.driftInterval) clearInterval(state.driftInterval);
  state.driftInterval = setInterval(() => {
    if (!audio || audio.paused || audio.ended) return;
    if (audio.buffered.length > 0) {
      const end = audio.buffered.end(audio.buffered.length - 1);
      if (Math.abs(end - audio.currentTime) > 10) {
        tryReloadStation();
      }
    }
  }, 60000);
}

function setupAudioKeepalive() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (state.keepaliveContext) return;
  state.keepaliveContext = new AudioCtx();
  const buffer = state.keepaliveContext.createBuffer(1, state.keepaliveContext.sampleRate, state.keepaliveContext.sampleRate);
  const source = state.keepaliveContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(state.keepaliveContext.destination);
  source.start(0);
  state.keepaliveSource = source;
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const code = `self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const excluded = ['zeno.fm', 'zenolive.com', 'streamguys1.com', 'radiojar.com', 'ethioldies.com'];
  if (excluded.some(host => url.href.includes(host))) return;
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.open('mubaFM-shell-v1').then(cache => cache.match(event.request).then(response => response || fetch(event.request).then(networkResponse => {
    const destination = event.request.destination;
    if (['script','style','document','image'].includes(destination)) {
      cache.put(event.request, networkResponse.clone());
    }
    return networkResponse;
  }))));
});`;
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  navigator.serviceWorker.register(url).catch(() => {});
}

function updatePageTitle() {
  const station = stations[state.currentIndex];
  if (station && state.isPlaying) {
    document.title = `${station.name} — mubaFM`;
  } else {
    document.title = 'mubaFM — Premium Ethiopian & Islamic Live Radio';
  }
}

function setCategory(category) {
  state.activeCategory = category;
  categoryTabs.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.category === category));
  renderStationGroups();
}

function attachEventListeners() {
  btnPlay.addEventListener('click', togglePlayback);
  btnPrev.addEventListener('click', () => changeStation(-1));
  btnNext.addEventListener('click', () => changeStation(1));

  volumeControl.addEventListener('input', event => {
    audio.volume = Number(event.target.value);
    updateVolumeUI();
  });

  searchInput.addEventListener('input', event => {
    state.searchTerm = event.target.value;
    renderStationGroups();
  });

  favoritesToggle.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    favoritesToggle.classList.toggle('active', state.favoritesOnly);
    favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
    renderStationGroups();
  });

  categoryTabs.addEventListener('click', event => {
    const tab = event.target.closest('.tab');
    if (!tab) return;
    setCategory(tab.dataset.category);
  });

  stationGroups.addEventListener('click', event => {
    const favoriteButton = event.target.closest('.favorite-toggle');
    if (favoriteButton) {
      const index = Number(favoriteButton.dataset.index);
      handleFavorite(index);
      return;
    }
    const card = event.target.closest('.station-card');
    if (!card) return;
    const index = Number(card.dataset.index);
    if (!Number.isNaN(index)) {
      setStation(index, { autoplay: true });
    }
  });

  stationGroups.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const card = event.target.closest('.station-card');
    if (!card) return;
    const index = Number(card.dataset.index);
    if (!Number.isNaN(index)) {
      setStation(index, { autoplay: true });
    }
  });

  sleepPresets.addEventListener('click', event => {
    const button = event.target.closest('.sleep-preset');
    if (!button) return;
    setSleepTimer(Number(button.dataset.mins));
  });

  audio.addEventListener('play', () => {
    state.isPlaying = true;
    updateNowPlaying(stations[state.currentIndex]);
    updatePageTitle();
    requestWakeLock();
    setupAudioKeepalive();
    updateNetworkSignal();
    clearStallTimeout();
    startDriftWatcher();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updateNowPlaying(stations[state.currentIndex]);
    updatePageTitle();
    releaseWakeLock();
  });

  audio.addEventListener('waiting', () => {
    clearStallTimeout();
    state.stallTimeout = setTimeout(() => {
      tryReloadStation();
    }, 4000);
  });

  audio.addEventListener('canplay', () => {
    clearStallTimeout();
  });

  audio.addEventListener('error', () => {
    clearRetryTimeout();
    state.retryTimeout = setTimeout(() => {
      tryReloadStation();
    }, 3000);
  });

  window.addEventListener('keydown', event => {
    if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlayback();
    }
    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      changeStation(-1);
    }
    if (event.code === 'ArrowRight') {
      event.preventDefault();
      changeStation(1);
    }
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.deferredPrompt = event;
    installButton.classList.remove('hidden');
  });

  installButton.addEventListener('click', async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    installButton.classList.add('hidden');
    state.deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    installButton.classList.add('hidden');
  });
}

function changeStation(direction) {
  const visible = getFilteredStations();
  if (!visible.length) return;
  const currentVisibleIndex = visible.findIndex(station => station.index === state.currentIndex);
  const nextIndex = currentVisibleIndex >= 0 ? (currentVisibleIndex + direction + visible.length) % visible.length : 0;
  setStation(visible[nextIndex].index, { autoplay: true });
}

function initializeUI() {
  loadFavorites();
  loadLastStation();
  audio.volume = Number(volumeControl.value);
  renderStationGroups();
  updateVolumeUI();
  setCategory(state.activeCategory);
  if (state.currentIndex >= 0) {
    const lastStation = stations[state.currentIndex];
    if (lastStation) updateNowPlaying(lastStation);
  }
}

function init() {
  registerServiceWorker();
  attachEventListeners();
  initializeUI();
  if (navigator.connection) {
    navigator.connection.addEventListener('change', updateNetworkSignal);
  }
}

init();
