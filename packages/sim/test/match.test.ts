import { describe, expect, it } from 'vitest';
import {
  RULE_VERSION,
  createMatch,
  damageAmount,
  elementMultiplier,
  runToEnd,
  scheduleHazards,
  step,
  type MatchConfig,
} from '../src/match.js';
import { defaultGameData } from '../src/default-data.js';

const config: MatchConfig = {
  seed: 12345,
  version: RULE_VERSION,
  mode: 'pvp',
  lineupA: {
    main: [
      { unitId: 'sun_wukong', position: { x: 2, y: 0 } },
      { unitId: 'zhenyuan', position: { x: 1, y: 1 } },
      { unitId: 'sha_wujing', position: { x: 0, y: 2 } },
    ],
    reinforcement: 'ne_zha',
  },
  lineupB: {
    main: [
      { unitId: 'bull_demon', position: { x: 4, y: 0 } },
      { unitId: 'ne_zha', position: { x: 5, y: 1 } },
      { unitId: 'zhenyuan', position: { x: 6, y: 2 } },
    ],
    reinforcement: 'sha_wujing',
  },
};

describe('match', () => {
  it('replays exactly, including tick hashes', () => {
    const first = runToEnd(config);
    const second = runToEnd(config);
    expect(first.finalHash).toBe(second.finalHash);
    expect(first.hashes).toEqual(second.hashes);
    expect(first.events).toEqual(second.events);
    expect(first.ticks).toBeLessThanOrEqual(1800);
  });

  it('uses the rule damage and elemental multipliers', () => {
    expect(elementMultiplier('metal', 'wood')).toBe(1.2);
    expect(elementMultiplier('wood', 'metal')).toBe(0.85);
    expect(elementMultiplier('metal', 'metal')).toBe(1);
    expect(damageAmount(100, 0, 1, 1.2)).toBe(120);
    expect(damageAmount(100, 0, 1, 0.85)).toBe(85);
  });

  it('spawns reinforcement once at the outer column with 15 tick immunity', () => {
    const state = createMatch(config);
    const fallen = state.units.find((unit) => unit.id === 'A0_sun_wukong')!;
    fallen.hp = 1;
    const attacker = state.units.find((unit) => unit.id === 'B0_bull_demon')!;
    attacker.position = { x: 3, y: 0 };
    step(state);
    const spawned = state.units.find(
      (unit) => unit.reinforcement && unit.side === 'A',
    )!;
    expect(spawned).toBeDefined();
    expect(spawned.position).toEqual({ x: 0, y: 0 });
    expect(spawned.invulnerableUntil).toBe(state.tick + 15);
    for (let i = 0; i < 30; i++) step(state);
    expect(
      state.events.filter(
        (event) =>
          event.type === 'ReinforcementSpawn' && event.sourceId === spawned.id,
      ),
    ).toHaveLength(1);
  });

  it('prevents damage for all 15 ticks after reinforcement spawn', () => {
    const state = createMatch(config);
    const fallen = state.units.find((unit) => unit.id === 'A0_sun_wukong')!;
    fallen.hp = 1;
    const attacker = state.units.find((unit) => unit.id === 'B0_bull_demon')!;
    attacker.position = { x: 3, y: 0 };
    step(state);
    const spawned = state.units.find(
      (unit) => unit.reinforcement && unit.side === 'A',
    )!;
    for (const unit of state.units)
      if (unit.side === 'A' && unit.id !== spawned.id) unit.alive = false;
    attacker.position = { x: 1, y: 0 };
    const hp = spawned.hp;
    for (let i = 0; i < 15; i++) {
      attacker.nextAttackTick = 0;
      step(state);
      expect(spawned.hp).toBe(hp);
    }
    attacker.nextAttackTick = 0;
    step(state);
    expect(spawned.hp).toBeLessThan(hp);
  });

  it('warns exactly 100 ticks before every hazard start', () => {
    const hazards = scheduleHazards(config.seed, defaultGameData);
    expect(hazards.length).toBeGreaterThanOrEqual(1);
    expect(hazards.length).toBeLessThanOrEqual(3);
    for (const hazard of hazards) {
      expect(hazard.startTick - hazard.warnTick).toBe(100);
      expect(hazard.endTick - hazard.startTick).toBe(60);
    }
    for (let i = 1; i < hazards.length; i++)
      expect(
        hazards[i]!.startTick - hazards[i - 1]!.startTick,
      ).toBeGreaterThanOrEqual(60);
    const result = runToEnd(config);
    for (const hazard of hazards) {
      expect(
        result.events.some(
          (event) =>
            event.type === 'HazardWarn' &&
            event.tick === hazard.warnTick &&
            event.hazardId === hazard.id,
        ),
      ).toBe(true);
      expect(
        result.events.some(
          (event) =>
            event.type === 'HazardStart' &&
            event.tick === hazard.startTick &&
            event.hazardId === hazard.id,
        ),
      ).toBe(true);
    }
  });

  it('settles timeout by real damage and healing score', () => {
    const state = createMatch(config);
    state.tick = 1799;
    state.score.A.damageDealt = 100;
    state.score.B.damageDealt = 200;
    step(state);
    expect(state.reason).toBe('timeout');
    expect(state.winner).toBe('B');
  });

  it('draws when timeout score differs by less than 0.1% of combined HP', () => {
    const state = createMatch(config);
    state.tick = 1799;
    state.score.A.damageDealt = 100;
    state.score.B.damageDealt = 101;
    step(state);
    expect(state.winner).toBe('draw');
  });
});
