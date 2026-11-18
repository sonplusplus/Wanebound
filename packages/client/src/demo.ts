import { RULE_VERSION, runToEnd, type MatchConfig } from '@ngu-hanh/sim';

export const demoConfig: MatchConfig = {
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

export const demoResult = runToEnd(demoConfig);
export const frames = demoResult.events.filter(
  (event) => event.type === 'Snapshot' && event.units,
);
