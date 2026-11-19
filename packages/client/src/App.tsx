import { useEffect, useState } from 'react';
import {
  RULE_VERSION,
  defaultGameData,
  runToEnd,
  scheduleHazards,
  selectMap,
  type MatchConfig,
  type MatchResult,
  type Position,
} from '@ngu-hanh/sim';
import { Battle } from './Battle';
import { vi } from './i18n/vi';

type Screen = 'team' | 'deployment' | 'battle' | 'result';
const botMain = [
  { unitId: 'bull_demon', position: { x: 4, y: 0 } },
  { unitId: 'ne_zha', position: { x: 5, y: 1 } },
  { unitId: 'zhenyuan', position: { x: 6, y: 2 } },
];
const seed = 42;
const name = (id: string) => vi[id as keyof typeof vi] ?? id;
const def = (id: string) =>
  defaultGameData.units.find((unit) => unit.id === id)!;
const screenFromHash = (): Screen => {
  const hash = location.hash.slice(1);
  return hash === 'deployment' || hash === 'battle' || hash === 'result'
    ? hash
    : 'team';
};

export function App() {
  const [screen, setScreen] = useState<Screen>('team');
  const [main, setMain] = useState<string[]>([]);
  const [reinforcement, setReinforcement] = useState('');
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [selected, setSelected] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [config, setConfig] = useState<MatchConfig>();
  const [result, setResult] = useState<MatchResult>();
  const mapId = selectMap(seed, defaultGameData);
  const hazards = scheduleHazards(seed, defaultGameData);
  const go = (next: Screen) => {
    location.hash = next;
    setScreen(next);
  };
  useEffect(() => {
    const sync = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => {
    if (
      (screen === 'deployment' && main.length !== 3) ||
      ((screen === 'battle' || screen === 'result') && !result)
    )
      go('team');
  }, [screen, main.length, result]);
  const lock = () => {
    if (main.length !== 3 || !reinforcement) return;
    const used = new Set(Object.values(positions).map((p) => `${p.x},${p.y}`));
    const free: Position[] = [];
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 3; x++)
        if (!used.has(`${x},${y}`)) free.push({ x, y });
    let cursor = 0;
    const next: MatchConfig = {
      seed,
      version: RULE_VERSION,
      mode: 'pvp',
      lineupA: {
        main: main.map((unitId) => ({
          unitId,
          position: positions[unitId] ?? free[cursor++]!,
        })),
        reinforcement,
      },
      lineupB: { main: botMain, reinforcement: 'sha_wujing' },
    };
    setConfig(next);
    setResult(runToEnd(next));
    go('battle');
  };
  useEffect(() => {
    if (screen !== 'deployment') return;
    if (seconds === 0) {
      lock();
      return;
    }
    const timer = window.setTimeout(
      () => setSeconds((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [screen, seconds]);
  const place = (id: string, pos: Position) => {
    if (!main.includes(id) || pos.x > 2) return;
    setPositions((before) => {
      const next = { ...before };
      for (const [other, p] of Object.entries(next))
        if (other !== id && p.x === pos.x && p.y === pos.y) delete next[other];
      next[id] = pos;
      return next;
    });
    setSelected(id);
  };
  const reset = () => {
    setMain([]);
    setReinforcement('');
    setPositions({});
    setSelected('');
    setSeconds(30);
    setConfig(undefined);
    setResult(undefined);
    go('team');
  };

  if (screen === 'battle' && config && result)
    return (
      <Battle
        config={config}
        result={result}
        onExit={() => go('result')}
        onComplete={() => go('result')}
      />
    );
  if (screen === 'result' && result) {
    const score = (side: 'A' | 'B') =>
      Math.round(
        result.score[side].damageDealt + result.score[side].healDone * 0.5,
      ).toLocaleString('vi-VN');
    return (
      <div className="flow-shell">
        <header className="flow-header">
          <img src="/branding/wanebound-logo.webp" alt="" />
          {vi.title}
        </header>
        <main className="result-screen">
          <span className="eyebrow">{vi.result}</span>
          <h1>
            {result.winner === 'draw'
              ? vi.draw
              : result.winner === 'A'
                ? vi.victory
                : vi.defeat}
          </h1>
          <p>
            {result.reason === 'timeout' ? vi.timeout : vi.elimination} ·{' '}
            {(result.ticks / 10).toFixed(1)} {vi.seconds}
          </p>
          <div className="result-scores">
            <div>
              {vi.teamA}
              <strong>{score('A')}</strong>
            </div>
            <div>
              {vi.teamB}
              <strong>{score('B')}</strong>
            </div>
          </div>
          <div className="flow-actions">
            <button onClick={() => go('battle')}>{vi.replay}</button>
            <button className="primary-button" onClick={reset}>
              {vi.newMatch}
            </button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="flow-shell">
      <header className="flow-header">
        <img src="/branding/wanebound-logo.webp" alt="" />
        {vi.title}
        <small>{vi.localMatch}</small>
      </header>
      <main className="flow-main">
        <div className="flow-steps">
          <span className={screen === 'team' ? 'active' : ''}>
            01 {vi.chooseTeam}
          </span>
          <span className={screen === 'deployment' ? 'active' : ''}>
            02 {vi.deploy}
          </span>
          <span>03 {vi.battlefield}</span>
        </div>
        {screen === 'team' ? (
          <>
            <div className="flow-title">
              <span className="eyebrow">{vi.localMatch}</span>
              <h1>{vi.chooseTeam}</h1>
              <p>{vi.chooseTeamHelp}</p>
            </div>
            <div className="unit-grid">
              {defaultGameData.units.map((unit) => {
                const index = main.indexOf(unit.id);
                const support = reinforcement === unit.id;
                return (
                  <div
                    className={`unit-card ${index >= 0 || support ? 'chosen' : ''}`}
                    key={unit.id}
                  >
                    <img src={`/${unit.art.portrait}`} alt="" />
                    <div className="unit-card-body">
                      <strong>{name(unit.id)}</strong>
                      <span>
                        {vi[unit.element]} · {vi[unit.role]}
                      </span>
                      <small>{unit.rarity}</small>
                    </div>
                    <div className="unit-card-actions">
                      <button
                        aria-pressed={index >= 0}
                        disabled={support || (index < 0 && main.length === 3)}
                        onClick={() =>
                          setMain((before) =>
                            index >= 0
                              ? before.filter((id) => id !== unit.id)
                              : [...before, unit.id],
                          )
                        }
                      >
                        {index >= 0
                          ? `${vi.mainUnit} ${index + 1} ✓`
                          : vi.mainUnit}
                      </button>
                      <button
                        aria-pressed={support}
                        disabled={index >= 0}
                        onClick={() => setReinforcement(support ? '' : unit.id)}
                      >
                        {support ? `${vi.reinforcement} ✓` : vi.reinforcement}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flow-bottom">
              <p>
                {main.length}/3 {vi.mainUnits} ·{' '}
                {reinforcement ? name(reinforcement) : vi.noReinforcement}
              </p>
              <button
                className="primary-button"
                disabled={main.length !== 3 || !reinforcement}
                onClick={() => {
                  setPositions({});
                  setSelected('');
                  setSeconds(30);
                  go('deployment');
                }}
              >
                {vi.continue} →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flow-title">
              <span className="eyebrow">
                {name(mapId)} · SEED {seed}
              </span>
              <h1>{vi.deploy}</h1>
              <p>{vi.deployHelp}</p>
            </div>
            <div className="deployment-layout">
              <section className="deployment-panel">
                <div className="deployment-top">
                  <strong>{vi.ownHalf}</strong>
                  <time>{seconds}s</time>
                </div>
                <div
                  className="deployment-board"
                  style={{ backgroundImage: `url(/maps/${mapId}.png)` }}
                >
                  {Array.from({ length: 5 }, (_, y) =>
                    Array.from({ length: 7 }, (_, x) => {
                      const id = Object.keys(positions).find(
                        (unitId) =>
                          positions[unitId]?.x === x &&
                          positions[unitId]?.y === y,
                      );
                      return (
                        <button
                          key={`${x},${y}`}
                          className={`deployment-cell ${x < 3 ? 'valid' : ''} ${id ? 'occupied' : ''}`}
                          style={{
                            left: `${9 + x * 10.55 + y * 5.25}%`,
                            top: `${20 + y * 13}%`,
                          }}
                          disabled={x > 2}
                          onClick={() => selected && place(selected, { x, y })}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            place(event.dataTransfer.getData('text/plain'), {
                              x,
                              y,
                            });
                          }}
                          aria-label={`${vi.column} ${x + 1}, ${vi.row} ${y + 1}${id ? `: ${name(id)}` : ''}`}
                        >
                          {id ? (
                            <img src={`/${def(id).art.icon}`} alt="" />
                          ) : x < 3 ? (
                            '·'
                          ) : (
                            ''
                          )}
                        </button>
                      );
                    }),
                  )}
                </div>
                <p>{vi.deployHint}</p>
              </section>
              <aside className="deployment-side">
                <section className="info-card">
                  <span className="eyebrow">{vi.weatherForecast}</span>
                  <h2>{name(mapId)}</h2>
                  {hazards.map((hazard, index) => (
                    <p key={index}>
                      {(hazard.startTick / 10).toFixed(0)}s · {name(hazard.id)}
                    </p>
                  ))}
                </section>
                <section className="info-card">
                  <span className="eyebrow">{vi.mainUnits}</span>
                  <div className="deploy-roster">
                    {main.map((id) => (
                      <button
                        key={id}
                        draggable
                        onDragStart={(event) =>
                          event.dataTransfer.setData('text/plain', id)
                        }
                        className={selected === id ? 'selected' : ''}
                        onClick={() => setSelected(id)}
                      >
                        <img src={`/${def(id).art.icon}`} alt="" />
                        <span>
                          {name(id)}
                          <small>
                            {positions[id]
                              ? `${vi.column} ${positions[id].x + 1} · ${vi.row} ${positions[id].y + 1}`
                              : vi.notPlaced}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p>
                    {vi.reinforcement}: {name(reinforcement)}
                  </p>
                </section>
              </aside>
            </div>
            <div className="flow-bottom">
              <button onClick={() => go('team')}>{vi.back}</button>
              <button className="primary-button" onClick={lock}>
                {vi.lock} →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
