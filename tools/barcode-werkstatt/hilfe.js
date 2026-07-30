(()=>{
  const embedded = new URLSearchParams(location.search).get('embed') === '1';
  document.body.classList.toggle('is-embedded', embedded);

  document.querySelectorAll('.image-wrap img').forEach(img=>{
    const fallback = ()=>img.parentElement.classList.add('image-missing');
    img.addEventListener('error', fallback, {once:true});
    img.addEventListener('load', ()=>img.parentElement.classList.remove('image-missing'));
    if(img.complete && !img.naturalWidth) fallback();
  });

  const links = [...document.querySelectorAll('.chapter-nav a')];
  const sections = [...document.querySelectorAll('.help-content section[id]')];
  const selectChapter = id=>links.forEach(link=>link.classList.toggle('active', link.hash === `#${id}`));
  const currentId = ()=>location.hash.slice(1) || 'start';
  const setCurrentChapter = id=>{
    selectChapter(id);
    if(location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
  };
  selectChapter(currentId());
  window.addEventListener('hashchange', ()=>selectChapter(currentId()));

  const observer = new IntersectionObserver(entries=>{
    const visible = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible) setCurrentChapter(visible.target.id);
  }, {rootMargin:'-15% 0px -70%',threshold:[0,.25,.6]});
  sections.forEach(section=>observer.observe(section));
})();
