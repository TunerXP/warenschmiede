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

  /* Native Controls bleiben im HTML als No-JavaScript-Fallback erhalten.
     Sobald dieser eigene Player läuft, übernimmt die Warenschmiede-Steuerung. */
  audio.controls = false;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds)) return '–:––';
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
  };

  const syncPlayState = () => {
    const playing = !audio.paused && !audio.ended;
    play.textContent = playing ? '❚❚ Pause' : '▶ Abspielen';
    play.setAttribute('aria-label', playing ? 'Running Back To You pausieren' : 'Running Back To You abspielen');
  };

  const syncMetadata = () => {
    duration.textContent = formatTime(audio.duration);
    progress.disabled = !Number.isFinite(audio.duration) || audio.duration <= 0;
  };

  const clearStatus = () => {
    status.textContent = '';
  };

  play.addEventListener('click', async () => {
    clearStatus();
    try {
      if (audio.paused || audio.ended) await audio.play();
      else audio.pause();
    } catch (error) {
      status.textContent = 'Die Audiodatei konnte nicht gestartet werden. Der MP3-Download bleibt verfügbar.';
    }
    syncPlayState();
  });

  audio.addEventListener('loadedmetadata', syncMetadata);

  audio.addEventListener('timeupdate', () => {
    current.textContent = formatTime(audio.currentTime);
    progress.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : '0';
  });

  progress.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
  });

  audio.addEventListener('play', syncPlayState);
  audio.addEventListener('pause', syncPlayState);
  audio.addEventListener('ended', syncPlayState);
  audio.addEventListener('canplay', clearStatus);
  audio.addEventListener('error', () => {
    status.textContent = 'Die Audiodatei ist gerade nicht erreichbar. Du kannst es später erneut versuchen oder den Downloadlink verwenden.';
    syncPlayState();
  });

  progress.disabled = true;
  if (audio.readyState >= 1) syncMetadata();
  syncPlayState();
})();
