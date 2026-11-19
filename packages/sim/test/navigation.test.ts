import { expect, it } from 'vitest';
import { navigate } from '../src/navigation.js';
import { hexGrid } from '../src/grid.js';
import { movementBlocked } from '../src/collision.js';

it('walks around an ally without entering any occupied hex', () => {
  let position = { x: 1, y: 2 };
  const target = { x: 4, y: 2 };
  const occupied = [{ x: 2, y: 2 }, target];
  let detoured = false;
  for (let i = 0; i < 150 && hexGrid.distance(position, target) > 1; i++) {
    const next = navigate(position, target, 1, 0.14, occupied);
    for (const obstacle of occupied)
      expect(movementBlocked(position, next, obstacle)).toBe(false);
    if (next.y !== 2) detoured = true;
    position = next;
  }
  expect(detoured).toBe(true);
  expect(hexGrid.distance(position, target)).toBeLessThanOrEqual(1);
});
