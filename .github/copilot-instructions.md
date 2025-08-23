I want to create a CRUD page from this database:

## Database

```
make a new table database from invoice and item but just take manual flow in that table not using product in child table
```

## Reference

Consistance layout and style will reference the folder page "/sales/invoice"
ambil semua input form pada tabel hanya diambil bagian manual saja bukan yang produk
Use custom UI from Components/UI

## application flow:

1. Saya ingin membuat sebuah halaman baru diaman ini akan hampir sama seprti pada invoice

## I want to make flow number 5

In the Sidebar Page, it will be named the "Pengeularan" module. The page created will be placed at the path "purchasing/pengeularan" and read on layout.tsx will contain this data:
const myStaticData = {
module: "purchasing",
subModule: "pengeularan",
allowedRole: ["OWNER", "ADMIN"],
data: await getCategories(), // adjust according to the data retrieval
};

### Main Features:

bisa menambahkan pengeluaran seperti pada form manual di invoice

### Data Storage:

Save to new Database