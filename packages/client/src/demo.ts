import {
  RULE_VERSION,
  runToEnd,
  selectMap,
  defaultGameData,
  type MatchConfig,
} from '@ngu-hanh/sim';

const requestedMap = new URLSearchParams(window.location.search).get('map');
let previewSeed = 42;
if (
  requestedMap === 'flaming_mountain' ||
  requestedMap === 'water_curtain_cave'
) {
  while (selectMap(previewSeed, defaultGameData) !== requestedMap)
    previewSeed++;
}

export const demoConfig: MatchConfig = {
  seed: previewSeed,
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
