"use client";

import React, { useState } from "react";
import {
  DashboardCard,
  StatusTimeline,
  DataRangePicker,
  FileUploader,
  Card,
  Button,
  Badge,
  Alert,
} from "@/components/ui";

// Sample icons as React components
const SalesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
  </svg>
);

const OrdersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z"
      clipRule="evenodd"
    />
  </svg>
);

const RevenueIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
      clipRule="evenodd"
    />
  </svg>
);

const Category4Demo = () => {
  // State management
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [currentOrderStep, setCurrentOrderStep] = useState(2);
  const [orderStatus, setOrderStatus] = useState<
    "in-progress" | "completed" | "failed"
  >("in-progress");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadAlert, setShowUploadAlert] = useState(false);

  // Sample data
  const dashboardStats = [
    {
      title: "Total Sales",
      value: "$45,231.89",
      icon: SalesIcon,
      trend: { direction: "up" as const, value: "20.1%" },
      linkTo: "/sales",
    },
    {
      title: "Active Users",
      value: "2,350",
      icon: UsersIcon,
      trend: { direction: "up" as const, value: "5.2%" },
      linkTo: "/users",
    },
    {
      title: "Total Orders",
      value: "1,234",
      icon: OrdersIcon,
      trend: { direction: "down" as const, value: "3.1%" },
      linkTo: "/orders",
    },
    {
      title: "Monthly Revenue",
      value: "$12,234",
      icon: RevenueIcon,
      trend: { direction: "up" as const, value: "15.3%" },
      linkTo: "/revenue",
    },
  ];

  const orderSteps = [
    "Order Placed",
    "Verified by Admin",
    "Prepared in Warehouse",
    "Shipped",
    "Delivered",
  ];

  const returnSteps = [
    "Return Request",
    "Item Received",
    "Quality Check",
    "Refund Processing",
    "Refund Complete",
  ];

  // Event handlers
  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
    console.log("Date range changed:", dates);
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    setShowUploadAlert(true);
    console.log("Files uploaded:", files);
  };

  const simulateOrderProgress = () => {
    if (currentOrderStep < orderSteps.length - 1) {
      setCurrentOrderStep(prev => prev + 1);
      if (currentOrderStep === orderSteps.length - 2) {
        setOrderStatus("completed");
      }
    }
  };

  const simulateOrderFailure = () => {
    setOrderStatus("failed");
  };

  const resetOrder = () => {
    setCurrentOrderStep(0);
    setOrderStatus("in-progress");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Category 4: Feature-Specific Components
        </h1>

        {/* Upload Alert */}
        {showUploadAlert && (
          <div className="mb-8">
            <Alert
              status="success"
              title="Files Uploaded Successfully"
              message={`${uploadedFiles.length} file(s) have been uploaded successfully.`}
              isClosable
              onClose={() => setShowUploadAlert(false)}
            />
          </div>
        )}

        {/* Dashboard Stat Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Dashboard Stat Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <DashboardCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                linkTo={stat.linkTo}
              />
            ))}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Status Timeline/Tracker
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Timeline */}
            <Card
              title="Order Processing Timeline"
              headerActions={
                <div className="flex space-x-2">
                  <Button size="small" variant="outline" onClick={resetOrder}>
                    Reset
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={simulateOrderProgress}
                  >
                    Next Step
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={simulateOrderFailure}
                  >
                    Fail
                  </Button>
                </div>
              }
            >
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge
                    colorScheme={
                      orderStatus === "completed"
                        ? "green"
                        : orderStatus === "failed"
                        ? "red"
                        : "blue"
                    }
                  >
                    {orderStatus.charAt(0).toUpperCase() +
                      orderStatus.slice(1).replace("-", " ")}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Order #12345
                  </span>
                </div>

                <StatusTimeline
                  steps={orderSteps}
                  currentStep={currentOrderStep}
                  status={orderStatus}
                />
              </div>
            </Card>

            {/* Return Timeline */}
            <Card title="Return Process Timeline">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge colorScheme="yellow">In Progress</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Return #RET-001
                  </span>
                </div>

                <StatusTimeline
                  steps={returnSteps}
                  currentStep={2}
                  status="in-progress"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Date Range Picker
          </h2>

          <Card title="Report Date Range Filter">
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Select a date range to filter your reports and analytics data.
              </p>

              <div className="max-w-md">
                <DataRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDatesChange={handleDateChange}
                />
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Selected Range:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From: {startDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To: {endDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total days:{" "}
                  {Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* File Uploader */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            File Uploader
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Single File Upload */}
            <Card title="Single File Upload">
              <FileUploader
                onUpload={handleFileUpload}
                acceptedFileTypes="image/jpeg,image/png,application/pdf"
                maxFileSize={5 * 1024 * 1024} // 5MB
                multiple={false}
              />
            </Card>

            {/* Multiple File Upload */}
            <Card title="Multiple File Upload">
              <FileUploader
                onUpload={handleFileUpload}
                acceptedFileTypes="image/*,application/pdf,.doc,.docx,.txt"
                maxFileSize={10 * 1024 * 1024} // 10MB
                multiple={true}
              />
            </Card>
          </div>
        </div>

        {/* Real-world Usage Example */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Real-world Usage Example
          </h2>

          <Card title="Admin Dashboard Overview">
            <div className="space-y-8">
              {/* KPI Cards */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DashboardCard
                    title="Today's Sales"
                    value="$2,345"
                    icon="💰"
                    trend={{ direction: "up", value: "12%" }}
                  />
                  <DashboardCard
                    title="New Orders"
                    value="156"
                    icon="📦"
                    trend={{ direction: "up", value: "8%" }}
                  />
                  <DashboardCard
                    title="Active Users"
                    value="1,234"
                    icon="👥"
                    trend={{ direction: "down", value: "2%" }}
                  />
                  <DashboardCard
                    title="Conversion Rate"
                    value="3.2%"
                    icon="📈"
                    trend={{ direction: "up", value: "0.5%" }}
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Analytics Period
                </h3>
                <div className="max-w-xs">
                  <DataRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDatesChange={handleDateChange}
                  />
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Order Status
                </h3>
                <StatusTimeline
                  steps={[
                    "Order Received",
                    "Payment Verified",
                    "In Preparation",
                    "Shipped",
                    "Delivered",
                  ]}
                  currentStep={3}
                  status="in-progress"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Category4Demo;