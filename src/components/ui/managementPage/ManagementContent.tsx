"use client";
import React, { useMemo, useState } from "react";
import {
  CombinedSearchInput,
  DataRangePicker,
  DataTable,
} from "@/components/ui";
import { formatDate } from "@/utils/formatDate";

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ManagementContentProps<T extends Record<string, any>> {
  sampleData: T[];
  columns: Column[];
  excludedAccessors: string[];
  dateAccessor?: keyof T; // Use a key of T for date filtering (optional)
  emptyMessage?: string;
  linkPath: string; // Dynamic link path for editing the row
}

const ManagementContent = <T extends Record<string, any>>({
  sampleData,
  columns,
  excludedAccessors,
  dateAccessor = "createdAt", // Default date accessor
  emptyMessage = "No data found",
  linkPath,
}: ManagementContentProps<T>) => {
  const initialDateRange = useMemo(() => {
    return {
      startDate: new Date(2025, 0, 1), // Start date: January 1, 2025
      endDate: new Date(), // Current date
    };
  }, []);

  const enhancedColumns = useMemo(() => {
    return columns.map(column => {
      // Here you can define custom render functions for certain columns
      if (column.accessor === "isActive") {
        return {
          ...column,
          render: (value: boolean) => (
            <span className={value ? "text-green-500" : "text-red-500"}>
              {value ? "Active" : "Inactive"}
            </span>
          ),
        };
      }
      if (column.accessor === dateAccessor) {
        return {
          ...column,
          render: (value: Date) => formatDate(value),
        };
      }
      return column;
    });
  }, [columns, dateAccessor]);

  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOption, setSearchOption] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  const handleSearch = (query: string, option: string) => {
    setSearchQuery(query);
    setSearchOption(option);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to the first page on page size change
  };

  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      // Date filtering (only if dateAccessor exists in the data)
      let isWithinDateRange = true;
      if (dateAccessor && item[dateAccessor]) {
        const itemDate = new Date(item[dateAccessor]);
        isWithinDateRange = itemDate >= startDate && itemDate <= endDate;
      }

      // Search filtering
      const searchMatch =
        !searchQuery ||
        (searchOption === "all"
          ? Object.values(item).some(value =>
              String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
          : item[searchOption]
              ?.toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

      return isWithinDateRange && searchMatch;
    });
  }, [sampleData, searchQuery, searchOption, startDate, endDate, dateAccessor]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const columnFilterFunction = (accessor: string) => {
    return !excludedAccessors.includes(accessor);
  };

  const defaultLinkPath = (row: T) => {
    return `${linkPath}/edit/${row.id}`;
  };

  return (
    <div className="p-3 md:p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="w-full md:w-auto">
          <DataRangePicker
            startDate={startDate}
            endDate={endDate}
            onDatesChange={handleDateChange}
          />
        </div>
        <CombinedSearchInput
          columns={enhancedColumns}
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search..."
          filterColumnAccessor={columnFilterFunction}
        />
      </div>
      <DataTable
        currentPage={currentPage}
        columns={enhancedColumns}
        data={paginatedData}
        emptyMessage={emptyMessage}
        enableFiltering={false}
        pageSize={pageSize}
        linkPath={defaultLinkPath}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        totalPages={Math.ceil(filteredData.length / pageSize)}
        totalItems={filteredData.length}
      />
    </div>
  );
};

export default ManagementContent;
