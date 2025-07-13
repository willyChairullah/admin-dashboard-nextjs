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
      context: "Dashboard",
      action: "View",
      name: "sales.Dashboard.View",
      description: "View Sales Dashboard",
    },
    {
      module: "sales",
      context: "Content",
      action: "View",
      name: "sales.Content.View",
      description: "View Sales Content",
    },
    {
      module: "sales",
      context: "Content",
      action: "Create",
      name: "sales.Content.Create",
      description: "Create Sales Records",
    },
    {
      module: "sales",
      context: "Content",
      action: "Edit",
      name: "sales.Content.Edit",
      description: "Edit Sales Records",
    },
    {
      module: "sales",
      context: "Content",
      action: "Delete",
      name: "sales.Content.Delete",
      description: "Delete Sales Records",
    },

    // Inventory Module
    {
      module: "inventory",
      context: "Dashboard",
      action: "View",
      name: "inventory.Dashboard.View",
      description: "View Inventory Dashboard",
    },
    {
      module: "inventory",
      context: "Master",
      action: "View",
      name: "inventory.Master.View",
      description: "View Item Master Data",
    },
    {
      module: "inventory",
      context: "Master",
      action: "Create",
      name: "inventory.Master.Create",
      description: "Create Item Master Data",
    },
    {
      module: "inventory",
      context: "Master",
      action: "Edit",
      name: "inventory.Master.Edit",
      description: "Edit Item Master Data",
    },
    {
      module: "inventory",
      context: "Master",
      action: "Delete",
      name: "inventory.Master.Delete",
      description: "Delete Item Master Data",
    },
    {
      module: "inventory",
      context: "Content",
      action: "View",
      name: "inventory.Content.View",
      description: "View Inventory Content",
    },
    {
      module: "inventory",
      context: "Content",
      action: "Edit",
      name: "inventory.Content.Edit",
      description: "Edit Stock Levels",
    },

    // Purchasing Module
    {
      module: "purchasing",
      context: "Content",
      action: "View",
      name: "purchasing.Content.View",
      description: "View Purchase Orders",
    },
    {
      module: "purchasing",
      context: "Content",
      action: "Create",
      name: "purchasing.Content.Create",
      description: "Create Purchase Orders",
    },
    {
      module: "purchasing",
      context: "Content",
      action: "Edit",
      name: "purchasing.Content.Edit",
      description: "Edit Purchase Orders",
    },
    {
      module: "purchasing",
      context: "Content",
      action: "Delete",
      name: "purchasing.Content.Delete",
      description: "Delete Purchase Orders",
    },

    // Finance Module
    {
      module: "finance",
      context: "Content",
      action: "View",
      name: "finance.Content.View",
      description: "View Financial Records",
    },
    {
      module: "finance",
      context: "Content",
      action: "Create",
      name: "finance.Content.Create",
      description: "Create Financial Records",
    },
    {
      module: "finance",
      context: "Content",
      action: "Edit",
      name: "finance.Content.Edit",
      description: "Edit Financial Records",
    },
    {
      module: "finance",
      context: "Content",
      action: "Delete",
      name: "finance.Content.Delete",
      description: "Delete Financial Records",
    },

    // HR Module
    {
      module: "hr",
      context: "Content",
      action: "View",
      name: "hr.Content.View",
      description: "View HR Records",
    },
    {
      module: "hr",
      context: "Content",
      action: "Create",
      name: "hr.Content.Create",
      description: "Create HR Records",
    },
    {
      module: "hr",
      context: "Content",
      action: "Edit",
      name: "hr.Content.Edit",
      description: "Edit HR Records",
    },
    {
      module: "hr",
      context: "Content",
      action: "Delete",
      name: "hr.Content.Delete",
      description: "Delete HR Records",
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
