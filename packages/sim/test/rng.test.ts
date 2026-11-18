import { describe, expect, it } from 'vitest';
import { SeededRng } from '../src/rng.js';

describe('SeededRng', () => {
  it('repeats the same stream for the same seed', () => {
    const first = new SeededRng(1234);
    const second = new SeededRng(1234);
    expect(Array.from({ length: 100 }, () => first.next())).toEqual(
      Array.from({ length: 100 }, () => second.next()),
    );
  });

  it('stays within bounds', () => {
    const rng = new SeededRng(0xffffffff);
    for (let i = 0; i < 100; i++) expect(rng.int(5)).toBeGreaterThanOrEqual(0);
    expect(() => new SeededRng(-1)).toThrow(RangeError);
  });
});
