import { ManagementHeader, ManagementContent } from "@/components/ui"; // Ganti dengan DynamicManagementContent
import { getCategories } from "@/lib/actions/categories";
// import { generateMonthlyCode } from "@/utils/generateCode";

// Columns Definition for Categories (without render functions for server component)
const columns = [
  { header: "Name", accessor: "name" },
  { header: "Description", accessor: "description" },
  { header: "Status", accessor: "isActive" },
  { header: "Products Count", accessor: "_count.products" },
  { header: "Created Date", accessor: "createdAt" },
];

// Define the excluded accessors as an array (these fields won't be shown in forms)
const excludedAccessors = ["name", "description", "isActive"];

export default async function CategoryPage() {
  // Fetch categories data from database
  const categoriesData = await getCategories();

  // const newCode = await generateMonthlyCode("INV", "invoice"); // 'INV' sebagai moduleName, 'invoice' sebagai modelTable
  // console.log("Generated Invoice Code:", newCode);
  console.log("testing");

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="Category"
        mainPageName="/category"
        allowedRoles={["ADMIN", "OWNER"]}
      />
      <ManagementContent
        sampleData={categoriesData}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="createdAt" // Menentukan kolom tanggal
        emptyMessage="No categories found" // Pesan kosong jika tidak ada data
        linkPath="/category" // Jalur untuk tautan edit
      />
    </div>
  );
}
