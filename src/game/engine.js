import LEVELS from './levels.js';

export const DIRS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function parseLevel(index) {
  const rows = LEVELS[index].map;
  const width = Math.max(...rows.map((r) => r.length));
  const height = rows.length;
  const walls = [];
  const goals = [];
  const boxes = [];
  const floor = [];
  let player = { x: 0, y: 0 };

  rows.forEach((row, y) => {
    row.padEnd(width, ' ').split('').forEach((c, x) => {
      if (c === '#') walls.push({ x, y });
      if (c === '.' || c === '*' || c === '+') goals.push({ x, y });
      if (c === '$' || c === '*') boxes.push({ id: boxes.length, x, y });
      if (c === '@' || c === '+') player = { x, y };
    });
  });

  // 플레이어가 도달 가능한 바닥만 표시 (외부 공백 제외)
  const wallSet = new Set(walls.map((w) => key(w.x, w.y)));
  const seen = new Set([key(player.x, player.y)]);
  const stack = [player];
  while (stack.length) {
    const p = stack.pop();
    floor.push(p);
    for (const d of Object.values(DIRS)) {
      const nx = p.x + d.dx;
      const ny = p.y + d.dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const k = key(nx, ny);
      if (wallSet.has(k) || seen.has(k)) continue;
      seen.add(k);
      stack.push({ x: nx, y: ny });
    }
  }
  const floorSet = seen;
  const visibleWalls = walls.filter((w) =>
    Object.values(DIRS).concat([
      { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
    ]).some((d) => floorSet.has(key(w.x + d.dx, w.y + d.dy))),
  );

  return { width, height, walls: visibleWalls, wallSet, goals, boxes, floorSet, player, moves: 0, history: [], apples: [], appleCount: 0 };
}

export const key = (x, y) => `${x},${y}`;

export const APPLE_CHANCE = 0.1;

// 이동 성공 시 10% 확률로 빈 바닥에 사과를 놓는다.
function spawnApple(state, player, boxes, apples, rng) {
  if (rng() >= APPLE_CHANCE) return apples;
  const occupied = new Set([
    key(player.x, player.y),
    ...boxes.map((b) => key(b.x, b.y)),
    ...apples.map((a) => key(a.x, a.y)),
  ]);
  const empty = [...state.floorSet].filter((k) => !occupied.has(k));
  if (!empty.length) return apples;
  const [x, y] = empty[Math.floor(rng() * empty.length)].split(',').map(Number);
  return [...apples, { x, y }];
}

export function tryMove(state, dir, rng = Math.random) {
  const { dx, dy } = DIRS[dir];
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (state.wallSet.has(key(nx, ny))) return null;

  const boxIdx = state.boxes.findIndex((b) => b.x === nx && b.y === ny);
  let boxes = state.boxes;
  if (boxIdx !== -1) {
    const bx = nx + dx;
    const by = ny + dy;
    if (state.wallSet.has(key(bx, by))) return null;
    if (state.boxes.some((b) => b.x === bx && b.y === by)) return null;
    boxes = state.boxes.map((b, i) => (i === boxIdx ? { ...b, x: bx, y: by } : b));
  }

  const prevApples = state.apples ?? [];
  const picked = prevApples.some((a) => a.x === nx && a.y === ny);
  let apples = picked ? prevApples.filter((a) => !(a.x === nx && a.y === ny)) : prevApples;
  const player = { x: nx, y: ny };
  apples = spawnApple(state, player, boxes, apples, rng);

  return {
    ...state,
    player,
    boxes,
    apples,
    appleCount: (state.appleCount ?? 0) + (picked ? 1 : 0),
    moves: state.moves + 1,
    history: [...state.history, { player: state.player, boxes: state.boxes, apples: prevApples, appleCount: state.appleCount ?? 0 }],
  };
}

export function undo(state) {
  if (!state.history.length) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    player: prev.player,
    boxes: prev.boxes,
    apples: prev.apples ?? state.apples ?? [],
    appleCount: prev.appleCount ?? state.appleCount ?? 0,
    moves: state.moves + 1,
    history: state.history.slice(0, -1),
  };
}

export function isSolved(state) {
  const goalSet = new Set(state.goals.map((g) => key(g.x, g.y)));
  return state.boxes.every((b) => goalSet.has(key(b.x, b.y)));
}
