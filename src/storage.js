export const STORAGE_KEY = 'tgcf-evaluacion-fisica-v1';

function normalizeState(value) {
  if (!value || typeof value !== 'object') return null;
  const sex = value.sex === 'F' ? 'F' : value.sex === 'M' ? 'M' : null;
  const age = String(value.age ?? '');
  const numericAge = Number(age);
  const marks = value.marks;
  if (!sex || !Number.isInteger(numericAge) || numericAge < 17 || numericAge > 60 || !marks || typeof marks !== 'object') return null;
  const text = field => typeof field === 'string' ? field : '';
  const plank = marks.plank && typeof marks.plank === 'object' ? marks.plank : {};
  const run = marks.run && typeof marks.run === 'object' ? marks.run : {};
  return {
    sex,
    age,
    marks: {
      flex: text(marks.flex),
      plank: { minutes: text(plank.minutes), seconds: text(plank.seconds) },
      run: { minutes: text(run.minutes), seconds: text(run.seconds) },
      agility: text(marks.agility),
    },
  };
}

export function loadState(storage) {
  try {
    return normalizeState(JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null'));
  } catch {
    return null;
  }
}

export function saveState(storage, state) {
  const normalized = normalizeState(state);
  if (!storage || !normalized) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}
