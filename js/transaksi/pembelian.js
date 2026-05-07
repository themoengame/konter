// ==================== TRANSAKSI PEMBELIAN (RESTOCK) ====================

let pembelianCart = [];
let supplierList = [];
let barangList = [];

// Render halaman pembelian
async function renderPembelian(container) {
    // Reset cart
    pembelianCart = [];
    
    // Load data
    await loadPembelianData();
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Transaksi Pembelian (Restock Barang)</h3>
        </div>
        
        <div class="transaction-container">
            <!-- Panel Kiri: Pilih Barang -->
            <div class="product-panel">
                <div class="product-panel-header">
                    <h3>Pilih Barang</h3>
                    <input type="text" id="searchBarangPembelian" class="product-search" placeholder="Cari barang..." onkeyup="searchBarangPembelian(this.value)">
                </div>
                <div id="barangPembelianList" class="product-list">
                    ${renderBarangPembelianList()}
                </div>
            </div>
            
            <!-- Panel Kanan: Keranjang Pembelian -->
            <div class="cart-panel">
                <div class="cart-header">
                    <h3>📦 Keranjang Pembelian</h3>
                </div>
                <div id="pembelianCartItems" class="cart-items">
                    ${renderPembelianCartItems()}
                </div>
                <div class="cart-summary">
                    <div class="summary-row total">
                        <span>Total Biaya</span>
                        <span id="pembelianTotal">Rp 0</span>
                    </div>
                </div>
                <div class="cart-actions">
                    <button class="btn-secondary" onclick="clearPembelianCart()">Kosongkan</button>
                    <button class="btn-primary" onclick="showPembelianModal()">Proses Pembelian</button>
                </div>
            </div>
        </div>
        
        <!-- Informasi Supplier -->
        <div class="transaction-info">
            <div class="info-row">
                <div class="form-group">
                    <label>ID Supplier</label>
                    <input type="text" id="idSupplier" placeholder="Pilih supplier">
                </div>
                <div class="form-group">
                    <label>Nama Supplier</label>
                    <input type="text" id="namaSupplier" placeholder="Cari supplier..." onkeyup="searchSupplierPembelian(this.value)">
                    <div id="supplierSearchResult" style="position:absolute; background:white; border:1px solid #ddd; max-height:150px; overflow-y:auto; width:200px; display:none;"></div>
                </div>
            </div>
            <div class="info-row">
                <div class="form-group">
                    <label>Catatan</label>
                    <textarea id="catatanPembelian" rows="2" placeholder="Catatan pembelian..."></textarea>
                </div>
            </div>
        </div>
    `;
}

// Load data untuk pembelian
async function loadPembelianData() {
    try {
        [barangList, supplierList] = await Promise.all([
            getAllMaster('barang'),
            getAllMaster('supplier')
        ]);
    } catch (error) {
        console.error('Error loading pembelian data:', error);
        showToast('Gagal memuat data', 'error');
    }
}

// Render list barang yang bisa dibeli
let searchBarangKeyword = '';
function renderBarangPembelianList() {
    let filtered = barangList;
    if (searchBarangKeyword) {
        filtered = barangList.filter(b => 
            b.nama_barang.toLowerCase().includes(searchBarangKeyword.toLowerCase()) ||
            b.kode_barang?.toLowerCase().includes(searchBarangKeyword.toLowerCase())
        );
    }
    
    if (filtered.length === 0) {
        return '<div style="text-align:center; padding:20px;">Tidak ada barang</div>';
    }
    
    return filtered.map(barang => `
        <div class="product-item">
            <div class="product-info">
                <div class="product-name">${barang.nama_barang}</div>
                <div class="product-price">Harga Beli: ${formatRupiah(barang.harga_beli)}</div>
                <div class="product-stock">Stok Saat Ini: ${barang.stok}</div>
            </div>
            <div class="product-actions">
                <input type="number" id="qty_pembelian_${barang.id}" min="1" value="1" style="width:60px;">
                <button class="btn-add" onclick="addToPembelianCart('${barang.id}', '${barang.nama_barang.replace(/'/g, "\\'")}', ${barang.harga_beli})">Tambah</button>
            </div>
        </div>
    `).join('');
}

function searchBarangPembelian(keyword) {
    searchBarangKeyword = keyword;
    const listContainer = document.getElementById('barangPembelianList');
    if (listContainer) {
        listContainer.innerHTML = renderBarangPembelianList();
    }
}

// Add to pembelian cart
function addToPembelianCart(id, nama, hargaBeli) {
    const qtyInput = document.getElementById(`qty_pembelian_${id}`);
    let qty = 1;
    if (qtyInput) qty = parseInt(qtyInput.value) || 1;
    
    const existing = pembelianCart.find(item => item.id === id);
    
    if (existing) {
        existing.qty += qty;
    } else {
        pembelianCart.push({
            id: id,
            nama: nama,
            harga_beli: hargaBeli,
            qty: qty
        });
    }
    
    updatePembelianCartDisplay();
    showToast(`${nama} ditambahkan ke keranjang`, 'success');
}

// Update tampilan keranjang pembelian
function updatePembelianCartDisplay() {
    const cartContainer = document.getElementById('pembelianCartItems');
    const totalSpan = document.getElementById('pembelianTotal');
    
    let total = 0;
    
    if (pembelianCart.length === 0) {
        cartContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Keranjang kosong</div>';
        totalSpan.textContent = formatRupiah(0);
        return;
    }
    
    cartContainer.innerHTML = pembelianCart.map((item, index) => {
        const subtotal = item.harga_beli * item.qty;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">📦 ${item.nama}</div>
                    <div class="cart-item-price">${formatRupiah(item.harga_beli)}</div>
                    <div class="cart-item-qty">
                        <button class="btn-qty-minus" onclick="updatePembelianCartQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="btn-qty-plus" onclick="updatePembelianCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-subtotal">${formatRupiah(subtotal)}</div>
                <button class="cart-item-remove" onclick="removeFromPembelianCart(${index})">&times;</button>
            </div>
        `;
    }).join('');
    
    totalSpan.textContent = formatRupiah(total);
}

function updatePembelianCartQty(index, delta) {
    const item = pembelianCart[index];
    if (!item) return;
    
    const newQty = item.qty + delta;
    if (newQty < 1) {
        removeFromPembelianCart(index);
        return;
    }
    
    item.qty = newQty;
    updatePembelianCartDisplay();
}

function removeFromPembelianCart(index) {
    pembelianCart.splice(index, 1);
    updatePembelianCartDisplay();
}

function clearPembelianCart() {
    if (pembelianCart.length > 0 && confirm('Kosongkan keranjang pembelian?')) {
        pembelianCart = [];
        updatePembelianCartDisplay();
        showToast('Keranjang dikosongkan', 'info');
    }
}

// Search supplier
let supplierSearchKeyword = '';
function searchSupplierPembelian(keyword) {
    const resultDiv = document.getElementById('supplierSearchResult');
    if (!keyword || keyword.length < 2) {
        resultDiv.style.display = 'none';
        return;
    }
    
    const filtered = supplierList.filter(s => 
        s.nama_supplier.toLowerCase().includes(keyword.toLowerCase()) ||
        s.kontak?.includes(keyword)
    );
    
    if (filtered.length > 0) {
        resultDiv.innerHTML = filtered.map(s => `
            <div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee;" onclick="selectSupplierPembelian('${s.id}', '${s.nama_supplier.replace(/'/g, "\\'")}')">
                <strong>${s.nama_supplier}</strong><br>
                <small>${s.kontak || ''}</small>
            </div>
        `).join('');
        resultDiv.style.display = 'block';
    } else {
        resultDiv.style.display = 'none';
    }
}

function selectSupplierPembelian(id, nama) {
    document.getElementById('idSupplier').value = id;
    document.getElementById('namaSupplier').value = nama;
    document.getElementById('supplierSearchResult').style.display = 'none';
}

// Show pembelian modal
function showPembelianModal() {
    if (pembelianCart.length === 0) {
        showToast('Keranjang masih kosong', 'warning');
        return;
    }
    
    const idSupplier = document.getElementById('idSupplier')?.value;
    if (!idSupplier) {
        showToast('Pilih supplier terlebih dahulu', 'warning');
        return;
    }
    
    const totalSpan = document.getElementById('pembelianTotal');
    const total = parseRupiah(totalSpan.textContent);
    
    const modal = document.getElementById('globalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Konfirmasi Pembelian';
    
    modalBody.innerHTML = `
        <form id="pembelianForm">
            <div class="form-group">
                <label>Supplier</label>
                <input type="text" value="${document.getElementById('namaSupplier').value}" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label>Total Biaya</label>
                <input type="text" value="${formatRupiah(total)}" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label>Status Pembayaran</label>
                <select id="statusPembayaran">
                    <option value="Lunas">Lunas</option>
                    <option value="Hutang">Hutang</option>
                    <option value="DP">DP</option>
                </select>
            </div>
            <div class="form-group">
                <label>Catatan</label>
                <textarea id="modalCatatan" rows="2">${document.getElementById('catatanPembelian')?.value || ''}</textarea>
            </div>
        </form>
    `;
    
    const saveBtn = modal.querySelector('.modal-save');
    saveBtn.textContent = 'Proses Pembelian';
    saveBtn.onclick = async () => {
        await prosesPembelian();
    };
    
    modal.style.display = 'flex';
}

// Proses pembelian
async function prosesPembelian() {
    const idSupplier = document.getElementById('idSupplier').value;
    const statusPembayaran = document.getElementById('statusPembayaran')?.value;
    const catatan = document.getElementById('modalCatatan')?.value || document.getElementById('catatanPembelian')?.value || '';
    const totalSpan = document.getElementById('pembelianTotal');
    const total = parseRupiah(totalSpan.textContent);
    
    const items = pembelianCart.map(item => ({
        id_barang: item.id,
        qty: item.qty,
        harga_beli: item.harga_beli
    }));
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const data = {
        id_supplier: idSupplier,
        total_biaya: total,
        status_pembayaran: statusPembayaran,
        catatan: catatan,
        dibuat_oleh: user.nama || user.email,
        items: JSON.stringify(items)
    };
    
    showLoading(true);
    
    try {
        const result = await savePembelian(data);
        if (result.success) {
            showToast(`Pembelian berhasil! ID: ${result.id_pembelian}`, 'success');
            closeModal();
            // Reset
            pembelianCart = [];
            updatePembelianCartDisplay();
            document.getElementById('idSupplier').value = '';
            document.getElementById('namaSupplier').value = '';
            document.getElementById('catatanPembelian').value = '';
            
            // Reload barang list to update stock
            await loadPembelianData();
            document.getElementById('barangPembelianList').innerHTML = renderBarangPembelianList();
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Export global functions
window.addToPembelianCart = addToPembelianCart;
window.updatePembelianCartQty = updatePembelianCartQty;
window.removeFromPembelianCart = removeFromPembelianCart;
window.clearPembelianCart = clearPembelianCart;
window.searchBarangPembelian = searchBarangPembelian;
window.searchSupplierPembelian = searchSupplierPembelian;
window.selectSupplierPembelian = selectSupplierPembelian;
window.showPembelianModal = showPembelianModal;
