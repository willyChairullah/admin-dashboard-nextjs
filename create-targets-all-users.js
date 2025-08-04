const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTargetsForAllUsers() {
  try {
    console.log("Creating targets for Admin and Owner users...");

    // Admin User - give them some targets with partial achievement
    const adminUserId = "364e1a62-c61b-4583-9baf-2c518fce0a4d";

    // Delete old admin targets
    await prisma.salesTargets.deleteMany({
      where: { userId: adminUserId },
    });

    // Create targets for admin (they won't have invoices, so 0% achievement)
    const adminTargets = [
      { period: "2025-02", target: 5000000 },
      { period: "2025-03", target: 5500000 },
      { period: "2025-04", target: 4800000 },
      { period: "2025-05", target: 6000000 },
      { period: "2025-06", target: 6500000 },
      { period: "2025-07", target: 5000000 },
    ];

    for (const targetData of adminTargets) {
      await prisma.salesTargets.create({
        data: {
          userId: adminUserId,
          targetType: "MONTHLY",
          targetPeriod: targetData.period,
          targetAmount: targetData.target,
          isActive: true,
        },
      });

      console.log(
        `Created admin target for ${targetData.period}: ${targetData.target}`
      );
    }

    // Owner User
    const ownerUserId = "264e1a62-c61b-4583-9baf-2c518fce0a4d";

    // Delete old owner targets
    await prisma.salesTargets.deleteMany({
      where: { userId: ownerUserId },
    });

    // Create targets for owner
    const ownerTargets = [
      { period: "2025-07", target: 3000000 },
      { period: "2025-08", target: 3500000 },
    ];

    for (const targetData of ownerTargets) {
      await prisma.salesTargets.create({
        data: {
          userId: ownerUserId,
          targetType: "MONTHLY",
          targetPeriod: targetData.period,
          targetAmount: targetData.target,
          isActive: true,
        },
      });

      console.log(
        `Created owner target for ${targetData.period}: ${targetData.target}`
      );
    }

    console.log(
      "\nAll users now have current targets. The progress bars should work!"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTargetsForAllUsers();
