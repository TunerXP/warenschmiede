(function () {
  const root = document.querySelector('[data-music-player]');
  if (!root) return;

  const audio = root.querySelector('[data-music-audio]');
  const play = root.querySelector('[data-music-play]');
  const progress = root.querySelector('[data-music-progress]');
  const current = root.querySelector('[data-music-current]');
  const duration = root.querySelector('[data-music-duration]');
  const volume = root.querySelector('[data-music-volume]');
  const status = root.querySelector('[data-music-status]');

  if (!audio || !play || !progress || !current || !duration || !volume || !status) return;

  const TRACK = {
    src: '/media/ki-musik/the-things-that-stay/audio/08-running-back-to-you.mp3',
    title: 'Running Back To You',
    album: 'The Things That Stay',
  };

  const formatTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return '–:––';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  };

  const isThisTrack = state => state?.src === TRACK.src;

  const render = state => {
    const active = isThisTrack(state);
    const total = active && Number.isFinite(state.duration) ? state.duration : 0;
    const position = active && Number.isFinite(state.position) ? state.position : 0;
    const playing = active && Boolean(state.actualPlaying);

    current.textContent = formatTime(position);
    duration.textContent = total > 0 ? formatTime(total) : '–:––';
    progress.disabled = !active || total <= 0;
    progress.value = total > 0 ? String((position / total) * 100) : '0';
    if (active && Number.isFinite(state.volume)) volume.value = String(state.volume);

    play.textContent = playing ? '❚❚ Pause' : active && state.resumeWanted ? '▶ Weiterhören' : '▶ Abspielen';
    play.setAttribute('aria-label', playing ? 'Running Back To You pausieren' : 'Running Back To You abspielen');

    if (active && state.resumeWanted && !playing) {
      status.textContent = 'Falls der Browser das automatische Fortsetzen blockiert: einfach hier oder oben im Menü auf Weiterhören klicken.';
    } else {
      status.textContent = '';
    }
  };

  const bindGlobalPlayer = () => {
    const player = window.WSGlobalMusicPlayer;
    if (!player || root.dataset.globalPlayerBound === 'true') return;
    root.dataset.globalPlayerBound = 'true';

    /* Das lokale Audio-Element bleibt im HTML als No-JavaScript-Fallback erhalten.
       Mit JavaScript übernimmt der globale Warenschmiede-Player den einzigen Audiokanal. */
    audio.pause();
    audio.controls = false;

    play.addEventListener('click', async () => {
      const state = player.getState();
      if (isThisTrack(state) && state.actualPlaying) {
        player.pause();
        return;
      }

      if (!isThisTrack(state)) {
        player.loadTrack(TRACK, { volume: Number(volume.value) });
      }

      const started = await player.play();
      if (!started) {
        status.textContent = 'Der Browser hat das Starten blockiert. Bitte noch einmal auf Weiterhören klicken.';
      }
    });

    progress.addEventListener('input', () => {
      const state = player.getState();
      if (!isThisTrack(state) || !state.duration) return;
      player.seek((Number(progress.value) / 100) * state.duration);
    });

    volume.addEventListener('input', () => {
      player.setVolume(Number(volume.value));
    });

    render(player.getState());
  };

  document.addEventListener('ws:music-state', event => render(event.detail));
  document.addEventListener('ws:global-player-ready', bindGlobalPlayer, { once: true });

  if (window.WSGlobalMusicPlayer) bindGlobalPlayer();
  else {
    progress.disabled = true;
    play.addEventListener('click', () => {
      if (!window.WSGlobalMusicPlayer) status.textContent = 'Der globale Musikplayer wird noch geladen …';
    }, { once: true });
  }
})();
