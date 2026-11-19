import { z } from 'zod';
import rawCombat from '../../../data/combat.json';
import type { Position } from './grid.js';

export const combat = z
  .object({
    minimumUnitDistance: z.number().positive().max(1),
    reinforcementInvulnerabilityTicks: z.number().int().positive(),
    targetRetargetDelayTicks: z.number().int().nonnegative(),
  })
  .parse(rawCombat);

/** Intersect movement segment with the interior of a hex around an occupied position. */
export function movementBlocked(
  from: Position,
  to: Position,
  occupied: Position,
): boolean {
  let enter = 0;
  let leave = 1;
  const q = from.x - occupied.x;
  const r = from.y - occupied.y;
  const dq = to.x - from.x;
  const dr = to.y - from.y;
  const radius = combat.minimumUnitDistance - 0.000001;
  for (const [offset, delta] of [
    [q, dq],
    [r, dr],
    [q + r, dq + dr],
  ]) {
    if (delta === 0) {
      if (Math.max(offset!, -offset!) >= radius) return false;
      continue;
    }
    const a = (-radius - offset!) / delta!;
    const b = (radius - offset!) / delta!;
    enter = Math.max(enter, Math.min(a, b));
    leave = Math.min(leave, Math.max(a, b));
    if (enter > leave) return false;
  }
  return enter <= leave;
}
