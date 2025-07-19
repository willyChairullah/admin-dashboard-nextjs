// src/utils/generateCode.ts
import db from "@/lib/db"; // Import Prisma connection

// Define the type for order entries
interface OrderEntry {
  moduleName: string;
  modelName: "users";
  month: string;
  year: number;
  order: number;
}

// Define possible model names as a union type
type ModelName = "users";

/**
 * Fetches the current order based on module, model, month, and year from the database using Prisma.
 * @param {string} moduleName - The name of the module.
 * @param {ModelName} modelName - The name of the model (e.g., 'order').
 * @param {string} month - The month (format: MM).
 * @param {number} year - The year (format: YYYY).
 * @returns {Promise<number>} - The last current order.
 */
const fetchCurrentOrder = async (
  moduleName: string,
  modelName: ModelName,
  month: string,
  year: number
): Promise<number> => {
  const currentMonthRecord = await db[modelName].findFirst({
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  return currentMonthRecord ? currentMonthRecord.order : 0;
};

/**
 * Generates a monthly code based on the module name and specified order.
 * @param {string} moduleName - The module name for which to generate the code.
 * @param {ModelName} modelTable - The name of the model to query.
 * @param {number} initialOrder - The initial order to use.
 * @returns {Promise<string>} - The code in the format: (Module Name)/(Month)/(Year)/(Order).
 */
const generateMonthlyCode = async (
  moduleName: string,
  modelTable: ModelName,
  initialOrder: number
): Promise<string> => {
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month starts from zero
    const year = now.getFullYear();
    return { month, year };
  };

  // Get current month and year
  const { month, year } = getCurrentMonthYear();

  // Fetch the current order from the database using the dynamic model
  const currentOrder = await fetchCurrentOrder(moduleName, modelTable, month, year);

  // Calculate new order
  const newOrder = initialOrder || currentOrder + 1; // If initialOrder not set, use currentOrder + 1

  // Format the order as 4 digits, e.g., 0001
  const formattedOrder = String(newOrder).padStart(4, "0");

  // Generate the new code in the specified format
  return `${moduleName}/${month}/${year}/${formattedOrder}`;
};

// Export functions for use in other modules
export { generateMonthlyCode };
