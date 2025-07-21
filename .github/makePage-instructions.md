Saya ingin membuat sebuah CRUD dari database ini:

model Categories {
id String @id @default(cuid())
name String
description String?
isActive Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
products Products[]

@@map("categories")
}

Akan mencontoh dari folder halaman "me"
Pada path root akan memiliki komponen ini, lengkapnya baca Page.tsx nya:
<ManagementHeader mainPageName="/me" allowedRoles={["ADMIN"]} />
<ManagementContent
sampleData={sampleData}
columns={columns}
excludedAccessors={excludedAccessors}

dimana untuk mainPageName akan menjadi kategory 
allowedRoles akan berisi ["ADMIN", "OWNER"]

sampleData akan diambil dari fetch data dari database model category
columns yang akan berisi name, description, isActive
exlcudeAccessors berisi name, description, isActive

pada folder me akan ada folder create berisi sebuah form untuk memasukkan data
Disitu terdapat form dan semua komponen input yang dibutuhkan sesuaikan agar bisa create di halaman tersebut
dan tolong buatkan folder edit untuk halaman edit,

buatkan semuanya lengkap sampai bisa CRUD Data