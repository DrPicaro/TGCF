export function buildShareText({ profile, status, average, entries }) {
  const lines = [
    'Simulador TGCF · Evaluación física',
    `Perfil: ${profile}`,
    `Resultado: ${status}${average ? ` · Media: ${average}` : ''}`,
  ];
  for (const entry of entries) lines.push(`${entry.label}: ${entry.mark} · ${entry.score} pts`);
  return lines.join('\n');
}
