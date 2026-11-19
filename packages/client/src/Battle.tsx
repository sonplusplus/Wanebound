import { useEffect, useMemo, useState } from 'react';
import {
  defaultGameData,
  scheduleHazards,
  type MatchEvent,
  type MatchConfig,
  type MatchResult,
} from '@ngu-hanh/sim';
import { Board } from './Board';
import { vi } from './i18n/vi';

const hazardNames: Record<string, string> = {
  sword_rain: vi.sword_rain,
  vines: vi.vines,
  flood: vi.flood,
  wildfire: vi.wildfire,
  sandstorm: vi.sandstorm,
  ice_field: vi.ice_field,
};
const eventNames: Record<string, string> = {
  Attack: 'Tấn công',
  Cast: 'Thi triển',
  Death: 'Gục ngã',
  ReinforcementSpawn: 'Viện trợ xuất hiện',
  HazardWarn: 'Cảnh báo thiên tai',
  HazardStart: 'Thiên tai bắt đầu',
  HazardEnd: 'Thiên tai kết thúc',
};
function getName(id: string): string {
  const unit = defaultGameData.units.find((item) => id.endsWith(item.id));
  return unit ? vi[unit.id as keyof typeof vi] : id;
}

function eventDescription(event: MatchEvent): string {
  if (event.hazardId)
    return `${eventNames[event.type]} · ${hazardNames[event.hazardId]}`;
  if (event.type === 'ReinforcementSpawn')
    return `${eventNames[event.type]} · ${getName(event.sourceId ?? '')}`;
  if (event.type === 'Death') return `${getName(event.targetId ?? '')} gục ngã`;
  if (event.type === 'Cast')
    return `${getName(event.sourceId ?? '')} dùng tuyệt kỹ`;
  return `${getName(event.sourceId ?? '')} tấn công`;
}

function Team({ side, ids }: { side: 'A' | 'B'; ids: string[] }) {
  return (
    <section className={`team team-${side.toLowerCase()}`}>
      <div className="team-heading">
        <span className="team-dot" />
        {side === 'A' ? vi.teamA : vi.teamB}
      </div>
      <div className="team-list">
        {ids.map((id, index) => {
          const unit = defaultGameData.units.find((item) => item.id === id)!;
          return (
            <div className="team-unit" key={id}>
              <span className={`element-token ${unit.element}`}>
                {vi[unit.element]}
              </span>
              <span className="team-unit-copy">
                <strong>{vi[unit.id as keyof typeof vi]}</strong>
                <small>
                  {vi[unit.role]}
                  {index === 3 ? ' · Viện trợ' : ''}
                </small>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Battle({
  config: demoConfig,
  result: demoResult,
  onExit,
  onComplete,
}: {
  config: MatchConfig;
  result: MatchResult;
  onExit: () => void;
  onComplete: () => void;
}) {
  const frames = useMemo(
    () =>
      demoResult.events.filter(
        (event) => event.type === 'Snapshot' && event.units,
      ),
    [demoResult],
  );
  const visibleEvents = useMemo(
    () => demoResult.events.filter((event) => event.type in eventNames),
    [demoResult],
  );
  const motionByTick = useMemo(() => {
    const map = new Map<number, MatchEvent[]>();
    for (const event of demoResult.events) {
      if (
        !['Attack', 'Cast', 'Damage', 'Death', 'ReinforcementSpawn'].includes(
          event.type,
        )
      )
        continue;
      const list = map.get(event.tick) ?? [];
      list.push(event);
      map.set(event.tick, list);
    }
    return map;
  }, [demoResult]);
  const hazards = useMemo(
    () =>
      demoConfig.mode === 'pvp'
        ? scheduleHazards(demoConfig.seed, defaultGameData)
        : [],
    [demoConfig],
  );
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    let id = 0;
    let active = true;
    let last = performance.now();
    const tick = (now: number) => {
      if (!active) return;
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      setPlayhead((value) =>
        Math.min(demoResult.ticks, value + elapsed * 10 * speed),
      );
      if (active) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(id);
    };
  }, [playing, speed]);
  useEffect(() => {
    if (playhead >= demoResult.ticks) {
      setPlaying(false);
      onComplete();
    }
  }, [playhead, demoResult.ticks, onComplete]);

  const whole = Math.floor(playhead);
  const current = frames[Math.min(whole, frames.length - 1)]?.units ?? [];
  const next = frames[Math.min(whole + 1, frames.length - 1)]?.units ?? current;
  const activeHazard = hazards.find(
    (hazard) => playhead >= hazard.startTick && playhead < hazard.endTick,
  );
  const warningHazard = hazards.find(
    (hazard) => playhead >= hazard.warnTick && playhead < hazard.startTick,
  );
  const upcoming = hazards.find((hazard) => playhead < hazard.warnTick);
  const recent = useMemo(
    () =>
      visibleEvents
        .filter((event) => event.tick <= whole)
        .slice(-4)
        .reverse(),
    [whole],
  );
  const motionEvents = useMemo(() => {
    const result: MatchEvent[] = [];
    for (let at = Math.max(0, whole - 5); at <= whole + 5; at++)
      result.push(...(motionByTick.get(at) ?? []));
    return result;
  }, [whole]);
  const teamA = [
    ...demoConfig.lineupA.main.map((entry) => entry.unitId),
    demoConfig.lineupA.reinforcement,
  ];
  const teamB = [
    ...demoConfig.lineupB.main.map((entry) => entry.unitId),
    demoConfig.lineupB.reinforcement,
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <button onClick={onExit}>{vi.back}</button>
        <img
          className="brand-mark"
          src="/branding/wanebound-logo.webp"
          alt="Logo Wanebound Tân Nguyệt"
        />
        <div>
          <h1>{vi.title}</h1>
          <p>{vi.subtitle}</p>
        </div>
        <div className="header-pill">HEX · 7 × 5</div>
      </header>
      <main className="layout">
        <div className="main-column">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                {vi.previewSeed} {demoConfig.seed}
              </span>
              <h2>{vi.battlefield}</h2>
              <span className="eyebrow">
                {demoResult.mapId === 'flaming_mountain'
                  ? vi.flaming_mountain
                  : vi.water_curtain_cave}
              </span>
            </div>
            <div className="clock">
              {(playhead / 10).toFixed(1)} <span>/ 180.0 s</span>
            </div>
          </div>
          <div className="board-wrap">
            <Board
              current={current}
              next={next}
              alpha={playhead - whole}
              tick={playhead}
              events={motionEvents}
              hazards={hazards}
              mapId={demoResult.mapId}
            />
            {warningHazard && (
              <div className="hazard-overlay warning">
                <span>
                  ⚠ {vi.hazard}: {hazardNames[warningHazard.id]}
                </span>
                <strong>
                  {Math.ceil((warningHazard.startTick - playhead) / 10)}s
                </strong>
              </div>
            )}
            {activeHazard && (
              <div className="hazard-overlay active">
                <span>
                  {vi.hazard}: {hazardNames[activeHazard.id]}
                </span>
                <strong>
                  {Math.ceil((activeHazard.endTick - playhead) / 10)}s
                </strong>
              </div>
            )}
            <div className="board-legend">
              <span>
                <i className="legend-a" /> {vi.teamA}
              </span>
              <span>
                <i className="legend-b" /> {vi.teamB}
              </span>
            </div>
          </div>
          <section className="playback-panel">
            <div className="timeline-title">
              <strong>{vi.timeline}</strong>
              <span>TICK {whole.toString().padStart(4, '0')}</span>
            </div>
            <div className="timeline-wrap">
              <input
                aria-label="Chọn thời điểm trận đấu"
                type="range"
                min="0"
                max={demoResult.ticks}
                step="0.1"
                value={playhead}
                onChange={(event) => {
                  setPlayhead(Number(event.target.value));
                  setPlaying(false);
                }}
              />
              <div className="timeline-markers">
                {hazards.map((hazard, index) => (
                  <span
                    key={index}
                    style={{
                      left: `${(hazard.startTick / demoResult.ticks) * 100}%`,
                    }}
                    title={`${hazardNames[hazard.id]} · ${hazard.startTick / 10}s`}
                  />
                ))}
              </div>
            </div>
            <div className="controls">
              <button
                className="primary-button"
                onClick={() => {
                  if (playhead >= demoResult.ticks) setPlayhead(0);
                  setPlaying((value) => !value);
                }}
              >
                {playing ? 'Ⅱ  ' + vi.paused : '▶  ' + vi.play}
              </button>
              <button
                onClick={() => {
                  setPlayhead(0);
                  setPlaying(true);
                }}
              >
                ↺ {vi.replay}
              </button>
              <div className="speed-buttons">
                <span>{vi.speed}</span>
                {[1, 2, 4].map((value) => (
                  <button
                    className={speed === value ? 'selected' : ''}
                    key={value}
                    onClick={() => setSpeed(value)}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="event-panel">
            <div className="panel-heading">
              NHỊP TRẬN <span>Đọc trực tiếp từ event log</span>
            </div>
            <div className="event-list">
              {recent.length ? (
                recent.map((event, index) => (
                  <div key={`${event.tick}-${event.type}-${index}`}>
                    <time>{(event.tick / 10).toFixed(1)}s</time>
                    <span>{eventDescription(event)}</span>
                  </div>
                ))
              ) : (
                <p>Trận đấu chuẩn bị bắt đầu…</p>
              )}
            </div>
          </section>
        </div>
        <aside className="side-column">
          <div className="logo-panel">
            <img
              src="/branding/wanebound-logo.webp"
              alt="Wanebound Tân Nguyệt: biểu tượng ngũ hành"
            />
          </div>
          <div className="info-card status-card">
            <span className="eyebrow">THIÊN TAI</span>
            <h3>
              {activeHazard
                ? vi.active
                : warningHazard
                  ? vi.upcoming
                  : upcoming
                    ? hazardNames[upcoming.id]
                    : 'Đã qua'}
            </h3>
            <p>
              {activeHazard
                ? `Còn ${Math.ceil((activeHazard.endTick - playhead) / 10)} giây`
                : warningHazard
                  ? `Bắt đầu sau ${Math.ceil((warningHazard.startTick - playhead) / 10)} giây`
                  : upcoming
                    ? `Dự kiến ${(upcoming.startTick / 10).toFixed(0)} giây`
                    : 'Không còn thiên tai trong trận này.'}
            </p>
            <div className="hazard-chips">
              {hazards.map((hazard, index) => (
                <span key={index}>
                  {index + 1}. {hazardNames[hazard.id]}
                </span>
              ))}
            </div>
          </div>
          <Team side="A" ids={teamA} />
          <Team side="B" ids={teamB} />
          <div className="info-card result-card">
            <span className="eyebrow">KẾT QUẢ MÔ PHỎNG</span>
            <h3>
              {vi.winner}:{' '}
              {demoResult.winner === 'draw'
                ? vi.draw
                : demoResult.winner === 'A'
                  ? vi.teamA
                  : vi.teamB}
            </h3>
            <p>
              Điểm A{' '}
              {Math.round(
                demoResult.score.A.damageDealt +
                  demoResult.score.A.healDone * 0.5,
              ).toLocaleString('vi-VN')}{' '}
              · Điểm B{' '}
              {Math.round(
                demoResult.score.B.damageDealt +
                  demoResult.score.B.healDone * 0.5,
              ).toLocaleString('vi-VN')}
            </p>
          </div>
        </aside>
      </main>
      <footer>{vi.footer}</footer>
    </div>
  );
}
