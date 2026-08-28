(function () {
  const root = document.querySelector('[data-ws-global-player]');
  if (!root) return;

  const playButton = root.querySelector('[data-ws-global-play]');
  const stopButton = root.querySelector('[data-ws-global-stop]');
  const titleNode = root.querySelector('[data-ws-global-title]');
  const statusNode = root.querySelector('[data-ws-global-status]');
  if (!playButton || !stopButton || !titleNode || !statusNode) return;

  const STATE_KEY = 'ws-music-player-state-v1';
  const audio = new Audio();
  audio.preload = 'metadata';

  const blankState = () => ({
    src: '',
    title: '',
    album: '',
    position: 0,
    volume: 1,
    playing: false,
    resumeWanted: false,
  });

  let state = blankState();
  let pendingPosition = 0;
  let lastSavedSecond = -1;

  const readStoredState = () => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null');
      if (!parsed || typeof parsed !== 'object' || !parsed.src) return null;
      return {
        ...blankState(),
        ...parsed,
        position: Number.isFinite(Number(parsed.position)) ? Math.max(0, Number(parsed.position)) : 0,
        volume: Number.isFinite(Number(parsed.volume)) ? Math.min(1, Math.max(0, Number(parsed.volume))) : 1,
        playing: Boolean(parsed.playing),
        resumeWanted: Boolean(parsed.resumeWanted),
      };
    } catch (error) {
      return null;
    }
  };

  const snapshot = () => ({
    ...state,
    position: Number.isFinite(audio.currentTime) ? audio.currentTime : state.position,
    duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    actualPlaying: !audio.paused && !audio.ended,
  });

  const saveState = () => {
    if (!state.src) {
      sessionStorage.removeItem(STATE_KEY);
      return;
    }
    const current = snapshot();
    state.position = current.position;
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      src: state.src,
      title: state.title,
      album: state.album,
      position: state.position,
      volume: state.volume,
      playing: state.playing,
      resumeWanted: state.resumeWanted,
    }));
  };

  const emitState = () => {
    document.dispatchEvent(new CustomEvent('ws:music-state', { detail: snapshot() }));
  };

  const render = () => {
    const active = Boolean(state.src);
    root.hidden = !active;
    if (!active) return;

    const actualPlaying = !audio.paused && !audio.ended;
    titleNode.textContent = state.title || 'Musik';
    playButton.textContent = actualPlaying ? '❚❚' : '▶';
    playButton.setAttribute('aria-label', actualPlaying
      ? `${state.title || 'Musik'} pausieren`
      : state.resumeWanted
        ? `${state.title || 'Musik'} weiterhören`
        : `${state.title || 'Musik'} abspielen`);
    playButton.title = actualPlaying ? 'Pause' : state.resumeWanted ? 'Weiterhören' : 'Abspielen';
    stopButton.setAttribute('aria-label', `${state.title || 'Musik'} stoppen`);
    root.classList.toggle('is-playing', actualPlaying);
    root.classList.toggle('is-resume-needed', !actualPlaying && state.resumeWanted);
    statusNode.textContent = state.resumeWanted && !actualPlaying ? 'Weiterhören' : '';
  };

  const applyPendingPosition = () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const target = Math.min(Math.max(0, pendingPosition), Math.max(0, audio.duration - 0.05));
    try {
      audio.currentTime = target;
    } catch (error) {
      // Manche Browser erlauben das Setzen erst etwas später. Der nächste Metadata-/Canplay-Lauf versucht es erneut.
    }
  };

  const loadTrack = (track, options = {}) => {
    if (!track || !track.src) return snapshot();
    const sameTrack = state.src === track.src;

    state.src = track.src;
    state.title = track.title || state.title || 'Musik';
    state.album = track.album || state.album || '';
    state.volume = Number.isFinite(Number(options.volume))
      ? Math.min(1, Math.max(0, Number(options.volume)))
      : state.volume;

    const requestedPosition = Number.isFinite(Number(options.position))
      ? Math.max(0, Number(options.position))
      : sameTrack
        ? state.position
        : 0;

    pendingPosition = requestedPosition;
    state.position = requestedPosition;
    audio.volume = state.volume;

    if (!sameTrack || audio.getAttribute('src') !== track.src) {
      audio.src = track.src;
      audio.load();
    } else {
      applyPendingPosition();
    }

    saveState();
    render();
    emitState();
    return snapshot();
  };

  const play = async (track) => {
    if (track?.src) loadTrack(track);
    if (!state.src) return false;

    statusNode.textContent = '';
    try {
      applyPendingPosition();
      await audio.play();
      state.playing = true;
      state.resumeWanted = false;
      saveState();
      render();
      emitState();
      return true;
    } catch (error) {
      state.playing = false;
      state.resumeWanted = true;
      saveState();
      render();
      emitState();
      return false;
    }
  };

  const pause = () => {
    if (!state.src) return;
    audio.pause();
    state.position = Number.isFinite(audio.currentTime) ? audio.currentTime : state.position;
    state.playing = false;
    state.resumeWanted = false;
    saveState();
    render();
    emitState();
  };

  const stop = () => {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (error) {
      // Bei einer noch nicht geladenen Datei gibt es nichts zurückzusetzen.
    }
    audio.removeAttribute('src');
    audio.load();
    pendingPosition = 0;
    lastSavedSecond = -1;
    state = blankState();
    sessionStorage.removeItem(STATE_KEY);
    render();
    emitState();
  };

  const seek = seconds => {
    if (!state.src) return;
    const target = Math.max(0, Number(seconds) || 0);
    pendingPosition = target;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(target, audio.duration);
    }
    state.position = target;
    saveState();
    emitState();
  };

  const setVolume = value => {
    const next = Math.min(1, Math.max(0, Number(value) || 0));
    state.volume = next;
    audio.volume = next;
    saveState();
    emitState();
  };

  const toggle = async () => {
    if (!state.src) return false;
    if (!audio.paused && !audio.ended) {
      pause();
      return true;
    }
    return play();
  };

  playButton.addEventListener('click', toggle);
  stopButton.addEventListener('click', stop);

  audio.addEventListener('loadedmetadata', () => {
    applyPendingPosition();
    render();
    emitState();
    if (state.resumeWanted) play();
  });
  audio.addEventListener('canplay', applyPendingPosition);
  audio.addEventListener('play', () => {
    state.playing = true;
    state.resumeWanted = false;
    saveState();
    render();
    emitState();
  });
  audio.addEventListener('pause', () => {
    if (!state.src) return;
    state.position = Number.isFinite(audio.currentTime) ? audio.currentTime : state.position;
    if (!state.resumeWanted) state.playing = false;
    saveState();
    render();
    emitState();
  });
  audio.addEventListener('timeupdate', () => {
    state.position = Number.isFinite(audio.currentTime) ? audio.currentTime : state.position;
    const second = Math.floor(state.position);
    if (second !== lastSavedSecond) {
      lastSavedSecond = second;
      saveState();
    }
    emitState();
  });
  audio.addEventListener('ended', () => {
    state.position = 0;
    pendingPosition = 0;
    state.playing = false;
    state.resumeWanted = false;
    saveState();
    render();
    emitState();
  });
  audio.addEventListener('error', () => {
    state.playing = false;
    state.resumeWanted = false;
    statusNode.textContent = 'Audio nicht erreichbar';
    saveState();
    render();
    emitState();
  });

  window.addEventListener('pagehide', () => {
    if (!state.src) return;
    state.position = Number.isFinite(audio.currentTime) ? audio.currentTime : state.position;
    const wasPlaying = !audio.paused && !audio.ended;
    state.playing = wasPlaying;
    state.resumeWanted = state.resumeWanted || wasPlaying;
    saveState();
  });

  window.WSGlobalMusicPlayer = {
    loadTrack,
    play,
    pause,
    stop,
    toggle,
    seek,
    setVolume,
    getState: snapshot,
  };

  const stored = readStoredState();
  if (stored) {
    state = {
      ...stored,
      playing: false,
      resumeWanted: Boolean(stored.playing || stored.resumeWanted),
    };
    pendingPosition = stored.position;
    audio.volume = state.volume;
    audio.src = state.src;
    audio.load();
    render();
  } else {
    render();
  }

  document.dispatchEvent(new CustomEvent('ws:global-player-ready', { detail: snapshot() }));
  emitState();
})();
