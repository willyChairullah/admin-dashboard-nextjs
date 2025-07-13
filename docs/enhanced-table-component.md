# Enhanced Table Component Documentation

Komponen Table yang telah ditingkatkan dengan fitur sorting, filtering, responsive design yang lebih baik, dan pagination yang lengkap.

## Fitur-fitur Baru

### 1. Sorting

- **Klik header kolom** untuk mengurutkan data
- **Tiga state**: ascending, descending, dan no sort
- **Visual indicator** dengan ikon panah
- **Configurable per kolom** dengan property `sortable`
- **Support client-side dan server-side** sorting

### 2. Filtering

- **Search bar** dengan dropdown pemilih kolom
- **Real-time filtering** saat mengetik
- **Configurable per kolom** dengan property `filterable`
- **Support client-side dan server-side** filtering

### 3. Responsive Design yang Ditingkatkan

- **Desktop (lg+)**: Tabel penuh dengan semua fitur
- **Tablet (md-lg)**: Tabel dengan kolom yang lebih compact dan scroll horizontal
- **Mobile (sm)**: Card view yang optimal untuk layar kecil

### 4. Pagination yang Lengkap

- **Numbered pages** dengan smart ellipsis
- **Page size selector** (5, 10, 25, 50, 100)
- **Items counter** showing "X to Y of Z results"
- **Quick navigation** dengan Previous/Next buttons

## Props Interface

```typescript
interface TableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;

  // Sorting & Filtering
  enableSorting?: boolean;
  enableFiltering?: boolean;
  onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  onFilter?: (column: string, value: string) => void;
}

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean; // Default: true
  filterable?: boolean; // Default: true
}
```

## Penggunaan

### Basic Usage

```tsx
const columns = [
  {
    header: "Name",
    accessor: "name",
    sortable: true,
    filterable: true,
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
    filterable: true,
  },
  {
    header: "Status",
    accessor: "status",
    render: value => <Badge variant={value}>{value}</Badge>,
  },
];

<Table
  columns={columns}
  data={data}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  totalItems={totalItems}
/>;
```

### Server-side Processing

```tsx
<Table
  columns={columns}
  data={data}
  onSort={(column, direction) => {
    // Handle server-side sorting
    fetchData({ sortColumn: column, sortDirection: direction });
  }}
  onFilter={(column, value) => {
    // Handle server-side filtering
    fetchData({ filterColumn: column, filterValue: value });
  }}
  // ... other props
/>
```

### Disable Sorting/Filtering for Specific Columns

```tsx
const columns = [
  {
    header: "Actions",
    accessor: "actions",
    sortable: false, // Disable sorting
    filterable: false, // Disable filtering
    render: (value, row) => <ActionButtons row={row} />,
  },
];
```

## Responsive Breakpoints

- **Mobile**: `< 768px` - Card view
- **Tablet**: `768px - 1024px` - Compact table with horizontal scroll
- **Desktop**: `> 1024px` - Full table

## Styling

Komponen menggunakan Tailwind CSS dengan support untuk:

- **Dark mode** automatic
- **Hover effects** pada rows dan buttons
- **Focus states** untuk accessibility
- **Loading skeletons** yang responsive

## Best Practices

1. **Performance**: Untuk dataset besar, gunakan server-side processing
2. **Accessibility**: Header kolom memiliki proper ARIA labels
3. **Mobile UX**: Card view memberikan pengalaman optimal di mobile
4. **Loading States**: Selalu handle loading state untuk UX yang baik

## Migration dari Versi Lama

Komponen tetap backward compatible. Props lama masih bekerja:

```tsx
// Old usage - still works
<Table columns={columns} data={data} />

// New features optional
<Table
  columns={columns}
  data={data}
  enableSorting={true}
  enableFiltering={true}
  pageSize={25}
  onPageSizeChange={setPageSize}
/>
```
