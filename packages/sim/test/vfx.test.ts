import { expect, it } from 'vitest';
import rawVfx from '../../../data/vfx.json';
import { defaultGameData } from '../src/default-data.js';
import { loadVfxData } from '../src/data.js';

it('validates all active and hazard VFX references', () => {
  const vfx = loadVfxData(
    rawVfx,
    defaultGameData.skills,
    defaultGameData.hazards,
  );
  expect(vfx).toHaveLength(10);
  expect(
    vfx.every(
      (item) => item.layers.reduce((sum, layer) => sum + layer.count, 0) <= 300,
    ),
  ).toBe(true);
});
