# Spesifikasi Backend — Website Rental Mobil

> Dokumen eksekusi backend untuk AI developer. Backend menjadi sumber kebenaran untuk data kendaraan, harga, autentikasi admin, jadwal ketersediaan, dan status booking. Kontrak ini harus konsisten dengan `FRONTEND.md`.

## 1. Ringkasan proyek

Bangun REST API untuk website jasa rental mobil. API melayani katalog publik dan permintaan booking pelanggan, sekaligus menyediakan endpoint privat untuk dashboard admin.

### Tujuan

1. Menyimpan dan menyajikan data armada, layanan, harga, dan konten website.
2. Menerima permintaan booking pelanggan dengan validasi server.
3. Mencegah admin mengonfirmasi kendaraan pada jadwal yang berbenturan.
4. Menyediakan pengelolaan kendaraan, tarif, periode maintenance, booking, serta pengaturan usaha.
5. Menjaga keamanan data pelanggan dan akses dashboard.

### Asumsi versi pertama

- Database utama: PostgreSQL.
- ORM: Prisma.
- Runtime: Node.js dengan TypeScript.
- Framework API: Express.js (boleh memakai NestJS hanya jika seluruh kontrak endpoint tetap sama).
- API menggunakan REST dan prefix `/api/v1`.
- Bahasa konten default: Bahasa Indonesia.
- Mata uang default: `IDR`.
- Zona waktu operasional: `Asia/Jakarta`; simpan timestamp secara konsisten di database (UTC/timestamptz) dan konversi pada layer aplikasi.
- Pelanggan tidak wajib membuat akun.
- Booking baru berstatus `PENDING` dan belum mengunci jadwal secara permanen.
- Admin yang memeriksa lalu mengonfirmasi booking.
- Pembayaran online tidak termasuk versi pertama. Catatan pembayaran manual dapat disimpan sebagai fitur internal opsional.
- Integrasi WhatsApp Business API tidak wajib. Backend cukup menyediakan nomor WhatsApp publik dari pengaturan usaha; frontend membuat link click-to-chat.

Jangan mengisi database produksi dengan nama mobil, tarif, alamat, nomor telepon, atau klaim bisnis palsu. Buat seed development yang jelas berlabel contoh dan tidak otomatis dijalankan di production.

## 2. Arsitektur dan stack

### Stack

- Node.js + TypeScript.
- Express.js.
- PostgreSQL.
- Prisma ORM dan migration.
- Zod untuk validasi request/response.
- Argon2id atau bcrypt dengan cost yang kuat untuk password hashing.
- Cookie-based admin authentication dengan cookie `HttpOnly`, `Secure` di production, dan `SameSite` yang sesuai.
- Pino/Winston untuk structured logging.
- Vitest/Jest + Supertest untuk testing.
- OpenAPI/Swagger untuk dokumentasi endpoint.

### Batas arsitektur

```text
Browser / Next.js frontend
        |
        | HTTPS REST API (/api/v1)
        v
Node.js API (Express + TypeScript)
        |
        +---- PostgreSQL (Prisma)
        |
        +---- Object storage (foto kendaraan)
        |
        +---- Optional: email/notification provider
```

Jaga pemisahan layer:

- `routes`: definisi route dan middleware.
- `controllers`: parsing request dan membentuk response.
- `services`: aturan bisnis dan transaksi.
- `repositories`: akses database bila diperlukan.
- `schemas`: validasi Zod.
- `middlewares`: auth, role, error handler, rate limit.
- `lib`: logger, database, storage, konfigurasi.

Controller tidak boleh menjadi tempat seluruh business logic.

## 3. Konvensi API

### Base URL

```text
/api/v1
```

### Format sukses

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

`meta` hanya disertakan untuk endpoint dengan pagination.

### Format error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang dikirim.",
    "details": [
      {
        "field": "endAt",
        "message": "Tanggal selesai harus setelah tanggal mulai."
      }
    ]
  }
}
```

Gunakan HTTP status code dengan benar:

- `200` sukses membaca/mengubah data.
- `201` data berhasil dibuat.
- `204` sukses tanpa response body bila memang diperlukan.
- `400` payload/query tidak valid.
- `401` belum login/sesi tidak valid.
- `403` tidak punya hak akses.
- `404` data tidak ditemukan.
- `409` konflik jadwal atau state transition.
- `422` validasi bisnis gagal (opsional; konsisten dengan 400 jika dipilih).
- `429` rate limit.
- `500` kesalahan internal tanpa membocorkan detail sensitif.

Semua timestamp API menggunakan ISO 8601 dengan timezone/offset yang jelas. Jangan menerima tanggal-waktu ambigu tanpa offset untuk proses booking. ID database tidak harus ditampilkan ke pelanggan; gunakan booking code publik.

## 4. Model data database

Gunakan UUID/CUID sebagai primary key, `createdAt` dan `updatedAt` untuk tabel yang relevan, foreign key, index, dan constraint. Nama tabel/model boleh disesuaikan, namun konsep dan relasinya harus tetap.

### 4.1 `AdminUser`

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID, primary key |
| `name` | string, wajib |
| `email` | string, unique, lowercase |
| `passwordHash` | string, wajib; jangan pernah simpan password asli |
| `role` | `SUPER_ADMIN` atau `ADMIN` |
| `isActive` | boolean, default true |
| `lastLoginAt` | timestamp nullable |
| `createdAt`, `updatedAt` | timestamp |

Tidak ada endpoint public untuk pendaftaran admin. Akun awal dibuat melalui CLI/seed aman atau perintah bootstrap satu kali yang dikendalikan environment.

### 4.2 `Vehicle`

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID, primary key |
| `name` | string, contoh nama display kendaraan |
| `slug` | string, unique |
| `brand` | string |
| `model` | string |
| `year` | integer nullable |
| `category` | string/enum yang dapat diperluas |
| `transmission` | `MANUAL`, `AUTOMATIC`, `OTHER`, nullable |
| `seats` | integer nullable |
| `doors` | integer nullable |
| `fuelType` | string nullable |
| `luggageCapacity` | string nullable |
| `description` | text nullable |
| `features` | JSON array/string list |
| `isActive` | boolean, default true; menentukan tampil di katalog |
| `sortOrder` | integer, default 0 |
| `createdAt`, `updatedAt` | timestamp |

Ketersediaan kendaraan tidak disimpan sebagai status tunggal di `Vehicle`; ketersediaan tanggal dihitung dari booking terkonfirmasi dan periode maintenance.

### 4.3 `VehicleImage`

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `vehicleId` | foreign key ke `Vehicle` |
| `url` | URL object storage |
| `altText` | string nullable |
| `sortOrder` | integer |
| `isPrimary` | boolean |

Satu kendaraan maksimal memiliki satu foto utama. Saat foto utama diubah, pastikan foto sebelumnya tidak lagi berstatus utama.

### 4.4 `VehicleRate`

Tarif dapat berbeda berdasarkan jenis layanan dan satuan durasi.

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `vehicleId` | foreign key |
| `serviceType` | `WITH_DRIVER` atau `SELF_DRIVE` |
| `billingUnit` | `DAILY`, `WEEKLY`, `MONTHLY` |
| `amount` | integer/bigint dalam Rupiah, wajib >= 0 |
| `isActive` | boolean |
| `notes` | string nullable |
| `createdAt`, `updatedAt` | timestamp |

Unique constraint yang disarankan: kombinasi `vehicleId + serviceType + billingUnit` agar tidak ada dua tarif aktif yang ambigu. Jika kelak diperlukan tarif berdasarkan musim, jam, lokasi, atau promo, buat tabel/aturan terpisah; jangan menambahkan kondisi kompleks ke controller.

### 4.5 `Service`

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `title` | string |
| `slug` | string, unique |
| `shortDescription` | string nullable |
| `description` | text nullable |
| `imageUrl` | string nullable |
| `isActive` | boolean |
| `sortOrder` | integer |
| `createdAt`, `updatedAt` | timestamp |

Contoh awal yang dapat dibuat admin: rental harian, rental mingguan/bulanan, dengan sopir, lepas kunci, kendaraan rombongan, dan kendaraan premium. Jangan menganggap semua layanan tersedia sebelum dikonfigurasi.

Buat relasi many-to-many `VehicleService` antara kendaraan dan layanan, atau gunakan struktur relasional ekuivalen untuk menyatakan jenis layanan yang diizinkan per kendaraan.

### 4.6 `Booking`

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `bookingCode` | string unique, non-sequential dan tidak mudah ditebak |
| `vehicleId` | foreign key ke `Vehicle` |
| `customerName` | string wajib |
| `customerPhone` | string wajib, simpan dalam format ternormalisasi/E.164 jika memungkinkan |
| `customerEmail` | string nullable |
| `serviceType` | `WITH_DRIVER` atau `SELF_DRIVE` |
| `billingUnit` | `DAILY`, `WEEKLY`, `MONTHLY` |
| `pickupAt` | timestamp wajib |
| `returnAt` | timestamp wajib |
| `pickupLocation` | string wajib |
| `returnLocation` | string nullable |
| `durationUnits` | integer hasil kalkulasi server |
| `estimatedTotal` | integer/bigint nullable; Rupiah |
| `priceBreakdown` | JSON nullable, snapshot komponen harga saat pengajuan |
| `customerNote` | text nullable |
| `termsAcceptedAt` | timestamp wajib; waktu persetujuan syarat/privasi dari form |
| `termsVersion` | string nullable; versi/kode dokumen kebijakan yang disetujui |
| `adminNote` | text nullable; jangan pernah dikirim ke endpoint publik |
| `status` | enum booking |
| `paymentStatus` | `NOT_TRACKED`, `UNPAID`, `DP_PAID`, `PAID`, `REFUNDED`; opsional untuk pencatatan manual |
| `amountPaid` | integer/bigint nullable |
| `confirmedAt` | timestamp nullable |
| `cancelledAt` | timestamp nullable |
| `createdAt`, `updatedAt` | timestamp |

Status booking yang digunakan:

- `PENDING` — permintaan diterima, menunggu pemeriksaan admin.
- `CONFIRMED` — sudah disetujui admin dan memblokir jadwal kendaraan.
- `IN_PROGRESS` — kendaraan sedang digunakan.
- `COMPLETED` — rental selesai.
- `REJECTED` — permintaan tidak disetujui.
- `CANCELLED` — booking dibatalkan.

`PENDING`, `REJECTED`, dan `CANCELLED` tidak memblokir jadwal secara permanen. `CONFIRMED` dan `IN_PROGRESS` memblokir jadwal sesuai rentang tanggal.

### 4.7 `VehicleBlock`

Digunakan untuk maintenance atau periode kendaraan tidak bisa disewakan.

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `vehicleId` | foreign key |
| `startAt` | timestamp |
| `endAt` | timestamp |
| `reason` | string/enum: `MAINTENANCE`, `INTERNAL_USE`, `OTHER` |
| `note` | text nullable |
| `createdByAdminId` | foreign key nullable |
| `createdAt`, `updatedAt` | timestamp |

### 4.8 Konten dan pengaturan

Model minimum yang disarankan:

- `SiteSetting`: key/value untuk nama usaha, logo, nomor WhatsApp, telepon, email, alamat, area layanan, jam operasional, social links, dan konfigurasi umum. Jangan menyimpan secret di sini.
- `ContentPage`: `slug`, `title`, `content`, `isPublished`, `updatedAt` untuk halaman tentang, syarat & ketentuan, kebijakan privasi, dan halaman statis lainnya.
- `FAQ`: pertanyaan, jawaban, status aktif, urutan.
- `Testimonial` (opsional): nama tampilan, isi, rating jika benar-benar diberikan, status publikasi, urutan. Jangan membuat testimoni palsu.
- `ContactMessage` (opsional): nama, kontak, pesan, status tindak lanjut, timestamp.
- `AuditLog`: admin, action, entity, entityId, metadata aman, timestamp.

## 5. Aturan bisnis utama

### 5.1 Kendaraan katalog

- Endpoint publik hanya mengembalikan kendaraan `isActive = true`.
- Kendaraan nonaktif tetap bisa terlihat oleh admin, tetapi tidak dapat dipesan oleh pelanggan.
- Tarif yang ditampilkan harus berasal dari `VehicleRate` aktif.
- Kendaraan tanpa tarif aktif dapat tetap tampil dengan label `Hubungi untuk harga`.

### 5.2 Hitung durasi dan estimasi biaya

- `returnAt` harus lebih besar dari `pickupAt`.
- Durasi dihitung dari selisih timestamp yang valid.
- Untuk versi pertama gunakan pembulatan ke atas per unit billing: `DAILY = 1 hari`, `WEEKLY = 7 hari`, `MONTHLY = 30 hari`; durasi minimum satu unit.
- `durationUnits = ceil(durationDays / unitDays)` dengan `durationDays = ceil((returnAt - pickupAt) / 24 jam)` dan minimum 1.
- `estimatedTotal = activeRate.amount * durationUnits`.
- Bila tarif untuk kombinasi kendaraan dan jenis layanan tidak tersedia, izinkan permintaan booking sebagai permintaan penawaran dengan `estimatedTotal = null`; tandai `quotationRequired = true` pada response.
- Semua perhitungan harga final dilakukan backend. Jangan percaya angka harga/total dari browser.
- Simpan snapshot tarif dan rincian estimasi ke `priceBreakdown` supaya perubahan tarif berikutnya tidak mengubah catatan booking lama.

Aturan pembulatan di atas adalah default teknis untuk versi pertama. Jika pemilik usaha memiliki cara hitung berbeda (contoh: overtime, kalender bulanan, minimum rental, sopir, tol, parkir, bahan bakar, atau biaya antar-jemput), aturan itu harus dikonfirmasi dan dibuat sebagai konfigurasi/komponen harga yang eksplisit.

### 5.3 Cek ketersediaan dan bentrok jadwal

Bentrok terjadi jika:

```text
requestedPickupAt < existingReturnAt
AND
requestedReturnAt > existingPickupAt
```

Periksa dua sumber:

1. Booking kendaraan berstatus `CONFIRMED` atau `IN_PROGRESS`.
2. `VehicleBlock` yang rentang waktunya overlap.

Booking `PENDING` tidak memblokir jadwal secara permanen pada versi pertama. Hal ini harus dijelaskan oleh frontend: permintaan belum menjamin unit tersedia sampai admin mengonfirmasi.

Endpoint availability hanya mengembalikan informasi ketersediaan, bukan data pribadi booking lain.

**Race condition:** ketika admin mengonfirmasi booking, lakukan cek ulang di backend dalam transaksi database. Kunci row kendaraan (misalnya `SELECT ... FOR UPDATE` di PostgreSQL) atau gunakan strategi transaksi/constraint yang setara agar dua booking yang berbarengan tidak mengonfirmasi kendaraan dan slot yang sama. Jika ada bentrok, return `409 AVAILABILITY_CONFLICT`.

### 5.4 Transisi status booking

Validasi transisi status di service layer. Rekomendasi:

- `PENDING` → `CONFIRMED`, `REJECTED`, atau `CANCELLED`.
- `CONFIRMED` → `IN_PROGRESS` atau `CANCELLED`.
- `IN_PROGRESS` → `COMPLETED`.
- `REJECTED`, `CANCELLED`, dan `COMPLETED` merupakan status akhir untuk versi pertama.

Transisi lain ditolak dengan `409 INVALID_STATUS_TRANSITION`. Saat status menjadi `CONFIRMED`, isi `confirmedAt`. Saat dibatalkan, isi `cancelledAt`. Setiap perubahan status harus dibuatkan `AuditLog`.

## 6. Endpoint publik

Semua endpoint di bawah berada setelah prefix `/api/v1`.

### 6.1 Pengaturan website

`GET /public/settings`

Mengembalikan pengaturan yang aman untuk publik, misalnya:

```json
{
  "success": true,
  "data": {
    "businessName": "Nama Rental",
    "logoUrl": null,
    "whatsappNumber": null,
    "phoneNumber": null,
    "email": null,
    "address": null,
    "serviceAreas": [],
    "businessHours": null,
    "socialLinks": []
  }
}
```

Data di atas hanya bentuk contoh response, bukan data bisnis sungguhan. Jangan pernah mengirim konfigurasi privat atau secret.

### 6.2 Katalog kendaraan

`GET /public/vehicles`

Query parameter yang disarankan:

- `search`
- `brand`
- `category`
- `transmission`
- `seats`
- `serviceType`
- `minPrice`
- `maxPrice`
- `sort` (`price_asc`, `price_desc`, `name_asc`, `newest`)
- `page`
- `limit`

Default `page=1`, `limit=12`; batasi maksimum limit (misalnya 50). Hanya kembalikan kendaraan aktif. Sertakan foto utama, spesifikasi ringkas, layanan tersedia, dan tarif aktif.

`GET /public/vehicles/:slug`

Mengembalikan detail kendaraan, seluruh foto, spesifikasi, deskripsi, layanan yang didukung, dan tarif aktif. Kembalikan `404` jika tidak ditemukan atau tidak aktif.

### 6.3 Cek availability

`GET /public/vehicles/:id/availability?pickupAt=...&returnAt=...&serviceType=...&billingUnit=...`

Validasi tanggal, jenis layanan, dan kendaraan. Response contoh:

```json
{
  "success": true,
  "data": {
    "available": true,
    "quotationRequired": false,
    "durationUnits": 2,
    "estimatedTotal": 1500000,
    "currency": "IDR"
  }
}
```

Jangan sertakan nama pelanggan, nomor telepon, atau detail booking yang menyebabkan bentrok.

### 6.4 Layanan dan konten

- `GET /public/services` — layanan aktif dan terurut.
- `GET /public/pages/:slug` — halaman yang dipublikasikan.
- `GET /public/faqs` — FAQ aktif.
- `GET /public/testimonials` — testimoni yang sudah dipublikasikan.
- `GET /public/articles` dan `GET /public/articles/:slug` — artikel publik berstatus `PUBLISHED`.

### 6.5 Membuat booking

`POST /public/bookings`

Payload contoh:

```json
{
  "vehicleId": "vehicle_uuid",
  "customerName": "Nama Pelanggan",
  "customerPhone": "+6281234567890",
  "customerEmail": null,
  "serviceType": "WITH_DRIVER",
  "billingUnit": "DAILY",
  "pickupAt": "2026-12-01T09:00:00+07:00",
  "returnAt": "2026-12-03T09:00:00+07:00",
  "pickupLocation": "Lokasi penjemputan",
  "returnLocation": null,
  "customerNote": "Catatan tambahan",
  "acceptedTerms": true
}
```

Proses:

1. Validasi semua field dengan Zod.
2. Normalisasi nomor telepon.
3. Pastikan kendaraan aktif dan jenis layanan tersedia.
4. Pastikan rentang tanggal valid dan tidak di masa lalu sesuai zona waktu operasional.
5. Hitung durasi dan estimasi biaya di server.
6. Cek bentrok dengan booking terkonfirmasi/berjalan dan blokir kendaraan.
7. Buat booking `PENDING` dengan booking code acak/unik.
8. Simpan snapshot estimasi harga.
9. Return kode booking dan status.

Response contoh:

```json
{
  "success": true,
  "data": {
    "bookingCode": "RNT-7K4P9X2Q",
    "status": "PENDING",
    "estimatedTotal": 1500000,
    "quotationRequired": false,
    "message": "Permintaan booking diterima dan menunggu konfirmasi admin."
  }
}
```

Jika jadwal saat itu sudah terkonfirmasi oleh booking lain atau maintenance, return `409 AVAILABILITY_CONFLICT`. Booking yang dibuat tidak otomatis `CONFIRMED`.

Tambahkan rate limit ketat pada endpoint booking dan contact agar tidak menjadi sasaran spam. Jangan mengembalikan data pribadi pelanggan lain.

### 6.6 Form kontak

`POST /public/contact` (opsional) menerima nama, nomor/email, dan pesan. Validasi, batasi panjang input, rate limit, dan simpan ke `ContactMessage` bila fitur ini diaktifkan.

## 7. Endpoint admin

Semua endpoint admin wajib memakai middleware autentikasi dan authorization. Prefix `/api/v1/admin`.

### 7.1 Auth

- `POST /admin/auth/login`
- `POST /admin/auth/logout`
- `GET /admin/auth/me`

Login menerima email dan password. Setelah sukses, buat sesi/token dan kirim cookie `HttpOnly`; jangan mengirim hash/password.

Gunakan access token/session yang berumur pendek dan refresh/session renewal yang aman. Cookie production harus `Secure`, `HttpOnly`, dan `SameSite` yang sesuai. Terapkan CSRF protection bila pola cookie dan deployment memerlukannya. Logout harus mencabut sesi/refresh token.

Jangan menyediakan public admin registration. Buat admin pertama dengan CLI/bootstrap command yang hanya dapat digunakan operator server.

### 7.2 Dashboard

`GET /admin/dashboard`

Return agregat booking pending, confirmed, in progress, completed, kendaraan aktif, dan kendaraan yang sedang diblokir/maintenance. Angka dihitung dari database.

### 7.3 Kendaraan dan foto

CRUD:

- `GET /admin/vehicles`
- `POST /admin/vehicles`
- `GET /admin/vehicles/:id`
- `PATCH /admin/vehicles/:id`
- `DELETE /admin/vehicles/:id` atau soft delete/nonaktifkan

Sertakan pengelolaan foto dan tarif. Hindari menghapus kendaraan permanen jika sudah memiliki riwayat booking; prioritaskan `isActive=false`.

Untuk foto:

- Gunakan object storage seperti S3-compatible storage atau Cloudinary.
- Batasi MIME type ke format gambar yang diizinkan.
- Batasi ukuran file.
- Buat filename acak.
- Jangan percaya ekstensi file saja.
- Sediakan delete/replace dan pengaturan foto utama.

### 7.4 Tarif dan layanan

- Endpoint CRUD `/admin/vehicles/:id/rates`.
- CRUD `/admin/services`.
- Kelola relasi kendaraan-layanan.
- Validasi amount integer >= 0, enum, dan kombinasi tarif yang unik.

### 7.5 Booking

- `GET /admin/bookings` — pagination, filter status/tanggal, search.
- `GET /admin/bookings/:id` — detail termasuk catatan admin.
- `PATCH /admin/bookings/:id/status` — perubahan status dengan validasi transisi dan availability re-check.
- `PATCH /admin/bookings/:id/notes` — ubah catatan internal admin.

Contoh payload perubahan status:

```json
{
  "status": "CONFIRMED"
}
```

Aksi konfirmasi harus atomik: cek ulang kendaraan/jadwal, cek transisi, update status, isi timestamp, catat audit log. Jika konflik, jangan mengubah status.

Admin dapat memperbarui `paymentStatus`/`amountPaid` bila pencatatan pembayaran manual diaktifkan. Jangan mengklaim uang sudah diterima hanya berdasarkan form pelanggan.

### 7.6 Kalender dan vehicle block

- `GET /admin/calendar?startAt=...&endAt=...&vehicleId=...`
- CRUD `/admin/vehicle-blocks`

Kalender mengembalikan booking confirmed/in progress dan blokir maintenance, serta dapat menyertakan booking pending dengan label terpisah. Validasi periode blokir agar tidak berbenturan dengan booking confirmed/in progress kecuali admin melakukan alur khusus pembatalan/penjadwalan ulang.

### 7.7 Konten dan pengaturan

- `GET`/`PATCH /admin/settings`
- CRUD `/admin/pages`
- CRUD `/admin/faqs`
- CRUD `/admin/testimonials`
- CRUD `/admin/articles`
- `GET /admin/contact-messages` dan update status bila modul contact digunakan.

Batasi akses edit konten dan pengaturan pada role yang sesuai. `SUPER_ADMIN` mengelola akun admin; `ADMIN` mengelola operasional sesuai kebijakan aplikasi. Jika fitur manajemen akun belum dibuat, tetap buat setidaknya satu role admin dan satu super admin dalam model.

## 8. Validasi dan keamanan

### Validasi

- Semua request body, path param, dan query param divalidasi dengan Zod.
- Tolak field yang tidak dikenal bila relevan untuk mencegah mass assignment.
- Normalisasi email, nomor telepon, slug, dan whitespace.
- Batasi panjang string dan ukuran payload.
- Validasi ID serta keberadaan relasi sebelum write.
- Harga dan jumlah uang memakai integer Rupiah, bukan floating point.
- Jangan mengandalkan validasi client.

### Keamanan wajib

- Helmet/security headers.
- CORS hanya untuk origin frontend yang diizinkan melalui environment.
- Rate limit pada login, booking, dan contact.
- Password hash Argon2id atau bcrypt; tidak ada plaintext.
- Cookie aman dan sesi dapat dicabut.
- CSRF protection untuk operasi admin berbasis cookie bila dibutuhkan.
- Authorization per route dan per aksi.
- Proteksi brute force login dan pesan error login yang tidak membocorkan apakah email terdaftar.
- SQL injection dicegah melalui Prisma/parameterized query; jangan menyusun query dari string pengguna.
- Sanitasi/escaping konten rich text sebelum ditampilkan.
- Validasi MIME dan ukuran upload.
- Jangan mencatat password, cookie, token, atau seluruh data pribadi ke log.
- Admin note tidak pernah dikirim di API publik.
- Terapkan HTTPS di production.
- Siapkan kebijakan backup database dan retensi data.

### Privasi pelanggan

Kumpulkan hanya data yang diperlukan untuk memproses rental. Sediakan halaman kebijakan privasi yang dapat diisi pemilik. Checkbox persetujuan pada form booking harus dicatat bersama timestamp dan versi/kode kebijakan bila memungkinkan. Batasi akses detail pelanggan hanya untuk admin berwenang.

## 9. Environment variables

Sediakan `.env.example` tanpa secret sungguhan:

```env
NODE_ENV=development
PORT=4000
API_BASE_PATH=/api/v1
FRONTEND_URL=http://localhost:3000
PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/rental_db
SESSION_SECRET=replace_with_long_random_secret
ACCESS_TOKEN_SECRET=replace_with_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_long_random_secret
COOKIE_NAME=rental_admin_session
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
STORAGE_PROVIDER=local
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_ENDPOINT=
UPLOAD_MAX_SIZE_MB=5
PUBLIC_WHATSAPP_NUMBER=
DEFAULT_TIMEZONE=Asia/Jakarta
DEFAULT_CURRENCY=IDR
```

Gunakan konfigurasi validasi saat startup; aplikasi harus gagal startup dengan pesan yang jelas jika variable wajib belum diset. Jangan commit `.env`.

## 10. Struktur folder yang disarankan

```text
apps/api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── vehicles/
│   │   ├── rates/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── availability/
│   │   ├── calendar/
│   │   ├── content/
│   │   ├── settings/
│   │   └── contacts/
│   ├── schemas/
│   ├── utils/
│   └── docs/
├── tests/
├── .env.example
└── package.json
```

Struktur dapat diubah bila ada alasan teknis, tetapi modul auth, vehicles, rates, bookings, availability, settings, dan content sebaiknya tetap dipisah.

## 11. Logging, audit, dan error handling

- Gunakan structured JSON logging di production.
- Tambahkan request ID/correlation ID.
- Error handler global menerjemahkan error internal ke format response standar.
- Jangan mengirim stack trace ke client production.
- Audit setiap aksi admin penting: login sukses/gagal (tanpa password), perubahan harga, perubahan status booking, perubahan jadwal maintenance, perubahan setting, dan pengelolaan armada.
- Simpan metadata audit seperlunya; hindari data sensitif yang tidak dibutuhkan.

## 12. Testing backend

### Unit test

- Perhitungan durasi dan harga per unit billing.
- Validasi status transition.
- Fungsi overlap tanggal.
- Normalisasi nomor telepon.
- Pembuatan booking code.

### Integration test

- CRUD kendaraan dan tarif.
- Katalog hanya menampilkan kendaraan aktif.
- Membuat booking valid.
- Menolak tanggal selesai sebelum tanggal mulai.
- Menolak kendaraan nonaktif.
- Menolak layanan yang tidak didukung kendaraan.
- Booking pending tidak memblokir jadwal permanen.
- Booking confirmed/in progress memblokir jadwal.
- Vehicle block memblokir availability.
- Admin tidak dapat mengonfirmasi booking yang bentrok.
- Dua proses konfirmasi bersamaan tidak dapat membuat double booking.
- Admin endpoint menolak request tanpa sesi/hak akses.
- Public endpoint tidak membocorkan nomor telepon, email, atau admin note.

### Database/migration

- Migration dapat dijalankan pada database kosong.
- Seed development tidak membuat kredensial default yang tidak aman.
- Reset/migrate/seed dijelaskan di README.
- Tambahkan index untuk slug, status, `vehicleId`, booking code, serta rentang tanggal yang sering dicari.

## 13. Dokumentasi dan cara menjalankan

Sediakan README backend berisi:

1. Prasyarat Node.js dan PostgreSQL.
2. Cara install dependency.
3. Cara membuat `.env` dari `.env.example`.
4. Cara migration dan seed development.
5. Cara bootstrap admin pertama dengan aman.
6. Cara menjalankan mode development dan production.
7. Cara menjalankan unit/integration test.
8. URL dokumentasi OpenAPI/Swagger.
9. Daftar endpoint dan contoh request penting.
10. Cara konfigurasi object storage dan CORS.

Sediakan script package yang sesuai, misalnya `dev`, `build`, `start`, `db:migrate`, `db:seed`, `admin:create`, `test`, dan `test:e2e`.

## 14. Kriteria penerimaan backend

Backend dianggap siap bila:

- Database schema dan migration dapat dijalankan dari awal.
- API publik menyediakan pengaturan, katalog, detail kendaraan, layanan, halaman, FAQ, dan endpoint booking.
- Harga dihitung di server dan snapshot-nya tersimpan.
- Booking baru selalu berstatus `PENDING`.
- Availability menghitung booking confirmed/in progress dan vehicle block.
- Admin dapat mengonfirmasi booking dengan pengecekan bentrok atomik.
- Admin authentication, authorization, logout, dan session invalidation bekerja.
- CRUD kendaraan, foto, tarif, layanan, konten, dan pengaturan tersedia.
- Response mengikuti format standar dan error memiliki HTTP status yang tepat.
- Data pribadi tidak bocor ke endpoint publik maupun log.
- Ada audit log untuk tindakan admin penting.
- Test utama lulus dan OpenAPI/README tersedia.

## 15. Instruksi untuk AI developer backend

1. Baca `FRONTEND.md` agar model response dan enum sama dengan kebutuhan UI.
2. Implementasikan database schema dan migration terlebih dahulu.
3. Implementasikan auth dan middleware, lalu modul kendaraan/tarif, availability, booking, dan admin.
4. Buat OpenAPI sebelum/bersamaan dengan integrasi frontend agar kontrak endpoint tidak ambigu.
5. Jangan mengubah booking baru menjadi `CONFIRMED` secara otomatis.
6. Jangan mempercayai harga dari browser atau mengirim informasi pribadi booking ke endpoint publik.
7. Jangan hard-code informasi usaha. Kelola melalui `SiteSetting`.
8. Jangan menambahkan payment gateway, WhatsApp Business API, atau customer account tanpa persetujuan scope baru.
9. Sertakan `.env.example`, migration, seed development yang aman, test, dan README.
10. Di akhir, laporkan endpoint yang sudah selesai, skema database, cara menjalankan, hasil test, serta konfigurasi yang masih harus diberikan pemilik usaha.

## 16. SEO, Local SEO, dan pengelolaan metadata — TJ Rentcar

### 16.1 Konfigurasi SEO awal bisnis

Gunakan konfigurasi awal berikut dan biarkan informasi yang belum tersedia tetap kosong sampai pemilik mengisinya:

| Pengaturan | Nilai awal / aturan |
|---|---|
| `businessName` | `TJ Rentcar` |
| `city` / `primaryServiceArea` | `Jakarta` |
| `countryCode` | `ID` |
| `locale` | `id-ID` |
| `timezone` | `Asia/Jakarta` |
| `currency` | `IDR` |
| `siteUrl` | Wajib diisi saat domain production ditetapkan |
| `publicAddress` | Nullable; hanya alamat tempat usaha yang nyata dan boleh dipublikasikan |
| `whatsappNumber` | Wajib diisi pemilik sebelum CTA produksi aktif |
| `phoneNumber` | Nullable bila belum tersedia |
| `businessHours` | Nullable sampai jam operasional dikonfirmasi |
| `serviceAreas` | Jakarta; rincian area tidak boleh melebihi cakupan operasional sebenarnya |
| `airportRoutes` | Daftar rute bandara yang disetujui pemilik; awalnya kosong sampai diverifikasi |
| `outOfTownRoutes` | Daftar rute luar kota yang disetujui pemilik; awalnya kosong sampai diverifikasi |

Jangan menganggap alamat usaha, koordinat, nomor telepon, jam buka, klaim 24 jam, harga, jumlah armada, rating, atau cakupan rute sudah diketahui. Jangan membuat nilai contoh menjadi data production.

### 16.2 Model metadata SEO

Tambahkan blok/kolom SEO pada `SiteSetting`, `ContentPage`, `Service`, `Vehicle`, dan `Article`. Bentuk logis metadata:

| Field | Tipe/aturan |
|---|---|
| `metaTitle` | string nullable, disarankan maksimal sekitar 60 karakter sebagai panduan editorial, bukan batas mesin pencari |
| `metaDescription` | string nullable, disarankan sekitar 140–160 karakter sebagai panduan editorial, bukan batas wajib |
| `ogImageUrl` | URL nullable ke gambar yang relevan dan dapat diakses crawler |
| `canonicalPath` | string nullable; path relatif di domain utama, harus lolos normalisasi dan validasi |
| `robotsIndex` | boolean, default true untuk halaman publik yang dipublikasikan |
| `robotsFollow` | boolean, default true |
| `focusKeyword` | string nullable, hanya catatan editorial; bukan field ranking atau faktor yang dikirim ke Google |

Aturan:

- Jika `metaTitle` kosong, frontend membuat title dari template entity yang relevan. Jangan gunakan satu title yang sama untuk semua halaman.
- Jika `metaDescription` kosong, frontend dapat membuat fallback dari ringkasan/deskripsi yang benar-benar ada; jangan membuat klaim baru.
- Canonical default adalah URL kanonis halaman itu sendiri. Admin boleh mengganti `canonicalPath` hanya untuk kasus editorial yang disengaja dan setelah validasi.
- Jangan menerima canonical URL eksternal atau URL yang mengarah ke domain yang tidak dimiliki, kecuali ada kebutuhan migrasi yang disetujui dan ditangani khusus.
- Halaman draft, private, admin, halaman hasil pencarian/filter, dan halaman konfirmasi booking harus non-indexable sesuai kebijakan frontend.
- `robotsIndex` dan `robotsFollow` hanya mengendalikan metadata crawler; bukan kontrol keamanan/authorization.
- `focusKeyword` tidak boleh diperlakukan sebagai bukti volume pencarian atau instruksi mengulang keyword di konten.

### 16.3 Penyesuaian model data

1. `SiteSetting`: tambahkan `siteUrl`, `defaultMetaTitle`, `defaultMetaDescription`, `defaultOgImageUrl`, `primaryServiceArea`, `serviceAreas`, `publicAddress` (struktur PostalAddress nullable), `publicCoordinates` (nullable), `businessHours` (nullable), `airportRoutes`, `outOfTownRoutes`, `socialLinks`, `googleBusinessProfileUrl` (nullable), serta metadata SEO untuk homepage. Alamat/koordinat hanya menjadi public response jika pemilik menandai boleh dipublikasikan.
2. `Service`: tambahkan metadata SEO dan konten khusus layanan yang dipublikasikan. Slug awal yang disarankan: `dengan-sopir`, `lepas-kunci`, `sewa-harian`, `sewa-mingguan`, `sewa-bulanan`, `antar-jemput-bandara`, `perjalanan-luar-kota`. Jangan mengaktifkan layanan sebelum detail operasional disetujui.
3. `Vehicle`: tambahkan metadata SEO opsional dan `description` yang unik. Data kendaraan aktif tanpa informasi yang cukup jangan otomatis dipaksa masuk sitemap.
4. `ContentPage`: tambahkan metadata SEO, `excerpt`/ringkasan, status publikasi, dan `publishedAt` bila diperlukan.
5. Tambahkan model `Article` untuk content marketing:

| Field | Tipe/aturan |
|---|---|
| `id` | UUID/CUID |
| `title` | string wajib |
| `slug` | string unique, URL-friendly |
| `excerpt` | string/text nullable |
| `content` | text/rich text wajib saat publish |
| `featuredImageUrl` | URL nullable |
| `featuredImageAlt` | string nullable |
| `category` | string nullable |
| `authorName` | string nullable; hanya nama yang disetujui |
| `status` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `publishedAt` | timestamp nullable |
| `updatedAt` | timestamp |
| `metaTitle`, `metaDescription`, `ogImageUrl` | nullable |
| `canonicalPath` | nullable, path relatif tervalidasi |
| `robotsIndex`, `robotsFollow` | boolean |

Artikel hanya dapat dipublish jika title, slug, konten utama, dan canonical default valid. Jangan memasukkan artikel otomatis dari AI tanpa proses review manusia.

### 16.4 Endpoint publik dan admin tambahan

Pastikan endpoint yang sudah ada mengembalikan metadata SEO publik yang aman:

- `GET /public/settings` — sertakan business name, site URL, layanan/area yang memang ditawarkan, jam operasional (bila ada), public address (jika boleh ditampilkan), social links, dan homepage SEO metadata. Jangan keluarkan private/internal setting.
- `GET /public/services` dan `GET /public/services/:slug` — sertakan ringkasan, konten detail, status publikasi, dan SEO metadata.
- `GET /public/pages/:slug` — sertakan status publikasi, konten, `updatedAt`, dan SEO metadata.
- `GET /public/vehicles` dan `GET /public/vehicles/:slug` — sertakan `description`, foto/alt text, layanan dan tarif aktif, serta SEO metadata.
- `GET /public/articles` — daftar artikel `PUBLISHED` dengan pagination dan filter yang aman.
- `GET /public/articles/:slug` — satu artikel `PUBLISHED`; artikel draft/arsip harus menghasilkan 404 untuk endpoint publik.

Tambahkan endpoint admin:

- CRUD `/admin/articles` dengan preview draft dan aksi publish/archive.
- CRUD `/admin/services`, `/admin/pages`, `/admin/vehicles` harus mengizinkan pengelolaan field SEO.
- `GET`/`PATCH /admin/settings` harus memisahkan pengaturan publik, SEO umum, dan pengaturan privat.

Validasi payload SEO dengan Zod. Normalize slug, batasi ukuran metadata, sanitasi konten HTML/rich text, dan validasi MIME serta host URL gambar. Update `updatedAt` saat konten atau metadata berubah.

### 16.5 Sitemap dan robots

Sitemap publik sebaiknya dibuat oleh Next.js melalui `app/sitemap.ts` atau mekanisme server-side setara, menggunakan data endpoint publik/backend. Backend harus menyediakan hanya daftar URL yang memenuhi syarat publikasi/indexing.

Sitemap harus:

- Menggunakan domain HTTPS production kanonis.
- Mengikutsertakan homepage, halaman layanan yang aktif, halaman statis terpublikasi, detail kendaraan aktif yang layak diindeks, dan artikel published yang indexable.
- Memakai `lastModified` dari waktu update konten yang benar; jangan mengubah semua `lastmod` setiap request.
- Tidak mengikutsertakan `/admin/**`, halaman booking sukses, draft, halaman pencarian internal, filter query, URL yang `noindex`, atau URL non-canonical.
- Diperbarui ketika konten/vehicle/service dipublish, diubah slug-nya, diarsipkan, atau dihapus.

`robots.txt`:

- Izinkan crawler mengakses halaman publik, CSS, JavaScript, dan gambar yang diperlukan untuk render.
- Boleh menambahkan `Disallow: /admin/` sebagai sinyal crawl, tetapi autentikasi dan otorisasi tetap wajib menjadi proteksi yang sesungguhnya.
- Sertakan absolute sitemap URL, misalnya `Sitemap: https://DOMAIN-AKTUAL/sitemap.xml` setelah domain dikonfigurasi.
- Jangan memblokir halaman publik penting melalui robots rules.
- Gunakan metadata `noindex` untuk halaman yang tidak boleh masuk indeks; jangan menganggap `robots.txt` setara dengan `noindex`.

### 16.6 Structured data / JSON-LD

Frontend yang merender halaman bertanggung jawab menyusun JSON-LD, sedangkan backend menyediakan data yang tervalidasi. Jenis markup:

- `AutoRental` (Schema.org subtype dari `LocalBusiness`) atau tipe LocalBusiness paling spesifik yang sesuai untuk bisnis rental mobil. Gunakan `name: TJ Rentcar`, `url`, `telephone`, `address`, `geo`, `openingHoursSpecification`, dan `areaServed` hanya jika nilainya nyata dan sesuai halaman.
- `Organization` dan `WebSite` untuk identitas brand/website bila datanya benar.
- `BreadcrumbList` untuk halaman bertingkat.
- `Article` untuk halaman artikel yang telah dipublikasikan.

Jangan menambahkan `address` atau `geo` fiktif untuk melengkapi schema. Dokumentasi Google untuk LocalBusiness mensyaratkan `name` dan `address` bagi kelayakan rich result LocalBusiness; jika TJ Rentcar adalah service-area business yang tidak mempublikasikan alamat, jangan mengarang alamat. Gunakan markup organisasi yang sesuai dan tampilkan service area yang akurat. Jangan menjanjikan rich result muncul karena structured data.

Review/rating hanya boleh dimarkup bila berasal dari ulasan asli dan memenuhi kebijakan Google. Jangan membuat rating agregat, testimoni, jumlah pelanggan, atau schema palsu.

### 16.7 Local SEO — pengelolaan data pendukung

Backend harus menyediakan field agar halaman Kontak dan konfigurasi Local SEO konsisten:

- Nama bisnis resmi yang digunakan pelanggan: `TJ Rentcar`.
- Nomor telepon/WhatsApp utama.
- Website kanonis.
- Alamat fisik dan opsi `showPublicAddress`.
- Koordinat hanya bila lokasi benar dan boleh dipublikasikan.
- Area layanan utama Jakarta dan daftar area/kelurahan/kecamatan hanya jika benar-benar dilayani.
- Jam operasional dan special hours jika dikelola.
- Profil sosial resmi.
- Tautan Google Business Profile.
- Bandara dan rute perjalanan yang benar-benar diterima.

Jangan membuat profil bisnis duplikat atau alamat kantor virtual. Jika bisnis tidak menerima pelanggan di alamat kantor, dukung pengaturan agar alamat tidak dipublikasikan dan area layanan tetap dapat ditampilkan. Pemilik harus mengklaim dan memverifikasi Google Business Profile secara langsung; backend tidak boleh mengklaim bahwa profil sudah diverifikasi tanpa bukti.

### 16.8 Redirect, canonical, dan status halaman

- Slug publik harus unik dan tidak mudah berubah.
- Saat slug berubah, simpan redirect permanen `301` dari slug lama ke slug baru yang relevan. Hindari redirect chain dan redirect ke homepage untuk semua URL yang dihapus.
- URL dengan parameter sorting/filter/search jangan menghasilkan canonical yang berbeda untuk setiap kombinasi; frontend tetapkan canonical ke halaman kategori utama atau gunakan `noindex` sesuai kebijakan.
- Draft/private: tidak boleh dikirim ke public API.
- Konten yang dihapus: gunakan `404`/`410` bila tidak ada pengganti yang relevan; gunakan `301` hanya bila ada pengganti yang benar-benar sesuai.
- Jangan mengirim private data pelanggan, catatan admin, atau jadwal booking yang sensitif ke data endpoint SEO/sitemap.

### 16.9 Analytics, audit, dan privasi

- Konfigurasi Measurement ID GA4 dan verifikasi Search Console berada pada environment/configuration yang aman; jangan expose API secret.
- Backend dapat mencatat conversion internal seperti booking submitted dan status booking berubah, tetapi jangan mengirim PII ke Analytics.
- Audit perubahan `metaTitle`, `metaDescription`, canonical, status publish, slug, area layanan, alamat publik, nomor telepon, harga, dan daftar rute.
- Jangan menyimpan kredensial Google Business Profile, Search Console, atau Analytics dalam plaintext SiteSetting.
- Sediakan dokumentasi bagi pemilik untuk menambahkan TXT/DNS verification sesuai provider domain; jangan mengklaim verifikasi otomatis.

### 16.10 Testing dan kriteria penerimaan backend SEO

- [ ] `TJ Rentcar`, Jakarta, `id-ID`, `Asia/Jakarta`, dan `IDR` terkonfigurasi sebagai default.
- [ ] Nilai alamat/nomor telepon/jam kerja/rute tetap nullable sampai pemilik mengisinya.
- [ ] Metadata SEO dapat dikelola pada homepage, halaman, layanan, kendaraan, dan artikel.
- [ ] Public API hanya mengembalikan konten published serta metadata yang boleh dipublikasikan.
- [ ] Public response tidak memuat secret, admin notes, data kontak pelanggan, atau informasi booking sensitif.
- [ ] Artikel dapat dibuat sebagai draft, dipreview admin, dipublish, diperbarui, dan diarsipkan.
- [ ] Sitemap hanya berisi URL canonical, published, dan indexable.
- [ ] Slug update membuat redirect yang benar dan tidak menimbulkan redirect loop.
- [ ] Canonical tidak dapat diarahkan ke domain eksternal yang tidak disetujui.
- [ ] JSON-LD menggunakan data bisnis asli; tidak pernah menghasilkan alamat/rating palsu.
- [ ] Perubahan konten dan pengaturan SEO tercatat dalam audit log.
- [ ] Test akses admin dan public endpoint membuktikan metadata tidak membocorkan informasi internal.

