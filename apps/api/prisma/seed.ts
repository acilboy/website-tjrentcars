import "dotenv/config";
import { PrismaClient, Role, ServiceType, BillingUnit, Transmission, ArticleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting development seed for TJ Rentcar...");

  // 1. Initial Admin User
  const adminPasswordHash = await bcrypt.hash("AdminSecurePassword2026!", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@tjrentcar.com" },
    update: {},
    create: {
      name: "Administrator TJ Rentcar",
      email: "admin@tjrentcar.com",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Site Settings
  const settingsData: Record<string, any> = {
    businessName: "TJ Rentcar",
    tagline: "Layanan Rental Mobil Profesional di Jakarta",
    city: "Jakarta",
    primaryServiceArea: "Jakarta",
    countryCode: "ID",
    locale: "id-ID",
    timezone: "Asia/Jakarta",
    currency: "IDR",
    siteUrl: "http://localhost:3000",
    publicAddress: null, // Nullable until owner fills it
    showPublicAddress: false,
    whatsappNumber: null, // Owner will fill via Admin Dashboard
    phoneNumber: null,
    email: null,
    businessHours: "Senin - Minggu: 07:00 - 22:00 WIB",
    serviceAreas: [
      "Jakarta Pusat",
      "Jakarta Selatan",
      "Jakarta Barat",
      "Jakarta Timur",
      "Jakarta Utara",
      "Bandara Soekarno-Hatta (CGK)",
      "Bandara Halim Perdanakusuma (HLP)",
    ],
    airportRoutes: ["Bandara Soekarno-Hatta (CGK)", "Bandara Halim Perdanakusuma (HLP)"],
    outOfTownRoutes: ["Bandung", "Bogor", "Puncak", "Cirebon", "Semarang", "Yogyakarta", "Surabaya"],
    socialLinks: [],
    metaTitle: "Rental Mobil Jakarta | TJ Rentcar",
    metaDescription:
      "Butuh rental mobil di Jakarta? Pilih layanan dengan sopir, lepas kunci, harian, mingguan, atau bulanan dari TJ Rentcar. Cek armada dan ajukan booking.",
  };

  for (const [key, value] of Object.entries(settingsData)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
  console.log("✅ Site settings seeded.");

  // 3. Core Services
  const services = [
    {
      title: "Rental Mobil dengan Sopir",
      slug: "dengan-sopir",
      shortDescription: "Perjalanan nyaman dan aman didampingi sopir profesional dan berpengalaman di rute Jakarta.",
      description:
        "Layanan rental mobil dengan sopir dari TJ Rentcar dirancang untuk kebutuhan perjalanan bisnis, dinas, wisata keluarga, maupun acara formal di Jakarta. Sopir kami memahami rute jalan ibukota serta selalu mengedepankan etika dan ketepatan waktu.",
      sortOrder: 1,
      metaTitle: "Rental Mobil dengan Sopir Jakarta | TJ Rentcar",
      metaDescription:
        "Cari rental mobil dengan sopir di Jakarta untuk perjalanan pribadi, keluarga, atau bisnis. Lihat pilihan armada, ketentuan, dan ajukan booking ke TJ Rentcar.",
    },
    {
      title: "Rental Mobil Lepas Kunci",
      slug: "lepas-kunci",
      shortDescription: "Nikmati fleksibilitas dan privasi penuh berkendara di Jakarta dengan armada prima.",
      description:
        "Pilihan tepat bagi Anda yang menginginkan kebebasan berkendara secara mandiri di wilayah Jakarta dan sekitarnya. Unit terawat, bersih, dan melalui proses verifikasi dokumen yang cepat dan transparan.",
      sortOrder: 2,
      metaTitle: "Rental Mobil Lepas Kunci Jakarta | TJ Rentcar",
      metaDescription:
        "Butuh mobil tanpa sopir di Jakarta? Pelajari pilihan armada, persyaratan, durasi sewa, dan proses booking lepas kunci TJ Rentcar.",
    },
    {
      title: "Sewa Mobil Harian",
      slug: "sewa-harian",
      shortDescription: "Solusi mobilitas praktis untuk kebutuhan transportasi harian di Jakarta.",
      description:
        "Layanan sewa mobil harian TJ Rentcar tersedia untuk durasi 12 jam atau 24 jam penuh. Cocok untuk pertemuan bisnis harian, city tour, maupun operasional mendesak di kawasan Jabodetabek.",
      sortOrder: 3,
      metaTitle: "Sewa Mobil Harian Jakarta | TJ Rentcar",
      metaDescription:
        "Temukan pilihan sewa mobil harian di Jakarta dari TJ Rentcar. Cek tarif, durasi, pilihan layanan, dan ketersediaan kendaraan.",
    },
    {
      title: "Rental Mobil Mingguan",
      slug: "sewa-mingguan",
      shortDescription: "Tarif lebih hemat untuk kebutuhan mobilitas beberapa hari atau satu minggu penuh.",
      description:
        "Bagi Anda yang sedang berkunjung ke Jakarta selama beberapa hari untuk urusan dinas atau proyek khusus, paket rental mingguan menawarkan efisiensi biaya dan unit yang siap pakai setiap saat.",
      sortOrder: 4,
      metaTitle: "Rental Mobil Mingguan Jakarta | TJ Rentcar",
      metaDescription:
        "Butuh kendaraan selama beberapa hari? Lihat pilihan rental mobil mingguan TJ Rentcar di Jakarta, ketentuan sewa, dan cara pemesanannya.",
    },
    {
      title: "Rental Mobil Bulanan",
      slug: "sewa-bulanan",
      shortDescription: "Paket rental bulanan untuk operasional perusahaan, ekspatriat, dan penggunaan jangka panjang.",
      description:
        "TJ Rentcar menyediakan opsi sewa mobil bulanan baik untuk korporat maupun perorangan di Jakarta dengan jaminan pemeliharaan berkala, unit pengganti jika terjadi kendala, serta faktur tagihan resmi.",
      sortOrder: 5,
      metaTitle: "Rental Mobil Bulanan Jakarta | TJ Rentcar",
      metaDescription:
        "Cari rental mobil bulanan di Jakarta untuk kebutuhan kerja atau operasional. Tinjau pilihan armada, tarif, dan ketentuan dari TJ Rentcar.",
    },
    {
      title: "Antar Jemput Bandara",
      slug: "antar-jemput-bandara",
      shortDescription: "Layanan transfer bandara Soekarno-Hatta (CGK) dan Halim Perdanakusuma (HLP) tepat waktu.",
      description:
        "Hindari antrean dan keterlambatan menuju penerbangan Anda. Sopir TJ Rentcar siap menjemput dari seluruh area Jakarta menuju bandara atau sebaliknya dengan layanan tepat waktu dan bantuan bagasi.",
      sortOrder: 6,
      metaTitle: "Antar Jemput Bandara dari Jakarta | TJ Rentcar",
      metaDescription:
        "Atur perjalanan menuju atau dari bandara dengan TJ Rentcar. Periksa bandara yang dilayani, area penjemputan, tarif, dan cara booking.",
    },
    {
      title: "Perjalanan Luar Kota",
      slug: "perjalanan-luar-kota",
      shortDescription: "Perjalanan nyaman ke kota-kota sekitar dari titik keberangkatan Jakarta.",
      description:
        "Melayani perjalanan luar kota dari Jakarta menuju destinasi seperti Bandung, Bogor, Cirebon, Semarang, hingga Yogyakarta dengan armada yang nyaman dan performa prima.",
      sortOrder: 7,
      metaTitle: "Rental Mobil Perjalanan Luar Kota dari Jakarta | TJ Rentcar",
      metaDescription:
        "Rencanakan perjalanan luar kota dengan keberangkatan dari Jakarta. Tanyakan rute yang dilayani, pilihan mobil, ketentuan perjalanan, dan estimasi biaya.",
    },
  ];

  const serviceRecords: Record<string, string> = {};
  for (const s of services) {
    const record = await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
    serviceRecords[s.slug] = record.id;
  }
  console.log("✅ Core services seeded.");

  // 4. Content Pages
  const pages = [
    {
      slug: "tentang-kami",
      title: "Tentang TJ Rentcar",
      content: `### Profil Perusahaan
TJ Rentcar adalah penyedia jasa rental mobil terpercaya yang beroperasi di wilayah Jakarta. Kami berkomitmen memberikan layanan transportasi yang aman, nyaman, dan tepat waktu untuk berbagai kebutuhan masyarakat, mulai dari urusan personal, wisata keluarga, hingga keperluan korporasi.

### Visi Kami
Menjadi mitra transportasi rental mobil pilihan utama di Jakarta yang dikenal atas keandalan armada, integritas layanan, dan transparansi tarif.

### Nilai Layanan
- **Unit Terawat:** Setiap kendaraan selalu diperiksa secara berkala sebelum diserahkan kepada pelanggan.
- **Transparansi:** Tarif jelas tanpa biaya tersembunyi yang membingungkan.
- **Sopir Profesional:** Berpengalaman, ramah, dan menguasai navigasi Jakarta dan sekitarnya.
- **Responsif:** Tim admin yang siap membantu reservasi dan kebutuhan perjalanan Anda.`,
      metaTitle: "Tentang TJ Rentcar | Rental Mobil Jakarta",
      metaDescription:
        "Kenali TJ Rentcar, layanan rental mobil yang beroperasi di Jakarta. Pelajari informasi usaha, layanan, dan cara menghubungi tim kami.",
    },
    {
      slug: "syarat-ketentuan",
      title: "Syarat & Ketentuan Rental",
      content: `### Ketentuan Umum
1. Seluruh pemesanan melalui website berstatus permintaan reservasi (Pending) dan baru sah setelah dikonfirmasi oleh Admin TJ Rentcar.
2. Penggunaan kendaraan hanya berlaku untuk wilayah yang telah disepakati saat pemesanan.

### Persyaratan Rental Lepas Kunci
1. Menunjukkan KTP asli dan SIM A yang masih berlaku.
2. Bersedia melalui proses verifikasi data domisili dan dokumen identitas.
3. Menyerahkan jaminan atau deposit sesuai kesepakatan yang akan dikembalikan saat rental berakhir tanpa kendala.
4. Penggunaan kendaraan harus mematuhi peraturan lalu lintas yang berlaku di Indonesia.

### Ketentuan Rental dengan Sopir
1. Durasi harian dihitung per 12 jam atau per tanggal kalender sesuai paket yang diambil.
2. Penggunaan melebihi batas durasi (overtime) akan dikenakan biaya tambahan per jam sesuai ketentuan armada.
3. Biaya tol, parkir, bahan bakar (BBM), dan uang makan sopir disesuaikan dengan paket yang dipilih (All-in atau Unit + Driver).
4. Untuk perjalanan ke luar kota yang menginap, akomodasi sopir ditanggung oleh penyewa atau diganti dengan uang inap.`,
      metaTitle: "Syarat dan Ketentuan Rental Mobil | TJ Rentcar",
      metaDescription:
        "Ketahui syarat dan ketentuan sewa mobil lepas kunci dan dengan sopir di TJ Rentcar Jakarta. Transparan, aman, dan mudah dipahami.",
    },
    {
      slug: "kebijakan-privasi",
      title: "Kebijakan Privasi",
      content: `### Perlindungan Data Pribadi
TJ Rentcar menghargai dan melindungi privasi data pelanggan kami. Informasi yang kami kumpulkan saat Anda mengajukan booking (nama lengkap, nomor telepon/WhatsApp, email, dan alamat penjemputan) hanya digunakan untuk:
1. Memproses dan mengonfirmasi reservasi kendaraan yang Anda pilih.
2. Menghubungi Anda terkait jadwal, penjemputan, dan koordinasi armada.
3. Kebutuhan verifikasi dokumen identitas untuk layanan lepas kunci.

### Penyimpanan dan Keamanan Data
Data pribadi Anda disimpan secara aman dan tidak akan diperjualbelikan kepada pihak ketiga manapun untuk tujuan periklanan atau spam. Kami menerapkan pembatasan akses ketat pada sistem backend kami sehingga hanya admin resmi yang berwenang yang dapat melihat data pemesanan.`,
      metaTitle: "Kebijakan Privasi | TJ Rentcar Jakarta",
      metaDescription:
        "Kebijakan privasi TJ Rentcar Jakarta menjelaskan bagaimana data pribadi Anda dikumpulkan, digunakan, dan dilindungi secara aman.",
    },
  ];

  for (const p of pages) {
    await prisma.contentPage.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log("✅ Content pages seeded.");

  // 5. Frequently Asked Questions (FAQ)
  const faqs = [
    {
      question: "Bagaimana cara melakukan pemesanan mobil di TJ Rentcar?",
      answer:
        "Pilih mobil yang Anda butuhkan pada katalog, pilih tanggal rental, lengkapi formulir booking di website, lalu kirim. Permintaan Anda akan masuk ke sistem kami dan tim admin akan segera menghubungi Anda melalui WhatsApp untuk mengonfirmasi ketersediaan unit.",
      category: "Pemesanan",
      sortOrder: 1,
    },
    {
      question: "Apakah pemesanan dari website langsung terkonfirmasi?",
      answer:
        "Pemesanan dari website berstatus 'Pending' (menunggu konfirmasi). Admin kami akan memeriksa ketersediaan fisik armada sebelum mengubah status menjadi terkonfirmasi guna mencegah bentrok jadwal.",
      category: "Pemesanan",
      sortOrder: 2,
    },
    {
      question: "Apa saja syarat untuk rental mobil lepas kunci?",
      answer:
        "Syarat umum sewa lepas kunci mencakup KTP asli, SIM A aktif, bukti identitas tempat tinggal/kantor, serta deposit jaminan yang disepakati bersama.",
      category: "Persyaratan",
      sortOrder: 3,
    },
    {
      question: "Apakah bisa sewa mobil mendadak untuk hari yang sama?",
      answer:
        "Bisa, selama unit armada masih tersedia. Kami menyarankan untuk menghubungi kami langsung melalui tombol WhatsApp untuk pengecekan cepat unit yang siap jalan.",
      category: "Operasional",
      sortOrder: 4,
    },
    {
      question: "Bagaimana jika terjadi keterlambatan pengembalian mobil (overtime)?",
      answer:
        "Keterlambatan pengembalian unit dikenakan biaya overtime per jam sesuai ketentuan yang berlaku. Harap memberi tahu admin kami minimal 2 jam sebelum waktu sewa berakhir jika ingin memperpanjang durasi.",
      category: "Ketentuan",
      sortOrder: 5,
    },
  ];

  await prisma.fAQ.deleteMany({});
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log("✅ FAQs seeded.");

  // 6. Demo Vehicles (Explictly labeled [DEMO])
  const demoVehicles = [
    {
      name: "Toyota Avanza [DEMO]",
      slug: "toyota-avanza-demo",
      brand: "Toyota",
      model: "Avanza Grand 1.5",
      year: 2023,
      category: "MPV",
      transmission: Transmission.AUTOMATIC,
      seats: 7,
      doors: 5,
      fuelType: "Bensin",
      luggageCapacity: "3 Koper",
      description:
        "[DATA DEMO] Toyota Avanza merupakan MPV andalan keluarga Indonesia. Efisien, lincah, dan memiliki kabin yang lapang untuk 7 penumpang.",
      features: JSON.stringify(["AC Double Blower", "Audio Touchscreen", "Dual Airbags", "ISOFIX", "Sensor Parkir"]),
      isActive: true,
      sortOrder: 1,
      metaTitle: "Toyota Avanza Jakarta | Harga dan Spesifikasi - TJ Rentcar",
      metaDescription:
        "Sewa mobil Toyota Avanza di Jakarta dari TJ Rentcar. MPV 7 penumpang hemat bahan bakar untuk kebutuhan harian, mingguan, dengan sopir atau lepas kunci.",
      rates: [
        { serviceType: ServiceType.WITH_DRIVER, billingUnit: BillingUnit.DAILY, amount: 550000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.DAILY, amount: 400000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.WEEKLY, amount: 2600000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.MONTHLY, amount: 8500000 },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        altText: "Tampak depan Toyota Avanza armada TJ Rentcar [DEMO]",
        isPrimary: true,
      },
      services: ["dengan-sopir", "lepas-kunci", "sewa-harian", "sewa-mingguan", "sewa-bulanan", "antar-jemput-bandara"],
    },
    {
      name: "Toyota Innova Zenix [DEMO]",
      slug: "toyota-innova-zenix-demo",
      brand: "Toyota",
      model: "Innova Zenix 2.0 V",
      year: 2024,
      category: "Medium MPV",
      transmission: Transmission.AUTOMATIC,
      seats: 7,
      doors: 5,
      fuelType: "Bensin",
      luggageCapacity: "4 Koper",
      description:
        "[DATA DEMO] All New Toyota Innova Zenix menawarkan kenyamanan premium dengan platform TNGA modern, suspensi lembut, dan kabin mewah.",
      features: JSON.stringify(["Panoramic Sunroof", "Captain Seat", "Wireless Charging", "Toyota Safety Sense", "Dual Zone AC"]),
      isActive: true,
      sortOrder: 2,
      metaTitle: "Toyota Innova Zenix Jakarta | Sewa Medium MPV Mewah - TJ Rentcar",
      metaDescription:
        "Rental Toyota Innova Zenix di Jakarta untuk kenyamanan eksekutif, dinas kantor, dan perjalanan keluarga premium bersama TJ Rentcar.",
      rates: [
        { serviceType: ServiceType.WITH_DRIVER, billingUnit: BillingUnit.DAILY, amount: 950000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.DAILY, amount: 750000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.WEEKLY, amount: 4800000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.MONTHLY, amount: 16000000 },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
        altText: "Toyota Innova Zenix armada TJ Rentcar tampak samping [DEMO]",
        isPrimary: true,
      },
      services: ["dengan-sopir", "lepas-kunci", "sewa-harian", "sewa-mingguan", "sewa-bulanan", "antar-jemput-bandara", "perjalanan-luar-kota"],
    },
    {
      name: "Mitsubishi Xpander [DEMO]",
      slug: "mitsubishi-xpander-demo",
      brand: "Mitsubishi",
      model: "Xpander Ultimate CVT",
      year: 2023,
      category: "MPV",
      transmission: Transmission.AUTOMATIC,
      seats: 7,
      doors: 5,
      fuelType: "Bensin",
      luggageCapacity: "3 Koper",
      description:
        "[DATA DEMO] Mitsubishi Xpander menggabungkan ketangguhan SUV dengan kepraktisan MPV. Ground clearance tinggi dan suspensi stabil.",
      features: JSON.stringify(["Ground Clearance 220mm", "Electric Parking Brake", "Smart Cruise Control", "Keyless Entry"]),
      isActive: true,
      sortOrder: 3,
      metaTitle: "Mitsubishi Xpander Jakarta | Rental MPV Modern - TJ Rentcar",
      metaDescription:
        "Sewa mobil Mitsubishi Xpander di Jakarta. Nyaman untuk mobilitas dalam kota maupun perjalanan ke luar kota dari Jakarta bersama TJ Rentcar.",
      rates: [
        { serviceType: ServiceType.WITH_DRIVER, billingUnit: BillingUnit.DAILY, amount: 600000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.DAILY, amount: 450000 },
        { serviceType: ServiceType.SELF_DRIVE, billingUnit: BillingUnit.WEEKLY, amount: 2900000 },
      ],
      image: {
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        altText: "Mitsubishi Xpander unit TJ Rentcar [DEMO]",
        isPrimary: true,
      },
      services: ["dengan-sopir", "lepas-kunci", "sewa-harian", "sewa-mingguan", "antar-jemput-bandara"],
    },
  ];

  for (const v of demoVehicles) {
    const existing = await prisma.vehicle.findUnique({ where: { slug: v.slug } });
    if (existing) {
      await prisma.vehicle.delete({ where: { slug: v.slug } });
    }

    const created = await prisma.vehicle.create({
      data: {
        name: v.name,
        slug: v.slug,
        brand: v.brand,
        model: v.model,
        year: v.year,
        category: v.category,
        transmission: v.transmission,
        seats: v.seats,
        doors: v.doors,
        fuelType: v.fuelType,
        luggageCapacity: v.luggageCapacity,
        description: v.description,
        features: v.features,
        isActive: v.isActive,
        sortOrder: v.sortOrder,
        metaTitle: v.metaTitle,
        metaDescription: v.metaDescription,
        images: {
          create: [
            {
              url: v.image.url,
              altText: v.image.altText,
              isPrimary: v.image.isPrimary,
              sortOrder: 0,
            },
          ],
        },
        rates: {
          create: v.rates.map((r) => ({
            serviceType: r.serviceType,
            billingUnit: r.billingUnit,
            amount: r.amount,
            isActive: true,
          })),
        },
      },
    });

    for (const serviceSlug of v.services) {
      const sId = serviceRecords[serviceSlug];
      if (sId) {
        await prisma.vehicleService.create({
          data: {
            vehicleId: created.id,
            serviceId: sId,
          },
        });
      }
    }
  }
  console.log("✅ Demo vehicles seeded.");

  // 7. Informational Articles (SEO-STRATEGY.md)
  const articles = [
    {
      title: "Syarat Sewa Mobil Lepas Kunci di Jakarta: Panduan Lengkap",
      slug: "syarat-sewa-mobil-lepas-kunci-jakarta",
      excerpt:
        "Panduan lengkap mengenai dokumen persyaratan, proses verifikasi, serta tips aman saat menyewa mobil lepas kunci di kawasan Jakarta.",
      content: `Menyewa mobil tanpa sopir atau lepas kunci memberikan fleksibilitas maksimal untuk aktivitas harian, pekerjaan, maupun liburan keluarga di Jakarta. Namun sebelum mengajukan sewa, ada beberapa persyaratan administratif yang wajib Anda persiapkan demi keamanan kedua belah pihak.

### 1. Dokumen Identitas Utama
Bagi penyewa perorangan berdomisili Jakarta, dokumen standar meliputi:
- KTP asli penyewa yang masih berlaku.
- SIM A aktif yang masih berlaku.
- Bukti tempat tinggal (kartu keluarga, PBB, atau tagihan utilitas).
- Akun media sosial aktif untuk verifikasi identitas tambahan.

### 2. Ketentuan untuk Wisatawan / Pendatang
Bagi pelanggan dari luar kota yang berkunjung ke Jakarta:
- Tiket pesawat pulang-pergi atau tiket kereta.
- Konfirmasi reservasi hotel atau tempat menginap selama di Jakarta.

### 3. Jaminan dan Deposit
Penyedia jasa rental umumnya menerapkan deposit uang jaminan yang bersifat dapat dikembalikan (refundable) setelah kendaraan dikembalikan dalam keadaan baik sesuai kesepakatan awal.

### 4. Tips Saat Menerima Kendaraan
Lakukan pengecekan fisik menyeluruh bersama petugas sebelum menandatangani berita acara serah terima. Periksa kondisi bodi, level bahan bakar, ban serep, dan kelengkapan surat kendaraan (STNK).`,
      category: "Panduan Rental",
      authorName: "Tim Redaksi TJ Rentcar",
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      metaTitle: "Syarat Sewa Mobil Lepas Kunci di Jakarta | Tips & Panduan",
      metaDescription:
        "Ketahui syarat sewa mobil lepas kunci di Jakarta: dokumen yang dibutuhkan, proses verifikasi, serta tips aman sebelum serah terima unit.",
      focusKeyword: "syarat sewa mobil lepas kunci",
    },
    {
      title: "Pilih Rental Mobil dengan Sopir atau Lepas Kunci? Ini Perbandingannya",
      slug: "perbedaan-rental-mobil-dengan-sopir-dan-lepas-kunci",
      excerpt:
        "Ketahui kelebihan dan kekurangan antara rental mobil dengan pengemudi dan rental lepas kunci agar perjalanan Anda di Jakarta lebih efektif.",
      content: `Menjelajahi jalanan Jakarta yang padat membutuhkan strategi transportasi yang tepat. Salah satu pertimbangan utama saat menyewa mobil adalah memilih antara layanan dengan sopir atau mengemudi sendiri (lepas kunci).

### Kapan Sebaiknya Memilih Rental dengan Sopir?
1. **Jadwal Padat & Urusan Bisnis:** Anda dapat memanfaatkan waktu di perjalanan untuk membuka laptop, membalas email, atau beristirahat sebelum menghadiri rapat.
2. **Tidak Menguasai Rute:** Sopir profesional memahami jalan alternatif, rute ganjil-genap, serta titik macet utama di Jakarta.
3. **Acara Pernikahan / Tamu VIP:** Memberikan kesan elegan dan kenyamanan ekstra bagi keluarga atau tamu penting Anda.

### Kapan Lebih Tepat Memilih Lepas Kunci?
1. **Privasi Penuh:** Cocok bagi perjalanan santai bersama pasangan atau keluarga inti tanpa kehadiran pihak luar di dalam mobil.
2. **Fleksibilitas Waktu:** Anda bebas menentukan kapan berangkat dan berhenti tanpa perlu memikirkan batas jam kerja sopir.
3. **Biaya Lebih Ekonomis:** Anda menghemat komponen biaya jasa driver, uang makan, atau uang penginapan.`,
      category: "Tips Perjalanan",
      authorName: "Tim Redaksi TJ Rentcar",
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      metaTitle: "Rental Mobil dengan Sopir vs Lepas Kunci di Jakarta | TJ Rentcar",
      metaDescription:
        "Bandingkan keuntungan sewa mobil dengan sopir dan lepas kunci di Jakarta. Temukan pilihan terbaik sesuai kebutuhan mobilitas Anda.",
      focusKeyword: "perbedaan rental dengan sopir dan lepas kunci",
    },
  ];

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }
  console.log("✅ SEO articles seeded.");

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
