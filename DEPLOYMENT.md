# Panduan Deployment — TJ Rentcar Website
> Versi: 1.0.0 | Stack: Next.js 14 + Express.js + PostgreSQL

---

## Prasyarat Server

| Komponen | Versi Minimal |
|---|---|
| Node.js | 20.x LTS |
| PostgreSQL | 15.x |
| npm | 10.x |
| RAM | 1 GB (minimum), 2 GB (rekomendasi) |
| Storage | 10 GB (termasuk foto armada) |

---

## Opsi 1: VPS / Server Sendiri (Ubuntu 22.04)

### Langkah 1 — Siapkan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### Langkah 2 — Siapkan Database PostgreSQL

```bash
# Masuk ke psql sebagai postgres
sudo -u postgres psql

# Di dalam psql:
CREATE USER tj_rentcar WITH PASSWORD 'ganti_password_kuat_disini';
CREATE DATABASE tj_rentcar OWNER tj_rentcar;
GRANT ALL PRIVILEGES ON DATABASE tj_rentcar TO tj_rentcar;
\q
```

### Langkah 3 — Upload Project

```bash
# Buat direktori
mkdir -p /var/www/tjrentcar
cd /var/www/tjrentcar

# Clone atau upload project Anda ke sini
# (via git clone, scp, atau rsync)

# Install dependensi
npm install
```

### Langkah 4 — Konfigurasi Environment Backend

```bash
# Copy dan edit .env
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Isi `.env` untuk production:

```env
NODE_ENV=production
PORT=4000
API_BASE_PATH=/api/v1
FRONTEND_URL=https://www.tjrentcar.com
PUBLIC_SITE_URL=https://www.tjrentcar.com

DATABASE_URL=postgresql://tj_rentcar:ganti_password_kuat@localhost:5432/tj_rentcar?schema=public

# WAJIB: ganti dengan string acak min 32 karakter
SESSION_SECRET=isi_dengan_32_karakter_acak_disini_production
ACCESS_TOKEN_SECRET=isi_access_token_secret_production_32chars
REFRESH_TOKEN_SECRET=isi_refresh_token_secret_production_32chars

COOKIE_NAME=tj_rentcar_admin_session
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

STORAGE_PROVIDER=local
STORAGE_DIR=/var/www/tjrentcar/uploads
UPLOAD_MAX_SIZE_MB=5
DEFAULT_TIMEZONE=Asia/Jakarta
DEFAULT_CURRENCY=IDR
```

### Langkah 5 — Konfigurasi Environment Frontend

```bash
cp apps/web/.env.example apps/web/.env.local
nano apps/web/.env.local
```

```env
NEXT_PUBLIC_SITE_URL=https://www.tjrentcar.com
NEXT_PUBLIC_API_BASE_URL=https://www.tjrentcar.com/api/v1
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GSC_VERIFICATION=isi_kode_verifikasi_gsc
```

### Langkah 6 — Migrasi Database & Seed

```bash
cd /var/www/tjrentcar

# Jalankan migrasi
npm run prisma:deploy --workspace=apps/api

# Buat akun admin pertama
npm run admin:create --workspace=apps/api
# Ikuti prompt: masukkan nama, email, password admin
```

### Langkah 7 — Build Production

```bash
# Build backend
npm run build --workspace=apps/api

# Build frontend
npm run build --workspace=apps/web
```

### Langkah 8 — Buat Direktori Uploads

```bash
mkdir -p /var/www/tjrentcar/uploads
chown -R www-data:www-data /var/www/tjrentcar/uploads
chmod 755 /var/www/tjrentcar/uploads
```

### Langkah 9 — Jalankan dengan PM2

Buat file `ecosystem.config.js` di root project:

```javascript
module.exports = {
  apps: [
    {
      name: 'tjrentcar-api',
      script: './apps/api/dist/server.js',
      cwd: '/var/www/tjrentcar',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'tjrentcar-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/tjrentcar/apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
```

```bash
# Start semua aplikasi
pm2 start ecosystem.config.js

# Save supaya restart otomatis saat server reboot
pm2 save
pm2 startup
# Ikuti perintah yang muncul dari pm2 startup

# Cek status
pm2 status
pm2 logs
```

### Langkah 10 — Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/tjrentcar
```

```nginx
server {
    listen 80;
    server_name tjrentcar.com www.tjrentcar.com;

    # Upload file size limit
    client_max_body_size 10M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static uploads
    location /uploads/ {
        alias /var/www/tjrentcar/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/tjrentcar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Langkah 11 — SSL/HTTPS dengan Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tjrentcar.com -d www.tjrentcar.com
# Ikuti prompt, masukkan email, setujui ToS
# Certbot otomatis mengkonfigurasi HTTPS dan auto-renew
```

---

## Opsi 2: Vercel + Railway (Rekomendasi untuk Pemula)

### Frontend — Vercel

1. Push project ke GitHub
2. Login ke [vercel.com](https://vercel.com)
3. Import repository
4. Set **Root Directory**: `apps/web`
5. Set **Framework**: Next.js
6. Tambahkan Environment Variables:
   ```
   NEXT_PUBLIC_SITE_URL=https://www.tjrentcar.com
   NEXT_PUBLIC_API_BASE_URL=https://api.tjrentcar.com/api/v1
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
7. Deploy

### Backend — Railway

1. Login ke [railway.app](https://railway.app)
2. New Project → Deploy from GitHub Repo
3. Set **Root Directory**: `apps/api`
4. Tambahkan PostgreSQL dari Railway Plugin
5. Set Environment Variables (sama seperti `.env` production di atas, gunakan DATABASE_URL dari Railway)
6. Set **Start Command**: `node dist/server.js`
7. Set **Build Command**: `npm run build`
8. Deploy

### Domain Custom

- Di Vercel: Settings → Domains → tambahkan `www.tjrentcar.com`
- Di Railway: Settings → Domains → tambahkan `api.tjrentcar.com`
- Arahkan DNS domain ke Vercel/Railway sesuai instruksi mereka

---

## Opsi 3: Docker (Advanced)

Buat `docker-compose.yml` di root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: tj_rentcar
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: tj_rentcar
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://tj_rentcar:${DB_PASSWORD}@postgres:5432/tj_rentcar
      PORT: 4000
    ports:
      - "4000:4000"
    volumes:
      - uploads:/app/uploads
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_BASE_URL: http://api:4000/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
  uploads:
```

---

## Setelah Deploy: Checklist Pemilik

Lakukan ini SEGERA setelah server berjalan:

- [ ] Buat akun admin: `npm run admin:create --workspace=apps/api`
- [ ] Login ke `/admin` dan ubah password bawaan
- [ ] Di `/admin/pengaturan`, isi:
  - Nomor WhatsApp bisnis (format: 628xxx)
  - Nomor telepon
  - Alamat bisnis
  - Email bisnis
  - Jam operasional
- [ ] Tambahkan armada nyata di `/admin/mobil/tambah`
- [ ] Upload foto armada
- [ ] Set harga dan tarif setiap kendaraan
- [ ] Aktifkan layanan yang tersedia
- [ ] Daftarkan ke Google Search Console
- [ ] Setup Google Analytics 4 dan isi `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Test booking dari halaman publik
- [ ] Verifikasi notifikasi booking masuk di admin dashboard

---

## Monitoring & Maintenance

```bash
# Lihat log aplikasi
pm2 logs tjrentcar-api
pm2 logs tjrentcar-web

# Restart setelah update kode
pm2 restart all

# Update dependencies
npm install
npm run build
pm2 restart all

# Backup database harian
pg_dump -U tj_rentcar tj_rentcar > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| `DATABASE_URL` tidak terbaca | Pastikan `.env` ada di `apps/api/.env`, bukan di root |
| Upload foto gagal | Cek permission direktori `uploads/`, harus writable |
| Admin tidak bisa login | Jalankan `npm run admin:create` untuk buat akun baru |
| 502 Bad Gateway | Cek PM2 status: `pm2 status` dan `pm2 logs` |
| Cookie tidak tersimpan | Pastikan `COOKIE_SECURE=true` dan HTTPS aktif di production |
