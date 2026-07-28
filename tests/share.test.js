import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShareText } from '../src/share.js';

test('builds a concise shareable APTO report', () => {
  const text = buildShareText({
    profile: 'Mujer · 46–50 años', status: 'APTO', average: '42,5',
    entries: [
      { label: 'Flexo-extensiones', mark: '23 rep.', score: 35 },
      { label: 'Plancha isométrica', mark: '1:30', score: 42 },
    ],
  });
  assert.match(text, /Simulador TGCF · Evaluación física/);
  assert.match(text, /Perfil: Mujer · 46–50 años/);
  assert.match(text, /Resultado: APTO · Media: 42,5/);
  assert.match(text, /Flexo-extensiones: 23 rep\. · 35 pts/);
});

test('omits average from an incomplete report', () => {
  const text = buildShareText({ profile: 'Hombre · 26–30 años', status: 'PENDIENTE', average: null, entries: [] });
  assert.match(text, /Resultado: PENDIENTE/);
  assert.doesNotMatch(text, /Media:/);
});
