import { describe, expect, it } from 'vitest';
import { getPaginationState, paginateItems } from './pagination';

describe('pagination', () => {
  it('returns an empty range for an empty list', () => {
    expect(getPaginationState(1, 10, 0)).toEqual({
      currentPage: 1,
      totalPages: 1,
      firstItem: 0,
      lastItem: 0,
      pageNumbers: [1],
    });
  });

  it('calculates the visible range and page numbers', () => {
    expect(getPaginationState(3, 10, 47)).toEqual({
      currentPage: 3,
      totalPages: 5,
      firstItem: 21,
      lastItem: 30,
      pageNumbers: [1, 2, 3, 4, 5],
    });
  });

  it('clamps pages to the available range and page size to at least one', () => {
    expect(getPaginationState(20, 0, 3)).toEqual({
      currentPage: 3,
      totalPages: 3,
      firstItem: 3,
      lastItem: 3,
      pageNumbers: [1, 2, 3],
    });
  });

  it('paginates items without changing the source array', () => {
    const records = ['a', 'b', 'c', 'd'];

    expect(paginateItems(records, 2, 2)).toEqual(['c', 'd']);
    expect(records).toEqual(['a', 'b', 'c', 'd']);
  });
});
