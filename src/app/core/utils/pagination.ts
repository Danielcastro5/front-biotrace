export interface PaginationState {
  currentPage: number;
  totalPages: number;
  firstItem: number;
  lastItem: number;
  pageNumbers: number[];
}

export function getPaginationState(
  currentPage: number,
  pageSize: number,
  totalItems: number,
  visiblePageCount = 5
): PaginationState {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const safeTotalItems = Math.max(0, Math.floor(totalItems));
  const safeVisiblePageCount = Math.max(1, Math.floor(visiblePageCount));
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  const page = Math.min(Math.max(1, Math.floor(currentPage)), totalPages);
  const firstPage = Math.max(
    1,
    Math.min(page - Math.floor(safeVisiblePageCount / 2), totalPages - safeVisiblePageCount + 1)
  );
  const lastPage = Math.min(totalPages, firstPage + safeVisiblePageCount - 1);

  return {
    currentPage: page,
    totalPages,
    firstItem: safeTotalItems === 0 ? 0 : (page - 1) * safePageSize + 1,
    lastItem: Math.min(page * safePageSize, safeTotalItems),
    pageNumbers: Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index),
  };
}

export function paginateItems<T>(items: readonly T[], currentPage: number, pageSize: number): T[] {
  const state = getPaginationState(currentPage, pageSize, items.length);
  const start = (state.currentPage - 1) * Math.max(1, Math.floor(pageSize));
  return items.slice(start, start + Math.max(1, Math.floor(pageSize)));
}
