import data from './data/annex-ii.json' with { type: 'json' };
import { ageBandIndex, calculateScore, evaluate, minimumMarkForPoints, normalizeAgilityTenths } from './calculator.js';
import { formatAgility, formatDuration, parseDuration } from './formatters.js';

const $ = selector => document.querySelector(selector);
const tests = data.tests;
const inputs = { flex: $('#flex'), plank: $('#plank'), run: $('#run'), agility: $('#agility') };
const ageBands = ['17–25 años', '26–30 años', '31–35 años', '36–40 años', '41–45 años', '46–50 años', '51–55 años', '56–59 años', '60 o más'];
let mode = 'mine';
let savedMarks = null;
let simulated = false;

const ageSelect = $('#age');
for (let age = 17; age <= 59; age += 1) {
  const option = document.createElement('option');
  option.value = String(age);
  option.textContent = String(age);
  ageSelect.append(option);
}
const age60Plus = document.createElement('option');
age60Plus.value = '60';
age60Plus.textContent = '60 o más';
ageSelect.append(age60Plus);
ageSelect.value = '30';

function profile() {
  const age = Number($('#age').value);
  return { age: Number.isFinite(age) ? age : 17, sex: $('#sex').value };
}

function rawValue(key) {
  if (key === 'plank' || key === 'run') return parseDuration(inputs[key].value);
  return inputs[key].value === '' ? null : Number(inputs[key].value);
}

function displayMark(key, mark) {
  if (mark === null || mark === undefined) return '—';
  if (key === 'plank' || key === 'run') return formatDuration(mark);
  if (key === 'agility') return formatAgility(mark);
  return `${mark} rep.`;
}

function inputMark(key, mark) {
  if (key === 'plank' || key === 'run') return formatDuration(mark);
  if (key === 'agility') return (mark / 10).toFixed(1);
  return mark;
}

function targetFor(key) {
  const { age, sex } = profile();
  return minimumMarkForPoints(tests[key], { age, sex, points: 20 });
}

function differenceCopy(key, value, target) {
  if (value === null || target === null) return 'Sin marca';
  const higher = tests[key].direction === 'higher';
  const delta = higher ? value - target : target - value;
  const amount = key === 'agility' ? formatAgility(Math.abs(delta)).replace(' s', ' s') : key === 'flex' ? `${Math.abs(delta)} rep.` : formatDuration(Math.abs(delta));
  if (delta > 0) return `Margen: ${amount}`;
  if (delta === 0) return 'En el corte';
  return `Faltan: ${amount}`;
}

function updateMetric(key) {
  const { age, sex } = profile();
  const test = tests[key];
  const target = targetFor(key);
  const article = document.querySelector(`[data-test="${key}"]`);
  const targetElement = $(`#${key}-target`);
  const resultElement = $(`#${key}-result`);
  const value = rawValue(key);
  const normalized = key === 'agility' && value !== null ? normalizeAgilityTenths(value) : value;
  const score = calculateScore(test, { age, sex, value: normalized });
  targetElement.textContent = displayMark(key, target);
  article.classList.toggle('is-not-applicable', score === null);
  inputs[key].disabled = score === null;
  if (score === null) {
    targetElement.textContent = 'No aplicable';
    resultElement.className = 'result';
    resultElement.textContent = 'No corresponde';
    return { applicable: false, value: null, score: null, passed: true };
  }
  if (value === null || !Number.isFinite(value)) {
    resultElement.className = 'result';
    resultElement.textContent = key === 'plank' || key === 'run' ? 'Usa min:seg' : 'Sin marca';
    return { applicable: true, value: null, score: null, passed: false };
  }
  const passed = score >= 20;
  resultElement.className = `result ${passed ? 'pass' : 'fail'}`;
  resultElement.innerHTML = `<b>${score} pts</b>${differenceCopy(key, normalized, target)}`;
  return { applicable: true, value: normalized, score, passed };
}

function updateReport(results) {
  const applicable = Object.values(results).filter(item => item.applicable);
  const complete = applicable.length > 0 && applicable.every(item => item.score !== null);
  const status = $('#report-status');
  if (!complete) {
    status.className = 'report-status waiting';
    $('#status-word').textContent = mode === 'cut' ? 'CORTE' : 'PENDIENTE';
    $('#informe-title').textContent = mode === 'cut' ? 'Estas viendo tu corte de aptitud.' : 'Completa las marcas para obtener el resultado.';
    $('#report-detail').textContent = mode === 'cut' ? 'El corte general equivale a 20 puntos en cada prueba aplicable. Puedes usarlo como simulación o compararlo con tus marcas.' : 'La calificación de referencia exige al menos 20 puntos en cada prueba aplicable. La media no compensa una prueba inferior al corte.';
    $('#average').textContent = '—'; $('#passed-count').textContent = '—';
    return;
  }
  const scores = applicable.map(item => item.score);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const passedCount = applicable.filter(item => item.passed).length;
  const apto = passedCount === applicable.length;
  status.className = `report-status ${apto ? 'apto' : 'no-apto'}`;
  $('#status-word').textContent = apto ? 'APTO' : 'NO APTO';
  $('#informe-title').textContent = apto ? 'Superas el corte en todas las pruebas.' : 'Hay al menos una prueba por debajo del corte.';
  $('#report-detail').textContent = apto ? 'Buen trabajo: mantienes como mínimo 20 puntos en cada prueba aplicable.' : 'La media es informativa. Para ser apto debes alcanzar al menos 20 puntos en todas las pruebas aplicables.';
  $('#average').textContent = average.toFixed(1).replace('.', ',');
  $('#passed-count').textContent = `${passedCount}/${applicable.length}`;
}

function render() {
  try {
    const band = ageBandIndex(profile().age);
    $('#age-band').textContent = ageBands[band];
  } catch { $('#age-band').textContent = 'Edad no válida'; }
  const results = Object.fromEntries(Object.keys(tests).map(key => [key, updateMetric(key)]));
  $('#agility-note').hidden = results.agility.applicable;
  updateReport(results);
}

function applyCut() {
  Object.keys(inputs).forEach(key => {
    const target = targetFor(key);
    if (target !== null) inputs[key].value = inputMark(key, target);
  });
}

function updateModeControls() {
  document.querySelectorAll('.mode').forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#mode-copy').textContent = mode === 'cut'
    ? 'Estos son los mínimos oficiales: 20 puntos en cada prueba aplicable según sexo y edad.'
    : 'Introduce tus marcas. La aplicación compara cada una con el corte de 20 puntos.';
}

function setMode(nextMode) {
  if (nextMode === mode) return;

  if (nextMode === 'cut') {
    savedMarks = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value]));
    simulated = true;
    mode = 'cut';
    applyCut();
  } else {
    mode = 'mine';
    if (simulated && savedMarks) {
      Object.entries(savedMarks).forEach(([key, value]) => { inputs[key].value = value; });
    }
    simulated = false;
  }

  updateModeControls();
  render();
}

function openBaremo(key) {
  const { age, sex } = profile();
  const test = tests[key];
  const column = test.sexes[0] === 'all' ? ageBandIndex(age) : ageBandIndex(age) * 2 + (sex === 'F' ? 1 : 0);
  if (test.ageBands && ageBandIndex(age) >= test.ageBands.length) return;
  $('#dialog-title').textContent = test.label;
  $('#dialog-subtitle').textContent = `${sex === 'F' ? 'Mujer' : 'Hombre'} · ${ageBands[ageBandIndex(age)]} · datos oficiales del Anexo II`;
  const target = targetFor(key);
  $('#baremo-body').innerHTML = test.rows.map(row => `<tr class="${row.mark === target ? 'highlight' : ''}"><td>${displayMark(key, row.mark)}</td><td>${row.scores[column]}</td></tr>`).join('');
  $('#baremo-dialog').showModal();
}

Object.values(inputs).forEach(input => input.addEventListener('input', () => {
  if (mode === 'cut') {
    const editedValue = input.value;
    mode = 'mine';
    if (savedMarks) Object.entries(savedMarks).forEach(([savedKey, value]) => { inputs[savedKey].value = value; });
    input.value = editedValue;
    simulated = false;
    updateModeControls();
  }
  render();
}));
$('#sex').addEventListener('change', () => { if (simulated) applyCut(); render(); });
$('#age').addEventListener('change', () => { if (simulated) applyCut(); render(); });
document.querySelectorAll('.mode').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
document.querySelectorAll('.baremo-button').forEach(button => button.addEventListener('click', () => openBaremo(button.dataset.baremo)));
$('#close-dialog').addEventListener('click', () => $('#baremo-dialog').close());
$('#baremo-dialog').addEventListener('click', event => { if (event.target === $('#baremo-dialog')) $('#baremo-dialog').close(); });

render();
