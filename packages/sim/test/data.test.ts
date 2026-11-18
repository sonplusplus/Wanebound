import { describe, expect, it } from 'vitest';
import units from '../../../data/units.json';
import skills from '../../../data/skills.json';
import hazards from '../../../data/hazards.json';
import { loadGameData } from '../src/data.js';

describe('game data', () => {
  it('loads the vertical slice and links its skills', () => {
    const data = loadGameData({ units, skills, hazards });
    expect(data.units).toHaveLength(5);
    expect(data.skills).toHaveLength(10);
    expect(data.hazards).toHaveLength(5);
  });

  it('rejects broken references and duplicate ids', () => {
    expect(() =>
      loadGameData({
        units: [{ ...units[0], active: 'missing' }],
        skills,
        hazards,
      }),
    ).toThrow('Invalid active');
    expect(() =>
      loadGameData({ units: [units[0], units[0]], skills, hazards }),
    ).toThrow('Duplicate unit id');
  });
});
