// ==================== LAPORAN PENJUALAN ====================

let laporanPenjualanData = [];

// Render halaman laporan penjualan
async function renderLaporanPenjualan(container) {
    const today = getTodayDate();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().slice(0, 10);
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Laporan Penjualan</h3>
            <div class="filter-bar">
                <input type="date" id="tglDari" value="${lastWeekStr}">
                <span>s/d</span>
                <input type="date" id="tglSampai" value="${today}">
                <button class="btn-primary" onclick="loadLaporanPenjualan()">Tampilkan</button>
                <button class="btn-secondary" onclick="exportLaporanPenjualan()">📥 Export CSV</button>
            </div>
        </div>
        
        <div class="dashboard-grid" style="margin-bottom:20px;">
            <div class="stat-card">
                <h3>Total Penjualan</h3>
                <p class="stat-value" id="totalPenjualan">Rp 0</p>
            </div>
            <div class="stat-card">
                <h3>Jumlah Transaksi</h3>
                <p class="stat-value" id="jumlahTransaksi">0</p>
            </div>
            <div class="stat-card">
                <h3>Rata-rata Transaksi</h3>
                <p class="stat-value" id="rataTransaksi">Rp 0</p>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID Transaksi</th>
                        <th>Tanggal</th>
                        <th>Konsumen</th>
                        <th>Total Bayar</th>
                        <th>Diskon</th>
                        <th>Grand Total</th>
                        <th>Metode</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="laporanPenjualanBody">
                    <tr><td colspan="8" style="text-align:center">Pilih tanggal dan klik Tampilkan</td></td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Load default laporan (7 hari terakhir)
    await loadLaporanPenjualan();
}

// Load laporan penjualan
async function loadLaporanPenjualan() {
    const tglDari = document.getElementById('tglDari')?.value;
    const tglSampai = document.getElementById('tglSampai')?.value;
    
    if (!tglDari || !tglSampai) {
        showToast('Pilih rentang tanggal', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const data = await getLaporanPenjualan(tglDari, tglSampai);
        laporanPenjualanData = data;
        
        // Update tabel
        const tbody = document.getElementById('laporanPenjualanBody');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">Tidak ada data penjualan</td></tr>';
            document.getElementById('totalPenjualan').textContent = formatRupiah(0);
            document.getElementById('jumlahTransaksi').textContent = '0';
            document.getElementById('rataTransaksi').textContent = formatRupiah(0);
            return;
        }
        
        let totalGrand = 0;
        
        tbody.innerHTML = data.map(item => {
            totalGrand += item.grand_total || 0;
            return `
                <tr>
                    <td>${item.id_transaksi || '-'}</td>
                    <td>${formatTanggal(item.tgl)}</td>
                    <td>${item.id_konsumen || '-'}</td>
                    <td>${formatRupiah(item.total_bayar || 0)}</td>
                    <td>${formatRupiah(item.diskon || 0)}</td>
                    <td><strong>${formatRupiah(item.grand_total || 0)}</strong></td>
                    <td>${item.metode || '-'}</td>
                    <td>${item.status || 'Selesai'}</td>
                </tr>
            `;
        }).join('');
        
        // Update statistik
        document.getElementById('totalPenjualan').textContent = formatRupiah(totalGrand);
        document.getElementById('jumlahTransaksi').textContent = data.length;
        document.getElementById('rataTransaksi').textContent = formatRupiah(totalGrand / data.length);
        
    } catch (error) {
        console.error('Error loading laporan:', error);
        showToast('Gagal memuat laporan', 'error');
    } finally {
        showLoading(false);
    }
}

// Export laporan penjualan
function exportLaporanPenjualan() {
    if (laporanPenjualanData.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    exportToCSV(laporanPenjualanData, 'laporan_penjualan');
}

// Export global functions
window.loadLaporanPenjualan = loadLaporanPenjualan;
window.exportLaporanPenjualan = exportLaporanPenjualan;
