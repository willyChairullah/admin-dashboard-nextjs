"use client";
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Button from "../common/Button";
import Modal from "../common/Modal";
import Calendar from "../common/Calendar";
import { FaCalendarAlt } from "react-icons/fa"; // Mengimpor ikon
import { formatDate } from "@/utils/formatDate"; // Import the formatDate function

interface DateRangePreset {
  label: string;
  range: [Date, Date];
}

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDatesChange: (dates: { startDate: Date; endDate: Date }) => void;
  presets?: DateRangePreset[];
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDatesChange,
  presets = [],
  className = "",
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  // Default presets
  const defaultPresets: DateRangePreset[] = [
    { label: "All Time", range: [new Date(0), new Date()] },
    {
      label: "Last 7 Days",
      range: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    },
    {
      label: "Last 30 Days",
      range: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    },
    {
      label: "Last 90 Days",
      range: [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()],
    },
    {
      label: "This Month",
      range: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(),
      ],
    },
    {
      label: "Last Month",
      range: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
    },
  ];

  const allPresets = presets.length > 0 ? presets : defaultPresets;

  const formatDateRange = () => {
    if (
      startDate.getTime() === 0 &&
      endDate.getTime() === new Date().getTime()
    ) {
      return "All Time";
    }
    return `${formatDate(tempStartDate)} - ${formatDate(tempEndDate)}`; // Use Indonesia format
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setTempStartDate(range.startDate);
    setTempEndDate(range.endDate);
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    setTempStartDate(preset.range[0]);
    setTempEndDate(preset.range[1]);
  };

  const handleApply = () => {
    onDatesChange({ startDate: tempStartDate, endDate: tempEndDate });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    const allTimeRange = [new Date(0), new Date()]; // Default to All Time
    setTempStartDate(allTimeRange[0]);
    setTempEndDate(allTimeRange[1]);
    onDatesChange({ startDate: allTimeRange[0], endDate: allTimeRange[1] }); // Notify parent component
    setIsOpen(false); // Close the modal
  };

  const renderPresets = () => (
    <div className={`${isMobile ? "grid grid-cols-2 gap-2" : "space-y-2"}`}>
      {allPresets.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          size={isMobile ? "small" : "medium"}
          className="w-full text-xs md:text-sm"
          onClick={() => handlePresetClick(preset)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );

  const renderModalFooter = () => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size={isMobile ? "small" : "medium"}
        onClick={handleClear} // Clear button added
        className="flex-1"
      >
        Clear
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "small" : "medium"}
        onClick={handleCancel}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        size={isMobile ? "small" : "medium"}
        onClick={handleApply}
        className="flex-1"
      >
        Apply
      </Button>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size={isMobile ? "small" : "medium"}
        onClick={() => setIsOpen(true)}
        className="w-full text-xs md:text-sm"
      >
        <FaCalendarAlt className="mr-1" />
        {formatDateRange()} {/* Use formatted date range */}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Date Range"
        size={isMobile ? "sm" : "lg"}
        footer={renderModalFooter()}
      >
        <div className="flex flex-col md:flex-row">
          <div className={`${isMobile ? "mb-4" : "w-1/4 pr-4 border-r"}`}>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Quick Select
            </h3>
            {renderPresets()}
          </div>

          <div className="flex-grow">
            <Calendar
              startDate={tempStartDate}
              endDate={tempEndDate}
              onDateRangeChange={handleDateRangeChange}
              isMobile={isMobile}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DateRangePicker;
