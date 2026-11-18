import { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  type Texture,
} from 'pixi.js';
import {
  defaultGameData,
  MAX_ENERGY,
  type Element,
  type HazardSchedule,
  type MatchEvent,
  type UnitState,
} from '@ngu-hanh/sim';
import { renderVfx } from './Vfx';

const colors: Record<Element, number> = {
  metal: 0xaab2c0,
  wood: 0x3f9d5b,
  water: 0x3b7fd8,
  fire: 0xe4572e,
  earth: 0xb98a48,
};

function point(x: number, y: number): { x: number; y: number } {
  return { x: 64 + x * 74 + y * 37, y: 120 + y * 64.5 };
}

function drawGrid(graphics: Graphics, mapId: string | null): void {
  graphics.clear();
  // A single terrain surface sits beneath the tactical hex overlay.
  const fiery = mapId === 'flaming_mountain';
  graphics.rect(0, 0, 700, 500).fill(fiery ? 0x60443a : 0x3c5350);
  graphics
    .rect(0, 0, 700, 72)
    .fill({ color: fiery ? 0x492b30 : 0x244852, alpha: 0.55 });
  graphics
    .rect(0, 428, 700, 72)
    .fill({ color: fiery ? 0x492b30 : 0x244852, alpha: 0.55 });
  if (fiery) {
    graphics
      .moveTo(0, 430)
      .bezierCurveTo(170, 360, 240, 490, 390, 420)
      .bezierCurveTo(530, 345, 605, 440, 700, 380)
      .stroke({ color: 0xdc763f, alpha: 0.43, width: 18 });
  } else {
    graphics
      .moveTo(0, 75)
      .bezierCurveTo(160, 15, 260, 155, 410, 80)
      .bezierCurveTo(550, 12, 620, 98, 700, 48)
      .stroke({ color: 0x70b6ba, alpha: 0.47, width: 26 });
  }
  for (let i = 0; i < 38; i++) {
    const x = (i * 173 + 41) % 700;
    const y = (i * 97 + 23) % 500;
    graphics
      .circle(x, y, 2 + (i % 3))
      .fill({ color: fiery ? 0xefab62 : 0x9be2d8, alpha: 0.17 });
  }
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 7; x++) {
      const center = point(x, y);
      const fill = x < 3 ? 0x6aa9ae : x > 3 ? 0xd08a70 : 0xb4a773;
      graphics
        .poly([
          center.x,
          center.y - 43,
          center.x + 37,
          center.y - 21.5,
          center.x + 37,
          center.y + 21.5,
          center.x,
          center.y + 43,
          center.x - 37,
          center.y + 21.5,
          center.x - 37,
          center.y - 21.5,
        ])
        .fill({ color: fill, alpha: 0.075 })
        .stroke({ color: 0xdde6d2, alpha: 0.38, width: 1 });
    }
  }
}

function drawUnits(
  graphics: Graphics,
  current: UnitState[],
  next: UnitState[],
  alpha: number,
  tick: number,
  spritesReady: boolean,
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
    if (spritesReady) {
      graphics
        .circle(center.x, center.y + 17, 22)
        .stroke({ color: teamColor, alpha: 0.7, width: 2 });
    } else {
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
    }
    const barX = center.x - 27;
    const barY = center.y - 41;
    graphics.roundRect(barX, barY, 54, 6, 3).fill(0x0a1018);
    graphics
      .roundRect(barX, barY, Math.max(0, (54 * unit.hp) / def.stats.hp), 6, 3)
      .fill(0x78d77a);
    graphics.roundRect(barX, barY + 8, 54, 4, 2).fill(0x0a1018);
    graphics
      .roundRect(
        barX,
        barY + 8,
        Math.max(0, (54 * unit.energy) / MAX_ENERGY),
        4,
        2,
      )
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
  events: MatchEvent[];
  hazards: HazardSchedule[];
  mapId: string | null;
}

export function Board({
  current,
  next,
  alpha,
  tick,
  events,
  hazards,
  mapId,
}: BoardProps) {
  const host = useRef<HTMLDivElement>(null);
  const layer = useRef<Graphics | null>(null);
  const vfxLayer = useRef<Graphics | null>(null);
  const spriteLayerRef = useRef<Container | null>(null);
  const textures = useRef(new Map<string, Texture>());
  const sprites = useRef(new Map<string, Sprite>());
  const latest = useRef({ current, next, alpha, tick, events, hazards });
  latest.current = { current, next, alpha, tick, events, hazards };

  const render = () => {
    const frame = latest.current;
    for (const unit of frame.current) {
      if (sprites.current.has(unit.id)) continue;
      const texture = textures.current.get(unit.unitId);
      if (!texture || !spriteLayerRef.current) continue;
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(unit.side === 'B' ? -0.18 : 0.18, 0.18);
      spriteLayerRef.current.addChild(sprite);
      sprites.current.set(unit.id, sprite);
    }
    if (layer.current)
      drawUnits(
        layer.current,
        frame.current,
        frame.next,
        frame.alpha,
        frame.tick,
        sprites.current.size > 0,
      );
    const nextById = new Map(frame.next.map((unit) => [unit.id, unit]));
    for (const [id, sprite] of sprites.current) {
      const unit = frame.current.find((item) => item.id === id);
      if (!unit || !unit.alive) {
        sprite.visible = false;
        continue;
      }
      const following = nextById.get(id);
      const x =
        unit.position.x +
        ((following?.position.x ?? unit.position.x) - unit.position.x) *
          frame.alpha;
      const y =
        unit.position.y +
        ((following?.position.y ?? unit.position.y) - unit.position.y) *
          frame.alpha;
      const center = point(x, y);
      const attack = frame.events.find(
        (event) =>
          (event.type === 'Attack' || event.type === 'Cast') &&
          event.sourceId === id &&
          frame.tick >= event.tick &&
          frame.tick < event.tick + 3,
      );
      let lungeX = 0;
      let lungeY = 0;
      if (attack) {
        const target = frame.current.find(
          (item) => item.id === attack.targetId,
        );
        if (target) {
          const targetPoint = point(target.position.x, target.position.y);
          const dx = targetPoint.x - center.x;
          const dy = targetPoint.y - center.y;
          const length = Math.sqrt(dx * dx + dy * dy) || 1;
          const strength = 8 * (1 - (frame.tick - attack.tick) / 3);
          lungeX = (dx / length) * strength;
          lungeY = (dy / length) * strength;
        }
      }
      const moving =
        following &&
        (following.position.x !== unit.position.x ||
          following.position.y !== unit.position.y);
      sprite.position.set(
        center.x + lungeX,
        center.y + 26 + lungeY - Math.sin(frame.tick * 0.35 + id.length) * 1.5,
      );
      sprite.rotation = moving ? (unit.side === 'A' ? 0.04 : -0.04) : 0;
      sprite.alpha = frame.events.some(
        (event) =>
          event.type === 'Damage' &&
          event.targetId === id &&
          frame.tick >= event.tick &&
          frame.tick < event.tick + 2,
      )
        ? 0.55
        : 1;
      if (following && !following.alive) sprite.alpha *= 1 - frame.alpha;
      if (unit.reinforcement) {
        const age = frame.tick - (unit.invulnerableUntil - 15);
        if (age >= 0 && age < 3) {
          sprite.y -= 18 * (1 - age / 3);
          sprite.alpha *= age / 3;
        }
      }
      sprite.visible = true;
    }
    if (vfxLayer.current)
      renderVfx(
        vfxLayer.current,
        frame.tick,
        frame.current,
        frame.events.filter((event) => event.type === 'Cast'),
        frame.hazards,
        (host.current?.clientWidth ?? 700) < 600 ? 150 : 300,
      );
  };

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
        const spriteLayer = new Container();
        const units = new Graphics();
        const effects = new Graphics();
        app.stage.addChild(grid, spriteLayer, units, effects);
        drawGrid(grid, mapId);
        layer.current = units;
        vfxLayer.current = effects;
        spriteLayerRef.current = spriteLayer;
        render();
        void Promise.allSettled(
          defaultGameData.units.map(async (def) => ({
            id: def.id,
            texture: await Assets.load(`/${def.art.battle}`),
          })),
        ).then((loaded) => {
          if (disposed) return;
          for (const asset of loaded)
            if (asset.status === 'fulfilled')
              textures.current.set(asset.value.id, asset.value.texture);
          render();
        });
      });
    return () => {
      disposed = true;
      layer.current = null;
      vfxLayer.current = null;
      spriteLayerRef.current = null;
      textures.current.clear();
      sprites.current.clear();
      if (app.renderer) app.destroy(true, { children: true });
    };
  }, [mapId]);

  useEffect(() => {
    render();
  }, [current, next, alpha, tick, events, hazards]);

  return (
    <div
      className="board-canvas"
      ref={host}
      aria-label="Bàn hex 7 cột, 5 hàng"
    />
  );
}
