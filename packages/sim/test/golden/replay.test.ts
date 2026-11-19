import { expect, it } from 'vitest';
import { RULE_VERSION, runToEnd } from '../../src/match.js';

it('keeps the golden replay stable for rule version 0.4.6', () => {
  const result = runToEnd({
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
  });
  expect({
    winner: result.winner,
    reason: result.reason,
    ticks: result.ticks,
    finalHash: result.finalHash,
  }).toMatchInlineSnapshot(`
    {
      "finalHash": "46653a91",
      "reason": "timeout",
      "ticks": 1800,
      "winner": "A",
    }
  `);
});
