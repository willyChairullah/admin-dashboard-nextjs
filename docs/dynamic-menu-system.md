# Dynamic Menu System

Sistem menu sidebar yang dinamis berdasarkan permissions di database. Menu akan otomatis muncul ketika permission baru ditambahkan ke database tanpa perlu edit kode.

## Cara Kerja

### 1. Struktur Permission

Format permission: `module.page.action`

- **module**: sales, inventory, purchasing, finance, hr
- **page**: Nama halaman dalam PascalCase (contoh: QuotationManagement, SalesOrder)
- **action**: View, Create, Edit, Delete

### 2. Auto-generation Menu

Sistem akan otomatis:

- **Membaca semua permissions** yang dimiliki user
- **Memfilter permission dengan action "View"** untuk dijadikan menu item
- **Auto-generate label dan href** jika page belum terdefinisi di PAGE_CONFIG
- **Mengurutkan menu** berdasarkan MODULE_CONFIG.order

### 3. Menambah Menu Baru

#### Cara 1: Langsung ke Database

```sql
-- Tambah permission baru
INSERT INTO permissions (module, page, action, name, description)
VALUES ('sales', 'QuotationManagement', 'View', 'sales.QuotationManagement.View', 'View Quotation Management');

-- Assign ke role
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('role_id_admin', 'permission_id_baru');
```

#### Cara 2: Menggunakan Script

```typescript
// scripts/add-permission.ts
const permission = await prisma.permissions.create({
  data: {
    module: "sales",
    page: "QuotationManagement",
    action: "View",
    name: "sales.QuotationManagement.View",
    description: "View Quotation Management",
  },
});
```

### 4. Auto-generated Properties

Jika page belum ada di `PAGE_CONFIG`, sistem akan auto-generate:

- **Label**: PascalCase → Readable format
  - `QuotationManagement` → `"Quotation Management"`
- **Href**: module + kebab-case page
  - `sales` + `QuotationManagement` → `"/sales/quotation-management"`
- **Dashboard detection**: jika page mengandung kata "dashboard"
  - `SalesDashboard` → `"/sales"` (tanpa suffix)

### 5. Urutan Menu

Menu diurutkan berdasarkan:

1. **Module order** (dari `MODULE_CONFIG.order`)
2. **Dashboard items first** (href dengan 2 segment: `/sales`)
3. **Alphabetical** untuk non-dashboard items

### 6. Contoh Hasil

Ketika user memiliki permissions:

```
sales.SalesDashboard.View
sales.SalesOrder.View
sales.QuotationManagement.View
```

Menu yang dihasilkan:

```
📁 Sales
  🏠 Sales Dashboard (/sales)
  📄 Quotation Management (/sales/quotation-management)
  📄 Sales Order (SO) (/sales/orders)
```

## Keuntungan Sistem Dinamis

✅ **Tidak perlu edit kode** untuk menambah menu baru  
✅ **Konsisten dengan permission system**  
✅ **Auto-generated labels dan URLs**  
✅ **Role-based menu filtering**  
✅ **Backward compatible** dengan PAGE_CONFIG yang sudah ada

## Catatan

- Hanya permission dengan action "View" yang dijadikan menu item
- Module baru perlu ditambahkan di `MODULE_CONFIG`
- Untuk customisasi label/href yang spesifik, tetap bisa ditambahkan di `PAGE_CONFIG`
