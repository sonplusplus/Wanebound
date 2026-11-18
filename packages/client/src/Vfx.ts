import { Graphics } from 'pixi.js';
import {
  defaultGameData,
  loadVfxData,
  type HazardSchedule,
  type MatchEvent,
  type UnitState,
  type VfxDef,
} from '@ngu-hanh/sim';
import rawVfx from '../../../data/vfx.json';

const vfx = loadVfxData(
  rawVfx,
  defaultGameData.skills,
  defaultGameData.hazards,
);
const byId = new Map(vfx.map((item) => [item.id, item]));
const directions = [
  [1, 0],
  [0.7, 0.7],
  [0, 1],
  [-0.7, 0.7],
  [-1, 0],
  [-0.7, -0.7],
  [0, -1],
  [0.7, -0.7],
] as const;

export function boardPoint(x: number, y: number): { x: number; y: number } {
  return { x: 72 + x * 69 + y * 34, y: 72 + y * 87 };
}

function noise(seed: number): number {
  let value = Math.imul(seed ^ (seed >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return ((value ^ (value >>> 16)) >>> 0) / 0x100000000;
}

function color(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

function particle(
  graphics: Graphics,
  shape: string,
  x: number,
  y: number,
  size: number,
  tint: number,
  alpha: number,
): void {
  if (shape === 'diamond' || shape === 'shard') {
    graphics
      .poly([x, y - size * 1.8, x + size, y, x, y + size * 1.8, x - size, y])
      .fill({ color: tint, alpha });
  } else if (shape === 'leaf') {
    graphics.ellipse(x, y, size * 1.4, size * 0.6).fill({ color: tint, alpha });
  } else if (shape === 'drop') {
    graphics.circle(x, y, size).fill({ color: tint, alpha });
    graphics
      .poly([x - size, y, x, y - size * 2, x + size, y])
      .fill({ color: tint, alpha });
  } else {
    graphics
      .poly([
        x - size,
        y + size,
        x - size * 0.4,
        y - size,
        x,
        y - size * 2,
        x + size,
        y + size,
      ])
      .fill({ color: tint, alpha });
  }
}

function burst(
  graphics: Graphics,
  definition: VfxDef,
  center: { x: number; y: number },
  ageSeconds: number,
  budget: { remaining: number },
  seed: number,
): void {
  for (const layer of definition.layers) {
    if (ageSeconds < 0 || ageSeconds > layer.life) continue;
    for (
      let i = 0;
      i < layer.count && budget.remaining > 0;
      i++, budget.remaining--
    ) {
      const direction = directions[(i + seed) % directions.length]!;
      const speed =
        layer.speed[0] +
        (layer.speed[1] - layer.speed[0]) * noise(seed * 31 + i);
      const travel = speed * ageSeconds;
      const spread = noise(seed * 73 + i) * 18;
      const x =
        center.x +
        direction[0] * travel +
        (noise(seed * 11 + i) - 0.5) * spread;
      const y =
        center.y +
        direction[1] * travel +
        (noise(seed * 17 + i) - 0.5) * spread;
      const alpha = Math.max(0, 0.9 * (1 - ageSeconds / layer.life));
      particle(
        graphics,
        layer.shape,
        x,
        y,
        2.5 + noise(seed + i) * 2.5,
        color(layer.color),
        alpha,
      );
    }
  }
}

export function renderVfx(
  graphics: Graphics,
  tick: number,
  units: UnitState[],
  castEvents: MatchEvent[],
  hazards: HazardSchedule[],
  budgetLimit: number,
): void {
  graphics.clear();
  const budget = { remaining: budgetLimit };
  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  for (const [index, hazard] of hazards.entries()) {
    const hazardDef = defaultGameData.hazards.find(
      (item) => item.id === hazard.id,
    )!;
    const definition = byId.get(hazardDef.vfx ?? '');
    if (!definition) continue;
    if (tick >= hazard.endTick) {
      const tint = color(hazardDef.activeOverlay ?? definition.telegraph.color);
      for (let i = 0; i < 7; i++) {
        const x = 70 + i * 84;
        const y = 424 - (i % 2) * 12;
        graphics
          .moveTo(x, y)
          .lineTo(x + 28, y - 8)
          .lineTo(x + 42, y + 2)
          .stroke({ color: tint, alpha: 0.2, width: 2 });
      }
    }
    if (tick >= hazard.startTick && tick < hazard.endTick) {
      const tint = color(hazardDef.activeOverlay ?? definition.telegraph.color);
      graphics.rect(0, 0, 700, 500).fill({ color: tint, alpha: 0.07 });
      const layer = definition.layers[0]!;
      for (
        let i = 0;
        i < layer.count && budget.remaining > 0;
        i++, budget.remaining--
      ) {
        const time = (tick - hazard.startTick) / 10;
        const x = 25 + noise(index * 1000 + i * 7) * 650;
        const y =
          30 +
          ((noise(index * 2000 + i * 13) * 440 + time * layer.speed[0] * 0.25) %
            440);
        particle(
          graphics,
          layer.shape,
          x,
          y,
          4 + noise(i * 19 + index) * 4,
          tint,
          0.38,
        );
      }
    }
  }

  for (const event of castEvents) {
    const source = unitById.get(event.sourceId ?? '');
    const target = unitById.get(event.targetId ?? '');
    if (!source) continue;
    const skill = defaultGameData.skills.find(
      (item) =>
        item.id ===
        defaultGameData.units.find((unit) => unit.id === source.unitId)?.active,
    );
    const definition = byId.get(skill?.vfx ?? '');
    if (!definition) continue;
    const center = boardPoint(
      (target ?? source).position.x,
      (target ?? source).position.y,
    );
    const before = event.tick - tick;
    if (before > 0 && before <= definition.telegraph.duration * 10) {
      graphics
        .circle(
          center.x,
          center.y,
          26 + (definition.telegraph.duration * 10 - before) * 2,
        )
        .stroke({
          color: color(definition.telegraph.color),
          alpha:
            0.3 + (1 - before / (definition.telegraph.duration * 10)) * 0.5,
          width: 2,
        });
    } else if (before <= 0 && before >= -5) {
      burst(
        graphics,
        definition,
        center,
        -before / 10,
        budget,
        event.tick + event.sourceId!.length,
      );
    }
  }

  for (const unit of units) {
    if (
      !unit.alive ||
      !unit.effects.some(
        (effect) => effect.expiresAt > tick && effect.type !== 'shield',
      )
    )
      continue;
    const element = defaultGameData.units.find(
      (item) => item.id === unit.unitId,
    )!.element;
    const tint = color(
      vfx.find((item) => item.element === element)!.telegraph.color,
    );
    const center = boardPoint(unit.position.x, unit.position.y);
    graphics
      .circle(center.x, center.y, 34)
      .stroke({ color: tint, alpha: 0.4, width: 2 });
  }
}
