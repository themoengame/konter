// ==================== KONFIGURASI GLOBAL ====================

// URL Apps Script Web App (ganti dengan URL Anda)
const BASE_URL = 'https://script.google.com/macros/s/AKfycbwJNO7SRTNtoLvyJcTJg0OXHKNayksFyMVvs2_2oblk0OZgd9I3hoVS31msN9vYFV4nXA/exec';

// Konfigurasi role dan menu
const ROLE_MENU = {
    admin: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', page: 'dashboard-home' },
        { id: 'penjualan', icon: '💰', label: 'Transaksi Penjualan', page: 'penjualan' },
        { id: 'pembelian', icon: '📦', label: 'Transaksi Pembelian', page: 'pembelian' },
        { id: 'barang', icon: '📱', label: 'Master Barang', page: 'master-barang' },
        { id: 'supplier', icon: '🏭', label: 'Master Supplier', page: 'master-supplier' },
        { id: 'konsumen', icon: '👥', label: 'Master Konsumen', page: 'master-konsumen' },
        { id: 'pulsa', icon: '📡', label: 'Master Pulsa', page: 'master-pulsa' },
        { id: 'pembayaran', icon: '💳', label: 'Master Pembayaran', page: 'master-pembayaran' },
        { id: 'servis', icon: '🔧', label: 'Master Servis', page: 'master-servis' },
        { id: 'profil-toko', icon: '🏪', label: 'Profil Toko', page: 'profil-toko' },
        { id: 'laporan-penjualan', icon: '📈', label: 'Laporan Penjualan', page: 'laporan-penjualan' },
        { id: 'laporan-servis', icon: '🛠️', label: 'Laporan Servis', page: 'laporan-servis' }
    ],
    kasir: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', page: 'dashboard-home' },
        { id: 'penjualan', icon: '💰', label: 'Transaksi Penjualan', page: 'penjualan' },
        { id: 'konsumen', icon: '👥', label: 'Master Konsumen', page: 'master-konsumen' },
        { id: 'laporan-penjualan', icon: '📈', label: 'Laporan Penjualan', page: 'laporan-penjualan' }
    ],
    owner: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', page: 'dashboard-home' },
        { id: 'penjualan', icon: '💰', label: 'Transaksi Penjualan', page: 'penjualan' },
        { id: 'pembelian', icon: '📦', label: 'Transaksi Pembelian', page: 'pembelian' },
        { id: 'barang', icon: '📱', label: 'Master Barang', page: 'master-barang' },
        { id: 'supplier', icon: '🏭', label: 'Master Supplier', page: 'master-supplier' },
        { id: 'konsumen', icon: '👥', label: 'Master Konsumen', page: 'master-konsumen' },
        { id: 'pulsa', icon: '📡', label: 'Master Pulsa', page: 'master-pulsa' },
        { id: 'pembayaran', icon: '💳', label: 'Master Pembayaran', page: 'master-pembayaran' },
        { id: 'servis', icon: '🔧', label: 'Master Servis', page: 'master-servis' },
        { id: 'profil-toko', icon: '🏪', label: 'Profil Toko', page: 'profil-toko' },
        { id: 'laporan-penjualan', icon: '📈', label: 'Laporan Penjualan', page: 'laporan-penjualan' },
        { id: 'laporan-servis', icon: '🛠️', label: 'Laporan Servis', page: 'laporan-servis' }
    ]
};

// Mapping nama page ke fungsi render
const PAGE_RENDERERS = {
    'dashboard-home': renderDashboard,
    'penjualan': renderPenjualan,
    'pembelian': renderPembelian,
    'master-barang': () => renderMaster('barang'),
    'master-supplier': () => renderMaster('supplier'),
    'master-konsumen': () => renderMaster('konsumen'),
    'master-pulsa': () => renderMaster('pulsa'),
    'master-pembayaran': () => renderMaster('pembayaran'),
    'master-servis': () => renderMaster('servis'),
    'laporan-penjualan': renderLaporanPenjualan,
    'laporan-servis': renderLaporanServis
};

// Endpoint mapping untuk setiap master
const MASTER_ENDPOINTS = {
    barang: 'barang',
    supplier: 'supplier',
    konsumen: 'konsumen',
    pulsa: 'pulsa',
    pembayaran: 'pembayaran',
    servis: 'servis'
};

// Kolom untuk setiap master (digunakan untuk form dan tabel)
const MASTER_COLUMNS = {
    barang: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'kode_barang', label: 'Kode Barang', type: 'text', required: true },
        { key: 'nama_barang', label: 'Nama Barang', type: 'text', required: true },
        { key: 'kategori', label: 'Kategori', type: 'select', options: ['Handphone', 'Aksesoris', 'Lainnya'], required: true },
        { key: 'harga_beli', label: 'Harga Beli', type: 'number', required: true },
        { key: 'harga_jual', label: 'Harga Jual', type: 'number', required: true },
        { key: 'stok', label: 'Stok', type: 'number', required: true },
        { key: 'id_supplier', label: 'ID Supplier', type: 'text', required: true }
    ],
    supplier: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'nama_supplier', label: 'Nama Supplier', type: 'text', required: true },
        { key: 'kontak', label: 'Kontak', type: 'text', required: true },
        { key: 'alamat', label: 'Alamat', type: 'textarea', required: false },
        { key: 'email', label: 'Email', type: 'email', required: false },
        { key: 'catatan', label: 'Catatan', type: 'textarea', required: false }
    ],
    konsumen: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'nama', label: 'Nama', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'telepon', label: 'Telepon', type: 'text', required: true },
        { key: 'alamat', label: 'Alamat', type: 'textarea', required: false },
        { key: 'poin', label: 'Poin', type: 'number', readonly: true }
    ],
    pulsa: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'id_barang', label: 'ID Barang (Relasi)', type: 'text', required: true },
        { key: 'operator', label: 'Operator', type: 'text', required: true },
        { key: 'nominal', label: 'Nominal', type: 'number', required: true },
        { key: 'harga_beli', label: 'Harga Beli', type: 'number', required: true },
        { key: 'harga_jual', label: 'Harga Jual', type: 'number', required: true },
        { key: 'stok_deposit', label: 'Stok Deposit', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: ['aktif', 'nonaktif'], required: true }
    ],
    pembayaran: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'id_barang', label: 'ID Barang (Relasi)', type: 'text', required: true },
        { key: 'provider', label: 'Provider', type: 'text', required: true },
        { key: 'jenis_layanan', label: 'Jenis Layanan', type: 'text', required: true },
        { key: 'fee_beli', label: 'Fee Beli', type: 'number', required: true },
        { key: 'fee_jual', label: 'Fee Jual', type: 'number', required: true },
        { key: 'stok_deposit', label: 'Stok Deposit', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: ['aktif', 'nonaktif'], required: true }
    ],
    servis: [
        { key: 'id', label: 'ID', type: 'text', readonly: true },
        { key: 'nama_servis', label: 'Nama Servis', type: 'text', required: true },
        { key: 'kategori', label: 'Kategori', type: 'select', options: ['Hardware', 'Software', 'Lainnya'], required: true },
        { key: 'biaya_jasa', label: 'Biaya Jasa', type: 'number', required: true },
        { key: 'estimasi_hari', label: 'Estimasi Hari', type: 'number', required: true },
        { key: 'garansi_hari', label: 'Garansi Hari', type: 'number', required: true },
        { key: 'id_part_default', label: 'ID Part Default', type: 'text', required: false },
        { key: 'status', label: 'Status', type: 'select', options: ['aktif', 'nonaktif'], required: true }
    ]
};
