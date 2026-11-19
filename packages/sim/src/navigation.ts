import { hexGrid, type Position } from './grid.js';
import { movementBlocked } from './collision.js';

/** Deterministic shortest route on a half-hex lattice. All edges are swept for collision. */
export function navigate(
  from: Position,
  target: Position,
  range: number,
  speed: number,
  occupied: Position[],
): Position {
  const clear = (a: Position, b: Position) =>
    occupied.every((p) => !movementBlocked(a, b, p));
  const distance = hexGrid.distance(from, target);
  const approach = hexGrid.moveToward(
    from,
    target,
    Math.max(0, distance - range + 0.001),
  );
  if (clear(from, approach)) return hexGrid.moveToward(from, approach, speed);
  const nodes: Position[] = [{ ...from }];
  for (let y = 0; y <= 8; y++)
    for (let x = 0; x <= 12; x++) {
      const p = { x: x / 2, y: y / 2 };
      if (clear(p, p)) nodes.push(p);
    }
  const costs = nodes.map(() => Infinity);
  const parents = nodes.map(() => -1);
  const visited = new Set<number>();
  costs[0] = 0;
  for (;;) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++)
      if (
        !visited.has(i) &&
        costs[i]! < Infinity &&
        (current < 0 || costs[i]! < costs[current]!)
      )
        current = i;
    if (current < 0) return { ...from };
    const p = nodes[current]!;
    if (current !== 0 && hexGrid.distance(p, target) <= range) {
      let first = current;
      while (parents[first]! > 0) first = parents[first]!;
      return hexGrid.moveToward(from, nodes[first]!, speed);
    }
    visited.add(current);
    for (let i = 1; i < nodes.length; i++) {
      if (visited.has(i)) continue;
      const edge = hexGrid.distance(p, nodes[i]!);
      if (
        edge === 0 ||
        edge > (current === 0 ? 1 : 0.5) ||
        !clear(p, nodes[i]!)
      )
        continue;
      const cost = costs[current]! + edge;
      if (cost < costs[i]!) {
        costs[i] = cost;
        parents[i] = current;
      }
    }
  }
}
