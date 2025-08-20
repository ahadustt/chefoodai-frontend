import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
  showItemsInfo?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  showItemsInfo = true,
  showPageSizeSelector = false,
  pageSizeOptions = [6, 12, 18, 24],
  onPageSizeChange
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Add ellipsis if there's a gap
      if (currentPage > 4) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      // Add ellipsis if there's a gap
      if (currentPage < totalPages - 3) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return showItemsInfo ? (
      <div className={cn("flex justify-center text-sm text-gray-600", className)}>
        Showing {totalItems} item{totalItems !== 1 ? 's' : ''}
      </div>
    ) : null
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Items info */}
      {showItemsInfo && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> items
        </div>
      )}

      {/* Page size selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200",
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 text-sm font-medium",
                    currentPage === page
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                  )}
                >
                  {page}
                </motion.button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200",
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

// Hook for pagination state management
export function usePagination(totalItems: number, defaultPageSize: number = 12) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)

  // Reset to page 1 when page size changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  // Reset to last valid page if current page exceeds total
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }

  // Calculate start and end indices for slicing data
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handlePageSizeChange
  }
}
