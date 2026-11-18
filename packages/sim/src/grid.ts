export interface Position {
  x: number;
  y: number;
}

export interface Grid {
  readonly columns: number;
  readonly rows: number;
  contains(position: Position): boolean;
  distance(a: Position, b: Position): number;
  moveToward(from: Position, to: Position, distance: number): Position;
}

function abs(value: number): number {
  return value < 0 ? -value : value;
}

/** Pointy-top axial hexes: q = x, r = y. Fractional positions support smooth movement. */
export const hexGrid: Grid = {
  columns: 7,
  rows: 5,
  contains(position) {
    return (
      position.x >= 0 && position.x < 7 && position.y >= 0 && position.y < 5
    );
  },
  distance(a, b) {
    const dq = a.x - b.x;
    const dr = a.y - b.y;
    return Math.max(abs(dq), abs(dr), abs(dq + dr));
  },
  moveToward(from, to, distance) {
    const remaining = this.distance(from, to);
    if (remaining === 0 || distance >= remaining) return { ...to };
    const fraction = distance / remaining;
    return {
      x: Math.round((from.x + (to.x - from.x) * fraction) * 1000) / 1000,
      y: Math.round((from.y + (to.y - from.y) * fraction) * 1000) / 1000,
    };
  },
};
