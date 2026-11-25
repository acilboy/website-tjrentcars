AGENTS.md — TJ RENTCAR
Instruksi proyek untuk OpenCode. Berlaku untuk seluruh repository TJ Rentcar.
1. Tujuan dan cara kerja
Bangun dan rawat website serta sistem operasional TJ Rentcar tanpa mengulang pekerjaan yang sudah ada, membuat duplikasi, atau menghabiskan konteks untuk membaca file yang tidak relevan.

Aturan utama:
- Kerjakan permintaan user yang sedang aktif. Jangan menambahkan fitur di luar scope tanpa diminta.
- Sebelum mengubah kode, telusuri implementasi yang sudah ada dan ikuti pola repository.
- Lakukan perubahan sekecil mungkin yang menyelesaikan masalah secara utuh.
- Jangan rewrite modul, mengganti stack, atau merapikan file yang tidak terkait hanya demi preferensi pribadi.
- Jangan membuat data bisnis, harga, komisi, kebijakan, testimoni, alamat, nomor kontak, atau kredensial palsu.
- Jangan mengklaim fitur atau test berhasil kecuali benar-benar dijalankan dan hasilnya diketahui.
- Jika ada ketidakpastian yang tidak menghalangi task, pilih solusi paling konservatif dan tulis asumsi. Tanyakan hanya jika keputusan bisnis/teknis yang belum ada benar-benar memblokir implementasi.
2. Hemat token dan pembacaan file
Jangan membaca seluruh repository atau semua dokumen pada setiap task.
Prosedur awal setiap task
1. Periksa git status --short untuk menjaga perubahan user.
2. Periksa direktori tempat task berada dan package.json terdekat.
3. Baca hanya file yang terkait langsung dengan task.
4. Gunakan pencarian terarah (rg/search) untuk menemukan fungsi, route, model, komponen, dan pemanggilnya.
5. Baca implementasi terkait dan dependency terdekat sebelum mengedit.
6. Setelah perubahan, jalankan pemeriksaan paling kecil yang relevan.
Jangan melakukan full repository scan berulang jika struktur dan area task sudah diketahui. Jangan membaca seluruh file besar hanya untuk mencari satu simbol; gunakan pencarian nama simbol dahulu.
Jangan membaca atau memproses ini kecuali benar-benar diperlukan
- node_modules/
- .next/, dist/, build/, coverage/, .turbo/
- file binary, hasil upload, backup, log, cache, dan generated files
- file .env, .env.* yang berisi secret, private key, sertifikat, token, atau kredensial
- seluruh lockfile untuk memahami arsitektur
Jangan pernah menampilkan isi secret ke terminal/chat. Gunakan .env.example atau nama variabel tanpa nilainya.
Peta dokumen — baca hanya saat relevan
- FRONTEND.md: hanya untuk pekerjaan UI/UX, halaman publik, dashboard, aksesibilitas, responsive, atau integrasi frontend.
- BACKEND.md: hanya untuk API, database, autentikasi, storage, validasi, atau business logic backend.
- SEO-STRATEGY.md: hanya untuk metadata, keyword, sitemap, structured data, indexing, konten, dan SEO.
- TJ-RENTCAR-MODUL-LANJUTAN.md: hanya untuk partner/armada campuran, pembayaran manual, verifikasi KTP/SIM, kontrak, inspeksi, maintenance, pengeluaran, atau settlement mitra.
- PROJECT_STATUS.md: baca ketika melanjutkan pekerjaan dari sesi/agent sebelumnya atau ketika status implementasi diperlukan. Anggap sebagai catatan; verifikasi kode sebelum mempercayainya.
- PROMPT-EKSEKUSI.md: jangan baca pada task rutin. Baca hanya jika user meminta menjalankan ulang proses implementasi menyeluruh.
Jika nama/path dokumen berbeda atau file tidak ada, cari hanya nama dokumen terkait. Jangan menelusuri semua dokumentasi sebagai pengganti.
3. Gambaran arsitektur proyek
Struktur aplikasi yang diketahui:
- apps/web: frontend Next.js, React, TypeScript.
- apps/api: backend Node.js, Express, TypeScript.
- Database: PostgreSQL dengan Prisma ORM.
- API memiliki versi /api/v1 pada rancangan proyek; verifikasi prefix aktual di route/config sebelum menggunakannya.
Jangan mengasumsikan versi package manager, framework, library, command, port, atau environment variable. Periksa package.json, lockfile utama, konfigurasi, dan .env.example yang relevan terlebih dahulu.

Jangan membuat package, framework, service, helper, endpoint, model Prisma, atau sistem autentikasi baru jika fungsi yang sama sudah tersedia. Extend implementasi existing.
4. Aturan frontend
- Ikuti komponen, styling, layout, form validation, state management, dan pola API client yang sudah digunakan.
- Jangan memanggil backend dengan fetch/client baru jika API client bersama sudah tersedia.
- Periksa bentuk respons API dan normalisasi response sebelum membaca properti seperti data, items, atau result. Jangan menebak bentuk response.
- Tangani loading, empty, error, success, dan state disabled untuk interaksi penting.
- Pastikan filter, pagination, search, dan detail benar-benar terhubung ke data/API, bukan hanya tampilan.
- Untuk gambar yang berasal dari backend, gunakan helper pembentuk asset URL yang sudah ada jika tersedia. Periksa konfigurasi base URL dan static file serving; jangan mengasumsikan frontend dan API memakai origin/port yang sama.
- Jangan mengganti desain global atau membuat mock data permanen untuk menyamarkan API yang gagal.
- Jangan menampilkan informasi internal mitra atau data pribadi pelanggan ke halaman publik.
5. Aturan backend, database, dan API
- Ikuti struktur route → controller → service/repository yang sudah ada di repository.
- Validasi input pada server; jangan mengandalkan validasi frontend.
- Terapkan autentikasi dan authorization/permission pada setiap endpoint admin. Menyembunyikan tombol di frontend bukan kontrol keamanan.
- Gunakan transaksi database untuk operasi multi-langkah yang harus konsisten, terutama booking, pembayaran, perubahan ketersediaan, dan settlement.
- Periksa constraint, index, relasi, dan histori sebelum mengubah Prisma schema.
- Untuk perubahan schema, buat migration yang aman dan sesuai workflow proyek. Jangan menjalankan perintah reset/drop database atau migration destruktif.
- Jangan mengubah kontrak API existing tanpa memeriksa seluruh pemanggilnya.
- Gunakan status code dan format error yang konsisten dengan API existing.
- Terapkan pagination dan filter pada endpoint list sesuai pola existing.
- Hindari N+1 query dan query tanpa batas data.
- Jangan hard delete data finansial, booking, dokumen, atau histori operasional yang perlu audit; gunakan mekanisme arsip/soft delete jika pola proyek mendukung.
6. Keputusan bisnis TJ Rentcar — jangan diubah
Data bisnis:
- Brand: TJ Rentcar.
- Area utama operasional: Jakarta (satu kota).
- Bahasa: Indonesia.
- Mata uang: IDR.
- Timezone: Asia/Jakarta.
- Layanan: dengan sopir, lepas kunci, sewa harian, mingguan, bulanan, antar-jemput bandara, dan perjalanan luar kota dari Jakarta.
Keputusan operasional:
1. Pembayaran manual. Jangan mengintegrasikan payment gateway kecuali user meminta perubahan.
2. Armada campuran. Sistem harus membedakan kendaraan milik TJ Rentcar (OWNED) dan kendaraan mitra (PARTNER).
3. Kendaraan PARTNER harus terkait dengan partner yang valid/aktif. Jangan menampilkan data internal partner di halaman publik.
4. Lepas kunci wajib verifikasi KTP dan SIM oleh admin. Booking lepas kunci tidak boleh dikonfirmasi atau check-out sebelum dokumen yang diwajibkan disetujui.
5. Jangan otomatis mewajibkan verifikasi KTP/SIM lepas kunci untuk layanan dengan sopir, kecuali kebijakan bisnis baru ditetapkan.
6. Booking baru berawal dari status PENDING sesuai workflow existing. Verifikasi pembayaran tidak otomatis mengubah booking menjadi CONFIRMED.
7. Status booking, payment, verification dokumen, dan status operasional kendaraan adalah lifecycle yang berbeda. Jangan gabungkan menjadi satu status.
Keputusan yang BELUM ditentukan — jangan mengarang
- Persentase/nominal komisi atau pembagian hasil mitra.
- Basis perhitungan hak mitra.
- Tanggung jawab biaya servis, kerusakan, bensin, tol, parkir, dan denda.
- Besaran DP serta batas waktu pelunasan.
- Kebijakan pembatalan dan refund.
- Rekening bank, QRIS, dan instruksi pembayaran final.
- Jadwal/periode settlement mitra.
- Masa retensi KTP/SIM dan bukti pembayaran.
- Bentuk persetujuan/tanda tangan kontrak.
- Aturan apakah booking PENDING menahan unit sementara dan berapa lama.
Buat konfigurasi yang dapat diatur admin atau tandai sebagai keputusan yang menunggu pemilik. Jangan memasukkan angka contoh sebagai default produksi.
7. Privasi, keamanan, dan data sensitif
- KTP, SIM, bukti transfer, kontrak, dan foto inspeksi yang sensitif harus disimpan di private storage, bukan folder publik.
- Jangan membuat URL publik permanen untuk KTP/SIM.
- Batasi akses dokumen berdasarkan permission; gunakan signed URL berumur pendek jika sesuai.
- Masking nomor identitas pada daftar/tampilan umum.
- Catat akses dan keputusan verifikasi dokumen dalam audit log tanpa mencatat isi dokumen atau nomor identitas penuh.
- Jangan mengirim file identitas, nomor KTP/SIM, token, atau bukti pembayaran melalui log, analytics, atau pesan WhatsApp/email.
- Validasi MIME type, ukuran, ekstensi, nama file acak, serta otorisasi upload/download.
- Jangan commit .env, secret, credentials, private key, atau file data pelanggan.
- Jangan menampilkan atau menyalin secret saat troubleshooting.
- Pertahankan prinsip least privilege untuk role admin.
8. Booking dan ketersediaan kendaraan
- Sebelum mengubah alur booking, telusuri controller/service availability dan semua tempat status booking digunakan.
- Validasi bentrok waktu di server dan database transaction, bukan hanya di UI.
- Ketersediaan memperhitungkan booking confirmed/in progress, maintenance aktif, dan blokir admin sesuai implementasi.
- Jangan menganggap semua booking pending mengunci unit selamanya; ikuti konfigurasi/workflow yang ada.
- Jangan izinkan status transition yang tidak valid.
- Simpan actor, waktu, dan alasan untuk perubahan status penting.
- Jangan memperbaiki bug booking hanya dengan menyembunyikan error atau mengganti empty state.
9. Perintah dan verifikasi
Jangan menebak command. Periksa package.json dan package manager terlebih dahulu.
- Gunakan package manager yang sudah dipakai proyek dan lockfile yang tersedia.
- Jalankan pemeriksaan terarah pada package yang diubah.
- Untuk TypeScript, jalankan script typecheck/lint/test yang benar-benar tersedia.
- Untuk perubahan API/database, jalankan test backend terkait serta validasi Prisma sesuai script proyek.
- Untuk perubahan UI, lakukan typecheck/lint dan test komponen/route yang relevan.
- Jalankan build penuh hanya jika perubahan berdampak luas atau sebagai pemeriksaan release.
- Jangan menjalankan migration pada production. Gunakan environment development/staging dan minta backup sebelum perubahan production.
- Jangan menghapus data untuk membuat test lolos.
- Jika test tidak dapat dijalankan karena dependency/env/database tidak tersedia, jelaskan hambatannya. Jangan mengarang hasil test.
10. Cara menyelesaikan setiap task
Sebelum coding:
- Identifikasi scope dan file relevan.
- Temukan implementasi existing dan caller terkait.
- Sebutkan rencana singkat hanya jika task multi-langkah atau berisiko.
Sesudah coding:
- Tampilkan ringkasan perubahan.
- Sebutkan file yang dibuat/diubah.
- Sebutkan command test yang dijalankan dan hasil sebenarnya.
- Sebutkan test yang tidak dapat dijalankan.
- Catat risiko, migration, atau konfigurasi manual yang diperlukan.
- Jangan membuat file dokumentasi baru untuk perubahan kecil kecuali diminta atau diperlukan untuk handover.
Handover
Jika task besar belum selesai, update PROJECT_STATUS.md secara singkat: status, file berubah, pekerjaan selesai, pekerjaan tersisa, error aktif, command verifikasi, dan langkah berikutnya. Jangan menyalin seluruh isi repository atau seluruh dokumen spesifikasi ke status file.
11. Batas scope
- Jangan mengerjakan semua roadmap sekaligus ketika user hanya meminta satu bug/fitur.
- Jangan melakukan refactor besar sebagai efek samping.
- Jangan memperbarui dependency kecuali diperlukan dan alasannya jelas.
- Jangan mengubah desain/brand identity tanpa permintaan.
- Jangan menghapus file atau data yang tidak dipahami.
- Saat menemukan bug lain di luar task, laporkan singkat; jangan otomatis memperbaikinya kecuali bug tersebut membuat task aktif tidak mungkin selesai atau menimbulkan risiko keamanan langsung.
Tujuan akhir: pertahankan dan kembangkan sistem TJ Rentcar yang sudah ada. Prioritaskan correctness, keamanan, data integrity, maintainability, dan efisiensi token. Jangan mengorbankan keamanan atau fungsi penting hanya demi menghemat token.
13. VALIDASI DATA PEMESAN — STANDAR PROFESIONAL
Setiap form publik yang menerima data pelanggan, terutama form booking dan form kontak, wajib memvalidasi input di frontend DAN backend. Validasi browser saja tidak cukup karena API dapat dipanggil langsung.
Data booking
- Nama pemesan wajib diisi, di-trim, spasi berlebih dirapikan, panjang minimum 3 dan maksimum 80 karakter.
- Nama harus berupa teks nama yang wajar: dukung huruf Unicode, spasi, tanda hubung, apostrof, dan titik seperlunya. Tolak nilai kosong, hanya angka/simbol, URL, email, atau string yang jelas bukan nama.
- Jangan membuat aturan yang terlalu ketat sampai menolak nama sah dari berbagai bahasa/budaya. Format yang lolos validasi tidak membuktikan identitas; jangan klaim nama sudah diverifikasi.
- Nomor WhatsApp wajib valid. Tolak huruf, nomor terlalu pendek/panjang, pola angka dummy yang jelas, dan nomor yang tidak valid menurut validator nomor telepon.
- Terima format yang lazim seperti 08..., 62..., dan +62...; normalisasi ke format penyimpanan yang konsisten dengan data existing. Periksa normalizePhoneNumber() sebelum mengubahnya. Jangan memutus kompatibilitas nomor lama.
- Jika mendukung nomor internasional, gunakan parser nomor telepon yang memahami kode negara (misalnya libphonenumber-js) dengan Indonesia sebagai default country. Periksa apakah dependency sudah tersedia sebelum menambahkannya. Jangan memakai regex dangkal sebagai satu-satunya validasi nomor internasional.
- Email tetap opsional sesuai UX yang ada. Jika diisi, trim, lowercase, dan validasi format dengan Zod. String kosong diperlakukan sebagai null, bukan email invalid yang membingungkan.
- Lokasi jemput wajib diisi dan harus punya batas panjang yang wajar. Catatan tambahan opsional dan dibatasi panjangnya.
- Jangan mewajibkan email atau data identitas tambahan tanpa keputusan bisnis.
Frontend UX
- Tambahkan validasi inline per field dan pesan error dalam Bahasa Indonesia yang jelas.
- Validasi saat blur dan submit; hindari menampilkan error sebelum pengguna sempat mengisi field.
- Gunakan autoComplete, inputMode, dan type yang tepat (name, tel, email).
- Untuk nomor WhatsApp tampilkan hint format contoh dan normalisasi dengan aman; jangan menghapus input saat pengguna masih mengetik.
- Pertahankan nilai form ketika API menolak input; arahkan fokus ke error pertama.
- Tombol submit harus disabled saat request berlangsung dan mencegah double submission.
- Tampilkan pesan sukses hanya setelah backend benar-benar menyimpan booking/pesan.
- Jangan gunakan validasi frontend untuk menggantikan validasi server.
Backend validation
- Terapkan schema Zod di API sebagai sumber validasi otoritatif.
- Normalisasi input sebelum disimpan: trim, collapse whitespace untuk nama/lokasi, normalize phone, dan lowercase email.
- Kembalikan error 400 dengan kode stabil serta field-level validation details jika pola error handler existing mendukungnya.
- Pastikan request invalid tidak membuat row database.
- Terapkan rate limiting pada endpoint publik booking dan contact sesuai pola middleware existing. Pertimbangkan honeypot anti-bot yang tidak mengganggu pengguna sah; jangan menambahkan layanan CAPTCHA eksternal tanpa persetujuan.
- Jangan mencatat seluruh payload pelanggan ke log.
Verifikasi nomor vs validasi format
Validasi format hanya membuktikan nomor memiliki format yang masuk akal, bukan membuktikan nomor aktif atau dimiliki pemesan. Jangan menyebutnya “terverifikasi”. OTP WhatsApp/SMS adalah fitur terpisah yang memerlukan provider, biaya, dan keputusan pemilik; jangan menambahkannya secara otomatis.
Lokasi kode yang sudah ditemukan (verifikasi lagi sebelum mengedit)
- Booking form: apps/web/app/(public)/booking/BookingFormClient.tsx
- Booking Zod schema dan contact Zod schema: apps/api/src/schemas/index.ts
- Phone normalization: apps/api/src/utils/phone.ts
- Booking creation API: apps/api/src/modules/bookings/bookings.controller.ts
- Contact form: apps/web/app/(public)/kontak/ContactFormClient.tsx
- Contact API: apps/api/src/modules/contacts/contacts.controller.ts
Regression tests minimum
- Nama kosong, satu huruf, angka saja, simbol saja, input terlalu panjang, spasi berlebih, dan nama sah dengan tanda hubung/apostrof.
- Nomor WhatsApp valid dengan format 08, 62, +62; nomor terlalu pendek, huruf, seluruh angka nol, dan format tidak valid.
- Email kosong, email valid, dan email invalid.
- API menolak payload invalid meskipun frontend dilewati.
- Request invalid tidak membuat booking/contact record.
- Booking valid tetap tersimpan dengan format nomor yang konsisten.
- Perubahan tidak merusak form admin dan data booking lama.