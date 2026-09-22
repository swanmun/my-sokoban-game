import { useCallback, useEffect, useRef, useState } from 'react';
import { parseLevel, tryMove, undo as undoMove, isSolved } from '../game/engine.js';

export const MOVE_MS = 160;

// 입력 큐를 두어 애니메이션 중에도 입력이 끊기지 않게 한다.
export default function useSokoban(levelIndex, saved, onApple) {
  const [state, setState] = useState(() => restore(levelIndex, saved));
  const queue = useRef([]);
  const busy = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onAppleRef = useRef(onApple);
  onAppleRef.current = onApple;

  useEffect(() => {
    queue.current = [];
    busy.current = false;
    setState(restore(levelIndex, saved));
    // saved는 마운트 시점의 값만 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  const pump = useCallback(() => {
    if (busy.current) return;
    const action = queue.current.shift();
    if (!action) return;
    const cur = stateRef.current;
    let next = null;
    if (action === 'undo') next = cur.history.length ? undoMove(cur) : null;
    else next = tryMove(cur, action);
    if (!next) { pump(); return; }
    const delta = (next.appleCount ?? 0) - (cur.appleCount ?? 0);
    if (delta) onAppleRef.current?.(delta);
    busy.current = true;
    stateRef.current = next;
    setState(next);
    setTimeout(() => { busy.current = false; pump(); }, MOVE_MS);
  }, []);

  const move = useCallback((dir) => {
    if (isSolved(stateRef.current)) return;
    if (queue.current.length < 3) queue.current.push(dir);
    pump();
  }, [pump]);

  const undo = useCallback(() => {
    queue.current.push('undo');
    pump();
  }, [pump]);

  const restart = useCallback(() => {
    queue.current = [];
    busy.current = false;
    const fresh = parseLevel(levelIndex);
    stateRef.current = fresh;
    setState(fresh);
  }, [levelIndex]);

  return { state, move, undo, restart, solved: isSolved(state) };
}

function restore(levelIndex, saved) {
  const base = parseLevel(levelIndex);
  if (saved && saved.level === levelIndex && saved.player && saved.boxes) {
    return { ...base, player: saved.player, boxes: saved.boxes, moves: saved.moves ?? 0, history: saved.history ?? [], apples: saved.apples ?? [], appleCount: saved.appleCount ?? 0 };
  }
  return base;
}
