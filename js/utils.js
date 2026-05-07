// ==================== FUNGSI UTILITY ====================

// Format Rupiah
function formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Parse Rupiah ke number
function parseRupiah(str) {
    if (!str) return 0;
    const number = str.replace(/[^0-9,-]/g, '').replace(',', '.');
    return parseInt(number) || 0;
}

// Format tanggal Indonesia
function formatTanggal(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format tanggal short (YYYY-MM-DD)
function formatTanggalShort(date) {
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
}

// Get today's date for input
function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

// Generate ID unik sementara (untuk frontend)
function generateTempId() {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Validasi email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validasi nomor telepon
function isValidPhone(phone) {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
}

// Tampilkan toast notification
function showToast(message, type = 'success') {
    // Hapus toast yang sudah ada
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Konfirmasi dengan modal sederhana
async function confirmAction(message) {
    return new Promise((resolve) => {
        const result = confirm(message);
        resolve(result);
    });
}

// Loading overlay
function showLoading(show = true) {
    let loader = document.getElementById('globalLoader');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            loader.innerHTML = '<div style="background:white; padding:20px; border-radius:8px;">Loading...</div>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    } else {
        if (loader) loader.style.display = 'none';
    }
}

// Export data ke CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header] || '';
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${formatTanggalShort(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data berhasil diekspor');
}

// Format number dengan separator ribuan
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Update realtime datetime di topbar
function updateDateTime() {
    const elem = document.getElementById('dateTime');
    if (elem) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        elem.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// Set interval untuk update jam
setInterval(updateDateTime, 1000);
