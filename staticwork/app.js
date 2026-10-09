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
    <marker id="arrowPurple" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L7,3.5 L0,7 z" fill="#8b5cf6"/></marker>
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
  const angle = v.alpha * Math.PI / 180;
  const forceLength = 62;
  const forceStartX = f2x + forceLength * Math.cos(angle);
  const forceStartY = f2y - forceLength * Math.sin(angle);
  markup += arrow(forceStartX, forceStartY, f2x, f2y, 'load', 'arrowOrange');
  const arcRadius = 24;
  const arcEndX = f2x + arcRadius * Math.cos(angle);
  const arcEndY = f2y - arcRadius * Math.sin(angle);
  markup += `<path class="angle-marker" d="M${f2x + arcRadius},${f2y} A${arcRadius},${arcRadius} 0 0,0 ${arcEndX},${arcEndY}"/>`;
  markup += `<text class="force-label" x="${forceStartX + 4}" y="${forceStartY - 7}">F₂</text><text class="svg-note" x="${f2x + 29}" y="${f2y - 10}">α</text>`;
  markup += arrow(A[0], A[1] + 35, A[0], A[1] + 5, 'reaction', 'arrowTeal');
  markup += `<text class="reaction-label" x="${A[0] - 18}" y="${A[1] + 48}">Yₐ</text>`;
  markup += arrow(supportC[0], supportC[1] + 34, supportC[0], supportC[1] + 6, 'reaction', 'arrowTeal');
  markup += `<text class="reaction-label" x="${supportC[0] - 12}" y="${supportC[1] + 48}">Yᴄ</text>`;
  const momentArc = (cx, cy, side) => {
    const startX = cx + side * 11;
    const endX = startX;
    const controlX = cx + side * 37;
    const direction = side < 0 ? 'top' : 'bottom';
    const path = direction === 'top'
      ? `M${startX},${cy + 21} C${controlX},${cy + 21} ${controlX},${cy - 21} ${endX},${cy - 21}`
      : `M${startX},${cy - 21} C${controlX},${cy - 21} ${controlX},${cy + 21} ${endX},${cy + 21}`;
    return `<path class="moment" d="${path}" marker-end="url(#arrowPurple)"/>`;
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
  const dimensionY = A[1] + 55;
  const h1X = A[0] - 38;
  const h2X = E[0] - 38;
  const dimensionPoints = [A[0], D[0], C[0], E[0], supportC[0]];
  const dimensionTicks = dimensionPoints.map((x) => `M${x},${dimensionY - 6} V${dimensionY + 6}`).join(' ');
  markup += `<path class="dimension" d="M${A[0]},${dimensionY} H${supportC[0]} ${dimensionTicks} M${h1X},${Y(0)} V${Y(v.h1)} M${h2X},${Y(v.h1)} V${Y(v.h1 + v.h2)}"/>`;
  markup += `<text class="dim-label" x="${(A[0] + D[0]) / 2 - 10}" y="${dimensionY - 8}">l₁</text><text class="dim-label" x="${(D[0] + C[0]) / 2 - 10}" y="${dimensionY - 8}">l₁</text><text class="dim-label" x="${(C[0] + E[0]) / 2 - 10}" y="${dimensionY - 8}">l₁</text><text class="dim-label" x="${(E[0] + supportC[0]) / 2 - 10}" y="${dimensionY - 8}">l₂</text><text class="dim-label" x="${h1X - 9}" y="${(Y(0) + Y(v.h1)) / 2}">h₁</text><text class="dim-label" x="${h2X - 9}" y="${(Y(v.h1) + Y(v.h1 + v.h2)) / 2}">h₂</text>`;
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

function renderSolution(v, result) {
  const solution = $('#solutionContent');
  solution.innerHTML = `
    <div class="formula-step"><strong>1. Эквивалентные силы распределённой нагрузки</strong>
      <p>Q₁ = q · h₁ = ${fmt(v.q)} · ${fmt(v.h1)} = <b>${fmt(result.Q1)} кН</b></p>
      <p>Q₂ = q · h₂ = ${fmt(v.q)} · ${fmt(v.h2)} = <b>${fmt(result.Q2)} кН</b></p>
    </div>
    <div class="formula-step"><strong>2. Разложение силы F₂</strong>
      <p>F₂ₓ = F₂ · cos α = ${fmt(v.F2)} · cos(${fmt(v.alpha, 0)}°) = <b>${fmt(result.fx2)} кН</b></p>
      <p>F₂ᵧ = F₂ · sin α = ${fmt(v.F2)} · sin(${fmt(v.alpha, 0)}°) = <b>${fmt(result.fy2)} кН</b></p>
    </div>
    <div class="formula-step"><strong>3. Реакции опор и усилия в шарнирах</strong>
      <p>Yₐ = (Q₁ · h₁ / 2 + M) / l₁ = <b>${fmt(result.RA)} кН</b></p>
      <p>Yᴄ = 0,4 · F₂ᵧ = <b>${fmt(result.RD)} кН</b></p>
      <p>Xᴅ = −Q₁ = <b>${fmt(result.XD)} кН</b>, &nbsp; Yᴅ = −Yₐ = <b>${fmt(result.YD)} кН</b></p>
      <p>Xₑ = F₂ₓ = <b>${fmt(result.XE)} кН</b>, &nbsp; Yₑ = 0,6 · F₂ᵧ = <b>${fmt(result.YE)} кН</b></p>
    </div>
    <div class="formula-step"><strong>4. Проверка равновесия</strong>
      <p>ΣFₓ = <b>${fmt(result.checks.fx, 2)} кН</b></p>
      <p>ΣFᵧ = <b>${fmt(result.checks.fy, 2)} кН</b></p>
      <p>ΣM = <b>${fmt(result.checks.moment, 2)} кН·м</b></p>
    </div>
  `;
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
  renderSolution(state, result);
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
