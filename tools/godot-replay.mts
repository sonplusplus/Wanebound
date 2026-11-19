import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RULE_VERSION,
  defaultGameData,
  runToEnd,
  scheduleHazards,
  type MatchConfig,
} from '../packages/sim/src/index.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const target = join(root, 'godot', 'replay', 'fixed_match.json');

const config: MatchConfig = {
  seed: 42,
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

const result = runToEnd(config);
const unitByInstance = new Map(
  result.events
    .filter((event) => event.type === 'Snapshot' && event.units)
    .flatMap((event) =>
      event.units!.map((unit) => [unit.id, unit.unitId] as const),
    ),
);
const skillByUnit = new Map(
  defaultGameData.units.map((unit) => [unit.id, unit.active]),
);
const payload = {
  schema: 1,
  version: config.version,
  seed: config.seed,
  mapId: result.mapId,
  winner: result.winner,
  reason: result.reason,
  ticks: result.ticks,
  finalHash: result.finalHash,
  hashes: result.hashes,
  hazards: scheduleHazards(config.seed, defaultGameData),
  units: defaultGameData.units.map((unit) => ({
    id: unit.id,
    name: unit.name,
    element: unit.element,
    maxHp: unit.stats.hp,
  })),
  events: result.events
    .filter((event) =>
      ['Attack', 'Cast', 'Damage', 'Death', 'ReinforcementSpawn'].includes(
        event.type,
      ),
    )
    .map((event) => ({
      tick: event.tick,
      type: event.type,
      sourceId: event.sourceId ?? '',
      targetId: event.targetId ?? '',
      amount: event.amount ?? 0,
      skillId:
        event.type === 'Cast'
          ? (skillByUnit.get(unitByInstance.get(event.sourceId ?? '') ?? '') ??
            '')
          : '',
    })),
  frames: result.events
    .filter((event) => event.type === 'Snapshot' && event.units)
    .map((event) => ({
      tick: event.tick,
      units: event.units!.map((unit) => ({
        id: unit.id,
        unitId: unit.unitId,
        side: unit.side,
        x: unit.position.x,
        y: unit.position.y,
        hp: unit.hp,
        shield: unit.shield,
        energy: unit.energy,
        alive: unit.alive,
        reinforcement: unit.reinforcement,
        invulnerableUntil: unit.invulnerableUntil,
      })),
    })),
};
const serialized = `${JSON.stringify(payload)}\n`;

if (process.argv.includes('--check')) {
  const existing = await readFile(target, 'utf8');
  if (existing !== serialized) {
    throw new Error(
      'Godot replay differs from packages/sim. Run pnpm godot:replay.',
    );
  }
  console.log(`Replay verified: ${result.finalHash}, ${result.ticks} ticks`);
} else {
  await mkdir(join(root, 'godot', 'replay'), { recursive: true });
  await writeFile(target, serialized);
  for (const unit of defaultGameData.units) {
    const destination = join(root, 'godot', 'assets', 'units', unit.id);
    await mkdir(destination, { recursive: true });
    await copyFile(
      join(
        root,
        'packages',
        'client',
        'public',
        'units',
        unit.id,
        'battle.webp',
      ),
      join(destination, 'battle.webp'),
    );
  }
  for (const map of defaultGameData.maps) {
    const destination = join(root, 'godot', 'assets', 'maps');
    await mkdir(destination, { recursive: true });
    await copyFile(
      join(root, 'packages', 'client', 'public', 'maps', `${map.id}.png`),
      join(destination, `${map.id}.png`),
    );
  }
  console.log(`Wrote Godot replay: ${result.finalHash}, ${result.ticks} ticks`);
}
