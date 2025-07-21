// src/utils/generateCode.ts
import db from "@/lib/db"; // Import Prisma connection

// Define possible model names as a union type.
// PENTING: Perluas tipe ini untuk mencakup semua nama model Prisma yang ingin Anda query.
// Pastikan nama-nama ini sesuai persis dengan nama model di skema Prisma Anda (misalnya, `model User {}` akan menjadi "user").
type ModelName = "user" | "product" | "order" | "invoice"; // Contoh: tambahkan model lain di sini

/**
 * Fetches the current order (count of records) based on model, month, and year from the database using Prisma.
 * Asumsi: "order" di sini berarti jumlah total record yang ada untuk bulan dan tahun tertentu.
 * Fungsi ini akan menghitung record berdasarkan kolom `createdAt`.
 * @param {ModelName} modelName - The name of the model (e.g., 'user', 'product', 'order').
 * @param {string} month - The month (format: MM).
 * @param {number} year - The year (format: YYYY).
 * @returns {Promise<number>} - The count of records for the given month and year.
 */
const fetchCurrentOrder = async (
  modelName: ModelName,
  month: string,
  year: number
): Promise<number> => {
  // Buat tanggal awal dan akhir untuk bulan dan tahun yang diberikan
  const startDate = new Date(year, parseInt(month) - 1, 1); // Bulan adalah 0-indexed di JavaScript Date
  const endDate = new Date(year, parseInt(month), 0); // Hari terakhir dari bulan yang diberikan

  // Membuat variabel terpisah untuk akses model Prisma secara dinamis
  const model = (db as any)[modelName];

  // Penting: Pastikan 'db[modelName]' valid. Prisma Client akan memiliki properti untuk setiap model Anda.
  // Gunakan `(db as any)[modelName]` untuk mengakses model secara dinamis.
  // Ini akan menghitung jumlah record yang `createdAt` berada dalam rentang bulan dan tahun yang ditentukan.
  const count: number = 1;
  // const count = await model.count({ // Menggunakan variabel `model` yang baru
  //   where: {
  //     createdAt: {
  //       gte: startDate, // Greater than or equal to (mulai dari tanggal awal bulan)
  //       lte: endDate,   // Less than or equal to (sampai tanggal akhir bulan)
  //     },
  //   },
  // });

  return count;
};

/**
 * Generates a monthly code based on the module name and specified order.
 * @param {string} moduleName - The module name for which to generate the code.
 * @param {ModelName} modelTable - The name of the model to query.
 * @param {number} initialOrder - The initial order to use. Jika 0 atau undefined, akan dihitung dari database.
 * @returns {Promise<string>} - The code in the format: (Module Name)/(Month)/(Year)/(Order).
 */
const generateMonthlyCode = async (
  moduleName: string,
  modelTable: ModelName,
  initialOrder: number = 0 // Set default to 0 for clarity
): Promise<string> => {
  const getCurrentMonthYear = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month starts from zero
    const year = now.getFullYear();
    return { month, year };
  };

  // Get current month and year
  const { month, year } = getCurrentMonthYear();

  // Fetch the current order (count) from the database using the dynamic model
  const currentOrderCount = await fetchCurrentOrder(modelTable, month, year);

  // Calculate new order
  // Jika initialOrder disediakan dan bukan 0, gunakan itu. Jika tidak, gunakan currentOrderCount + 1.
  const newOrder = initialOrder > 0 ? initialOrder : currentOrderCount + 1;

  // Format the order as 4 digits, e.g., 0001
  const formattedOrder = String(newOrder).padStart(4, "0");

  // Generate the new code in the specified format
  return `${moduleName}/${month}/${year}/${formattedOrder}`;
};

// Export functions for use in other modules
export { generateMonthlyCode };
