const defaults = { F1: 100, F2: 120, alpha: 60, q: 25, M: 120, l1: 6, l2: 4, h1: 6, h2: 3 };
const inputs = [...document.querySelectorAll('input[data-key]')];
const $ = (selector) => document.querySelector(selector);
const fmt = (value, digits = 1) => Number(value).toLocaleString('ru-RU', {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});

function readState() {
  return Object.fromEntries(inputs.map((input) => [input.dataset.key, Number(input.value) || 0]));
}

function calculate(v) {
  const angle = v.alpha * Math.PI / 180;
  const fx2 = v.F2 * Math.cos(angle);
  const fy2 = v.F2 * Math.sin(angle);
  const Q1 = v.q * v.h1;
  const Q2 = v.q * v.h2;
  const RA = (Q1 * v.h1 / 2 + v.M) / v.l1;
  const RD = fy2 * 0.4;
  const YH = fy2 * 0.6;
  const XE = -Q1;
  const YE = -RA;
  const XH = fx2;
  const XB = -(Q1 + Q2 + v.F1 - fx2);
  const YB = YH - RA;
  const MB = Q1 * v.h1 + RA * 2 * v.l1 + v.M
    + Q2 * (v.h1 + v.h2 / 2) + v.F1 * 0.8 * v.h1 - fx2 * (v.h1 + v.h2);
  const moment = -Q1 * v.h1 / 2 - Q2 * (v.h1 + v.h2 / 2)
    - v.F1 * 0.8 * v.h1 - fy2 * (3 * v.l1 + 0.4 * v.l2)
    + fx2 * (v.h1 + v.h2) + RD * (3 * v.l1 + v.l2) + YB * 3 * v.l1 + MB;
  return {
    fx2, fy2, Q1, Q2, RA, RD, RC: RD, XH, YH, XE, YE, XD: XE, YD: YE, XE: XH, YE: YH, XB, YB, MB,
    checks: {
      fx: Q1 + Q2 + v.F1 - fx2 + XB,
      fy: RA + YB + RD - fy2,
      moment
    }
  };
}

function arrow(x1, y1, x2, y2, className = 'load', marker = 'arrowOrange') {
  return `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${marker})"/>`;
}

function drawDiagram(v, options) {
  const svg = $('#diagram');
  const pad = 65;
  const width = 790;
  const height = 375;
  const maxX = 3 * v.l1 + v.l2;
  const scale = Math.min(width / (maxX + 1), height / (v.h1 + v.h2 + 1.5));
  const X = (x) => pad + x * scale;
  const Y = (y) => 445 - y * scale;
  const A = [X(0), Y(0)];
  const L = [X(0), Y(v.h1)];
  const D = [X(v.l1), Y(v.h1)];
  const step = [X(2 * v.l1), Y(v.h1)];
  const C = [X(2 * v.l1), Y(v.h1 + v.h2)];
  const E = [X(3 * v.l1), Y(v.h1 + v.h2)];
  const B = [X(3 * v.l1), Y(0)];
  const supportC = [X(maxX), Y(v.h1 + v.h2)];
  const f2x = X(3 * v.l1 + 0.4 * v.l2);
  const f2y = Y(v.h1 + v.h2);
  let markup = `<defs>
    <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#f29b55"/></marker>
    <marker id="arrowTeal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#0d8b83"/></marker>
    <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#8b5cf6"/></marker>
  </defs>`;
  markup += `<path class="frame" d="M${A[0]},${A[1]} L${L[0]},${L[1]} L${D[0]},${D[1]} L${step[0]},${step[1]} L${C[0]},${C[1]} L${E[0]},${E[1]} L${supportC[0]},${supportC[1]} M${B[0]},${B[1]} L${E[0]},${E[1]}"/>`;
  const roller = (point) => `<path class="support" d="M${point[0] - 17},${point[1] + 12} L${point[0] + 17},${point[1] + 12} M${point[0] - 12},${point[1] + 12} l-5,8 M${point[0] - 4},${point[1] + 12} l-5,8 M${point[0] + 4},${point[1] + 12} l-5,8 M${point[0] + 12},${point[1] + 12} l-5,8"/><circle class="support-wheel" cx="${point[0]}" cy="${point[1] + 7}" r="5"/>`;
  markup += roller(A) + roller(supportC);
  markup += `<path class="support" d="M${B[0] - 18},${B[1]} L${B[0] + 18},${B[1]} M${B[0] - 18},${B[1]} l-7,11 M${B[0] - 9},${B[1]} l-7,11 M${B[0]},${B[1]} l-7,11 M${B[0] + 9},${B[1]} l-7,11 M${B[0] + 18},${B[1]} l-7,11"/>`;
  markup += '<g class="distributed-load">';
  markup += `<path class="load-fill" d="M${X(0) - 24},${Y(0)} L${X(0) - 24},${Y(v.h1 + v.h2)}"/>`;
  for (let i = 0; i < 7; i += 1) {
    const y = Y((v.h1 + v.h2) * (i + 1) / 8);
    markup += arrow(X(0) - 25, y, X(0) - 2, y);
  }
  markup += `<text class="force-label" x="${X(0) - 40}" y="${Y(v.h1 + v.h2) + 5}">q</text></g>`;
  const f1y = Y(0.8 * v.h1);
  markup += arrow(X(3 * v.l1) - 70, f1y, X(3 * v.l1) - 8, f1y);
  markup += `<text class="force-label" x="${X(3 * v.l1) - 67}" y="${f1y - 10}">F₁</text>`;
  markup += arrow(f2x + 28, f2y - 58, f2x + 1, f2y - 5);
  markup += `<text class="force-label" x="${f2x + 22}" y="${f2y - 68}">F₂</text><text class="svg-note" x="${f2x + 39}" y="${f2y - 35}">α</text>`;
  markup += arrow(A[0], A[1] + 35, A[0], A[1] + 5, 'reaction', 'arrowTeal');
  markup += `<text class="reaction-label" x="${A[0] - 18}" y="${A[1] + 48}">Yₐ</text>`;
  markup += arrow(supportC[0], supportC[1] + 34, supportC[0], supportC[1] + 6, 'reaction', 'arrowTeal');
  markup += `<text class="reaction-label" x="${supportC[0] - 12}" y="${supportC[1] + 48}">Yᴄ</text>`;
  const momentArc = (cx, cy, side) => {
    const x = cx + side * 18;
    const sweep = side < 0 ? 1 : 0;
    return `<path class="moment" d="M${x},${cy + 18} A18,18 0 1,${sweep} ${x},${cy - 18}" marker-end="url(#arrowPurple)"/>`;
  };
  markup += momentArc(D[0], D[1], -1) + momentArc(D[0], D[1], 1);
  markup += `<text class="moment-label" x="${D[0] - 31}" y="${D[1] - 23}">M</text><text class="moment-label" x="${D[0] + 21}" y="${D[1] - 23}">M</text>`;
  markup += `<circle class="node" cx="${D[0]}" cy="${D[1]}" r="6"/><circle class="node" cx="${E[0]}" cy="${E[1]}" r="6"/>`;
  markup += `<text class="point-label" x="${A[0] - 5}" y="${A[1] + 27}">A</text><text class="point-label" x="${D[0] - 5}" y="${D[1] - 15}">D</text><text class="point-label" x="${E[0] - 5}" y="${E[1] - 15}">E</text><text class="point-label" x="${supportC[0] + 8}" y="${supportC[1] + 5}">C</text><text class="point-label" x="${B[0] + 8}" y="${B[1] + 5}">B</text>`;
  if (options.equivLoads) {
    markup += `<g class="equiv-loads">${arrow(X(0) - 60, Y(v.h1 / 2), X(0) - 5, Y(v.h1 / 2))}<text class="force-label" x="${X(0) - 58}" y="${Y(v.h1 / 2) - 10}">Q₁</text>`;
    markup += `${arrow(X(2 * v.l1) - 60, Y(v.h1 + v.h2 / 2), X(2 * v.l1) - 5, Y(v.h1 + v.h2 / 2))}<text class="force-label" x="${X(2 * v.l1) - 58}" y="${Y(v.h1 + v.h2 / 2) - 10}">Q₂</text>`;
    if (options.values) markup += `<text class="svg-note" x="${X(0) - 58}" y="${Y(v.h1 / 2) + 15}">${fmt(v.q * v.h1)} кН</text><text class="svg-note" x="${X(2 * v.l1) - 58}" y="${Y(v.h1 + v.h2 / 2) + 15}">${fmt(v.q * v.h2)} кН</text></g>`;
    else markup += '</g>';
  }
  markup += `<path class="dimension" d="M${A[0]},${A[1] + 55} L${D[0]},${D[1] + 55} M${D[0]},${D[1] + 55} L${C[0]},${C[1] + 55} M${C[0]},${C[1] + 55} L${E[0]},${E[1] + 55} M${E[0]},${E[1] + 55} L${supportC[0]},${supportC[1] + 55}"/>`;
  markup += `<text class="dim-label" x="${(A[0] + D[0]) / 2 - 10}" y="${A[1] + 74}">l₁</text><text class="dim-label" x="${(E[0] + supportC[0]) / 2 - 10}" y="${supportC[1] + 74}">l₂</text><text class="dim-label" x="${A[0] - 48}" y="${(A[1] + D[1]) / 2}">h₁</text><text class="dim-label" x="${E[0] - 48}" y="${(E[1] + C[1]) / 2}">h₂</text>`;
  svg.innerHTML = markup;
  svg.classList.toggle('hide-reactions', !$('#toggleReactions').checked);
  svg.classList.toggle('hide-dimensions', !$('#toggleDimensions').checked);
  svg.classList.toggle('hide-distributed', options.equivLoads);
}

const rows = [
  ['Yₐ', 'опора A', 'RA', 'вверх'], ['Xᴅ', 'шарнир D', 'XD', 'влево'], ['Yᴅ', 'шарнир D', 'YD', 'вниз'],
  ['Xₑ', 'шарнир E', 'XE', 'вправо'], ['Yₑ', 'шарнир E', 'YE', 'вверх'], ['Yᴄ', 'опора C', 'RC', 'вверх'],
  ['Xʙ', 'заделка B', 'XB', 'влево'], ['Yʙ', 'заделка B', 'YB', 'вниз'], ['Mʙ', 'заделка B', 'MB', 'против часовой']
];

function renderResults(result) {
  $('#reactionsTableBody').innerHTML = rows.map(([name, place, key, direction]) => {
    const value = result[key];
    const unit = key === 'MB' ? 'кН·м' : 'кН';
    return `<tr><td><strong>${name}</strong></td><td>${place}</td><td class="text-right">${fmt(value)} ${unit}</td><td class="text-center">${value < 0 ? 'противоположно' : direction}</td></tr>`;
  }).join('');
}

function renderChecks(result) {
  const checks = [['ΣFₓ', 'кН', result.checks.fx], ['ΣFᵧ', 'кН', result.checks.fy], ['ΣMₐ', 'кН·м', result.checks.moment]];
  $('#checksList').innerHTML = checks.map(([label, unit, value]) => `<div class="check-row"><strong>${label}</strong><span>${fmt(value, 2)} ${unit} ✓</span></div>`).join('');
}

function update() {
  const state = readState();
  const result = calculate(state);
  drawDiagram(state, {
    equivLoads: $('#toggleEquivLoads').checked,
    values: $('#toggleValuesOnDiagram').checked
  });
  renderResults(result);
  renderChecks(result);
}

inputs.forEach((input) => {
  const range = $(`#range-${input.dataset.key}`);
  input.addEventListener('input', () => {
    if (range) range.value = input.value;
    update();
  });
  if (range) {
    range.addEventListener('input', () => {
      input.value = range.value;
      update();
    });
  }
});

$('#resetDefaultsBtn').addEventListener('click', () => {
  inputs.forEach((input) => {
    input.value = defaults[input.dataset.key];
    const range = $(`#range-${input.dataset.key}`);
    if (range) range.value = input.value;
  });
  update();
});

['toggleReactions', 'toggleDimensions', 'toggleEquivLoads', 'toggleValuesOnDiagram'].forEach((id) => {
  $(`#${id}`).addEventListener('change', update);
});

update();
