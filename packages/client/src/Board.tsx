import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';
import { defaultGameData, type Element, type UnitState } from '@ngu-hanh/sim';

const colors: Record<Element, number> = {
  metal: 0xaab2c0,
  wood: 0x3f9d5b,
  water: 0x3b7fd8,
  fire: 0xe4572e,
  earth: 0xb98a48,
};

function point(x: number, y: number): { x: number; y: number } {
  return { x: 72 + x * 69 + y * 34, y: 72 + y * 87 };
}

function drawGrid(graphics: Graphics): void {
  graphics.clear();
  graphics.rect(0, 0, 700, 500).fill(0x111b24);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 7; x++) {
      const center = point(x, y);
      const fill = x < 3 ? 0x1e3540 : x > 3 ? 0x382a36 : 0x29353b;
      graphics
        .poly([
          center.x,
          center.y - 43,
          center.x + 36,
          center.y - 21,
          center.x + 36,
          center.y + 21,
          center.x,
          center.y + 43,
          center.x - 36,
          center.y + 21,
          center.x - 36,
          center.y - 21,
        ])
        .fill({ color: fill, alpha: 0.92 })
        .stroke({ color: 0x60717a, alpha: 0.42, width: 1 });
    }
  }
}

function drawUnits(
  graphics: Graphics,
  current: UnitState[],
  next: UnitState[],
  alpha: number,
  tick: number,
): void {
  graphics.clear();
  const nextById = new Map(next.map((unit) => [unit.id, unit]));
  for (const unit of current) {
    if (!unit.alive) continue;
    const following = nextById.get(unit.id);
    const x =
      unit.position.x +
      ((following?.position.x ?? unit.position.x) - unit.position.x) * alpha;
    const y =
      unit.position.y +
      ((following?.position.y ?? unit.position.y) - unit.position.y) * alpha;
    const center = point(x, y);
    const def = defaultGameData.units.find((item) => item.id === unit.unitId)!;
    const color = colors[def.element];
    const teamColor = unit.side === 'A' ? 0x8bd3e8 : 0xffa0a0;
    graphics
      .circle(center.x, center.y + 3, 28)
      .fill({ color: 0x000000, alpha: 0.28 });
    graphics
      .circle(center.x, center.y, 24)
      .fill(color)
      .stroke({ color: teamColor, width: 4 });
    graphics
      .circle(center.x - 7, center.y - 7, 6)
      .fill({ color: 0xffffff, alpha: 0.3 });
    const barX = center.x - 27;
    const barY = center.y - 41;
    graphics.roundRect(barX, barY, 54, 6, 3).fill(0x0a1018);
    graphics
      .roundRect(barX, barY, Math.max(0, (54 * unit.hp) / def.stats.hp), 6, 3)
      .fill(0x78d77a);
    graphics.roundRect(barX, barY + 8, 54, 4, 2).fill(0x0a1018);
    graphics
      .roundRect(barX, barY + 8, Math.max(0, (54 * unit.energy) / 100), 4, 2)
      .fill(0x69a7ee);
    if (unit.shield > 0) {
      graphics
        .circle(center.x, center.y, 29)
        .stroke({ color: 0x91dafa, width: 3, alpha: 0.85 });
    }
    if (unit.reinforcement && tick <= unit.invulnerableUntil) {
      graphics
        .circle(center.x, center.y, 32)
        .stroke({ color: 0xf2db8e, width: 1.5, alpha: 0.65 });
    }
  }
}

interface BoardProps {
  current: UnitState[];
  next: UnitState[];
  alpha: number;
  tick: number;
}

export function Board({ current, next, alpha, tick }: BoardProps) {
  const host = useRef<HTMLDivElement>(null);
  const layer = useRef<Graphics | null>(null);
  const latest = useRef({ current, next, alpha, tick });
  latest.current = { current, next, alpha, tick };

  useEffect(() => {
    const app = new Application();
    let disposed = false;
    void app
      .init({ width: 700, height: 500, antialias: true, backgroundAlpha: 0 })
      .then(() => {
        if (disposed) {
          app.destroy(true, { children: true });
          return;
        }
        host.current?.appendChild(app.canvas);
        const grid = new Graphics();
        const units = new Graphics();
        app.stage.addChild(grid, units);
        drawGrid(grid);
        layer.current = units;
        drawUnits(
          units,
          latest.current.current,
          latest.current.next,
          latest.current.alpha,
          latest.current.tick,
        );
      });
    return () => {
      disposed = true;
      layer.current = null;
      if (app.renderer) app.destroy(true, { children: true });
    };
  }, []);

  useEffect(() => {
    if (layer.current) drawUnits(layer.current, current, next, alpha, tick);
  }, [current, next, alpha, tick]);

  return (
    <div
      className="board-canvas"
      ref={host}
      aria-label="Bàn hex 7 cột, 5 hàng"
    />
  );
}
