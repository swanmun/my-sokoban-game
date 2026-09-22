import { useEffect, useRef, useState } from 'react';
import useSokoban from '../hooks/useSokoban.js';
import LEVELS from '../game/levels.js';
import Board from './Board.jsx';
import DPad from './DPad.jsx';

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

export default function Game({ levelIndex, saved, apples, onApple, onProgress, onClear, onNext, onSelect }) {
  const { state, move, undo, restart, solved } = useSokoban(levelIndex, saved, onApple);
  const [cell, setCell] = useState(48);
  const wrapRef = useRef(null);
  const touch = useRef(null);
  const total = LEVELS.length;

  // 키보드 입력
  useEffect(() => {
    const onKey = (e) => {
      const dir = KEYS[e.key];
      if (dir) { e.preventDefault(); move(dir); }
      else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') undo();
      else if (e.key === 'r' || e.key === 'R') restart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, undo, restart]);

  // 화면 크기에 맞춰 셀 크기 계산
  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth - 16;
      const h = el.clientHeight - 16;
      setCell(Math.max(24, Math.min(64, Math.floor(w / state.width), Math.floor(h / state.height))));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [state.width, state.height]);

  // 진행 저장
  useEffect(() => {
    onProgress({ level: levelIndex, player: state.player, boxes: state.boxes, moves: state.moves, history: state.history, apples: state.apples, appleCount: state.appleCount });
  }, [state, levelIndex, onProgress]);

  useEffect(() => {
    if (solved) onClear(levelIndex);
  }, [solved, levelIndex, onClear]);

  // 스와이프
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  };

  return (
    <div className="game">
      <header className="hud hud-game">
        <button className="btn ghost" onClick={onSelect}>◀ 목록</button>
        <div className="hud-moves">
          <span className="moves-num">{state.moves}</span>
          <span className="moves-label">이동</span>
        </div>
        <div className="hud-title">
          <span className="lv">{levelIndex + 1}단계</span>
          <span className="lv-name">{LEVELS[levelIndex].name}</span>
          {apples > 0 && <span className="apples">🍎 {apples}</span>}
        </div>
      </header>

      <div className="board-wrap" ref={wrapRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <Board state={state} size={cell} />
        {solved && (
          <div className="clear-overlay">
            <div className="clear-card">
              <div className="clear-title">✨ 클리어!</div>
              <div className="clear-moves">이동 횟수 {state.moves}</div>
              <div className="clear-actions">
                {levelIndex + 1 < total
                  ? <button className="btn primary" onClick={onNext}>다음 단계 ▶</button>
                  : <div className="clear-all">모든 단계를 완료했습니다!</div>}
                <button className="btn" onClick={onSelect}>단계 선택</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="controls">
        <div className="actions">
          <button className="btn" onClick={undo} disabled={!state.history.length}>↶ 되돌리기</button>
          <button className="btn" onClick={restart}>⟳ 다시 시작</button>
        </div>
        <DPad onMove={move} />
      </footer>
    </div>
  );
}
