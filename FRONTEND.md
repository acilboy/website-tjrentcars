# Spesifikasi Frontend — Website Rental Mobil

> Dokumen eksekusi frontend untuk AI developer. Bangun antarmuka berdasarkan spesifikasi ini dan kontrak API pada `BACKEND.md`. Jangan mengubah aturan bisnis atau membuat data kendaraan/harga fiktif.

## 1. Ringkasan proyek

Buat website profesional untuk bisnis jasa rental mobil. Website harus membantu calon pelanggan menemukan kendaraan, memahami pilihan layanan, mengirim permintaan booking, dan menghubungi admin melalui WhatsApp. Pemilik usaha juga membutuhkan dashboard admin untuk mengelola informasi yang tampil di website.

**Referensi pengalaman pengguna:** [https://sarambarental.com/](https://sarambarental.com/). Referensi tersebut memperlihatkan pola website rental dengan hero promosi, navigasi katalog dan layanan, informasi keunggulan, halaman tentang perusahaan, syarat dan ketentuan, serta CTA WhatsApp. Gunakan pola informasinya sebagai inspirasi; jangan menyalin logo, foto, teks, identitas visual, atau aset milik referensi.

### Tujuan utama

1. Membuat bisnis rental terlihat profesional dan terpercaya.
2. Memudahkan pelanggan mencari mobil berdasarkan kebutuhan.
3. Memudahkan pelanggan mengirim permintaan pemesanan.
4. Mengarahkan pelanggan ke WhatsApp tanpa mengharuskan integrasi WhatsApp Business API.
5. Memberi admin antarmuka untuk mengelola mobil, harga, booking, layanan, dan konten dasar.

### Asumsi produk untuk versi pertama

- Bahasa utama: Bahasa Indonesia.
- Mata uang: Rupiah (IDR), format `Rp 1.500.000`.
- Zona waktu tampilan: `Asia/Jakarta`.
- Pemesanan dari website berstatus **menunggu konfirmasi**, bukan otomatis terkonfirmasi.
- Konfirmasi ketersediaan dan keputusan akhir dilakukan admin.
- WhatsApp merupakan kanal komunikasi; tombol WhatsApp membuka aplikasi/link chat, bukan mengirim pesan otomatis dari server.
- Pembayaran online/payment gateway tidak termasuk versi pertama. Admin boleh mencatat status pembayaran manual bila backend mengaktifkannya.
- Nama usaha, logo, nomor WhatsApp, alamat, area layanan, foto armada, harga, dan kebijakan rental harus diisi oleh pemilik. Jangan membuat informasi bisnis palsu.

## 2. Teknologi dan batas tanggung jawab

### Stack frontend yang disarankan

- Next.js dengan App Router.
- React dan TypeScript.
- Tailwind CSS untuk styling.
- Komponen UI reusable; shadcn/ui boleh digunakan bila mempercepat implementasi.
- Lucide React untuk ikon.
- React Hook Form + Zod untuk formulir dan validasi sisi klien.
- TanStack Query atau mekanisme fetch bawaan Next.js untuk data API; pilih satu pola utama dan konsisten.

Gunakan versi stabil yang kompatibel saat implementasi, bukan versi prerelease. Jangan membuat backend database langsung dari frontend.

### Batas tanggung jawab

Frontend bertanggung jawab atas tampilan, navigasi, input pengguna, validasi awal, pemanggilan REST API, dan penyajian hasil API.

Backend bertanggung jawab atas autentikasi admin, validasi final, harga final, pengecekan bentrok jadwal, status booking, penyimpanan data, dan hak akses.

**Jangan** menaruh secret, password, private API key, atau kredensial database dalam variabel `NEXT_PUBLIC_*`.

### Konfigurasi environment frontend

Sediakan `.env.example` sekurang-kurangnya berisi:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Semua data bisnis yang berubah-ubah sebaiknya diambil dari endpoint konfigurasi backend, bukan ditanam permanen di komponen.

## 3. Arah desain UI/UX

### Karakter visual

Buat tampilan **modern, premium, bersih, dan terpercaya**. Website harus terasa seperti layanan rental profesional, bukan marketplace yang ramai.

Arah visual awal yang boleh dijadikan default:

- Latar utama putih atau abu-abu sangat muda.
- Teks utama charcoal/navy gelap.
- Satu warna aksen premium seperti bronze/gold atau biru elegan.
- Hero dapat memakai foto kendaraan berkualitas tinggi dengan overlay gelap agar teks terbaca.
- Card kendaraan memakai foto besar, sudut membulat secukupnya, bayangan tipis, dan hierarki harga yang jelas.

Seluruh warna, logo, tipografi, radius, dan ukuran komponen harus dibuat melalui design tokens/CSS variables agar mudah diganti setelah identitas brand ditentukan. Jangan mengunci seluruh website ke warna contoh.

### Prinsip desain

- Mobile-first dan responsif untuk ponsel, tablet, serta desktop.
- CTA utama mudah ditemukan.
- Gunakan foto mobil yang relevan, berkualitas baik, dan memiliki hak penggunaan.
- Hindari animasi berat, efek berlebihan, dan autoplay video.
- Perhatikan kontras teks, ukuran font, focus state, label input, dan navigasi keyboard.
- Gunakan skeleton/loading state, empty state, error state, dan feedback sukses.
- Jangan menampilkan rating, jumlah pelanggan, testimoni, penghargaan, atau statistik yang belum diberikan pemilik.

## 4. Struktur navigasi dan route

### Navigasi publik

- Beranda (`/`)
- Daftar Mobil (`/mobil`)
- Layanan (`/layanan`)
- Tentang Kami (`/tentang-kami`)
- Syarat & Ketentuan (`/syarat-ketentuan`)
- Kontak (`/kontak`)
- Tombol CTA: **Booking / Hubungi Kami**

Pada desktop gunakan navbar yang rapi dan mudah dibaca. Pada mobile gunakan menu drawer/hamburger dan tombol kontak yang tetap mudah dijangkau.

### Route publik

| Route | Tujuan |
|---|---|
| `/` | Landing page dan CTA utama |
| `/mobil` | Katalog, pencarian, filter, dan sorting kendaraan |
| `/mobil/[slug]` | Detail satu kendaraan dan CTA booking |
| `/layanan` | Daftar jenis layanan rental |
| `/layanan/[slug]` | Detail layanan, ketentuan, dan CTA |
| `/tentang-kami` | Profil, visi/misi, dan keunggulan bisnis |
| `/syarat-ketentuan` | Ketentuan rental yang dikelola admin |
| `/kebijakan-privasi` | Penjelasan pengelolaan data pelanggan |
| `/kontak` | Kontak, area layanan, alamat, dan peta bila tersedia |
| `/artikel` | Indeks artikel dan panduan rental mobil |
| `/artikel/[slug]` | Artikel individual yang dipublikasikan |
| `/booking` | Formulir permintaan booking |
| `/booking/berhasil` | Ringkasan bahwa permintaan berhasil dikirim dan kode booking |

### Route admin

- `/admin/login`
- `/admin` — ringkasan dashboard
- `/admin/booking` — daftar dan detail booking
- `/admin/kalender` — kalender reservasi dan jadwal kendaraan
- `/admin/mobil` — daftar dan pengelolaan kendaraan
- `/admin/mobil/tambah` dan `/admin/mobil/[id]` — tambah/edit kendaraan
- `/admin/layanan` — pengelolaan layanan
- `/admin/konten` — pengelolaan halaman, FAQ, SEO, dan informasi website
- `/admin/artikel` — pengelolaan artikel, draft, preview, publish, dan archive
- `/admin/pengaturan` — identitas usaha, kontak, area layanan, dan pengaturan umum

Semua route admin wajib dilindungi autentikasi backend. Jangan hanya menyembunyikan menu di frontend sebagai mekanisme keamanan. Jika sesi tidak valid, arahkan pengguna ke `/admin/login`.

## 5. Spesifikasi halaman publik

### 5.1 Beranda

Urutan bagian yang disarankan:

1. **Top bar opsional:** nomor WhatsApp, jam operasional, atau area layanan. Tampilkan hanya jika datanya tersedia.
2. **Navbar:** logo/nama usaha dan navigasi utama.
3. **Hero:** headline singkat yang menjelaskan layanan rental, subheadline, foto armada, CTA `Lihat Mobil` dan `Booking Sekarang`.
4. **Quick search / booking finder:** tanggal mulai, tanggal selesai, jenis layanan, dan tombol cari mobil. Jangan tampilkan filter yang belum didukung backend.
5. **Mobil pilihan:** beberapa kendaraan aktif dari API, bukan hard-code.
6. **Layanan:** contoh kategori seperti rental harian, bulanan, dengan sopir, lepas kunci, kendaraan rombongan, atau premium. Data final berasal dari backend.
7. **Alasan memilih kami:** gunakan poin yang disetujui pemilik, misalnya unit terawat atau proses mudah. Jangan mengklaim sesuatu yang belum terbukti.
8. **Cara booking:** pilih mobil → isi jadwal → kirim permintaan → tunggu konfirmasi admin.
9. **Testimoni/FAQ:** tampilkan hanya jika tersedia dan telah disetujui pemilik.
10. **CTA akhir:** ajakan konsultasi atau booking.
11. **Footer:** navigasi, alamat, kontak, jam operasional, tautan syarat, kebijakan privasi, dan media sosial jika tersedia.

Hero harus langsung menyampaikan apa yang disewakan, area layanan (bila dikonfigurasi), dan langkah berikutnya. Hindari headline generik yang tidak menjelaskan bisnis.

### 5.2 Katalog mobil — `/mobil`

Tampilkan kendaraan dalam grid card yang responsif.

Setiap card sekurang-kurangnya memuat:

- Foto utama.
- Merek dan nama/model mobil.
- Tahun, bila tersedia.
- Kapasitas penumpang.
- Transmisi.
- Kategori/tipe kendaraan.
- Harga mulai dari, jika backend memiliki tarif aktif.
- Label status yang aman dan jelas, misalnya `Hubungi untuk ketersediaan`.
- CTA `Lihat Detail` dan/atau `Booking`.

Fitur katalog:

- Pencarian berdasarkan nama atau merek.
- Filter kategori/brand.
- Filter kapasitas dan transmisi bila field tersedia.
- Filter jenis layanan yang dapat dipakai.
- Sorting harga atau nama, jika didukung API.
- Pagination atau load more.
- Sinkronkan filter ke query string agar URL dapat dibagikan.
- Tampilkan empty state saat tidak ada hasil.

Jangan menyimpulkan mobil tersedia hanya karena status katalog aktif. Ketersediaan tanggal harus dicek melalui endpoint availability.

### 5.3 Detail mobil — `/mobil/[slug]`

Tampilkan:

- Galeri foto kendaraan.
- Nama, merek, model, tahun, dan deskripsi.
- Spesifikasi: kapasitas penumpang, transmisi, jumlah pintu, bahan bakar, bagasi, atau fitur lain hanya jika datanya tersedia.
- Opsi layanan yang dapat digunakan untuk kendaraan itu.
- Tarif harian/mingguan/bulanan sesuai tarif aktif.
- Informasi fasilitas, termasuk sopir atau ketentuan khusus bila relevan.
- Form pencarian tanggal/ketersediaan.
- CTA utama `Booking Mobil Ini`.
- Mobil terkait (opsional, dari API).

Saat pelanggan memilih tanggal, panggil endpoint availability. Tampilkan status sebagai informasi awal dan jelaskan bahwa booking baru pasti setelah dikonfirmasi admin.

### 5.4 Halaman layanan — `/layanan` dan `/layanan/[slug]`

Tampilkan kartu layanan dengan judul, deskripsi, manfaat, ketentuan dasar, dan CTA. Jenis layanan awal dapat mencakup:

- Sewa mobil harian.
- Sewa mobil mingguan/bulanan.
- Sewa dengan sopir.
- Sewa lepas kunci.
- Sewa kendaraan rombongan.
- Sewa mobil premium.

Daftar tersebut hanya contoh. Admin harus dapat mengubah, menonaktifkan, atau mengurutkan layanan dari dashboard.

### 5.5 Tentang kami

Tampilkan profil perusahaan, visi, misi, nilai layanan, dan foto yang disediakan pemilik. Gunakan konten dari API/CMS sederhana. Jangan menulis pengalaman, jumlah armada, tahun berdiri, atau pencapaian yang tidak diberikan.

### 5.6 Syarat & ketentuan

Tampilkan ketentuan rental yang dibuat/disetujui pemilik, misalnya persyaratan penyewa, dokumen, batas wilayah, penggunaan kendaraan, overtime, bahan bakar, pembatalan, denda, dan tanggung jawab. Jangan mengarang aturan final. Konten harus bisa diperbarui admin.

### 5.7 Kontak

Tampilkan WhatsApp, telepon, email, alamat, jam operasional, dan area layanan hanya jika tersedia. Peta boleh ditampilkan bila pemilik memberikan alamat/lokasi yang benar. Tombol WhatsApp harus menggunakan nomor dari konfigurasi backend.

## 6. Alur booking pelanggan

### 6.1 Input formulir

Form booking harus dapat menerima:

- Kendaraan yang dipilih.
- Jenis layanan: dengan sopir atau lepas kunci, sesuai layanan kendaraan.
- Tanggal dan waktu mulai.
- Tanggal dan waktu selesai.
- Lokasi penjemputan.
- Lokasi pengembalian (opsional bila sama dengan penjemputan).
- Nama lengkap.
- Nomor WhatsApp.
- Email (opsional).
- Catatan tambahan (opsional).
- Checkbox persetujuan syarat dan ketentuan/kebijakan privasi.

Form sebaiknya memiliki ringkasan pilihan kendaraan, jadwal, durasi, dan estimasi biaya bila tarif tersedia.

### 6.2 Validasi tampilan

- Nama dan nomor WhatsApp wajib diisi.
- Kendaraan, jenis layanan, tanggal mulai, dan tanggal selesai wajib diisi.
- Tanggal selesai harus setelah tanggal mulai.
- Tanggal tidak boleh berada di masa lalu.
- Jenis layanan harus tersedia untuk kendaraan yang dipilih.
- Nomor telepon menerima format Indonesia seperti `08...` atau `+62...`, lalu dinormalisasi oleh backend.
- Checkbox persetujuan harus dicentang.
- Batasi panjang catatan dan tampilkan pesan validasi yang mudah dipahami.

Validasi frontend hanya untuk kenyamanan. Backend tetap menjadi sumber kebenaran.

### 6.3 Hasil submit

1. Disable tombol submit selama request berjalan untuk mencegah klik berulang.
2. Kirim request ke `POST /public/bookings`.
3. Jika sukses, tampilkan kode booking dan pesan bahwa permintaan menunggu konfirmasi admin.
4. Sediakan tombol WhatsApp yang membuka chat ke nomor bisnis dengan teks yang sudah di-URL-encode, berisi kode booking dan permintaan tindak lanjut. Jangan memasukkan informasi sensitif yang tidak diperlukan.
5. Sediakan tombol kembali ke katalog.
6. Jika gagal karena jadwal bentrok atau validasi, tampilkan pesan backend dan pertahankan input yang sudah diisi.

**Penting:** jangan pernah menampilkan status `Confirmed` hanya karena formulir berhasil dikirim. Keberhasilan submit berarti permintaan tercatat, bukan kendaraan sudah dipesan.

## 7. Dashboard admin — tampilan frontend

### 7.1 Dashboard ringkasan

Tampilkan kartu ringkasan dari API:

- Booking baru/pending.
- Booking terkonfirmasi.
- Booking berjalan.
- Kendaraan aktif.
- Kendaraan sedang maintenance/tidak tersedia.

Tampilkan daftar booking terbaru dan shortcut ke halaman booking. Jangan membuat angka dummy setelah API tersedia.

### 7.2 Pengelolaan booking

- Tabel dengan kode booking, nama pelanggan, kendaraan, tanggal rental, jenis layanan, dan status.
- Filter berdasarkan status dan rentang tanggal.
- Pencarian kode booking/nama/nomor kontak.
- Detail booking, ringkasan estimasi biaya, catatan pelanggan, dan catatan internal admin.
- Aksi status yang sesuai dengan transisi status dari backend.
- Tombol WhatsApp untuk menghubungi pelanggan.
- Dialog konfirmasi untuk tindakan penting seperti menolak atau membatalkan booking.

Jangan izinkan perubahan status yang tidak valid. Backend tetap memvalidasi setiap perubahan.

### 7.3 Kalender

Tampilkan kendaraan dan rentang tanggal booking yang telah dikonfirmasi serta periode maintenance. Booking pending boleh ditampilkan dengan gaya visual berbeda, tetapi jangan dianggap sebagai reservasi final. Beri filter per kendaraan.

### 7.4 Pengelolaan kendaraan

Form tambah/edit kendaraan mencakup data kendaraan, foto, spesifikasi, deskripsi, status katalog, layanan yang tersedia, serta tarif per jenis layanan dan satuan durasi. Mendukung:

- Tambah, edit, aktif/nonaktifkan kendaraan.
- Upload, urutkan, pilih foto utama, dan hapus foto.
- Mengelola tarif harian/mingguan/bulanan.
- Mengatur layanan yang dapat digunakan untuk mobil tersebut.
- Menambah periode maintenance/tidak tersedia.

Gunakan upload ke storage melalui mekanisme backend; jangan menyimpan file foto besar sebagai base64 di database.

### 7.5 Konten dan pengaturan

Admin dapat mengedit layanan, halaman tentang, syarat dan ketentuan, FAQ, artikel, metadata SEO, kontak, alamat, jam operasional, nomor WhatsApp, area layanan, logo, dan pengaturan tampilan dasar. Jika implementasi CMS penuh terlalu besar, prioritaskan pengaturan usaha, layanan, serta halaman utama/ketentuan.

## 8. Kontrak integrasi API

Frontend menggunakan base URL dari `NEXT_PUBLIC_API_BASE_URL` dan endpoint yang didefinisikan pada `BACKEND.md`.

### Pola response

Sukses:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Gagal:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang dikirim.",
    "details": []
  }
}
```

`meta` boleh tidak ada jika endpoint tidak memakai pagination.

### Endpoint publik utama

- `GET /public/settings`
- `GET /public/vehicles`
- `GET /public/vehicles/:slug`
- `GET /public/vehicles/:id/availability`
- `GET /public/services`
- `GET /public/pages/:slug`
- `GET /public/faqs`
- `GET /public/testimonials`
- `GET /public/articles`
- `GET /public/articles/:slug`
- `POST /public/bookings`
- `POST /public/contact`

### Endpoint admin utama

- `POST /admin/auth/login`
- `POST /admin/auth/logout`
- `GET /admin/auth/me`
- `GET /admin/dashboard`
- CRUD `/admin/vehicles`
- CRUD `/admin/services`
- CRUD `/admin/pages`
- CRUD `/admin/faqs`
- CRUD `/admin/articles`
- CRUD `/admin/testimonials`
- `GET /admin/bookings`
- `GET /admin/bookings/:id`
- `PATCH /admin/bookings/:id/status`
- `PATCH /admin/bookings/:id/notes`
- `GET /admin/calendar`
- CRUD `/admin/vehicle-blocks`
- `GET`/`PATCH /admin/settings`

Gunakan nama, query parameter, payload, dan enum yang sama dengan kontrak backend. Jika terdapat perbedaan, sepakati satu kontrak sebelum implementasi; jangan membuat endpoint frontend sendiri.

### Autentikasi admin

Gunakan cookie sesi/token `HttpOnly` yang dikelola backend. Frontend mengirim request dengan credential/cookie sesuai konfigurasi CORS. Jangan menyimpan access token sensitif di `localStorage`. Buat API client terpusat untuk menangani 401, logout, dan pesan error.

## 9. SEO, aksesibilitas, dan performa

- Set metadata title dan description yang unik untuk setiap halaman.
- Gunakan slug yang mudah dibaca untuk kendaraan dan layanan.
- Render konten katalog/detail secara SEO-friendly; manfaatkan server rendering/metadata Next.js.
- Tambahkan Open Graph image dan favicon dari aset milik bisnis.
- Buat sitemap dan robots configuration.
- Gunakan semantic HTML, heading berurutan, alt text gambar, label form, dan keyboard focus yang terlihat.
- Kompres foto, gunakan format modern bila memungkinkan, ukuran gambar responsif, lazy-load gambar di bawah fold, dan optimalkan hero image.
- Hindari layout shift dengan memberi dimensi/aspect ratio gambar.
- Jangan memakai foto stok yang tidak merepresentasikan armada seolah-olah itu mobil milik bisnis.

## 10. Struktur folder yang disarankan

```text
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── mobil/
│   │   ├── layanan/
│   │   ├── artikel/
│   │   ├── tentang-kami/
│   │   ├── syarat-ketentuan/
│   │   ├── kontak/
│   │   └── booking/
│   └── admin/
├── components/
│   ├── layout/
│   ├── home/
│   ├── vehicles/
│   ├── booking/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── api-client.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── config.ts
├── hooks/
├── types/
├── styles/
└── public/
```

Boleh menyesuaikan struktur selama pemisahan komponen, halaman, API client, tipe data, dan utilitas tetap jelas.

## 11. Testing frontend

Minimal lakukan:

- Unit test formatter Rupiah, perhitungan tampilan durasi, dan validasi form.
- Component test untuk card kendaraan, filter, dan form booking.
- Integration/E2E test alur beranda → katalog → detail → booking → halaman sukses.
- Test halaman kosong, API error, loading, jadwal bentrok, dan sesi admin kedaluwarsa.
- Test responsif pada lebar ponsel, tablet, dan desktop.
- Test keyboard navigation dan label form.

## 12. Kriteria penerimaan frontend

Implementasi dianggap siap bila:

- Semua halaman publik utama dapat diakses dan navigasinya berfungsi.
- Katalog serta detail kendaraan bersumber dari API, bukan data hard-code.
- Filter dan pencarian bekerja sesuai kemampuan endpoint.
- Form booking memvalidasi input dan mengirim payload sesuai kontrak backend.
- Halaman sukses menyebutkan bahwa permintaan masih menunggu konfirmasi.
- Tombol WhatsApp memakai nomor yang dikonfigurasi admin.
- Admin dapat login dan mengakses dashboard sesuai hak akses backend.
- CRUD kendaraan/layanan/konten dan pengelolaan booking terhubung ke API.
- Tidak ada secret di bundle browser.
- Tampilan responsif, aksesibel, dan tidak menampilkan data/testimoni/harga palsu.

## 13. Instruksi untuk AI developer frontend

1. Baca `BACKEND.md` sebelum membuat API client atau tipe data.
2. Bangun UI menggunakan data API dan state loading/error/empty yang benar.
3. Jangan mengimplementasikan database, autentikasi server, atau aturan booking di frontend.
4. Jangan mengarang nama bisnis, nomor WhatsApp, alamat, harga, armada, testimoni, dan syarat rental. Gunakan placeholder yang jelas atau data konfigurasi backend.
5. Buat `.env.example`, dokumentasikan cara menjalankan frontend, dan pastikan `npm run build`/type check berhasil.
6. Sertakan daftar file yang dibuat, keputusan teknis, endpoint yang dipakai, serta hal yang masih memerlukan data dari pemilik usaha.

## 14. SEO implementation khusus TJ Rentcar — Jakarta

### 14.1 Konteks bisnis dan target pencarian

Konfigurasi awal SEO:

- Brand: `TJ Rentcar`.
- Kota operasional utama: `Jakarta`.
- Cakupan pemasaran: satu kota; jangan membuat seolah-olah TJ Rentcar memiliki cabang di kota lain.
- Bahasa utama: Bahasa Indonesia (`id-ID`).
- Target bisnis utama: permintaan booking dan kontak WhatsApp.
- Jenis layanan: dengan sopir, lepas kunci, sewa harian, mingguan, bulanan, antar jemput bandara, dan perjalanan luar kota.
- Domain, alamat publik, nomor WhatsApp, jam operasional, daftar armada, harga, rute bandara, dan batas perjalanan luar kota wajib diisi dari data pemilik.

Kelompok keyword yang harus menjadi acuan konten:

| Cluster | Target keyword | Halaman pemilik keyword |
|---|---|---|
| Utama | rental mobil Jakarta; sewa mobil Jakarta | `/` |
| Katalog | daftar mobil rental Jakarta; harga sewa mobil Jakarta; armada rental Jakarta | `/mobil` |
| Kendaraan | sewa [nama/model mobil] Jakarta; harga sewa [nama/model mobil] | `/mobil/[slug]` |
| Sopir | rental mobil dengan sopir Jakarta; sewa mobil plus sopir Jakarta | `/layanan/dengan-sopir` |
| Lepas kunci | rental mobil lepas kunci Jakarta; sewa mobil tanpa sopir Jakarta | `/layanan/lepas-kunci` |
| Harian | sewa mobil harian Jakarta; rental mobil per hari Jakarta | `/layanan/sewa-harian` |
| Mingguan | rental mobil mingguan Jakarta; sewa mobil mingguan Jakarta | `/layanan/sewa-mingguan` |
| Bulanan | rental mobil bulanan Jakarta; sewa mobil bulanan Jakarta | `/layanan/sewa-bulanan` |
| Bandara | antar jemput bandara dari Jakarta; rental mobil ke bandara | `/layanan/antar-jemput-bandara` |
| Luar kota | rental mobil luar kota dari Jakarta; sewa mobil perjalanan luar kota | `/layanan/perjalanan-luar-kota` |
| Brand/kontak | TJ Rentcar; kontak TJ Rentcar Jakarta | `/tentang-kami`, `/kontak` |
| Informasional | syarat sewa mobil lepas kunci; tips sewa mobil; perbedaan rental dengan sopir dan lepas kunci | `/artikel/[slug]` dan FAQ relevan |

Daftar ini adalah hipotesis target berdasarkan relevansi dan intent, bukan klaim volume atau tingkat kesulitan keyword. Jangan menampilkan angka volume pencarian tanpa riset Keyword Planner atau sumber riset yang jelas.

### 14.2 Route dan SEO metadata yang direkomendasikan

Pertahankan route yang sudah didefinisikan. Tambahkan route artikel:

- `/artikel` — indeks artikel.
- `/artikel/[slug]` — artikel individual.

Gunakan metadata awal berikut. Developer boleh memperhalus copy, tetapi setiap halaman harus memiliki title, description, H1, dan isi yang unik.

| Halaman | Meta title rekomendasi | Meta description rekomendasi | H1 rekomendasi |
|---|---|---|---|
| `/` | `Rental Mobil Jakarta  TJ Rentcar` | `Butuh rental mobil di Jakarta? Pilih layanan dengan sopir, lepas kunci, harian, mingguan, atau bulanan dari TJ Rentcar. Cek armada dan ajukan booking.` | `Rental Mobil Jakarta untuk Berbagai Kebutuhan` |
| `/mobil` | `Daftar Mobil dan Harga Rental Jakarta  TJ Rentcar` | `Lihat pilihan armada TJ Rentcar untuk kebutuhan perjalanan di Jakarta. Bandingkan spesifikasi, pilihan layanan, dan tarif yang tersedia.` | `Pilihan Mobil Rental TJ Rentcar di Jakarta` |
| `/layanan/dengan-sopir` | `Rental Mobil dengan Sopir Jakarta  TJ Rentcar` | `Cari rental mobil dengan sopir di Jakarta untuk perjalanan pribadi, keluarga, atau bisnis. Lihat pilihan armada, ketentuan, dan ajukan booking ke TJ Rentcar.` | `Rental Mobil dengan Sopir di Jakarta` |
| `/layanan/lepas-kunci` | `Rental Mobil Lepas Kunci Jakarta  TJ Rentcar` | `Butuh mobil tanpa sopir di Jakarta? Pelajari pilihan armada, persyaratan, durasi sewa, dan proses booking lepas kunci TJ Rentcar.` | `Rental Mobil Lepas Kunci di Jakarta` |
| `/layanan/sewa-harian` | `Sewa Mobil Harian Jakarta  TJ Rentcar` | `Temukan pilihan sewa mobil harian di Jakarta dari TJ Rentcar. Cek tarif, durasi, pilihan layanan, dan ketersediaan kendaraan.` | `Sewa Mobil Harian di Jakarta` |
| `/layanan/sewa-mingguan` | `Rental Mobil Mingguan Jakarta  TJ Rentcar` | `Butuh kendaraan selama beberapa hari? Lihat pilihan rental mobil mingguan TJ Rentcar di Jakarta, ketentuan sewa, dan cara pemesanannya.` | `Rental Mobil Mingguan di Jakarta` |
| `/layanan/sewa-bulanan` | `Rental Mobil Bulanan Jakarta  TJ Rentcar` | `Cari rental mobil bulanan di Jakarta untuk kebutuhan kerja atau operasional. Tinjau pilihan armada, tarif, dan ketentuan dari TJ Rentcar.` | `Rental Mobil Bulanan di Jakarta` |
| `/layanan/antar-jemput-bandara` | `Antar Jemput Bandara dari Jakarta  TJ Rentcar` | `Atur perjalanan menuju atau dari bandara dengan TJ Rentcar. Periksa bandara yang dilayani, area penjemputan, tarif, dan cara booking.` | `Layanan Antar Jemput Bandara dari Jakarta` |
| `/layanan/perjalanan-luar-kota` | `Rental Mobil Perjalanan Luar Kota dari Jakarta  TJ Rentcar` | `Rencanakan perjalanan luar kota dengan keberangkatan dari Jakarta. Tanyakan rute yang dilayani, pilihan mobil, ketentuan perjalanan, dan estimasi biaya.` | `Rental Mobil untuk Perjalanan Luar Kota dari Jakarta` |
| `/tentang-kami` | `Tentang TJ Rentcar  Rental Mobil Jakarta` | `Kenali TJ Rentcar, layanan rental mobil yang beroperasi di Jakarta. Pelajari informasi usaha, layanan, dan cara menghubungi tim kami.` | `Tentang TJ Rentcar` |
| `/kontak` | `Kontak TJ Rentcar Jakarta  Booking dan Informasi` | `Hubungi TJ Rentcar untuk informasi armada, tarif, jadwal, dan pemesanan rental mobil di Jakarta melalui kanal kontak resmi.` | `Hubungi TJ Rentcar` |
| `/artikel` | `Artikel dan Tips Rental Mobil  TJ Rentcar` | `Baca panduan memilih mobil, memahami ketentuan sewa, dan merencanakan perjalanan bersama TJ Rentcar.` | `Artikel dan Panduan Rental Mobil` |

Catatan metadata:

- Karakter `` pada tabel di atas berarti pemisah `|`; implementasi HTML harus memakai karakter pipe biasa. Contoh title homepage: `Rental Mobil Jakarta | TJ Rentcar`.
- Meta title dan description adalah rekomendasi awal, bukan janji bahwa Google akan menampilkannya persis seperti yang ditulis.
- Jangan menambahkan klaim seperti `termurah`, `terbaik`, `24 jam`, `gratis`, `tersedia setiap saat`, atau angka diskon tanpa bukti dan persetujuan pemilik.
- Jangan mengulang keyword secara berlebihan. Gunakan variasi bahasa alami dan fokus pada kebutuhan pengunjung.
- Semua halaman publik harus memiliki canonical URL absolut yang menuju versi URL pilihan.

### 14.3 Persyaratan konten setiap halaman layanan

Halaman layanan tidak boleh hanya mengganti kata kunci pada template yang sama. Isi minimum setiap halaman layanan:

1. Penjelasan layanan dan siapa yang cocok menggunakannya.
2. Jenis armada yang benar-benar tersedia untuk layanan tersebut.
3. Durasi sewa dan cara perhitungan tarif.
4. Rincian yang termasuk dan tidak termasuk harga.
5. Persyaratan pelanggan dan dokumen yang diperlukan, jika berlaku.
6. Area penjemputan/pengantaran atau batas rute yang benar.
7. Alur pemesanan dan cara konfirmasi ketersediaan.
8. FAQ yang menjawab pertanyaan nyata pelanggan.
9. CTA menuju katalog, formulir booking, dan WhatsApp.

Khusus halaman layanan bandara, tampilkan daftar bandara dan terminal hanya setelah rute benar-benar dikonfirmasi pemilik. Bandara Soekarno-Hatta berada di Tangerang, sedangkan Halim berada di Jakarta; jangan mengiklankan rute ke bandara yang tidak dilayani. Jelaskan biaya tambahan, waktu tunggu, titik temu, bagasi, dan ketentuan perubahan jadwal bila datanya tersedia.

Khusus perjalanan luar kota, sebutkan bahwa layanan berangkat dari Jakarta dan tampilkan tujuan/rute yang memang dapat diterima. Jangan membuat landing page untuk setiap kota tujuan sebelum ada informasi rute, tarif, dan konten yang cukup unik.

### 14.4 Katalog dan halaman detail kendaraan

- Setiap kendaraan aktif memiliki slug stabil, nama, deskripsi asli, foto milik/berizin, spesifikasi yang benar, layanan yang tersedia, dan tarif aktif atau keterangan `Hubungi untuk harga`.
- Halaman detail kendaraan boleh diindeks jika berisi informasi unik dan berguna. Jangan membuat ribuan variasi halaman dari filter.
- Gunakan title dinamis, misalnya `[Nama Mobil] Jakarta | Harga dan Spesifikasi - TJ Rentcar`.
- H1 harus berupa nama/model mobil yang sebenarnya.
- Setiap foto memiliki alt text deskriptif, misalnya `Tampak depan Toyota Avanza armada TJ Rentcar`; jangan menyisipkan keyword yang tidak menjelaskan gambar.
- Jangan menampilkan harga lama, tarif nonaktif, atau klaim ketersediaan tanpa pemeriksaan API.
- Jika kendaraan dinonaktifkan atau dihapus, gunakan 301 ke kategori yang relevan hanya bila ada pengganti yang benar-benar setara; selain itu gunakan 404/410 sesuai keadaan.

### 14.5 Komponen SEO yang wajib di frontend

Implementasikan menggunakan Next.js Metadata API dan server rendering untuk halaman yang perlu diindeks:

- Metadata `title`, `description`, `metadataBase`, canonical, robots, Open Graph, Twitter card, favicon, dan theme color.
- Satu H1 utama yang jelas per halaman; gunakan H2/H3 untuk subbagian dengan struktur semantik.
- HTML konten penting harus tersedia pada hasil render server; jangan bergantung hanya pada interaksi client untuk menampilkan nama layanan, detail mobil, harga, atau teks utama.
- Internal link crawlable menggunakan elemen anchor standar, bukan hanya event click pada `div`.
- Breadcrumb visual untuk halaman detail mobil, layanan, dan artikel; tambahkan `BreadcrumbList` JSON-LD yang konsisten dengan breadcrumb terlihat.
- `AutoRental` JSON-LD untuk identitas bisnis hanya dengan data usaha yang nyata. `address` dan koordinat hanya boleh diisi bila benar, dapat dipublikasikan, dan sesuai kondisi tempat usaha. Jangan membuat alamat fiktif untuk melengkapi schema.
- `Organization`/`WebSite` JSON-LD dapat dipakai untuk informasi brand website. `Article` JSON-LD hanya untuk artikel yang benar-benar dipublikasikan.
- Data structured markup harus sama dengan informasi yang terlihat di halaman. Jangan memasukkan review, rating, harga, stok, atau jam operasional yang tidak tampil/valid.
- Schema adalah bantuan pemahaman mesin pencari, bukan jaminan munculnya rich result atau peningkatan peringkat.

### 14.6 Halaman yang tidak boleh masuk indeks

Set `noindex, follow` untuk:

- `/admin/**` dan halaman login admin.
- `/booking` bila hanya formulir transaksional tanpa konten pencarian yang berdiri sendiri.
- `/booking/berhasil`.
- Halaman hasil pencarian internal, filter kombinasi, sort, dan URL query yang menghasilkan duplikasi katalog.
- Halaman preview/draft yang belum dipublikasikan.

Jangan hanya mengandalkan `robots.txt` untuk menghilangkan halaman dari indeks. Pastikan route yang perlu `noindex` mengirim meta robots yang sesuai dan tetap tidak membocorkan data privat. API admin wajib terlindungi autentikasi terlepas dari robots rules.

### 14.7 UX, kecepatan, dan aksesibilitas terkait SEO

- Terapkan mobile-first; seluruh fungsi cari mobil, pilih tanggal, booking, dan WhatsApp harus nyaman di ponsel.
- Gunakan foto WebP/AVIF bila kompatibel, ukuran responsif, `width`/`height` atau aspect ratio, dan lazy-load gambar di bawah fold. Jangan lazy-load hero image utama yang menjadi LCP.
- Hindari carousel berat, video autoplay, font berlebihan, dan script pihak ketiga yang tidak diperlukan.
- Optimalkan Core Web Vitals dan uji dengan PageSpeed Insights serta data lapangan/Search Console bila tersedia.
- Pastikan kontras, label form, keyboard navigation, focus state, dan teks alternatif tersedia.

### 14.8 Analytics dan konversi

Sediakan integrasi opsional yang dikendalikan environment untuk Google Analytics 4 dan Google Search Console. Event yang disarankan:

- `view_vehicle` — halaman detail kendaraan dibuka.
- `select_service` — layanan dipilih.
- `begin_booking` — pelanggan memulai formulir booking.
- `booking_submit` — permintaan booking berhasil diterima API.
- `click_whatsapp` — CTA WhatsApp diklik.
- `click_phone` — nomor telepon diklik.

Jangan mengirim nama, nomor telepon, email, catatan pelanggan, alamat penjemputan, booking code, atau data pribadi lain sebagai parameter Analytics. Pisahkan keberhasilan submit permintaan dari booking yang sudah dikonfirmasi admin.

### 14.9 Checklist acceptance frontend SEO

- [ ] Setiap halaman terindeks memiliki title, meta description, H1, canonical, dan Open Graph yang relevan.
- [ ] Metadata setiap halaman unik dan konsisten dengan konten yang terlihat.
- [ ] Homepage menargetkan `rental mobil Jakarta` dan `sewa mobil Jakarta`; halaman layanan memiliki target masing-masing.
- [ ] Halaman layanan bandara dan luar kota tidak memuat rute yang belum disetujui.
- [ ] Detail kendaraan dirender dari data API dan memiliki deskripsi/alt text yang benar.
- [ ] Artikel hanya tampil sebagai halaman publik setelah dipublikasikan.
- [ ] Halaman admin, booking sukses, pencarian/filter, dan draft tidak diindeks.
- [ ] Breadcrumb visual dan JSON-LD konsisten.
- [ ] JSON-LD tidak memuat data bisnis palsu dan lolos validasi.
- [ ] `sitemap.xml` dan `robots.txt` dapat diakses.
- [ ] Halaman utama tetap usable dan cepat pada perangkat mobile.
- [ ] Event analytics tidak mengirim data pribadi pelanggan.

