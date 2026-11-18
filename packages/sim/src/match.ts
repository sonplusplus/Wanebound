import type { Element, GameData, SkillDef, UnitDef } from './data.js';
import { defaultGameData } from './default-data.js';
import { hexGrid, type Position } from './grid.js';
import { SeededRng } from './rng.js';

export const RULE_VERSION = '0.3.1';
export const MAX_ENERGY = 200;
export type Side = 'A' | 'B';
export type Winner = Side | 'draw';
export interface Lineup {
  main: { unitId: string; position: Position }[];
  reinforcement: string;
}
export interface MatchConfig {
  seed: number;
  lineupA: Lineup;
  lineupB: Lineup;
  mode: 'pvp' | 'pve';
  version: string;
  data?: GameData;
}
export interface TimedEffect {
  type: 'shield' | 'taunt' | 'slow' | 'stat_mod';
  sourceId: string;
  expiresAt: number;
  amount: number;
  stat?: 'atk' | 'def' | 'spd' | 'range' | 'aspd';
  radius?: number;
}
export interface UnitState {
  id: string;
  unitId: string;
  side: Side;
  position: Position;
  hp: number;
  shield: number;
  energy: number;
  nextAttackTick: number;
  invulnerableUntil: number;
  effects: TimedEffect[];
  alive: boolean;
  reinforcement: boolean;
}
export interface HazardSchedule {
  id: string;
  startTick: number;
  endTick: number;
  warnTick: number;
}
export interface MatchEvent {
  tick: number;
  type: string;
  sourceId?: string;
  targetId?: string;
  amount?: number;
  position?: Position;
  hazardId?: string;
  units?: UnitState[];
  winner?: Winner;
}
export interface MatchState {
  config: MatchConfig;
  data: GameData;
  tick: number;
  units: UnitState[];
  hazards: HazardSchedule[];
  events: MatchEvent[];
  hashes: { tick: number; hash: string }[];
  score: Record<Side, { damageDealt: number; healDone: number }>;
  spawned: Record<Side, boolean>;
  winner?: Winner;
  reason?: 'elimination' | 'timeout';
}
export interface MatchResult {
  winner: Winner;
  reason: 'elimination' | 'timeout';
  ticks: number;
  score: MatchState['score'];
  events: MatchEvent[];
  hashes: MatchState['hashes'];
  finalHash: string;
}

const generates: Record<Element, Element> = {
  metal: 'water',
  water: 'wood',
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
};
const counters: Record<Element, Element> = {
  metal: 'wood',
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
};
export function elementMultiplier(
  attacker: Element,
  defender: Element,
): number {
  if (counters[attacker] === defender) return 1.2;
  if (counters[defender] === attacker) return 0.85;
  return 1;
}

export function damageAmount(
  atk: number,
  def: number,
  mult: number,
  elementMult: number,
): number {
  return Math.max(
    1,
    Math.floor((atk * mult * 100 * elementMult) / (100 + def)),
  );
}

function chooseHazard(rng: SeededRng, elements: string[]): number {
  if (
    elements.length < 2 ||
    elements[elements.length - 1] !== elements[elements.length - 2]
  )
    return rng.int(5);
  const repeated = elements[elements.length - 1];
  const pick = rng.next() * 5;
  let cumulative = 0;
  for (let i = 0; i < 5; i++) {
    cumulative += i === Number(repeated) ? 0.5 : 1.125;
    if (pick < cumulative) return i;
  }
  return 4;
}

export function scheduleHazards(
  seed: number,
  data: GameData,
): HazardSchedule[] {
  const rng = new SeededRng(seed);
  const count = 1 + rng.int(3);
  const times: number[] = [];
  while (times.length < count) {
    const candidate = 600 + rng.int(601);
    if (
      times.every((time) => Math.max(time - candidate, candidate - time) >= 60)
    )
      times.push(candidate);
  }
  times.sort((a, b) => a - b);
  const elements: string[] = [];
  return times.map((startTick) => {
    const index = chooseHazard(rng, elements);
    elements.push(String(index));
    const hazard = data.hazards[index];
    if (!hazard) throw new Error('Missing hazard');
    return {
      id: hazard.id,
      startTick,
      endTick: startTick + 60,
      warnTick: startTick - 100,
    };
  });
}

function validateLineup(lineup: Lineup, side: Side, data: GameData): void {
  if (lineup.main.length !== 3)
    throw new Error(`${side} needs three main units`);
  const ids = [
    ...lineup.main.map((entry) => entry.unitId),
    lineup.reinforcement,
  ];
  if (new Set(ids).size !== 4)
    throw new Error(`${side} lineup must use four different units`);
  for (const id of ids)
    if (!data.units.some((unit) => unit.id === id))
      throw new Error(`Unknown unit: ${id}`);
  for (const { position } of lineup.main) {
    if (
      !hexGrid.contains(position) ||
      !Number.isInteger(position.x) ||
      !Number.isInteger(position.y) ||
      (side === 'A' && position.x > 2) ||
      (side === 'B' && position.x < 4)
    ) {
      throw new Error(`Invalid ${side} deployment`);
    }
  }
  if (
    new Set(lineup.main.map(({ position }) => `${position.x},${position.y}`))
      .size !== 3
  )
    throw new Error(`${side} deployment overlaps`);
}

export function createMatch(config: MatchConfig): MatchState {
  if (config.version !== RULE_VERSION)
    throw new Error(`Unsupported rule version: ${config.version}`);
  const data = config.data ?? defaultGameData;
  validateLineup(config.lineupA, 'A', data);
  validateLineup(config.lineupB, 'B', data);
  const units: UnitState[] = [];
  for (const side of ['A', 'B'] as const) {
    const lineup = side === 'A' ? config.lineupA : config.lineupB;
    lineup.main.forEach((entry, index) => {
      const def = data.units.find((item) => item.id === entry.unitId)!;
      units.push({
        id: `${side}${index}_${def.id}`,
        unitId: def.id,
        side,
        position: { ...entry.position },
        hp: def.stats.hp,
        shield: 0,
        energy: 0,
        nextAttackTick: 0,
        invulnerableUntil: 0,
        effects: [],
        alive: true,
        reinforcement: false,
      });
    });
  }
  units.sort((a, b) => a.id.localeCompare(b.id));
  const state: MatchState = {
    config,
    data,
    tick: 0,
    units,
    hazards: config.mode === 'pvp' ? scheduleHazards(config.seed, data) : [],
    events: [],
    hashes: [],
    score: {
      A: { damageDealt: 0, healDone: 0 },
      B: { damageDealt: 0, healDone: 0 },
    },
    spawned: { A: false, B: false },
  };
  state.events.push({
    tick: 0,
    type: 'Snapshot',
    units: cloneUnits(state.units),
  });
  return state;
}

function cloneUnits(units: UnitState[]): UnitState[] {
  return units.map((unit) => ({
    ...unit,
    position: { ...unit.position },
    effects: unit.effects.map((effect) => ({ ...effect })),
  }));
}

function defOf(state: MatchState, unit: UnitState): UnitDef {
  return state.data.units.find((def) => def.id === unit.unitId)!;
}
function skillOf(
  state: MatchState,
  unit: UnitState,
  kind: 'active' | 'passive',
): SkillDef {
  const def = defOf(state, unit);
  return state.data.skills.find(
    (skill) => skill.id === (kind === 'active' ? def.active : def.passive),
  )!;
}
function distance(a: UnitState, b: UnitState): number {
  return hexGrid.distance(a.position, b.position);
}
function allies(snapshot: UnitState[], unit: UnitState): UnitState[] {
  return snapshot.filter((item) => item.alive && item.side === unit.side);
}
function enemies(snapshot: UnitState[], unit: UnitState): UnitState[] {
  return snapshot.filter((item) => item.alive && item.side !== unit.side);
}
function hpPct(state: MatchState, unit: UnitState): number {
  return unit.hp / defOf(state, unit).stats.hp;
}

function passiveActive(
  state: MatchState,
  snapshot: UnitState[],
  unit: UnitState,
  target?: UnitState,
): boolean {
  const trigger = skillOf(state, unit, 'passive').trigger;
  if (!trigger || trigger.when === 'always') return true;
  if (trigger.when === 'self_hp_below')
    return hpPct(state, unit) < (trigger.value ?? 0);
  if (trigger.when === 'target_hp_below')
    return !!target && hpPct(state, target) < (trigger.value ?? 0);
  if (trigger.when === 'interval')
    return (
      state.tick > 0 && state.tick % Math.round((trigger.value ?? 1) * 10) === 0
    );
  return (
    enemies(snapshot, unit).filter(
      (enemy) => distance(unit, enemy) <= (trigger.radius ?? 0),
    ).length >= (trigger.value ?? 0)
  );
}

function stat(
  state: MatchState,
  snapshot: UnitState[],
  unit: UnitState,
  name: 'atk' | 'def' | 'spd' | 'range' | 'aspd',
): number {
  let value = defOf(state, unit).stats[name];
  const passive = skillOf(state, unit, 'passive');
  if (passiveActive(state, snapshot, unit))
    for (const effect of passive.effects) {
      if (effect.type === 'stat_mod' && effect.stat === name)
        value *= 1 + effect.pct;
    }
  for (const effect of unit.effects)
    if (effect.expiresAt > state.tick && effect.stat === name)
      value *= 1 + effect.amount;
  if (name === 'aspd') {
    const element = defOf(state, unit).element;
    if (
      allies(snapshot, unit).some(
        (ally) =>
          ally.id !== unit.id &&
          hexGrid.distance(ally.position, unit.position) <= 1.5 &&
          generates[defOf(state, ally).element] === element,
      )
    )
      value *= 1.15;
  }
  const activeHazard = state.hazards.find(
    (hazard) =>
      state.tick >= hazard.startTick &&
      state.tick < hazard.endTick &&
      counters[
        state.data.hazards.find((item) => item.id === hazard.id)!.element
      ] === defOf(state, unit).element,
  );
  if (activeHazard) {
    const effect = state.data.hazards.find(
      (item) => item.id === activeHazard.id,
    )!.effect;
    if (effect.type === 'stat_mod' && name === effect.stat)
      value *= 1 + effect.pct;
    if (effect.type === 'range_mod' && name === 'range')
      value = Math.max(effect.min, value + effect.amount);
  }
  return value;
}

function energyMultiplier(
  state: MatchState,
  snapshot: UnitState[],
  unit: UnitState,
): number {
  const element = defOf(state, unit).element;
  const nearby = allies(snapshot, unit).filter(
    (ally) => ally.id !== unit.id && distance(ally, unit) <= 1.5,
  );
  let result = 1;
  if (nearby.some((ally) => generates[defOf(state, ally).element] === element))
    result += 0.15;
  if (nearby.some((ally) => generates[element] === defOf(state, ally).element))
    result -= 0.1;
  for (const hazard of state.hazards)
    if (state.tick >= hazard.startTick && state.tick < hazard.endTick) {
      const def = state.data.hazards.find((item) => item.id === hazard.id)!;
      if (
        counters[def.element] === element &&
        def.effect.type === 'energy_gain_mod'
      )
        result *= 1 + def.effect.pct;
    }
  return result;
}

function chooseTarget(
  state: MatchState,
  snapshot: UnitState[],
  unit: UnitState,
): UnitState | undefined {
  const foe = enemies(snapshot, unit);
  const taunt = unit.effects.find(
    (effect) =>
      effect.type === 'taunt' &&
      effect.expiresAt > state.tick &&
      foe.some(
        (enemy) =>
          enemy.id === effect.sourceId &&
          distance(unit, enemy) <= (effect.radius ?? 0),
      ),
  );
  if (taunt) return foe.find((enemy) => enemy.id === taunt.sourceId);
  const role = defOf(state, unit).role;
  const candidates =
    role === 'archer'
      ? foe.filter(
          (enemy) =>
            distance(unit, enemy) <= stat(state, snapshot, unit, 'range'),
        )
      : foe;
  if (
    role === 'support' &&
    unit.energy >= MAX_ENERGY &&
    skillOf(state, unit, 'active').effects.some(
      (effect) => effect.type === 'heal',
    )
  ) {
    const wounded = allies(snapshot, unit).filter(
      (ally) => hpPct(state, ally) < 1,
    );
    if (wounded.length)
      return wounded.sort(
        (a, b) => hpPct(state, a) - hpPct(state, b) || a.id.localeCompare(b.id),
      )[0];
  }
  return candidates.sort(
    (a, b) =>
      (role === 'archer'
        ? hpPct(state, a) - hpPct(state, b)
        : distance(unit, a) - distance(unit, b)) || a.id.localeCompare(b.id),
  )[0];
}

interface Pending {
  source: UnitState;
  target: UnitState;
  type: 'damage' | 'heal' | 'shield' | 'effect';
  amount: number;
  effect?: TimedEffect;
  basic?: boolean;
  hazard?: boolean;
}
function targetsForArea(
  snapshot: UnitState[],
  source: UnitState,
  target: UnitState,
  area: 'target' | { radius: number; around: 'target' | 'self' },
): UnitState[] {
  if (area === 'target') return [target];
  const center = area.around === 'self' ? source : target;
  return enemies(snapshot, source).filter(
    (enemy) => hexGrid.distance(center.position, enemy.position) <= area.radius,
  );
}

function cast(
  state: MatchState,
  snapshot: UnitState[],
  source: UnitState,
  target: UnitState,
  pending: Pending[],
): void {
  const skill = skillOf(state, source, 'active');
  state.events.push({
    tick: state.tick,
    type: 'Cast',
    sourceId: source.id,
    targetId: target.id,
  });
  for (const effect of skill.effects) {
    if (effect.type === 'damage')
      for (const victim of targetsForArea(
        snapshot,
        source,
        target,
        effect.area,
      )) {
        const bonus = passiveActive(state, snapshot, source, victim)
          ? skillOf(state, source, 'passive').effects.find(
              (item) => item.type === 'damage_bonus',
            )
          : undefined;
        const amount = damageAmount(
          stat(state, snapshot, source, 'atk'),
          stat(state, snapshot, victim, 'def'),
          effect.mult * (bonus?.type === 'damage_bonus' ? 1 + bonus.pct : 1),
          elementMultiplier(
            defOf(state, source).element,
            defOf(state, victim).element,
          ),
        );
        pending.push({ source, target: victim, type: 'damage', amount });
      }
    if (effect.type === 'heal') {
      const chosen =
        effect.target === 'self'
          ? [source]
          : effect.target === 'all_allies'
            ? allies(snapshot, source)
            : allies(snapshot, source)
                .filter((ally) => hpPct(state, ally) < 1)
                .sort(
                  (a, b) =>
                    hpPct(state, a) - hpPct(state, b) ||
                    a.id.localeCompare(b.id),
                )
                .slice(0, 1);
      for (const ally of chosen)
        pending.push({
          source,
          target: ally,
          type: 'heal',
          amount: Math.floor(defOf(state, ally).stats.hp * effect.pct),
        });
    }
    if (effect.type === 'shield')
      pending.push({
        source,
        target: source,
        type: 'shield',
        amount: Math.floor(defOf(state, source).stats.hp * effect.pct),
        effect: {
          type: 'shield',
          sourceId: source.id,
          amount: 0,
          expiresAt: state.tick + Math.round(effect.duration * 10),
        },
      });
    if (effect.type === 'taunt')
      for (const foe of enemies(snapshot, source).filter(
        (enemy) => distance(source, enemy) <= effect.radius,
      ))
        pending.push({
          source,
          target: foe,
          type: 'effect',
          amount: 0,
          effect: {
            type: 'taunt',
            sourceId: source.id,
            amount: 0,
            radius: effect.radius,
            expiresAt: state.tick + Math.round(effect.duration * 10),
          },
        });
    if (effect.type === 'slow')
      for (const foe of targetsForArea(snapshot, source, target, effect.area))
        pending.push({
          source,
          target: foe,
          type: 'effect',
          amount: 0,
          effect: {
            type: 'slow',
            sourceId: source.id,
            amount: -effect.pct,
            stat: 'spd',
            expiresAt: state.tick + Math.round(effect.duration * 10),
          },
        });
    if (effect.type === 'stat_mod')
      pending.push({
        source,
        target: source,
        type: 'effect',
        amount: 0,
        effect: {
          type: 'stat_mod',
          sourceId: source.id,
          amount: effect.pct,
          stat: effect.stat,
          expiresAt: state.tick + Math.round((effect.duration ?? 0.1) * 10),
        },
      });
  }
}

function basicAttack(
  state: MatchState,
  snapshot: UnitState[],
  source: UnitState,
  target: UnitState,
  pending: Pending[],
): void {
  const bonus = passiveActive(state, snapshot, source, target)
    ? skillOf(state, source, 'passive').effects.find(
        (item) => item.type === 'damage_bonus',
      )
    : undefined;
  const amount = damageAmount(
    stat(state, snapshot, source, 'atk'),
    stat(state, snapshot, target, 'def'),
    bonus?.type === 'damage_bonus' ? 1 + bonus.pct : 1,
    elementMultiplier(
      defOf(state, source).element,
      defOf(state, target).element,
    ),
  );
  const reduction = skillOf(state, target, 'passive').effects.find(
    (item) => item.type === 'basic_damage_reduction',
  );
  pending.push({
    source,
    target,
    type: 'damage',
    amount: Math.max(
      1,
      Math.floor(
        amount *
          (reduction?.type === 'basic_damage_reduction'
            ? 1 - reduction.pct
            : 1),
      ),
    ),
    basic: true,
  });
  state.events.push({
    tick: state.tick,
    type: 'Attack',
    sourceId: source.id,
    targetId: target.id,
  });
}

function applyPending(
  state: MatchState,
  snapshot: UnitState[],
  pending: Pending[],
): void {
  const damage = new Map<string, number>();
  const healing = new Map<string, number>();
  const shield = new Map<string, number>();
  for (const action of pending) {
    if (action.type === 'damage') {
      if (state.tick <= action.target.invulnerableUntil) continue;
      damage.set(
        action.target.id,
        (damage.get(action.target.id) ?? 0) + action.amount,
      );
      if (action.basic) {
        const liveSource = state.units.find(
          (unit) => unit.id === action.source.id,
        )!;
        liveSource.energy = Math.min(
          MAX_ENERGY,
          liveSource.energy +
            12 * energyMultiplier(state, snapshot, action.source),
        );
      }
      state.events.push({
        tick: state.tick,
        type: 'Damage',
        sourceId: action.source.id,
        targetId: action.target.id,
        amount: action.amount,
      });
    } else if (action.type === 'heal') {
      healing.set(
        action.target.id,
        (healing.get(action.target.id) ?? 0) + action.amount,
      );
    } else if (action.type === 'shield') {
      shield.set(
        action.target.id,
        (shield.get(action.target.id) ?? 0) + action.amount,
      );
      if (action.effect)
        state.units
          .find((unit) => unit.id === action.target.id)!
          .effects.push(action.effect);
      state.events.push({
        tick: state.tick,
        type: 'ShieldGain',
        sourceId: action.source.id,
        targetId: action.target.id,
        amount: action.amount,
      });
    } else if (action.effect)
      state.units
        .find((unit) => unit.id === action.target.id)!
        .effects.push(action.effect);
  }
  for (const unit of state.units) {
    if (!unit.alive) continue;
    const before = snapshot.find((item) => item.id === unit.id)!;
    const incoming = damage.get(unit.id) ?? 0;
    const absorbed = Math.min(before.shield, incoming);
    const actualDamage = Math.min(before.hp, incoming - absorbed);
    unit.shield =
      Math.max(0, before.shield - incoming) + (shield.get(unit.id) ?? 0);
    unit.hp = Math.min(
      defOf(state, unit).stats.hp,
      Math.max(0, before.hp - actualDamage) + (healing.get(unit.id) ?? 0),
    );
    if (actualDamage > 0) {
      const sources = pending.filter(
        (action) =>
          action.type === 'damage' &&
          !action.hazard &&
          action.target.id === unit.id,
      );
      const total = sources.reduce((sum, action) => sum + action.amount, 0);
      const totalIncoming = pending
        .filter(
          (action) => action.type === 'damage' && action.target.id === unit.id,
        )
        .reduce((sum, action) => sum + action.amount, 0);
      for (const source of sources)
        state.score[source.source.side].damageDealt +=
          (actualDamage * source.amount) / totalIncoming;
      if (total > 0)
        unit.energy = Math.min(
          MAX_ENERGY,
          unit.energy + 6 * energyMultiplier(state, snapshot, before),
        );
    }
    const actualHeal = Math.min(
      defOf(state, unit).stats.hp - Math.max(0, before.hp - actualDamage),
      healing.get(unit.id) ?? 0,
    );
    if (actualHeal > 0) {
      const sources = pending.filter(
        (action) => action.type === 'heal' && action.target.id === unit.id,
      );
      const total = sources.reduce((sum, action) => sum + action.amount, 0);
      for (const source of sources)
        state.score[source.source.side].healDone +=
          (actualHeal * source.amount) / total;
      state.events.push({
        tick: state.tick,
        type: 'Heal',
        targetId: unit.id,
        amount: actualHeal,
      });
    }
    if (unit.hp <= 0) {
      unit.alive = false;
      state.events.push({ tick: state.tick, type: 'Death', targetId: unit.id });
    }
  }
}

function spawnReinforcements(state: MatchState): void {
  for (const side of ['A', 'B'] as const) {
    if (state.spawned[side]) continue;
    const dead = state.units.find(
      (unit) => unit.side === side && !unit.reinforcement && !unit.alive,
    );
    if (!dead) continue;
    const unitId = (side === 'A' ? state.config.lineupA : state.config.lineupB)
      .reinforcement;
    const def = state.data.units.find((item) => item.id === unitId)!;
    const position = {
      x: side === 'A' ? 0 : 6,
      y: Math.round(dead.position.y),
    };
    const unit: UnitState = {
      id: `${side}R_${unitId}`,
      unitId,
      side,
      position,
      hp: def.stats.hp,
      shield: 0,
      energy: 0,
      nextAttackTick: state.tick + 1,
      invulnerableUntil: state.tick + 15,
      effects: [],
      alive: true,
      reinforcement: true,
    };
    state.units.push(unit);
    state.units.sort((a, b) => a.id.localeCompare(b.id));
    state.spawned[side] = true;
    state.events.push({
      tick: state.tick,
      type: 'ReinforcementSpawn',
      sourceId: unit.id,
      position,
    });
  }
}

function resolveEnd(state: MatchState): void {
  const aliveA = state.units.some((unit) => unit.alive && unit.side === 'A');
  const aliveB = state.units.some((unit) => unit.alive && unit.side === 'B');
  if (!aliveA || !aliveB) {
    state.winner = !aliveA && !aliveB ? 'draw' : aliveA ? 'A' : 'B';
    state.reason = 'elimination';
  } else if (state.tick >= 1800) {
    const a = state.score.A.damageDealt + state.score.A.healDone * 0.5;
    const b = state.score.B.damageDealt + state.score.B.healDone * 0.5;
    const totalHp = [
      ...state.config.lineupA.main.map((item) => item.unitId),
      state.config.lineupA.reinforcement,
      ...state.config.lineupB.main.map((item) => item.unitId),
      state.config.lineupB.reinforcement,
    ].reduce(
      (sum, id) =>
        sum + state.data.units.find((def) => def.id === id)!.stats.hp,
      0,
    );
    state.winner =
      state.config.mode === 'pve'
        ? 'B'
        : Math.max(a - b, b - a) < totalHp * 0.001
          ? 'draw'
          : a > b
            ? 'A'
            : 'B';
    state.reason = 'timeout';
  }
  if (state.winner)
    state.events.push({
      tick: state.tick,
      type: 'MatchEnd',
      winner: state.winner,
    });
}

export function step(state: MatchState): void {
  if (state.winner) return;
  state.tick += 1;
  const snapshot = cloneUnits(state.units);
  const pending: Pending[] = [];
  for (const hazard of state.hazards) {
    if (state.tick === hazard.warnTick)
      state.events.push({
        tick: state.tick,
        type: 'HazardWarn',
        hazardId: hazard.id,
      });
    if (state.tick === hazard.startTick)
      state.events.push({
        tick: state.tick,
        type: 'HazardStart',
        hazardId: hazard.id,
      });
    if (state.tick === hazard.endTick)
      state.events.push({
        tick: state.tick,
        type: 'HazardEnd',
        hazardId: hazard.id,
      });
    if (state.tick >= hazard.startTick && state.tick < hazard.endTick) {
      const def = state.data.hazards.find((item) => item.id === hazard.id)!;
      if (def.effect.type === 'damage_max_hp_per_second')
        for (const unit of snapshot.filter(
          (item) =>
            item.alive && counters[def.element] === defOf(state, item).element,
        )) {
          pending.push({
            source: unit,
            target: unit,
            type: 'damage',
            hazard: true,
            amount: Math.floor(
              (defOf(state, unit).stats.hp * def.effect.pct) / 10,
            ),
          });
        }
    }
  }
  for (const unit of snapshot.filter((item) => item.alive)) {
    const live = state.units.find((item) => item.id === unit.id)!;
    live.effects = live.effects.filter(
      (effect) => effect.expiresAt > state.tick,
    );
    if (
      live.shield > 0 &&
      !live.effects.some((effect) => effect.type === 'shield')
    )
      live.shield = 0;
    if (passiveActive(state, snapshot, unit)) {
      const passive = skillOf(state, unit, 'passive');
      for (const effect of passive.effects)
        if (effect.type === 'heal') {
          const targets =
            effect.target === 'all_allies' ? allies(snapshot, unit) : [unit];
          for (const ally of targets)
            pending.push({
              source: unit,
              target: ally,
              type: 'heal',
              amount: Math.floor(defOf(state, ally).stats.hp * effect.pct),
            });
        }
    }
    const target = chooseTarget(state, snapshot, unit);
    if (!target) continue;
    const range = stat(state, snapshot, unit, 'range');
    if (distance(unit, target) > range) {
      const newPosition = hexGrid.moveToward(
        unit.position,
        target.position,
        stat(state, snapshot, unit, 'spd') / 10,
      );
      live.position = newPosition;
      state.events.push({
        tick: state.tick,
        type: 'Move',
        sourceId: unit.id,
        position: newPosition,
      });
      continue;
    }
    if (state.tick < unit.nextAttackTick) continue;
    const active = skillOf(state, unit, 'active');
    const canCast =
      unit.energy >= MAX_ENERGY &&
      !(
        active.effects.some((effect) => effect.type === 'heal') &&
        !allies(snapshot, unit).some((ally) => hpPct(state, ally) < 1)
      );
    if (canCast) {
      cast(state, snapshot, unit, target, pending);
      live.energy = 0;
    } else if (target.side !== unit.side)
      basicAttack(state, snapshot, unit, target, pending);
    else continue;
    live.nextAttackTick =
      state.tick +
      Math.max(1, Math.round(10 / stat(state, snapshot, unit, 'aspd')));
  }
  applyPending(state, snapshot, pending);
  spawnReinforcements(state);
  resolveEnd(state);
  state.events.push({
    tick: state.tick,
    type: 'Snapshot',
    units: cloneUnits(state.units),
  });
  if (state.tick % 10 === 0)
    state.hashes.push({ tick: state.tick, hash: stateHash(state) });
}

export function stateHash(state: MatchState): string {
  const content = JSON.stringify({
    tick: state.tick,
    units: state.units,
    score: state.score,
    spawned: state.spawned,
    winner: state.winner,
  });
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++)
    hash = Math.imul(hash ^ content.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function runToEnd(config: MatchConfig): MatchResult {
  const state = createMatch(config);
  while (!state.winner) step(state);
  return {
    winner: state.winner!,
    reason: state.reason!,
    ticks: state.tick,
    score: state.score,
    events: state.events,
    hashes: state.hashes,
    finalHash: stateHash(state),
  };
}
