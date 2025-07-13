import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addNewPermission() {
  console.log("🔧 Adding new permission to database...");

  try {
    // Add new permission for Quotation Management in Sales module
    const newPermission = await prisma.permissions.create({
      data: {
        module: "sales",
        page: "QuotationManagement",
        action: "View",
        name: "sales.QuotationManagement.View",
        description: "View Quotation Management",
      },
    });

    console.log("✅ New permission created:", newPermission);

    // Add permission to Admin role
    const adminRole = await prisma.roles.findFirst({
      where: { role_name: "Admin" },
    });

    if (adminRole) {
      await prisma.role_permissions.create({
        data: {
          role_id: adminRole.id,
          permission_id: newPermission.id,
        },
      });

      console.log("✅ Permission assigned to Admin role");
    }

    // Add more permissions for CRUD operations
    const crudActions = ["Create", "Edit", "Delete"];

    for (const action of crudActions) {
      const permission = await prisma.permissions.create({
        data: {
          module: "sales",
          page: "QuotationManagement",
          action: action,
          name: `sales.QuotationManagement.${action}`,
          description: `${action} Quotation Management`,
        },
      });

      if (adminRole) {
        await prisma.role_permissions.create({
          data: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        });
      }
    }

    console.log("🎉 All Quotation Management permissions added successfully!");
  } catch (error) {
    console.error("❌ Error adding permissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewPermission();
