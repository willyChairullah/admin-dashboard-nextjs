import React, { useState, useRef, useEffect } from "react";
import Button from "../common/Button";

interface DateRangePreset {
  label: string;
  range: [Date, Date];
}

interface DataRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDatesChange: (dates: { startDate: Date; endDate: Date }) => void;
  presets?: DateRangePreset[];
  className?: string;
}

const DataRangePicker: React.FC<DataRangePickerProps> = ({
  startDate,
  endDate,
  onDatesChange,
  presets = [],
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(startDate.getFullYear(), startDate.getMonth())
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Default presets
  const defaultPresets: DateRangePreset[] = [
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = () => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateRangeStart = (date: Date) => {
    return (
      tempStartDate && date.toDateString() === tempStartDate.toDateString()
    );
  };

  const isDateRangeEnd = (date: Date) => {
    return tempEndDate && date.toDateString() === tempEndDate.toDateString();
  };

  const isDateInHoverRange = (date: Date) => {
    if (!hoverDate || !tempStartDate || tempEndDate) return false;
    const start = tempStartDate < hoverDate ? tempStartDate : hoverDate;
    const end = tempStartDate < hoverDate ? hoverDate : tempStartDate;
    return date >= start && date <= end;
  };

  const handleDateClick = (date: Date) => {
    if (isSelectingStart || !tempStartDate) {
      setTempStartDate(date);
      setTempEndDate(date);
      setIsSelectingStart(false);
    } else {
      if (date < tempStartDate) {
        setTempStartDate(date);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(date);
      }
    }
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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  const renderCalendar = (monthOffset: number = 0) => {
    const displayMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset
    );
    const days = getDaysInMonth(displayMonth);
    const monthName = displayMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {monthName}
          </h3>
          {monthOffset === 0 && (
            <div className="flex space-x-1">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2" />;
            }

            const isInRange = isDateInRange(day);
            const isRangeStart = isDateRangeStart(day);
            const isRangeEnd = isDateRangeEnd(day);
            const isInHoverRange = isDateInHoverRange(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={`
                  p-2 text-sm rounded-lg transition-colors duration-150 relative
                  ${
                    isRangeStart || isRangeEnd
                      ? "bg-blue-500 text-white"
                      : isInRange || isInHoverRange
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }
                  ${isToday ? "font-bold" : ""}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {formatDateRange()}
          </span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-max">
          <div className="flex">
            {/* Presets */}
            <div className="border-r border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Quick Select
              </h3>
              {allPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div className="flex">
              {renderCalendar(0)}
              <div className="hidden md:block">{renderCalendar(1)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end space-x-2">
            <Button variant="outline" size="small" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="small" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRangePicker;
