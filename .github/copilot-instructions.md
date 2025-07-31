Berdasarkan analisis skema Prisma dan kode form, ada beberapa kekurangan pada sistem Purchase Order (PO) Anda, baik dari sisi data maupun fungsionalitas.

Secara singkat, PO Anda terlalu kaku, kurang memiliki data finansial historis, dan tidak fleksibel untuk beberapa skenario gudang yang umum terjadi.

Kekurangan pada Skema & Data
Kekurangan ini berkaitan dengan cara data disimpan di database, yang berdampak pada pelaporan dan keakuratan data jangka panjang.

Tidak Menyimpan Harga & Total per Item (Price Snapshot) 📸

Kekurangan: Model PurchaseOrderItems Anda hanya menyimpan quantity dan productId. Harga (price) tidak disimpan, melainkan hanya ditampilkan di antarmuka dengan mengambil data dari Order asli.

Risiko: Jika harga produk pada Order asli atau di master data Products berubah di masa depan, Anda akan kehilangan data harga historis saat PO ini dibuat. PO seharusnya menjadi dokumen yang "membekukan" detail transaksi pada satu waktu.

Solusi: Tambahkan field price dan totalPrice di model PurchaseOrderItems.

Tidak Menyimpan Total Nilai PO 💰

Kekurangan: Model PurchaseOrders Anda tidak memiliki kolom untuk menyimpan total nilai dari PO tersebut (misalnya totalAmount). Total nilai hanya dihitung di front-end untuk ditampilkan.

Risiko: Anda tidak bisa melakukan query atau membuat laporan untuk melihat total nilai dari semua PO yang sedang PENDING atau PROCESSING langsung dari database.

Solusi: Tambahkan field totalAmount di model PurchaseOrders.

Relasi Terlalu Kaku (Satu Order untuk Satu PO) ⛓️

Kekurangan: Anda menggunakan @unique pada orderId di model PurchaseOrders. Ini berarti satu Order hanya bisa dibuatkan satu PO.

Risiko: Ini tidak fleksibel. Bagaimana jika satu Order besar dari pelanggan perlu diproses dalam dua pengiriman terpisah? Anda tidak bisa membuat dua PO terpisah untuk satu Order yang sama.

Solusi: Hapus @unique dari orderId jika Anda ingin memungkinkan skenario pemisahan pemenuhan pesanan.

Kekurangan pada Fungsionalitas & Alur Kerja
Kekurangan ini berkaitan dengan pengalaman pengguna (UX) dan batasan alur kerja pada form yang Anda buat.

Item PO Tidak Bisa Diubah ✏️

Kekurangan: Form Anda secara otomatis mengambil semua item dari Order yang dipilih, dan pengguna tidak bisa mengubah jumlah (quantity) atau menghapus item.

Skenario Masalah: Staf gudang melihat ada 10 item di Order, tapi stok yang tersedia hanya 8. Mereka tidak bisa membuat PO hanya untuk 8 item yang tersedia. Form memaksa untuk memproses "semua atau tidak sama sekali".

PO Wajib Berasal dari Order Pelanggan 📦

Kekurangan: Alur kerja Anda mengharuskan setiap PO dibuat dari Order yang sudah ada.

Skenario Masalah: Anda tidak bisa membuat PO untuk kebutuhan internal yang tidak terkait Order pelanggan, misalnya:

Membuat PO untuk transfer stok antar gudang.

Membuat PO untuk menyiapkan stok berdasarkan ramalan penjualan (forecast).

Tidak Menampilkan Informasi Stok 📊

Kekurangan: Saat item-item dari Order ditampilkan, tidak ada informasi currentStock (stok saat ini) untuk setiap produk.

Manfaat Jika Ada: Menampilkan stok saat ini akan sangat membantu staf gudang untuk langsung mengetahui ketersediaan barang tanpa perlu mengecek di halaman lain.

Validasi Tanggal Kurang Lengkap 🗓️

Kekurangan: Tidak ada validasi yang memastikan tanggal dateline tidak lebih awal dari poDate. Pengguna bisa saja salah memasukkan tanggal.