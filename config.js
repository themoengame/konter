// config.js
// URL Web App Google Apps Script
const BASE_URL = 'https://script.google.com/macros/s/AKfycbwYd-keZ4UidqbCUaDU5NGfMg3UgjJ0AZRoj4Ps0_P3qlhc2qHF_lk3jBm_jIRx9-nm/exec';

// Konfigurasi aplikasi
const APP_CONFIG = {
    sessionTimeout: 3600000, // 1 jam dalam milidetik
    autoSave: true,
    itemsPerPage: 50,
    version: '1.0.0'
};

// Role-based menu access
const ROLE_MENU = {
    admin: ['penjualan', 'pembelian', 'barang', 'supplier', 'konsumen', 'laporan', 'profil'],
    kasir: ['penjualan', 'konsumen'],
    gudang: ['pembelian', 'barang', 'supplier'],
    owner: ['penjualan', 'pembelian', 'barang', 'supplier', 'konsumen', 'laporan', 'profil']
};

// Menu display names
const MENU_NAMES = {
    penjualan: { icon: '💰', name: 'Penjualan' },
    pembelian: { icon: '📦', name: 'Pembelian' },
    barang: { icon: '📱', name: 'Barang' },
    supplier: { icon: '🏭', name: 'Supplier' },
    konsumen: { icon: '👥', name: 'Konsumen' },
    laporan: { icon: '📄', name: 'Laporan' },
    profil: { icon: '🏪', name: 'Profil Toko' }
};

// Page titles
const PAGE_TITLES = {
    penjualan: '💰 Transaksi Penjualan',
    pembelian: '📦 Transaksi Pembelian',
    barang: '📱 Master Barang',
    supplier: '🏭 Master Supplier',
    konsumen: '👥 Master Konsumen',
    laporan: '📄 Laporan',
    profil: '🏪 Profil Toko'
};

// Export untuk penggunaan
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BASE_URL, APP_CONFIG, ROLE_MENU, MENU_NAMES, PAGE_TITLES };
}
