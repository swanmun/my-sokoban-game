import { key } from '../game/engine.js';
import { MOVE_MS } from '../hooks/useSokoban.js';

export default function Board({ state, size }) {
  const { width, height, walls, goals, boxes, floorSet, player, apples = [] } = state;
  const goalSet = new Set(goals.map((g) => key(g.x, g.y)));
  const floor = [...floorSet].map((k) => k.split(',').map(Number));
  const style = { width: width * size, height: height * size, '--cell': `${size}px`, '--ms': `${MOVE_MS}ms` };
  const pos = (x, y) => ({ transform: `translate(${x * size}px, ${y * size}px)` });

  return (
    <div className="board" style={style}>
      {floor.map(([x, y]) => (
        <div key={`f${x},${y}`} className="cell floor" style={pos(x, y)} />
      ))}
      {walls.map((w) => (
        <div key={`w${w.x},${w.y}`} className="cell wall" style={pos(w.x, w.y)} />
      ))}
      {goals.map((g) => (
        <div key={`g${g.x},${g.y}`} className="cell goal" style={pos(g.x, g.y)} aria-label="목표" />
      ))}
      {apples.map((a) => (
        <div key={`a${a.x},${a.y}`} className="cell apple" style={pos(a.x, a.y)} aria-label="사과" />
      ))}
      {boxes.map((b) => (
        <div
          key={`b${b.id}`}
          className={`cell box ${goalSet.has(key(b.x, b.y)) ? 'on-goal' : ''}`}
          style={pos(b.x, b.y)}
        />
      ))}
      <div className="cell player" style={pos(player.x, player.y)} aria-label="플레이어" />
    </div>
  );
}
