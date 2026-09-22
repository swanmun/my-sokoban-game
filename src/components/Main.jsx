export default function Main({ hasSave, onContinue, onStart, onSelect }) {
  return (
    <div className="screen main">
      <div className="torch left" />
      <div className="torch right" />
      <h1 className="title">동굴<br />소코반</h1>
      <p className="subtitle">상자를 밀어 수정 위에 놓으세요</p>
      <div className="main-actions">
        {hasSave && <button className="btn primary big" onClick={onContinue}>이어서 하기</button>}
        <button className={`btn big ${hasSave ? '' : 'primary'}`} onClick={onStart}>처음부터</button>
        <button className="btn big" onClick={onSelect}>단계 선택</button>
      </div>
      <p className="hint">방향키 · WASD · 스와이프 · 화면 버튼</p>
    </div>
  );
}
