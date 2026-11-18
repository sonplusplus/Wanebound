import { describe, expect, it } from 'vitest';
import { hexGrid } from '../src/grid.js';

describe('hex grid', () => {
  it('measures axial steps and moves toward a target', () => {
    expect(hexGrid.distance({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(2);
    expect(hexGrid.distance({ x: 0, y: 2 }, { x: 2, y: 0 })).toBe(2);
    expect(hexGrid.distance({ x: 0, y: 0 }, { x: 2, y: 2 })).toBe(4);
    expect(hexGrid.moveToward({ x: 0, y: 0 }, { x: 2, y: 0 }, 1)).toEqual({
      x: 1,
      y: 0,
    });
  });
});
