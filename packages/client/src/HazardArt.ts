import { Graphics } from 'pixi.js';
import {
  defaultGameData,
  type HazardSchedule,
  type UnitState,
} from '@ngu-hanh/sim';
import { boardPoint } from './Vfx';

const counters = {
  metal: 'wood',
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
};

function snow(g: Graphics, x: number, y: number, size: number, alpha: number) {
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    const dx = Math.cos(a) * size;
    const dy = Math.sin(a) * size;
    g.moveTo(x - dx, y - dy)
      .lineTo(x + dx, y + dy)
      .stroke({ color: 0xd9f8ff, width: 1.5, alpha });
  }
}

export function renderHazardArt(
  floor: Graphics,
  front: Graphics,
  tick: number,
  hazards: HazardSchedule[],
  units: UnitState[],
) {
  floor.clear();
  front.clear();
  for (const schedule of hazards) {
    const def = defaultGameData.hazards.find((h) => h.id === schedule.id)!;
    const tint = Number.parseInt((def.activeOverlay ?? '#ffffff').slice(1), 16);
    if (tick >= schedule.warnTick && tick < schedule.startTick) {
      floor
        .rect(0, 0, 700, 500)
        .fill({ color: tint, alpha: 0.035 + 0.035 * (1 + Math.sin(tick)) });
    }
    if (tick < schedule.startTick || tick >= schedule.endTick) continue;
    const t = (tick - schedule.startTick) / 10;
    if (def.id === 'ice_field') {
      floor.rect(0, 0, 700, 500).fill({ color: 0xa8dded, alpha: 0.48 });
      for (let i = 0; i < 24; i++) {
        const x = (i * 137 + 21) % 700,
          y = (i * 83 + 43) % 500;
        floor
          .moveTo(x - 28, y - 18)
          .lineTo(x, y)
          .lineTo(x + 32, y - 12)
          .stroke({ color: 0xecffff, alpha: 0.55, width: 1 });
        floor
          .moveTo(x, y)
          .lineTo(x + 9, y + 29)
          .stroke({ color: 0xecffff, alpha: 0.4, width: 1 });
      }
      for (let i = 0; i < 25; i++)
        snow(front, (i * 113 + t * 8) % 700, (i * 71 + t * 22) % 500, 2, 0.5);
    } else if (def.id === 'sandstorm') {
      floor.rect(0, 0, 700, 500).fill({ color: 0xd0a56a, alpha: 0.2 });
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 150 + Math.sin(t + i) * 22;
        const y = i % 2 ? 440 : 110;
        for (let j = 0; j < 12; j++) {
          const w = 5 + j * 2.5;
          const dx = Math.sin(t * 5 + j * 0.65) * w * 0.4;
          front
            .ellipse(x + dx, y - j * 6, w, 3 + j * 0.35)
            .stroke({
              color: j % 2 ? 0xe8c68c : 0x9d733e,
              width: 3,
              alpha: 0.38,
            });
        }
      }
    } else if (def.id === 'flood') {
      floor.rect(0, 0, 700, 500).fill({ color: 0x318bb2, alpha: 0.3 });
      for (let j = 0; j < 9; j++) {
        const y = (j * 65 + t * 35) % 520;
        floor
          .moveTo(0, y)
          .bezierCurveTo(180, y - 28, 400, y + 28, 700, y)
          .stroke({ color: 0xc3f5ff, width: 3, alpha: 0.35 });
      }
    } else if (def.id === 'vines') {
      for (let i = 0; i < 10; i++) {
        const x = i * 78;
        floor
          .moveTo(x, 500)
          .bezierCurveTo(x - 65, 370, x + 65, 260, x, 110)
          .stroke({ color: 0x417b4c, width: 6, alpha: 0.65 });
        for (let j = 0; j < 5; j++)
          floor
            .ellipse(x + Math.sin(j * 2) * 24, 450 - j * 65, 13, 5)
            .fill({ color: 0x87b968, alpha: 0.6 });
      }
    } else if (def.id === 'wildfire') {
      for (let i = 0; i < 14; i++) {
        const x = (i * 137 + 40) % 700,
          y = (i * 97 + 100) % 500;
        floor.ellipse(x, y, 25, 10).fill({ color: 0xf56826, alpha: 0.3 });
        const h = 18 + Math.sin(t * 8 + i) * 7;
        front
          .poly([x - 12, y, x - 5, y - h, x, y - h * 1.7, x + 12, y])
          .fill({ color: 0xffa340, alpha: 0.7 });
      }
    } else if (def.id === 'sword_rain') {
      for (let i = 0; i < 24; i++) {
        const y = ((i * 71 + t * 230) % 560) - 30,
          x = (i * 113 - t * 90 + 1400) % 750;
        front
          .moveTo(x + 12, y - 32)
          .lineTo(x, y)
          .stroke({ color: 0xf0e8bd, alpha: 0.7, width: 3 });
        front
          .moveTo(x - 5, y - 14)
          .lineTo(x + 12, y - 8)
          .stroke({ color: 0xaaaeb9, alpha: 0.8, width: 2 });
      }
    }
    for (const unit of units) {
      if (!unit.alive) continue;
      const element = defaultGameData.units.find(
        (u) => u.id === unit.unitId,
      )!.element;
      if (def.target !== 'all' && counters[def.element] !== element) continue;
      const p = boardPoint(unit.position.x, unit.position.y);
      floor
        .ellipse(p.x, p.y + 20, 23, 10)
        .stroke({ color: tint, alpha: 0.9, width: 2 });
      const y = p.y - 65;
      front
        .roundRect(p.x - 10, y - 10, 20, 20, 5)
        .fill({ color: 0x132435, alpha: 0.9 });
      if (def.id === 'ice_field') snow(front, p.x, y, 7, 1);
      else if (def.id === 'sandstorm') {
        for (let j = 0; j < 3; j++)
          front
            .ellipse(p.x, y - 5 + j * 4, 7 - j * 2, 2)
            .stroke({ color: tint, width: 1.5 });
      } else {
        front.circle(p.x, y - 2, 4).fill(tint);
        front
          .moveTo(p.x - 4, y + 4)
          .lineTo(p.x, y + 7)
          .lineTo(p.x + 4, y + 4)
          .stroke({ color: tint, width: 1.5 });
      }
    }
  }
}
