(() => {
  const playButton = document.getElementById('btn-maerchen-play');
  const stopButton = document.getElementById('btn-maerchen-stop');
  const storyContainer = document.getElementById('ki-maerchen-traumland');
  const supportNotice = document.querySelector('[data-speech-support]');

  if (!playButton || !storyContainer) {
    return;
  }

  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  if (!synth) {
    playButton.disabled = true;
    playButton.setAttribute('aria-disabled', 'true');
    if (supportNotice) {
      supportNotice.hidden = false;
    }
    return;
  }

  const stopSpeech = () => {
    if (!synth) {
      return;
    }
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
  };

  const startSpeech = () => {
    const text = storyContainer.innerText.trim();
    if (!text) {
      return;
    }

    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    synth.speak(utterance);
  };

  playButton.addEventListener('click', startSpeech);

  if (stopButton) {
    stopButton.addEventListener('click', stopSpeech);
  }
})();
