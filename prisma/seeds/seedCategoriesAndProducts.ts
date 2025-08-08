import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

export async function seedCategoriesAndProducts(prisma: PrismaClient) {
  console.log("📦 Creating categories and products...");

  const oilCategory = await prisma.categories.create({
    data: {
      id: uuid(),
      code: "KTG/04/2025/0001",
      name: "Minyak",
      description: "Berbagai jenis minyak goreng",
      isActive: true,
      updatedAt: new Date(),
    },
  });

  const productsToCreate = [
    {
      id: uuid(),
      code: "PDK/04/2025/0001",
      name: "Minyak Indana 250 ml",
      unit: "Pcs",
      price: 7000,
      cost: 5000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      code: "PDK/04/2025/0002",
      name: "Minyak Indana 500 ml",
      unit: "Pcs",
      price: 13000,
      cost: 10000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      code: "PDK/04/2025/0003",
      name: "Minyak Indana 800 ml",
      unit: "Pcs",
      price: 18000,
      cost: 14000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      code: "PDK/04/2025/0004",
      name: "Minyak Indana 900 ml",
      unit: "Pcs",
      price: 20000,
      cost: 16000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      code: "PDK/04/2025/0005",
      name: "Minyak Indana 1 Liter",
      unit: "Pcs",
      price: 22000,
      cost: 18000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
    {
      id: uuid(),
      code: "PDK/04/2025/0006",
      name: "Minyak Kita 1 Liter",
      unit: "Pcs",
      price: 15000,
      cost: 12000,
      currentStock: 100,
      categoryId: oilCategory.id,
      updatedAt: new Date(),
    },
  ];

  for (const productData of productsToCreate) {
    await prisma.products.create({ data: productData });
  }

  console.log("✅ Categories and products created.");
  return prisma.products.findMany();
}
