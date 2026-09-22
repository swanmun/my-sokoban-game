import LEVELS from '../game/levels.js';

export default function LevelSelect({ cleared, onPick, onBack }) {
  return (
    <div className="screen">
      <header className="hud">
        <button className="btn ghost" onClick={onBack}>◀ 메인</button>
        <div className="hud-title"><span className="lv">단계 선택</span></div>
        <span className="moves">{cleared.length}/{LEVELS.length}</span>
      </header>
      <div className="level-grid">
        {LEVELS.map((l, i) => {
          const done = cleared.includes(i);
          return (
            <button key={i} className={`level-card ${done ? 'done' : ''}`} onClick={() => onPick(i)}>
              <span className="level-num">{i + 1}</span>
              <span className="level-name">{l.name}</span>
              <span className="level-status">{done ? '✔ 클리어' : '미클리어'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
