# 📱 Counter HP Management System

Sistem manajemen penuh untuk counter handphone yang mendukung penjualan **Handphone**, **Aksesoris**, **Pulsa**, **Pembayaran Online**, dan **Servis**. Dilengkapi dengan manajemen stok, transaksi penjualan & pembelian, laporan, serta sistem role-based access (Admin, Kasir, Owner).

## ✨ Fitur Utama

### 🛒 Transaksi Penjualan
- Multi-tipe produk (Barang fisik, Pulsa, Pembayaran Online, Servis)
- Keranjang belanja real-time
- Update stok otomatis (barang fisik & deposit)
- Poin loyalty konsumen (1% dari transaksi)
- Multi metode pembayaran (Cash, QRIS, Transfer)

### 📦 Transaksi Pembelian (Restock)
- Pembelian barang dari supplier
- Update stok otomatis

### 📊 Laporan
- Laporan penjualan per periode (filter tanggal)
- Laporan servis terjual
- Export ke CSV & Print

### 👥 Master Data
- Barang (HP, Aksesoris, dll)
- Supplier
- Konsumen
- Pulsa & Token
- Pembayaran Online (OVO, Dana, QRIS, dll)
- Servis (Hardware/Software)

### 🔐 Role-based Access
| Role | Akses |
|------|-------|
| Admin | Semua fitur |
| Kasir | Penjualan, Konsumen, Laporan Penjualan |
| Owner | Semua fitur (kecuali edit user) |

## 🏗️ Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Hosting | GitHub Pages / Vercel / Netlify |

## 📁 Struktur Proyek
counter-hp-app/
├── index.html # Halaman login
├── dashboard.html # Halaman utama dengan sidebar
├── css/
│ ├── style.css # Gaya global
│ ├── dashboard.css # Layout sidebar & header
│ ├── transaksi.css # Gaya form transaksi & keranjang
│ └── responsive.css # Mobile friendly
├── js/
│ ├── config.js # Konfigurasi BASE_URL
│ ├── utils.js # Utility functions
│ ├── api.js # Wrapper API ke Apps Script
│ ├── auth.js # Login, logout, session
│ ├── dashboard.js # Navigasi & load page
│ ├── master/ # CRUD master data
│ ├── transaksi/ # Logika transaksi
│ └── laporan/ # Logika laporan
└── pages/ # Halaman yang dimuat dinamis
├── home.html
├── penjualan.html
├── pembelian.html
├── master-.html
└── laporan-.html

text

## 🚀 Panduan Instalasi

### 1. Setup Google Sheets & Apps Script

1. **Buat Google Sheet baru** dengan 8 sheets:
   - `users` - Data user
   - `supplier` - Data supplier
   - `barang` - Data barang fisik
   - `konsumen` - Data konsumen
   - `pulsa` - Data produk pulsa
   - `pembayaran_online` - Data pembayaran online
   - `transaksi_penjualan_master` - Header transaksi penjualan
   - `transaksi_penjualan_detil` - Detail transaksi penjualan
   - `transaksi_pembelian_master` - Header transaksi pembelian
   - `transaksi_pembelian_detil` - Detail transaksi pembelian

2. **Copy kode Apps Script** dari file yang telah disediakan ke **Extensions → Apps Script**

3. **Deploy sebagai Web App**:
   - Klik **Deploy → New deployment**
   - Pilih **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Copy URL Web App yang dihasilkan

### 2. Setup Frontend

1. **Clone repository**
```bash
git clone https://github.com/username/counter-hp-app.git
cd counter-hp-app
Update konfigurasi

Buka js/config.js

Ganti BASE_URL dengan URL Apps Script Anda:

javascript
const BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
Deploy ke hosting (GitHub Pages / Vercel / Netlify)

3. Data Awal (Sample)
Users (users sheet)
email	password	role	nama_lengkap
admin@counter.com	admin123	admin	Administrator
kasir1@counter.com	kasir123	kasir	Kasir Utama
owner@counter.com	owner123	owner	Pemilik
🔧 Penggunaan
Login
Buka index.html atau URL deployment

Masukkan email dan password sesuai data users

Role menentukan menu yang tampil

Transaksi Penjualan
Pilih menu Transaksi Penjualan

Pilih tipe produk (Barang/Pulsa/Pembayaran/Servis)

Cari produk, tentukan jumlah, klik Tambah

Ulangi untuk produk lain

Masukkan ID Konsumen (atau cari nama)

Masukkan diskon (jika ada)

Klik Bayar, masukkan jumlah bayar

Transaksi selesai, stok otomatis berkurang

Transaksi Pembelian (Restock)
Pilih menu Transaksi Pembelian

Cari barang, tentukan jumlah

Pilih supplier

Klik Proses Pembelian

Laporan
Pilih menu Laporan Penjualan atau Laporan Servis

Pilih rentang tanggal

Klik Tampilkan

Export ke CSV atau Print

📊 Database Schema
Users
Kolom	Tipe	Deskripsi
email	string	Username login
password	string	Password (plain text untuk demo)
role	string	admin/kasir/owner
nama_lengkap	string	Nama lengkap user
Barang
Kolom	Tipe	Deskripsi
id	string	Auto (B001, B002, ...)
kode_barang	string	Kode unik manual
nama_barang	string	Nama produk
kategori	string	Handphone/Aksesoris/Lainnya
harga_beli	number	Modal
harga_jual	number	Harga jual
stok	number	Jumlah stok fisik
id_supplier	string	Referensi ke supplier
Pulsa
Kolom	Tipe	Deskripsi
id	string	Auto (PLS001, ...)
id_barang	string	Referensi ke master barang
operator	string	Telkomsel/Indosat/XL/PLN
nominal	number	Nilai pulsa/token
harga_beli	number	Modal deposit
harga_jual	number	Harga ke konsumen
stok_deposit	number	Saldo deposit
status	string	aktif/nonaktif
Servis
Kolom	Tipe	Deskripsi
id	string	Auto (SVC001, ...)
nama_servis	string	Nama layanan
kategori	string	Hardware/Software/Lainnya
biaya_jasa	number	Harga jasa
estimasi_hari	float	Estimasi pengerjaan
garansi_hari	number	Masa garansi
id_part_default	string	Part default (opsional)
status	string	aktif/nonaktif
🌐 Deployment ke GitHub Pages
Push ke GitHub

bash
git add .
git commit -m "Initial commit - Counter HP System"
git push origin main

API Endpoints (Apps Script)
Endpoint	Action	Method	Deskripsi
login	-	GET	Autentikasi user
dashboard-stats	-	GET	Statistik dashboard
barang	read/create/update/delete	GET/POST	CRUD barang
supplier	read/create/update/delete	GET/POST	CRUD supplier
konsumen	read/create/update/delete	GET/POST	CRUD konsumen
pulsa	read/create/update/delete	GET/POST	CRUD pulsa
pembayaran	read/create/update/delete	GET/POST	CRUD pembayaran
servis	read/create/update/delete	GET/POST	CRUD servis
transaksi-penjualan	read/create	GET/POST	Transaksi penjualan
transaksi-pembelian	read/create	GET/POST	Transaksi pembelian
laporan-penjualan	-	GET	Laporan penjualan
laporan-servis	-	GET	Laporan servis
🤝 Kontribusi
Silakan fork repository ini dan buat pull request untuk pengembangan lebih lanjut.

📄 Lisensi
MIT License - Silakan gunakan untuk keperluan komersial maupun non-komersial.

Dibuat dengan ❤️ untuk Counter HP Indonesia

text

## 📋 Screenshot yang Direkomendasikan untuk README

Sebaiknya tambahkan screenshot di README agar lebih informatif. Simpan gambar di folder `screenshots/` lalu tambahkan markdown:

```markdown
## 📸 Screenshot

### Halaman Login
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Transaksi Penjualan
![Transaksi Penjualan](screenshots/penjualan.png)

### Master Barang
![Master Barang](screenshots/master-barang.png)

### Laporan Penjualan
![Laporan Penjualan](screenshots/laporan.png)
🎯 Template Status Badge (Opsional)
Tambahkan di bagian atas README:

markdown
![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-✓-brightgreen)
