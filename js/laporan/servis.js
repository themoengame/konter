// ==================== LAPORAN SERVIS ====================

let laporanServisData = [];

// Render halaman laporan servis
async function renderLaporanServis(container) {
    const today = getTodayDate();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().slice(0, 10);
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Laporan Servis</h3>
            <div class="filter-bar">
                <input type="date" id="tglDariServis" value="${lastWeekStr}">
                <span>s/d</span>
                <input type="date" id="tglSampaiServis" value="${today}">
                <button class="btn-primary" onclick="loadLaporanServis()">Tampilkan</button>
                <button class="btn-secondary" onclick="exportLaporanServis()">📥 Export CSV</button>
            </div>
        </div>
        
        <div class="dashboard-grid" style="margin-bottom:20px;">
            <div class="stat-card">
                <h3>Total Servis Terjual</h3>
                <p class="stat-value" id="totalServis">0</p>
            </div>
            <div class="stat-card">
                <h3>Total Pendapatan Servis</h3>
                <p class="stat-value" id="totalPendapatanServis">Rp 0</p>
            </div>
            <div class="stat-card">
                <h3>Kategori Terbanyak</h3>
                <p class="stat-value" id="kategoriTerbanyak">-</p>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID Transaksi</th>
                        <th>Tanggal</th>
                        <th>Konsumen</th>
                        <th>ID Servis</th>
                        <th>Nama Servis</th>
                        <th>Kategori</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Estimasi Hari</th>
                        <th>Garansi Hari</th>
                    </tr>
                </thead>
                <tbody id="laporanServisBody">
                    <tr><td colspan="10" style="text-align:center">Pilih tanggal dan klik Tampilkan</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    await loadLaporanServis();
}

// Load laporan servis
async function loadLaporanServis() {
    const tglDari = document.getElementById('tglDariServis')?.value;
    const tglSampai = document.getElementById('tglSampaiServis')?.value;
    
    if (!tglDari || !tglSampai) {
        showToast('Pilih rentang tanggal', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const data = await getLaporanServis(tglDari, tglSampai);
        laporanServisData = data;
        
        const tbody = document.getElementById('laporanServisBody');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center">Tidak ada data servis</td></tr>';
            document.getElementById('totalServis').textContent = '0';
            document.getElementById('totalPendapatanServis').textContent = formatRupiah(0);
            document.getElementById('kategoriTerbanyak').textContent = '-';
            return;
        }
        
        let totalQty = 0;
        let totalPendapatan = 0;
        const kategoriCount = {};
        
        tbody.innerHTML = data.map(item => {
            totalQty += item.qty || 1;
            totalPendapatan += (item.harga || 0) * (item.qty || 1);
            
            const kategori = item.kategori || 'Lainnya';
            kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
            
            return `
                <tr>
                    <td>${item.id_transaksi || '-'}</td>
                    <td>${formatTanggal(item.tgl)}</td>
                    <td>${item.konsumen || '-'}</td>
                    <td>${item.id_servis || '-'}</td>
                    <td>${item.nama_servis || '-'}</td>
                    <td>${item.kategori || '-'}</td>
                    <td>${item.qty || 1}</td>
                    <td>${formatRupiah(item.harga || 0)}</td>
                    <td>${item.estimasi_hari || 0} hari</td>
                    <td>${item.garansi_hari || 0} hari</td>
                </tr>
            `;
        }).join('');
        
        // Update statistik
        document.getElementById('totalServis').textContent = totalQty;
        document.getElementById('totalPendapatanServis').textContent = formatRupiah(totalPendapatan);
        
        // Cari kategori terbanyak
        let maxKategori = '-';
        let maxCount = 0;
        for (const [kategori, count] of Object.entries(kategoriCount)) {
            if (count > maxCount) {
                maxCount = count;
                maxKategori = kategori;
            }
        }
        document.getElementById('kategoriTerbanyak').textContent = `${maxKategori} (${maxCount}x)`;
        
    } catch (error) {
        console.error('Error loading laporan servis:', error);
        showToast('Gagal memuat laporan servis', 'error');
    } finally {
        showLoading(false);
    }
}

// Export laporan servis
function exportLaporanServis() {
    if (laporanServisData.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    exportToCSV(laporanServisData, 'laporan_servis');
}

// Export global functions
window.loadLaporanServis = loadLaporanServis;
window.exportLaporanServis = exportLaporanServis;
