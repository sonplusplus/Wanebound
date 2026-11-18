import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defaultGameData } from '../packages/sim/src/default-data.js';
import {
  RULE_VERSION,
  runToEnd,
  type Lineup,
} from '../packages/sim/src/match.js';
import { SeededRng } from '../packages/sim/src/rng.js';

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const nIndex = args.indexOf('--n');
const count = nIndex >= 0 ? Number(args[nIndex + 1]) : 300;
if (!Number.isSafeInteger(count) || count <= 0)
  throw new Error('--n must be a positive integer');
const outIndex = args.indexOf('--out');
const csvPath = resolve(
  outIndex >= 0 ? (args[outIndex + 1] ?? '') : 'reports/sim-bot.csv',
);

const rng = new SeededRng(20261118);
const ids = defaultGameData.units.map((unit) => unit.id);
const placements = {
  A: [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 2, y: 4 },
  ],
  B: [
    { x: 6, y: 0 },
    { x: 5, y: 2 },
    { x: 4, y: 4 },
  ],
};
function lineup(side: 'A' | 'B'): Lineup {
  const pool = [...ids];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return {
    main: pool
      .slice(0, 3)
      .map((unitId, index) => ({ unitId, position: placements[side][index]! })),
    reinforcement: pool[3]!,
  };
}

type Row = { group: string; id: string; matches: number; wins: number };
const rows = new Map<string, Row>();
function record(group: string, id: string, won: boolean): void {
  const key = `${group}:${id}`;
  const row = rows.get(key) ?? { group, id, matches: 0, wins: 0 };
  row.matches++;
  if (won) row.wins++;
  rows.set(key, row);
}
let totalTicks = 0;
let timeouts = 0;
let draws = 0;
for (let i = 0; i < count; i++) {
  const lineupA = lineup('A');
  const lineupB = lineup('B');
  const result = runToEnd({
    seed: rng.int(0x100000000),
    lineupA,
    lineupB,
    mode: 'pvp',
    version: RULE_VERSION,
  });
  totalTicks += result.ticks;
  if (result.reason === 'timeout') timeouts++;
  if (result.winner === 'draw') draws++;
  for (const [side, picked] of [
    ['A', lineupA],
    ['B', lineupB],
  ] as const) {
    const won = result.winner === side;
    for (const id of [
      ...picked.main.map((entry) => entry.unitId),
      picked.reinforcement,
    ]) {
      const unit = defaultGameData.units.find((item) => item.id === id)!;
      record('unit', id, won);
      record('element', unit.element, won);
      record('role', unit.role, won);
    }
  }
}
const sorted = [...rows.values()].sort(
  (a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id),
);
console.log(
  `Matches: ${count}; average: ${(totalTicks / count / 10).toFixed(1)}s; timeouts: ${((timeouts / count) * 100).toFixed(1)}%; draws: ${((draws / count) * 100).toFixed(1)}%`,
);
console.table(
  sorted.map((row) => ({
    group: row.group,
    id: row.id,
    matches: row.matches,
    winRate: `${((row.wins / row.matches) * 100).toFixed(1)}%`,
  })),
);
mkdirSync(dirname(csvPath), { recursive: true });
writeFileSync(
  csvPath,
  [
    'group,id,matches,wins,win_rate',
    ...sorted.map(
      (row) =>
        `${row.group},${row.id},${row.matches},${row.wins},${(row.wins / row.matches).toFixed(4)}`,
    ),
  ].join('\n') + '\n',
);
console.log(`CSV: ${csvPath}`);
