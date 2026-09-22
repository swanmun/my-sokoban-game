# 동굴 소코반

`02-prd.md`를 기반으로 만든 React(Vite) 소코반 게임.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 빌드
```

## 조작

- 데스크톱: 방향키 / WASD, Z 또는 Backspace = 되돌리기, R = 다시 시작
- 모바일: 스와이프 또는 화면 하단 방향 버튼

## 구조

- `src/game/levels.js` : 1~10단계 맵 데이터
- `src/game/engine.js` : 이동/밀기/되돌리기/클리어 판정 로직
- `src/game/storage.js` : localStorage 진행 저장
- `src/hooks/useSokoban.js` : 입력 큐 + 애니메이션 타이밍
- `src/components/` : Main, LevelSelect, Game, Board, DPad
