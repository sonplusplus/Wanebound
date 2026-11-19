import { describe, expect, it } from 'vitest';
import {
  RULE_VERSION,
  createMatch,
  damageAmount,
  elementMultiplier,
  runToEnd,
  scheduleHazards,
  selectMap,
  step,
  type MatchConfig,
} from '../src/match.js';
import { defaultGameData } from '../src/default-data.js';
import { hexGrid } from '../src/grid.js';
import { combat, movementBlocked } from '../src/collision.js';

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
  it('moves Wukong and Ne Zha through the narrow opening in the deployed lineup', () => {
    const state = createMatch({
      ...config,
      lineupA: {
        ...config.lineupA,
        main: [
          { unitId: 'sun_wukong', position: { x: 1, y: 3 } },
          { unitId: 'zhenyuan', position: { x: 0, y: 2 } },
          { unitId: 'sha_wujing', position: { x: 2, y: 1 } },
        ],
      },
    });
    for (let i = 0; i < 100; i++) step(state);
    expect(
      state.units.find((unit) => unit.id === 'A0_sun_wukong')!.position.x,
    ).toBeGreaterThan(2);
    expect(
      state.units.find((unit) => unit.id === 'B1_ne_zha')!.position.x,
    ).toBeLessThan(4.5);
  });
  it('delays switching to a nearer target by three ticks and switches immediately after death', () => {
    const data = {
      ...defaultGameData,
      units: defaultGameData.units.map((unit) => ({
        ...unit,
        stats: { ...unit.stats, spd: 0 },
      })),
    };
    const state = createMatch({ ...config, data });
    state.hazards = [];
    const source = state.units.find((unit) => unit.id === 'A0_sun_wukong')!;
    const old = state.units.find((unit) => unit.id === 'B0_bull_demon')!;
    const nearer = state.units.find((unit) => unit.id === 'B1_ne_zha')!;
    old.position = { x: 4, y: 0 };
    nearer.position = { x: 3, y: 0 };
    source.targetId = old.id;
    for (let tick = 1; tick <= 3; tick++) {
      step(state);
      expect(source.targetId).toBe(old.id);
    }
    step(state);
    expect(source.targetId).toBe(nearer.id);
    nearer.alive = false;
    step(state);
    expect(source.targetId).toBe(old.id);
  });
  it('ranged approaches distant enemies and attacks the nearest rather than lowest HP', () => {
    const data = {
      ...defaultGameData,
      units: defaultGameData.units.map((unit) =>
        unit.id === 'sun_wukong'
          ? {
              ...unit,
              role: 'ranged' as const,
              stats: { ...unit.stats, range: 3 },
            }
          : unit,
      ),
    };
    const state = createMatch({ ...config, data });
    const source = state.units.find((unit) => unit.id === 'A0_sun_wukong')!;
    const nearest = state.units.find((unit) => unit.id === 'B0_bull_demon')!;
    const weak = state.units.find((unit) => unit.id === 'B1_ne_zha')!;
    weak.hp = 1;
    step(state);
    expect(
      state.events.find(
        (event) => event.type === 'Attack' && event.sourceId === source.id,
      )?.targetId,
    ).toBe(nearest.id);
    source.position = { x: 0, y: 0 };
    const before = { ...source.position };
    step(state);
    expect(source.position).not.toEqual(before);
  });

  it('blocks crossing an occupied hex even when the destination is beyond it', () => {
    expect(
      movementBlocked({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 1.5, y: 0 }),
    ).toBe(true);
    expect(
      movementBlocked({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 1.5, y: 1 }),
    ).toBe(false);
  });

  it('keeps every living unit separated throughout a match', () => {
    const result = runToEnd(config);
    for (const event of result.events) {
      const units = event.units?.filter((unit) => unit.alive) ?? [];
      for (let i = 0; i < units.length; i++)
        for (let j = i + 1; j < units.length; j++)
          expect(
            hexGrid.distance(units[i]!.position, units[j]!.position),
          ).toBeGreaterThanOrEqual(combat.minimumUnitDistance - 0.000001);
    }
  });

  it('spawns reinforcement immediately near the fallen unit', () => {
    const state = createMatch(config);
    state.units[0]!.alive = false;
    state.units[0]!.position = { x: 2, y: 0 };
    const ally = state.units.find((unit) => unit.side === 'A' && unit.alive)!;
    ally.position = { x: 0, y: 0 };
    ally.nextAttackTick = 9999;
    step(state);
    const reinforcement = state.units.find(
      (unit) => unit.side === 'A' && unit.reinforcement,
    )!;
    expect(reinforcement.position).toEqual({ x: 2, y: 0 });
  });
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

  it('spawns reinforcement once at the fallen position with 20 tick immunity', () => {
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
    expect(spawned.position).toEqual({ x: 2, y: 0 });
    expect(spawned.invulnerableUntil).toBe(state.tick + 20);
    for (let i = 0; i < 30; i++) step(state);
    expect(
      state.events.filter(
        (event) =>
          event.type === 'ReinforcementSpawn' && event.sourceId === spawned.id,
      ),
    ).toHaveLength(1);
  });

  it('prevents damage for all 20 ticks after reinforcement spawn', () => {
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
    for (let i = 0; i < 20; i++) {
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

  it('selects a PvP map deterministically from validated data', () => {
    const selected = new Set<string>();
    for (const seed of [0, 1, 2, 3, 42, 12345, 0xffffffff]) {
      const state = createMatch({ ...config, seed });
      expect(state.mapId).toBe(selectMap(seed, defaultGameData));
      expect(defaultGameData.maps.some((map) => map.id === state.mapId)).toBe(
        true,
      );
      selected.add(state.mapId!);
    }
    expect(selected.size).toBe(2);
    expect(createMatch({ ...config, mode: 'pve' }).mapId).toBeNull();
  });

  it('applies the ice field attack speed penalty to both teams', () => {
    const clear = createMatch(config);
    const icy = createMatch(config);
    clear.hazards = [];
    icy.hazards = [{ id: 'ice_field', warnTick: 0, startTick: 1, endTick: 61 }];
    for (const state of [clear, icy]) {
      state.units.find((unit) => unit.id === 'A0_sun_wukong')!.position = {
        x: 3,
        y: 0,
      };
      state.units.find((unit) => unit.id === 'B0_bull_demon')!.position = {
        x: 4,
        y: 0,
      };
      step(state);
    }
    for (const id of ['A0_sun_wukong', 'B0_bull_demon'])
      expect(
        icy.units.find((unit) => unit.id === id)!.nextAttackTick,
      ).toBeGreaterThan(
        clear.units.find((unit) => unit.id === id)!.nextAttackTick,
      );
  });

  it('applies the map damage bonus to both teams', () => {
    const plain = createMatch(config);
    const mountain = createMatch(config);
    plain.mapId = 'water_curtain_cave';
    mountain.mapId = 'flaming_mountain';
    for (const state of [plain, mountain]) {
      state.hazards = [];
      state.units.find((unit) => unit.id === 'A0_sun_wukong')!.position = {
        x: 3,
        y: 0,
      };
      state.units.find((unit) => unit.id === 'B0_bull_demon')!.position = {
        x: 4,
        y: 0,
      };
      step(state);
    }
    for (const id of ['A0_sun_wukong', 'B0_bull_demon'])
      expect(mountain.units.find((unit) => unit.id === id)!.hp).toBeLessThan(
        plain.units.find((unit) => unit.id === id)!.hp,
      );
  });

  it('increases actual healing for both teams in Water Curtain Cave', () => {
    const plain = createMatch(config);
    const cave = createMatch(config);
    plain.mapId = 'flaming_mountain';
    cave.mapId = 'water_curtain_cave';
    for (const state of [plain, cave]) {
      state.hazards = [];
      state.tick = 49;
      for (const unit of state.units) {
        unit.nextAttackTick = 100;
        if (unit.side === 'A') unit.hp -= 500;
        if (unit.side === 'B') unit.hp -= 500;
      }
      step(state);
    }
    expect(cave.score.A.healDone).toBeGreaterThan(plain.score.A.healDone);
    expect(cave.score.B.healDone).toBeGreaterThan(plain.score.B.healDone);
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
