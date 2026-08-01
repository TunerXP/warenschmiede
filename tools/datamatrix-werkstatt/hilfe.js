(() => {
  const embedded = new URLSearchParams(location.search).get('embed') === '1';
  document.body.classList.toggle('is-embedded', embedded);
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const content = document.getElementById('helpContent');
  const sections = [...document.querySelectorAll('.help-content section[id]')];
  const selectChapter = id => links.forEach(link => link.classList.toggle('active', link.hash === `#${id}`));
  const currentId = () => location.hash.slice(1) || 'start';
  const setCurrentChapter = id => {
    selectChapter(id);
    if (location.hash !== `#${id}`) {
      const url = new URL(location.href);
      url.hash = id;
      history.replaceState(null, '', url);
    }
  };
  const showHash = () => {
    selectChapter(currentId());
    document.getElementById(currentId())?.scrollIntoView({ block: 'start' });
  };
  links.forEach(link => link.addEventListener('click', () => selectChapter(link.hash.slice(1))));
  window.addEventListener('hashchange', showHash);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (visible) setCurrentChapter(visible.target.id);
  }, { root: embedded ? content : null, rootMargin: '-15% 0px -70%', threshold: [0,.25,.6] });
  sections.forEach(section => observer.observe(section));
  showHash();
})();
