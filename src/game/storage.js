const KEY = 'sokoban-cave-progress';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* 저장소 사용 불가 */ }
  return { cleared: [], current: null };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch { /* 저장소 사용 불가 */ }
}
