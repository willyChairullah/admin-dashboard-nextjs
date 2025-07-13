import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create permissions
  console.log("📋 Creating permissions...");

  const permissions = [
    // Sales Module
    {
      module: "sales",
      page: "SalesDashboard",
      action: "View",
      name: "sales.SalesDashboard.View",
      description: "View Sales Dashboard",
    },
    {
      module: "sales",
      page: "SalesOrder",
      action: "View",
      name: "sales.SalesOrder.View",
      description: "View Sales Orders",
    },
    {
      module: "sales",
      page: "SalesOrder",
      action: "Create",
      name: "sales.SalesOrder.Create",
      description: "Create Sales Orders",
    },
    {
      module: "sales",
      page: "SalesOrder",
      action: "Edit",
      name: "sales.SalesOrder.Edit",
      description: "Edit Sales Orders",
    },
    {
      module: "sales",
      page: "SalesOrder",
      action: "Delete",
      name: "sales.SalesOrder.Delete",
      description: "Delete Sales Orders",
    },
    {
      module: "sales",
      page: "DeliveryOrder",
      action: "View",
      name: "sales.DeliveryOrder.View",
      description: "View Delivery Orders",
    },
    {
      module: "sales",
      page: "DeliveryOrder",
      action: "Create",
      name: "sales.DeliveryOrder.Create",
      description: "Create Delivery Orders",
    },
    {
      module: "sales",
      page: "DeliveryOrder",
      action: "Edit",
      name: "sales.DeliveryOrder.Edit",
      description: "Edit Delivery Orders",
    },
    {
      module: "sales",
      page: "DeliveryOrder",
      action: "Delete",
      name: "sales.DeliveryOrder.Delete",
      description: "Delete Delivery Orders",
    },
    {
      module: "sales",
      page: "Invoice",
      action: "View",
      name: "sales.Invoice.View",
      description: "View Invoices",
    },
    {
      module: "sales",
      page: "Invoice",
      action: "Create",
      name: "sales.Invoice.Create",
      description: "Create Invoices",
    },
    {
      module: "sales",
      page: "Invoice",
      action: "Edit",
      name: "sales.Invoice.Edit",
      description: "Edit Invoices",
    },
    {
      module: "sales",
      page: "Invoice",
      action: "Delete",
      name: "sales.Invoice.Delete",
      description: "Delete Invoices",
    },
    {
      module: "sales",
      page: "SalesReturn",
      action: "View",
      name: "sales.SalesReturn.View",
      description: "View Sales Returns",
    },
    {
      module: "sales",
      page: "SalesReturn",
      action: "Create",
      name: "sales.SalesReturn.Create",
      description: "Create Sales Returns",
    },
    {
      module: "sales",
      page: "SalesReturn",
      action: "Edit",
      name: "sales.SalesReturn.Edit",
      description: "Edit Sales Returns",
    },
    {
      module: "sales",
      page: "SalesReturn",
      action: "Delete",
      name: "sales.SalesReturn.Delete",
      description: "Delete Sales Returns",
    },

    // Inventory Module
    {
      module: "inventory",
      page: "StockDashboard",
      action: "View",
      name: "inventory.StockDashboard.View",
      description: "View Stock Dashboard",
    },
    {
      module: "inventory",
      page: "ItemList",
      action: "View",
      name: "inventory.ItemList.View",
      description: "View Item List (Master Data)",
    },
    {
      module: "inventory",
      page: "ItemList",
      action: "Create",
      name: "inventory.ItemList.Create",
      description: "Create Items in Master Data",
    },
    {
      module: "inventory",
      page: "ItemList",
      action: "Edit",
      name: "inventory.ItemList.Edit",
      description: "Edit Items in Master Data",
    },
    {
      module: "inventory",
      page: "ItemList",
      action: "Delete",
      name: "inventory.ItemList.Delete",
      description: "Delete Items from Master Data",
    },
    {
      module: "inventory",
      page: "StockManagement",
      action: "View",
      name: "inventory.StockManagement.View",
      description: "View Stock Management",
    },
    {
      module: "inventory",
      page: "StockManagement",
      action: "Edit",
      name: "inventory.StockManagement.Edit",
      description: "Edit Stock Levels",
    },
    {
      module: "inventory",
      page: "StockTaking",
      action: "View",
      name: "inventory.StockTaking.View",
      description: "View Stock Taking",
    },
    {
      module: "inventory",
      page: "StockTaking",
      action: "Create",
      name: "inventory.StockTaking.Create",
      description: "Create Stock Taking",
    },
    {
      module: "inventory",
      page: "StockTaking",
      action: "Edit",
      name: "inventory.StockTaking.Edit",
      description: "Edit Stock Taking",
    },

    // Purchasing Module
    {
      module: "purchasing",
      page: "PurchaseOrder",
      action: "View",
      name: "purchasing.PurchaseOrder.View",
      description: "View Purchase Orders",
    },
    {
      module: "purchasing",
      page: "PurchaseOrder",
      action: "Create",
      name: "purchasing.PurchaseOrder.Create",
      description: "Create Purchase Orders",
    },
    {
      module: "purchasing",
      page: "PurchaseOrder",
      action: "Edit",
      name: "purchasing.PurchaseOrder.Edit",
      description: "Edit Purchase Orders",
    },
    {
      module: "purchasing",
      page: "PurchaseOrder",
      action: "Delete",
      name: "purchasing.PurchaseOrder.Delete",
      description: "Delete Purchase Orders",
    },
    {
      module: "purchasing",
      page: "POPayments",
      action: "View",
      name: "purchasing.POPayments.View",
      description: "View PO Payments",
    },
    {
      module: "purchasing",
      page: "POPayments",
      action: "Create",
      name: "purchasing.POPayments.Create",
      description: "Create PO Payments",
    },
    {
      module: "purchasing",
      page: "POPayments",
      action: "Edit",
      name: "purchasing.POPayments.Edit",
      description: "Edit PO Payments",
    },
    {
      module: "purchasing",
      page: "POPayments",
      action: "Delete",
      name: "purchasing.POPayments.Delete",
      description: "Delete PO Payments",
    },

    // Finance Module
    {
      module: "finance",
      page: "Revenue",
      action: "View",
      name: "finance.Revenue.View",
      description: "View Revenue Records",
    },
    {
      module: "finance",
      page: "Revenue",
      action: "Create",
      name: "finance.Revenue.Create",
      description: "Create Revenue Records",
    },
    {
      module: "finance",
      page: "Revenue",
      action: "Edit",
      name: "finance.Revenue.Edit",
      description: "Edit Revenue Records",
    },
    {
      module: "finance",
      page: "Revenue",
      action: "Delete",
      name: "finance.Revenue.Delete",
      description: "Delete Revenue Records",
    },
    {
      module: "finance",
      page: "Expenses",
      action: "View",
      name: "finance.Expenses.View",
      description: "View Expense Records",
    },
    {
      module: "finance",
      page: "Expenses",
      action: "Create",
      name: "finance.Expenses.Create",
      description: "Create Expense Records",
    },
    {
      module: "finance",
      page: "Expenses",
      action: "Edit",
      name: "finance.Expenses.Edit",
      description: "Edit Expense Records",
    },
    {
      module: "finance",
      page: "Expenses",
      action: "Delete",
      name: "finance.Expenses.Delete",
      description: "Delete Expense Records",
    },

    // HR Module
    {
      module: "hr",
      page: "Attendance",
      action: "View",
      name: "hr.Attendance.View",
      description: "View Attendance Records",
    },
    {
      module: "hr",
      page: "Attendance",
      action: "Create",
      name: "hr.Attendance.Create",
      description: "Create Attendance Records",
    },
    {
      module: "hr",
      page: "Attendance",
      action: "Edit",
      name: "hr.Attendance.Edit",
      description: "Edit Attendance Records",
    },
    {
      module: "hr",
      page: "Attendance",
      action: "Delete",
      name: "hr.Attendance.Delete",
      description: "Delete Attendance Records",
    },
  ];

  const createdPermissions = [];
  for (const permission of permissions) {
    try {
      const created = await prisma.permissions.create({
        data: permission,
      });
      createdPermissions.push(created);
    } catch (error) {
      // Permission might already exist, try to find it
      const existing = await prisma.permissions.findFirst({
        where: {
          name: permission.name,
        },
      });
      if (existing) {
        createdPermissions.push(existing);
      }
    }
  }

  console.log(`✅ Created/found ${createdPermissions.length} permissions`);

  // Create roles
  console.log("👥 Creating roles...");

  const roles = [
    {
      role_name: "Admin",
      description: "Full system administrator with all permissions",
      login_destination: "/",
      default_context: "content",
    },
    {
      role_name: "Sales",
      description: "Sales team member with sales module access",
      login_destination: "/sales",
      default_context: "content",
    },
    {
      role_name: "Warehouse",
      description: "Warehouse staff with inventory management access",
      login_destination: "/inventory",
      default_context: "content",
    },
  ];

  const createdRoles = [];
  for (const role of roles) {
    try {
      const created = await prisma.roles.create({
        data: role,
      });
      createdRoles.push(created);
    } catch (error) {
      // Role might already exist, try to find it
      const existing = await prisma.roles.findFirst({
        where: {
          role_name: role.role_name,
        },
      });
      if (existing) {
        createdRoles.push(existing);
      }
    }
  }

  console.log("✅ Created/found roles");

  // Assign permissions to roles
  console.log("🔗 Assigning permissions to roles...");

  const adminRole = createdRoles.find(r => r.role_name === "Admin");
  const salesRole = createdRoles.find(r => r.role_name === "Sales");
  const warehouseRole = createdRoles.find(r => r.role_name === "Warehouse");

  if (adminRole) {
    // Admin gets all permissions
    for (const permission of createdPermissions) {
      try {
        await prisma.role_permissions.create({
          data: {
            role_id: adminRole.id,
            permission_id: permission.id,
          },
        });
      } catch (error) {
        // Permission assignment might already exist
      }
    }
  }

  if (salesRole) {
    // Sales gets sales permissions - find by name prefix
    const salesPermissions = createdPermissions.filter(p =>
      p.name.startsWith("sales.")
    );
    for (const permission of salesPermissions) {
      try {
        await prisma.role_permissions.create({
          data: {
            role_id: salesRole.id,
            permission_id: permission.id,
          },
        });
      } catch (error) {
        // Permission assignment might already exist
      }
    }
  }

  if (warehouseRole) {
    // Warehouse gets inventory permissions (excluding delete)
    const warehousePermissions = createdPermissions.filter(
      p => p.name.startsWith("inventory.") && !p.name.includes(".Delete")
    );
    for (const permission of warehousePermissions) {
      try {
        await prisma.role_permissions.create({
          data: {
            role_id: warehouseRole.id,
            permission_id: permission.id,
          },
        });
      } catch (error) {
        // Permission assignment might already exist
      }
    }
  }

  console.log("✅ Assigned permissions to roles");

  // Create test users
  console.log("👤 Creating test users...");

  const testUsers = [
    {
      name: "Admin User",
      email: "admin@indana.com",
      password: "password123", // In real app, this should be hashed
      roleName: "Admin",
    },
    {
      name: "Sales User",
      email: "sales@indana.com",
      password: "password123",
      roleName: "Sales",
    },
    {
      name: "Warehouse User",
      email: "warehouse@indana.com",
      password: "password123",
      roleName: "Warehouse",
    },
  ];

  for (const userData of testUsers) {
    const role = createdRoles.find(r => r.role_name === userData.roleName);
    if (role) {
      try {
        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            roles: {
              connect: { id: role.id },
            },
          },
        });
      } catch (error) {
        // User might already exist
        console.log(`User ${userData.email} might already exist`);
      }
    }
  }

  console.log("✅ Created test users");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("Admin: admin@indana.com / password123");
  console.log("Sales: sales@indana.com / password123");
  console.log("Warehouse: warehouse@indana.com / password123");
}

main()
  .catch(e => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
