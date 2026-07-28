const groups = document.querySelectorAll('[data-menu]');
const closeGroups = () => groups.forEach(g => g.classList.remove('open'));
groups.forEach(group => {
  const button = group.querySelector('button.nav-link');
  button?.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = group.classList.contains('open');
    closeGroups();
    if (!wasOpen) group.classList.add('open');
  });
});
document.addEventListener('click', closeGroups);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeGroups(); closeMobile(); } });

const burger = document.getElementById('burger');
const mobile = document.getElementById('mobile');
const closeBtn = document.getElementById('close');
const scrim = document.getElementById('scrim');
function openMobile(){ mobile.classList.add('open'); scrim.classList.add('open'); }
function closeMobile(){ mobile.classList.remove('open'); scrim.classList.remove('open'); }
burger?.addEventListener('click', openMobile);
closeBtn?.addEventListener('click', closeMobile);
scrim?.addEventListener('click', closeMobile);
document.querySelectorAll('.mobile-section').forEach(btn => {
  btn.addEventListener('click', () => btn.nextElementSibling?.classList.toggle('open'));
});
