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

// Export untuk penggunaan
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BASE_URL, APP_CONFIG };
}
