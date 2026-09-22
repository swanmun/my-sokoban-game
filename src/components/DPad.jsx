export default function DPad({ onMove }) {
  const btn = (dir, label, cls) => (
    <button
      className={`dpad-btn ${cls}`}
      onPointerDown={(e) => { e.preventDefault(); onMove(dir); }}
      aria-label={label}
    >
      {label}
    </button>
  );
  return (
    <div className="dpad">
      {btn('up', '▲', 'up')}
      {btn('left', '◀', 'left')}
      {btn('right', '▶', 'right')}
      {btn('down', '▼', 'down')}
    </div>
  );
}
