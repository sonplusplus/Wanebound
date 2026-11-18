import { describe, expect, it } from 'vitest';
import units from '../../../data/units.json';
import skills from '../../../data/skills.json';
import hazards from '../../../data/hazards.json';
import maps from '../../../data/maps.json';
import { loadGameData } from '../src/data.js';

describe('game data', () => {
  it('loads the vertical slice and links its skills', () => {
    const data = loadGameData({ units, skills, hazards, maps });
    expect(data.units).toHaveLength(5);
    expect(data.skills).toHaveLength(10);
    expect(data.hazards).toHaveLength(6);
    expect(data.maps).toHaveLength(2);
  });

  it('rejects broken references and duplicate ids', () => {
    expect(() =>
      loadGameData({
        units: [{ ...units[0], active: 'missing' }],
        skills,
        hazards,
        maps,
      }),
    ).toThrow('Invalid active');
    expect(() =>
      loadGameData({ units: [units[0], units[0]], skills, hazards, maps }),
    ).toThrow('Duplicate unit id');
  });
});
