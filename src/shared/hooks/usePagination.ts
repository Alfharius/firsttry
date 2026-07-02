import { useEffect, useMemo, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function usePagination<T>(items: T[], initialPageSize: PageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize)

  useEffect(() => {
    setPage(1)
  }, [items])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  )

  const rangeStart = items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, items.length)

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value) as PageSize)
    setPage(1)
  }

  return {
    pageItems,
    page: currentPage,
    setPage,
    pageSize,
    totalPages,
    rangeStart,
    rangeEnd,
    total: items.length,
    handlePageSizeChange,
  }
}
