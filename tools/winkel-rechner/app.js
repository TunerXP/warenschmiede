'use strict';

const toRad = degrees => degrees * Math.PI / 180;
const toDeg = radians => radians * 180 / Math.PI;
const sin = degrees => Math.sin(toRad(degrees));
const cos = degrees => Math.cos(toRad(degrees));
const asin = value => toDeg(Math.asin(value));
const acos = value => toDeg(Math.acos(value));

let currentMode = 'right';
let inputSequence = 0;

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function clearTriangleResults() {
  setText('res-area', '–');
  setText('res-perim', '–');
  setText('res-height', '–');
}

// User-entered values receive a sequence marker. Calculated values never become drivers.
function handleInput(element) {
  if (element.value !== '') {
    inputSequence += 1;
    element.dataset.time = String(inputSequence);
    element.classList.remove('calculated');
  } else {
    delete element.dataset.time;
    element.classList.remove('calculated');
  }
  solveTriangle();
}

function solveTriangle() {
  const ids = ['in-a', 'in-b', 'in-c', 'in-alpha', 'in-beta', 'in-gamma'];
  const inputs = ids.map(id => {
    const element = document.getElementById(id);
    return { id, val: Number.parseFloat(element.value), time: Number.parseInt(element.dataset.time || '0', 10), element };
  }).filter(item => Number.isFinite(item.val) && item.val > 0 && !(currentMode === 'right' && item.id === 'in-gamma'));

  inputs.sort((left, right) => right.time - left.time);
  const needed = currentMode === 'right' ? 2 : 3;
  updateHint(currentMode, inputs.length, needed);
  if (inputs.length < needed) {
    clearTriangleResults();
    return;
  }

  let drivers = inputs.slice(0, needed);
  if (currentMode === 'general') {
    const sides = ['in-a', 'in-b', 'in-c'];
    if (!drivers.some(driver => sides.includes(driver.id))) {
      const olderSide = inputs.slice(needed).find(driver => sides.includes(driver.id));
      if (!olderSide) {
        updateHint(currentMode, inputs.length, needed, false);
        clearTriangleResults();
        return;
      }
      drivers = [...drivers.slice(0, -1), olderSide];
    }
  }

  const driverIds = drivers.map(driver => driver.id);
  const getDriver = id => drivers.find(driver => driver.id === id)?.val ?? null;
  let a = getDriver('in-a');
  let b = getDriver('in-b');
  let c = getDriver('in-c');
  let alpha = getDriver('in-alpha');
  let beta = getDriver('in-beta');
  let gamma = getDriver('in-gamma');
  if (currentMode === 'right') gamma = 90;

  for (let pass = 0; pass < 3; pass += 1) {
    if (alpha && beta && !gamma) gamma = 180 - alpha - beta;
    if (alpha && gamma && !beta) beta = 180 - alpha - gamma;
    if (beta && gamma && !alpha) alpha = 180 - beta - gamma;

    if (currentMode === 'right') {
      if (a && b && !c) c = Math.sqrt(a * a + b * b);
      if (a && c && !b && c > a) b = Math.sqrt(c * c - a * a);
      if (b && c && !a && c > b) a = Math.sqrt(c * c - b * b);
      if (a && alpha && !c && sin(alpha)) c = a / sin(alpha);
      if (b && beta && !c && sin(beta)) c = b / sin(beta);
      if (c && alpha && !a) a = c * sin(alpha);
      if (c && beta && !b) b = c * sin(beta);
      if (a && beta && !b && Math.tan(toRad(beta))) b = a * Math.tan(toRad(beta));
      if (b && alpha && !a && Math.tan(toRad(alpha))) a = b * Math.tan(toRad(alpha));
      if (a && c && !alpha && a <= c) alpha = asin(a / c);
      if (b && c && !beta && b <= c) beta = asin(b / c);
    } else {
      if (a && b && c) {
        if (!alpha) alpha = acos((b * b + c * c - a * a) / (2 * b * c));
        if (!beta) beta = acos((a * a + c * c - b * b) / (2 * a * c));
        if (!gamma && alpha && beta) gamma = 180 - alpha - beta;
      }
      if (a && alpha) {
        if (b && !beta) beta = asin(b * sin(alpha) / a);
        if (c && !gamma) gamma = asin(c * sin(alpha) / a);
        if (beta && !b && sin(alpha)) b = a * sin(beta) / sin(alpha);
      }
      if (b && c && alpha && !a) a = Math.sqrt(b * b + c * c - 2 * b * c * cos(alpha));
      if (a && c && beta && !b) b = Math.sqrt(a * a + c * c - 2 * a * c * cos(beta));
      if (a && b && gamma && !c) c = Math.sqrt(a * a + b * b - 2 * a * b * cos(gamma));
    }
  }

  const values = { 'in-a': a, 'in-b': b, 'in-c': c, 'in-alpha': alpha, 'in-beta': beta, 'in-gamma': gamma };
  const validTriangle = [a, b, c, alpha, beta, gamma].every(finitePositive)
    && alpha < 180 && beta < 180 && gamma < 180
    && a + b > c && a + c > b && b + c > a;
  if (!validTriangle) {
    updateHint(currentMode, inputs.length, needed, false);
    clearTriangleResults();
    return;
  }

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (!driverIds.includes(id) && finitePositive(value)) {
      element.value = value.toFixed(2);
      element.classList.add('calculated');
      delete element.dataset.time;
    }
  });

  const area = 0.5 * a * b * sin(gamma);
  const height = c ? (2 * area) / c : null;
  if (![area, a + b + c, height].every(Number.isFinite)) {
    clearTriangleResults();
    return;
  }
  setText('res-area', area.toFixed(2));
  setText('res-perim', (a + b + c).toFixed(2));
  setText('res-height', height.toFixed(2));
  drawTriangle(a, b, c, alpha, beta, gamma);
  updateHint(currentMode, inputs.length, needed, true);
}

function updateHint(mode, count, needed, solved = null) {
  const box = document.getElementById('hint-box');
  if (solved === true) {
    box.dataset.state = 'success';
    setText('hint-title', 'Berechnet');
    setText('hint-text', 'Ändere einen Wert für eine neue Variante.');
  } else if (solved === false || (mode === 'general' && count >= needed)) {
    box.dataset.state = 'progress';
    setText('hint-title', 'Eingaben prüfen');
    setText('hint-text', mode === 'general' ? '3 Werte eingeben, mindestens eine Seitenlänge.' : 'Diese Kombination ergibt kein gültiges Dreieck.');
  } else if (count === 0) {
    box.dataset.state = 'neutral';
    setText('hint-title', 'Bereit');
    setText('hint-text', `Gib ${needed} Werte ein.`);
  } else {
    box.dataset.state = 'progress';
    setText('hint-title', 'Eingabe');
    const remaining = Math.max(0, needed - count);
    setText('hint-text', `Noch ${remaining} ${remaining === 1 ? 'Wert' : 'Werte'} benötigt.`);
  }
}

function solveTaper() {
  const D = Number.parseFloat(document.getElementById('tap-D').value);
  const d = Number.parseFloat(document.getElementById('tap-d').value);
  const L = Number.parseFloat(document.getElementById('tap-L').value);
  if (![D, d, L].every(finitePositive) || D <= d) {
    setText('tap-result', '– °');
    setText('tap-ratio', '–');
    updateHint('taper', [D, d, L].filter(finitePositive).length, 3, D && d && L ? false : null);
    return;
  }
  const angle = toDeg(Math.atan(((D - d) / 2) / L));
  const ratio = L / (D - d);
  if (!Number.isFinite(angle) || !Number.isFinite(ratio)) return;
  setText('tap-result', `${angle.toFixed(3)} °`);
  setText('tap-ratio', ratio.toFixed(1));
  updateHint('taper', 3, 3, true);
}

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  const showTriangle = mode !== 'taper';
  if (showTriangle) {
    document.getElementById('form-triangle').setAttribute('aria-labelledby', `btn-${mode}`);
  }
  document.getElementById('form-triangle').classList.toggle('is-hidden', !showTriangle);
  document.getElementById('form-taper').classList.toggle('is-hidden', showTriangle);
  document.getElementById('main-svg').classList.toggle('is-hidden', !showTriangle);
  document.getElementById('taper-svg').classList.toggle('is-hidden', showTriangle);
  document.getElementById('info-footer').classList.toggle('is-hidden', !showTriangle);
  document.getElementById('taper-summary').classList.toggle('is-hidden', showTriangle);

  document.querySelectorAll('.control-card input').forEach(element => {
    element.value = '';
    delete element.dataset.time;
    element.classList.remove('calculated');
  });
  inputSequence = 0;
  clearTriangleResults();
  setText('tap-result', '– °');
  setText('tap-ratio', '–');

  const gammaInput = document.getElementById('in-gamma');
  if (mode === 'right') {
    gammaInput.value = '90';
    gammaInput.disabled = true;
    setText('lbl-c-input', 'Seite c / Hypotenuse');
    setText('lbl-gamma-input', 'γ = 90°');
  } else {
    gammaInput.disabled = false;
    setText('lbl-c-input', 'Seite c');
    setText('lbl-gamma-input', 'γ (Gamma)');
  }
  updateHint(mode, 0, mode === 'right' ? 2 : 3);
  if (showTriangle) drawTriangle(100, 100, 141.4, 45, 45, 90);
}

function resetAll() {
  setMode(currentMode);
}

function drawTriangle(a, b, c, alpha, beta, gamma) {
  if (![a, b, c, alpha, beta, gamma].every(finitePositive)) return;
  const pointC = { x: 0, y: 0 };
  const pointB = { x: a, y: 0 };
  const pointA = { x: b * cos(gamma), y: b * sin(gamma) };
  if (![pointA.x, pointA.y].every(Number.isFinite)) return;
  const minX = Math.min(pointC.x, pointA.x, pointB.x);
  const maxX = Math.max(pointC.x, pointA.x, pointB.x);
  const minY = Math.min(pointC.y, pointA.y, pointB.y);
  const maxY = Math.max(pointC.y, pointA.y, pointB.y);
  const scale = Math.min(300 / (maxX - minX || 1), 300 / (maxY - minY || 1)) * 0.8;
  const transformX = value => 50 + (value - minX) * scale;
  const transformY = value => 320 - (value - minY) * scale;
  const cPoint = { x: transformX(pointC.x), y: transformY(pointC.y) };
  const bPoint = { x: transformX(pointB.x), y: transformY(pointB.y) };
  const aPoint = { x: transformX(pointA.x), y: transformY(pointA.y) };
  document.getElementById('tri-path').setAttribute('d', `M${cPoint.x},${cPoint.y} L${bPoint.x},${bPoint.y} L${aPoint.x},${aPoint.y} Z`);
  place(document.getElementById('lbl-a'), cPoint, bPoint, 22);
  place(document.getElementById('lbl-b'), cPoint, aPoint, -18);
  place(document.getElementById('lbl-c'), aPoint, bPoint, -18);
  placeNode(document.getElementById('lbl-gamma'), cPoint, aPoint, bPoint);
  placeNode(document.getElementById('lbl-beta'), bPoint, cPoint, aPoint);
  placeNode(document.getElementById('lbl-alpha'), aPoint, cPoint, bPoint);
}

function place(element, point1, point2, offset) {
  element.setAttribute('x', (point1.x + point2.x) / 2);
  element.setAttribute('y', (point1.y + point2.y) / 2 + offset);
}

function placeNode(element, center, point1, point2) {
  const middleX = (center.x + point1.x + point2.x) / 3;
  const middleY = (center.y + point1.y + point2.y) / 3;
  const deltaX = middleX - center.x;
  const deltaY = middleY - center.y;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
  element.setAttribute('x', center.x + (deltaX / length) * 31);
  element.setAttribute('y', center.y + (deltaY / length) * 31);
}

document.querySelectorAll('.tri-input').forEach(element => element.addEventListener('input', () => handleInput(element)));
['tap-D', 'tap-d', 'tap-L'].forEach(id => document.getElementById(id).addEventListener('input', solveTaper));
document.getElementById('reset-button').addEventListener('click', resetAll);
document.querySelectorAll('.mode-tab').forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll('.mode-tab')];
    const index = tabs.indexOf(button);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    setMode(tabs[nextIndex].dataset.mode);
  });
});

setMode('right');
