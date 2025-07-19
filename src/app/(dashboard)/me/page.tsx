"use client";
import { ManagementContent, ManagementHeader } from "@/components/ui";
import { formatDate } from "@/utils/formatDate";

interface UserData {
  id: number;
  nik: string;
  name: string;
  email: string;
  status: string;
  role: string;
  date: Date;
}

// Function to generate unique NIK
const generateNIK = (index: number): string => {
  const date = new Date("2023-01-15");
  const formattedDate = date.toISOString().split("T")[0].replace(/-/g, "");
  const uniqueNumber = String(index + 1).padStart(4, "0");
  return `${formattedDate}-${uniqueNumber}`;
};

// Sample User Data
const sampleData: UserData[] = [
  {
    id: 1,
    nik: generateNIK(0),
    name: "John Doe",
    email: "john@example.com",
    status: "Active",
    role: "Admin",
    date: new Date("2023-01-15"),
  },
  {
    id: 2,
    nik: generateNIK(1),
    name: "Jane Smith",
    email: "jane@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-02-20"),
  },
  {
    id: 3,
    nik: generateNIK(2),
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "Inactive",
    role: "User",
    date: new Date("2023-03-10"),
  },
  {
    id: 4,
    nik: generateNIK(3),
    name: "Alice Brown",
    email: "alice@example.com",
    status: "Active",
    role: "Moderator",
    date: new Date("2023-04-05"),
  },
  {
    id: 5,
    nik: generateNIK(4),
    name: "Charlie Wilson",
    email: "charlie@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-05-22"),
  },
  {
    id: 6,
    nik: generateNIK(5),
    name: "Eva Martinez",
    email: "eva@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-06-30"),
  },
  {
    id: 7,
    nik: generateNIK(6),
    name: "David Lee",
    email: "david@example.com",
    status: "Inactive",
    role: "User",
    date: new Date("2023-07-15"),
  },
  {
    id: 8,
    nik: generateNIK(7),
    name: "Willy Test",
    email: "charlie@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-05-22"),
  },
  {
    id: 9,
    nik: generateNIK(8),
    name: "Elon Musk",
    email: "elon@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-06-30"),
  },
  {
    id: 10,
    nik: generateNIK(9),
    name: "Mark Zuckerberg",
    email: "mark@example.com",
    status: "Active",
    role: "User",
    date: new Date("2023-06-30"),
  },
];

// Columns Definition
const columns = [
  { header: "NIK", accessor: "nik" },
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email" },
  {
    header: "Status",
    accessor: "status",
    render: (value: string) => (
      <span className={value === "Active" ? "text-green-500" : "text-red-500"}>
        {value}
      </span>
    ),
  },
  { header: "Role", accessor: "role" },
  {
    header: "Date",
    accessor: "date",
    render: (value: Date) => formatDate(value), // Use formatDate utility
  },
];

// Define the excluded accessors as an array
const excludedAccessors = ["date", "status"];

export default function Page() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader allowedRoles={["ADMIN"]} />
      <ManagementContent
        sampleData={sampleData}
        columns={columns}
        excludedAccessors={excludedAccessors}
      />
    </div>
  );
}
