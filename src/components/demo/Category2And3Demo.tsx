"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Badge,
  FormGroup,
  FormField,
  SearchBar,
  Alert,
  DataTable,
  Modal,
  Card,
  DataRangePicker,
  InputCheckbox,
  InputDate,
  InputFileUpload,
  InputTextArea,
} from "@/components/ui";
interface FormData {
  name: string; // Full name (string)
  email: string; // Email address (string)
  category: string; // Selected category (string, could be an enum if there are predefined categories)
  dateOfBirth: Date | null; // Date of birth (use Date type or null if not set)
  description: string; // Description (string)
  fileUpload: FileList | null; // File upload (FileList or null if no file uploaded)
  termsAccepted: boolean; // Terms acceptance (boolean)
}

interface FormErrors {
  name?: string; // Error message for name field (optional)
  email?: string; // Error message for email field (optional)
  category?: string; // Error message for category field (optional)
  dateOfBirth?: string; // Error message for date of birth (optional)
  description?: string; // Error message for description (optional)
  fileUpload?: string; // Error message for file upload (optional)
  termsAccepted?: string; // Error message for terms acceptance (optional)
}

const Category2And3Demo = () => {
  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  // Event handlers
  const handleDateChange = (dates: { startDate: Date; endDate: Date }) => {
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
    console.log("Date range changed:", dates);
  };
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  // State for various components
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    category: "",
    dateOfBirth: null, // Set to null initially
    description: "",
    fileUpload: null, // Accepting file uploads, starts as null
    termsAccepted: false, // Initialize to false unless terms are accepted
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "", // Start with empty error messages
    email: "",
    category: "",
    dateOfBirth: "",
    description: "",
    fileUpload: "",
    termsAccepted: "",
  });

  // Sample data for table
  const sampleData = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "Active",
      role: "Admin",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Active",
      role: "User",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "Inactive",
      role: "User",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      status: "Active",
      role: "Moderator",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie@example.com",
      status: "Active",
      role: "User",
    },
  ];

  // Table columns configuration
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => (
        <Badge colorScheme={value === "Active" ? "green" : "red"}>
          {value}
        </Badge>
      ),
    },
    { header: "Role", accessor: "role" },
    {
      header: "Actions",
      accessor: "actions",
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="outline"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const categoryOptions = [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" },
    { value: "moderator", label: "Moderator" },
  ];

  // Event handlers
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search logic here
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });

    // Optional: Validate or clear errors
    if (value) {
      setFormErrors({ ...formErrors, category: "" });
    } else {
      setFormErrors({ ...formErrors, category: "Please select a category." });
    }
  };

  const handleEdit = (row: any) => {
    console.log("Edit:", row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: any) => {
    console.log("Delete:", row);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    const errors = {
      name: formData.name ? "" : "Name is required",
      email: formData.email ? "" : "Email is required",
      category: formData.category ? "" : "Category is required",
    };

    setFormErrors(errors);

    if (!errors.name && !errors.email && !errors.category) {
      console.log("Form submitted:", formData);
      setIsModalOpen(false);
    }
  };

  const handleLoadTable = () => {
    setIsTableLoading(true);
    setTimeout(() => {
      setIsTableLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Component Demo - Category 2 & 3
        </h1>

        {/* Category 2: Composite Components */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Category 2: Composite Components (Molecules)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Group Demo */}
            <Card title="Form Group Components" className="h-fit">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <FormField
                  label="Full Name"
                  htmlFor="name"
                  required
                  errorMessage={formErrors.name}
                >
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  htmlFor="email"
                  required
                  errorMessage={formErrors.email}
                >
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </FormField>

                <FormField
                  label="Date"
                  htmlFor="date"
                  required
                  errorMessage={formErrors.category}
                >
                  <InputDate
                    value={formData.dateOfBirth}
                    onChange={date =>
                      setFormData({ ...formData, dateOfBirth: date })
                    }
                    placeholder="Select a date"
                    errorMessage={formErrors.dateOfBirth} // Display error if there is any
                  />
                </FormField>
                <FormField
                  label="Category"
                  htmlFor="category"
                  required
                  errorMessage={formErrors.category}
                >
                  <Select
                    options={categoryOptions}
                    value={formData.category}
                    onChange={handleCategoryChange}
                    placeholder="— Select a Category —"
                  />
                </FormField>

                <FormField
                  label="Description"
                  htmlFor="description"
                  errorMessage={formErrors.description}
                >
                  <InputTextArea
                    name="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </FormField>

                <FormField
                  label="fileUpload"
                  htmlFor="fileUpload"
                  required
                  errorMessage={formErrors.fileUpload}
                >
                  <InputFileUpload
                    name="fileUpload"
                    onChange={e => {
                      // Handle the FileList or null in your form data state
                      if (e) {
                        setFormData({ ...formData, fileUpload: e });
                      } else {
                        setFormData({ ...formData, fileUpload: null });
                      }
                    }}
                    errorMessage={formErrors.fileUpload}
                  />
                </FormField>

                <InputCheckbox
                  checked={formData.termsAccepted}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      termsAccepted: e.target.checked,
                    })
                  }
                  label="I accept the terms and conditions"
                  errorMessage={formErrors.termsAccepted}
                />

                <Button type="submit" className="w-full">
                  Submit Form
                </Button>
              </form>
            </Card>

            {/* Search Bar Demo */}
            <Card title="Search Bar Component" className="h-fit">
              <div className="space-y-4">
                <SearchBar
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onSearch={handleSearch}
                  placeholder="Search users, products, or orders..."
                />

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Try typing something and press Enter or click the search
                    icon.
                  </p>
                  <p className="mt-2">
                    Current query:{" "}
                    <span className="font-medium">{searchQuery || "None"}</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Alert Demo */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alert/Notification Components
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert
                status="success"
                title="Success!"
                message="Your operation was completed successfully."
                isClosable
                onClose={() => console.log("Success alert closed")}
              />

              <Alert
                status="error"
                title="Error Occurred"
                message="Something went wrong. Please try again."
                isClosable
                onClose={() => console.log("Error alert closed")}
              />

              <Alert
                status="warning"
                title="Warning"
                message="Please review your settings before continuing."
                isClosable
                onClose={() => console.log("Warning alert closed")}
              />

              <Alert
                status="info"
                title="Information"
                message="New features have been added to your dashboard."
                isClosable
                onClose={() => console.log("Info alert closed")}
              />
            </div>
          </div>
        </div>

        {/* Category 3: Layout & Page Components */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Category 3: Layout & Page Components
          </h2>

          {/* Table Demo */}
          <Card
            title="Data Table Component"
            headerActions={
              <div className="flex space-x-2">
                <Button variant="secondary">List</Button>
                <Button>Add New</Button>
              </div>
            }
          >
            <div className="flex flex-col">
              <div className="flex  mb-4">
                <div className="">
                  <SearchBar
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onSearch={handleSearch}
                    placeholder="Search users, products, or orders..."
                  />
                </div>
                <div className="">
                  <Select
                    options={selectOptions}
                    placeholder="— Select an Option —"
                  />
                </div>
                <div className="">
                  <DataRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDatesChange={handleDateChange}
                  />
                </div>
              </div>
              <DataTable
                enableFiltering={false}
                columns={columns}
                data={sampleData}
                isLoading={isTableLoading}
                currentPage={currentPage}
                totalPages={3}
                onPageChange={setCurrentPage}
                emptyMessage="No users found"
              />
            </div>
          </Card>

          {/* Card Variations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Simple Card" hover>
              <p className="text-gray-600 dark:text-gray-400">
                This is a simple card with title and content. It has hover
                effects enabled.
              </p>
            </Card>

            <Card
              title="Card with Actions"
              headerActions={
                <Button size="small" variant="outline">
                  Action
                </Button>
              }
            >
              <p className="text-gray-600 dark:text-gray-400">
                This card has header actions like buttons or dropdowns.
              </p>
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Card without Title
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This card has no title but uses large padding for better
                spacing.
              </p>
            </Card>
          </div>
        </div>

        {/* Modal Demo */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New User"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSubmit}>Save User</Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Fill in the form below to add a new user to the system.
            </p>

            <FormField label="Full Name" required>
              <Input
                type="text"
                name="modalName"
                placeholder="Enter user's full name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </FormField>

            <FormField label="Email Address" required>
              <Input
                type="email"
                name="modalEmail"
                placeholder="Enter user's email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormField>

            {/* <FormField label="User Role" required>
              <Select
                name="modalCategory"
                label="User Role"
                options={categoryOptions}
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </FormField> */}
          </div>
        </Modal>

        {/* Demo Controls */}
        <Card title="Demo Controls" className="mt-8">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Button variant="outline" onClick={handleLoadTable}>
              Load Table Data
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAlert(!showAlert)}
            >
              {showAlert ? "Hide" : "Show"} Alert
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Category2And3Demo;
