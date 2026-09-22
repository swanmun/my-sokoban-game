import { useCallback, useEffect, useRef, useState } from 'react';
import Main from './components/Main.jsx';
import LevelSelect from './components/LevelSelect.jsx';
import Game from './components/Game.jsx';
import { loadProgress, saveProgress } from './game/storage.js';
import { loadApples, saveApples } from './game/items.js';
import LEVELS from './game/levels.js';
import './App.css';

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState('main');
  const [level, setLevel] = useState(0);
  const [resume, setResume] = useState(null);

  const [apples, setApples] = useState(0);
  const applesLoaded = useRef(false);
  const pendingApples = useRef(0); // 불러오기 전에 먹은 사과

  useEffect(() => { saveProgress(progress); }, [progress]);

  // 사과 개수는 Supabase item 테이블에서 불러오고 변경 시 저장한다.
  useEffect(() => {
    loadApples()
      .then((n) => { applesLoaded.current = true; setApples(n + pendingApples.current); })
      .catch((e) => console.error('사과 불러오기 실패', e));
  }, []);

  useEffect(() => {
    if (!applesLoaded.current) return;
    const t = setTimeout(() => {
      saveApples(apples).catch((e) => console.error('사과 저장 실패', e));
    }, 300);
    return () => clearTimeout(t);
  }, [apples]);

  const onApple = useCallback((delta) => {
    if (!applesLoaded.current) pendingApples.current += delta;
    setApples((n) => Math.max(0, n + delta));
  }, []);

  const onProgress = useCallback((cur) => {
    setProgress((p) => ({ ...p, current: cur }));
  }, []);

  const onClear = useCallback((i) => {
    setProgress((p) => (p.cleared.includes(i) ? p : { ...p, cleared: [...p.cleared, i].sort((a, b) => a - b) }));
  }, []);

  const play = (i, saved = null) => { setLevel(i); setResume(saved); setScreen('game'); };

  const onContinue = () => play(progress.current.level, progress.current);
  const onStart = () => {
    const first = LEVELS.findIndex((_, i) => !progress.cleared.includes(i));
    play(first === -1 ? 0 : first);
  };
  const onNext = () => play(Math.min(level + 1, LEVELS.length - 1));

  if (screen === 'select') {
    return <LevelSelect cleared={progress.cleared} onPick={(i) => play(i)} onBack={() => setScreen('main')} />;
  }
  if (screen === 'game') {
    return (
      <Game
        key={`${level}-${resume ? 'r' : 'n'}`}
        levelIndex={level}
        saved={resume}
        apples={apples}
        onApple={onApple}
        onProgress={onProgress}
        onClear={onClear}
        onNext={onNext}
        onSelect={() => setScreen('select')}
      />
    );
  }
  return (
    <Main
      hasSave={progress.current !== null}
      onContinue={onContinue}
      onStart={onStart}
      onSelect={() => setScreen('select')}
    />
  );
}
