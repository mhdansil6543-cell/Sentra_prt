import { describe, it, expect } from 'vitest';

describe('frontend smoke test', () => {
  it('runs a baseline vitest check', () => {
    expect(1 + 1).toBe(2);
  });
});
