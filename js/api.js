// ==================== API WRAPPER ====================

// Fungsi utama untuk memanggil Apps Script
async function callApi(endpoint, action, data = {}, method = 'GET') {
    try {
        let url = `${BASE_URL}?endpoint=${endpoint}&action=${action}`;
        
        // Tambahkan parameter ke URL untuk GET
        if (method === 'GET' && Object.keys(data).length > 0) {
            const params = new URLSearchParams(data);
            url += `&${params.toString()}`;
        }
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        
        // Untuk POST, kirim sebagai body
        if (method === 'POST') {
            const formData = new URLSearchParams();
            formData.append('endpoint', endpoint);
            formData.append('action', action);
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }
            options.body = formData.toString();
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Terjadi kesalahan');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Fungsi khusus untuk login
async function loginUser(email, password) {
    return await callApi('login', '', { email, password }, 'GET');
}

// Fungsi untuk mengambil data (GET)
async function getData(endpoint, action = 'read', params = {}) {
    return await callApi(endpoint, action, params, 'GET');
}

// Fungsi untuk create/update/delete (POST)
async function postData(endpoint, action, data) {
    return await callApi(endpoint, action, data, 'POST');
}

// Fungsi untuk create master
async function createMaster(masterType, data) {
    return await postData(masterType, 'create', data);
}

// Fungsi untuk update master
async function updateMaster(masterType, id, data) {
    return await postData(masterType, 'update', { id, ...data });
}

// Fungsi untuk delete master
async function deleteMaster(masterType, id) {
    return await postData(masterType, 'delete', { id });
}

// Fungsi untuk mengambil semua data master
async function getAllMaster(masterType) {
    const result = await getData(masterType, 'read');
    return result.data || [];
}

// Fungsi untuk mengambil dashboard stats
async function getDashboardStats() {
    const result = await getData('dashboard-stats', '');
    return result.data || {};
}

// Fungsi untuk transaksi penjualan
async function savePenjualan(data) {
    return await postData('transaksi-penjualan', 'create', data);
}

// Fungsi untuk mengambil laporan penjualan
async function getLaporanPenjualan(dari, sampai) {
    const result = await getData('laporan-penjualan', '', { dari, sampai });
    return result.data || [];
}

// Fungsi untuk mengambil laporan servis
async function getLaporanServis(dari, sampai) {
    const result = await getData('laporan-servis', '', { dari, sampai });
    return result.data || [];
}

// Fungsi untuk transaksi pembelian
async function savePembelian(data) {
    return await postData('transaksi-pembelian', 'create', data);
}

// ==================== KONFIGURASI TOKO ====================

// Ambil semua konfigurasi atau berdasarkan key
async function getKonfigurasi(key = null) {
  const params = key ? { key: key } : {};
  const result = await getData('konfigurasi', 'read', params);
  return result.data || {};
}

// Update konfigurasi
async function updateKonfigurasi(key, value, description = '') {
  return await postData('konfigurasi', 'update', { key, value, description });
}
