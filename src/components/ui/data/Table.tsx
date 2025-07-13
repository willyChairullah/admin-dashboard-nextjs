import React from "react";
import Button from "../common/Button";

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Skeleton loader component
const TableSkeleton: React.FC<{ columns: Column[] }> = ({ columns }) => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {columns.map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-300 dark:bg-gray-600 rounded"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Pagination component
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
      <div className="flex items-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="small"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="small"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 mb-4 text-gray-400 dark:text-gray-500">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
};

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  className = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPagination = true,
}) => {
  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      >
        <TableSkeleton columns={columns} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      >
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.render
                      ? column.render(row[column.accessor], row)
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-gray-200 dark:border-gray-700 p-4 space-y-3"
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {column.header}:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default Table;
