"use client";
import React, { useMemo, useState } from "react";
import {
  CombinedSearchInput,
  DataRangePicker,
  DataTable,
} from "@/components/ui";

interface UserData {
  id: number;
  nik: string;
  name: string;
  email: string;
  status: string;
  role: string;
  date: Date;
}

interface Column {
  header: string;
  accessor: string;
}

interface ManagementContentProps {
  sampleData: UserData[];
  columns: Column[];
  excludedAccessors: string[]; // Accept an array of excluded accessors
}

const ManagementContent: React.FC<ManagementContentProps> = ({
  sampleData,
  columns,
  excludedAccessors, // Get the excluded accessors
}) => {
  const initialDateRange = useMemo(() => {
    return {
      startDate: new Date(2025, 0, 1), // Start date: January 1, 2025
      endDate: new Date(), // Current date
    };
  }, []);

  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOption, setSearchOption] = useState("all"); // Default to "all"
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

  // Handler for changing page size
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to the first page
  };

  const filteredData = useMemo(() => {
    return sampleData.filter(item => {
      const isWithinDateRange = item.date >= startDate && item.date <= endDate;
      const searchMatch =
        !searchQuery ||
        (searchOption === "all"
          ? Object.values(item).some(value =>
              String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
          : item[searchOption as keyof UserData]
              ?.toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase()));

      return isWithinDateRange && searchMatch;
    });
  }, [sampleData, searchQuery, searchOption, startDate, endDate]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Define the filter function for searchable columns
  const columnFilterFunction = (accessor: string) => {
    return !excludedAccessors.includes(accessor); // Exclude specified columns
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
          columns={columns}
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search..."
          filterColumnAccessor={columnFilterFunction} // Pass the filter function here
        />
      </div>
      <DataTable
        currentPage={currentPage}
        columns={columns}
        data={paginatedData}
        emptyMessage="No users found"
        enableFiltering={false}
        pageSize={pageSize}
        linkPath={row =>
          `${window.location.origin}${window.location.pathname}/edit/${row.id}`
        }
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        totalPages={Math.ceil(filteredData.length / pageSize)}
        totalItems={filteredData.length}
      />
    </div>
  );
};

export default ManagementContent;
