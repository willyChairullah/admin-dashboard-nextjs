import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTaxes() {
  console.log("🌱 Seeding taxes...");

  const taxes = [
    {
      nominal: "0",
      notes: "Bebas Pajak",
    },
    {
      nominal: "11",
      notes: "PPN 11%",
    },
    {
      nominal: "12",
      notes: "PPN 12%",
    },
  ];

  try {
    // Delete existing taxes if any
    await prisma.taxs.deleteMany({});
    console.log("🗑️  Cleared existing taxes");

    // Create new taxes
    for (const tax of taxes) {
      await prisma.taxs.create({
        data: tax,
      });
      console.log(`✅ Created tax: ${tax.nominal}% - ${tax.notes}`);
    }

    console.log("✅ Tax seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding taxes:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTaxes()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
