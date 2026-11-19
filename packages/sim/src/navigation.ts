import { hexGrid, type Position } from './grid.js';
import { movementBlocked } from './collision.js';

const subdivisions = 8;
const columns = 6 * subdivisions + 1;
const rows = 4 * subdivisions + 1;
const nodeCount = columns * rows;
const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
] as const;
type QueueEntry = { index: number; cost: number; estimate: number };

function before(a: QueueEntry, b: QueueEntry): boolean {
  return (
    a.estimate < b.estimate ||
    (a.estimate === b.estimate &&
      (a.cost < b.cost || (a.cost === b.cost && a.index < b.index)))
  );
}

function push(queue: QueueEntry[], entry: QueueEntry): void {
  let i = queue.length;
  queue.push(entry);
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (!before(entry, queue[parent]!)) break;
    queue[i] = queue[parent]!;
    i = parent;
  }
  queue[i] = entry;
}

function pop(queue: QueueEntry[]): QueueEntry {
  const result = queue[0]!;
  const tail = queue.pop()!;
  if (queue.length === 0) return result;
  let i = 0;
  while (i * 2 + 1 < queue.length) {
    let child = i * 2 + 1;
    if (child + 1 < queue.length && before(queue[child + 1]!, queue[child]!))
      child++;
    if (!before(queue[child]!, tail)) break;
    queue[i] = queue[child]!;
    i = child;
  }
  queue[i] = tail;
  return result;
}

function point(index: number): Position {
  return {
    x: (index % columns) / subdivisions,
    y: Math.floor(index / columns) / subdivisions,
  };
}

/** A* over eighth-hex axial points; sweep every segment to preserve hard collision. */
export function navigate(
  from: Position,
  target: Position,
  range: number,
  speed: number,
  occupied: Position[],
): Position {
  const clear = (a: Position, b: Position) =>
    occupied.every((other) => !movementBlocked(a, b, other));
  const distance = hexGrid.distance(from, target);
  const approach = hexGrid.moveToward(
    from,
    target,
    Math.max(0, distance - range + 0.001),
  );
  if (clear(from, approach)) return hexGrid.moveToward(from, approach, speed);

  const valid = new Int8Array(nodeCount);
  const walkable = (index: number): boolean => {
    if (valid[index] === 0)
      valid[index] = clear(point(index), point(index)) ? 1 : -1;
    return valid[index] === 1;
  };
  const costs = new Float64Array(nodeCount + 1);
  costs.fill(Infinity);
  const parents = new Int32Array(nodeCount + 1);
  parents.fill(-1);
  const start = nodeCount;
  const queue: QueueEntry[] = [];
  costs[start] = 0;
  push(queue, {
    index: start,
    cost: 0,
    estimate: Math.max(0, distance - range),
  });

  while (queue.length) {
    const current = pop(queue);
    if (current.cost !== costs[current.index]) continue;
    const position = current.index === start ? from : point(current.index);
    if (
      current.index !== start &&
      hexGrid.distance(position, target) <= range
    ) {
      const route: number[] = [];
      for (let index = current.index; index !== start; index = parents[index]!)
        route.push(index);
      route.reverse();
      const next = route
        .map(point)
        .find((candidate) => hexGrid.distance(from, candidate) > 0.0001);
      return next ? hexGrid.moveToward(from, next, speed) : { ...from };
    }
    const neighbors: number[] = [];
    if (current.index === start) {
      for (let index = 0; index < nodeCount; index++) {
        if (hexGrid.distance(from, point(index)) <= 0.5) neighbors.push(index);
      }
    } else {
      const x = current.index % columns;
      const y = Math.floor(current.index / columns);
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < columns && ny >= 0 && ny < rows)
          neighbors.push(ny * columns + nx);
      }
    }
    for (const index of neighbors) {
      if (!walkable(index)) continue;
      const candidate = point(index);
      if (!clear(position, candidate)) continue;
      const edge = hexGrid.distance(position, candidate);
      const cost = current.cost + edge;
      if (cost >= costs[index]!) continue;
      costs[index] = cost;
      parents[index] = current.index;
      push(queue, {
        index,
        cost,
        estimate:
          cost + Math.max(0, hexGrid.distance(candidate, target) - range),
      });
    }
  }
  return { ...from };
}
