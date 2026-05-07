// ==================== TRANSAKSI PENJUALAN ====================

// Global cart array
let cart = [];
let currentProducts = {
    barang: [],
    pulsa: [],
    pembayaran: [],
    servis: []
};
let activeTab = 'barang';

// Render halaman penjualan
async function renderPenjualan(container) {
    // Reset cart
    cart = [];
    
    // Load all products
    await loadAllProducts();
    
    container.innerHTML = `
        <div class="section-header">
            <h3>Transaksi Penjualan</h3>
            <div class="filter-bar">
                <input type="text" id="searchProduct" placeholder="Cari produk..." onkeyup="searchProducts(this.value)">
            </div>
        </div>
        
        <div class="transaction-container">
            <!-- Panel Kiri: Pilih Produk -->
            <div class="product-panel">
                <div class="product-panel-header">
                    <h3>Pilih Produk</h3>
                </div>
                
                <!-- Tabs -->
                <div class="tabs">
                    <button class="tab-btn ${activeTab === 'barang' ? 'active' : ''}" onclick="switchTab('barang')">📱 Barang</button>
                    <button class="tab-btn ${activeTab === 'pulsa' ? 'active' : ''}" onclick="switchTab('pulsa')">📡 Pulsa</button>
                    <button class="tab-btn ${activeTab === 'pembayaran' ? 'active' : ''}" onclick="switchTab('pembayaran')">💳 Pembayaran</button>
                    <button class="tab-btn ${activeTab === 'servis' ? 'active' : ''}" onclick="switchTab('servis')">🔧 Servis</button>
                </div>
                
                <!-- Product List -->
                <div id="productList" class="product-list">
                    ${renderProductList()}
                </div>
            </div>
            
            <!-- Panel Kanan: Keranjang -->
            <div class="cart-panel">
                <div class="cart-header">
                    <h3>🛒 Keranjang Belanja</h3>
                </div>
                <div id="cartItems" class="cart-items">
                    ${renderCartItems()}
                </div>
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Total</span>
                        <span id="cartTotal">Rp 0</span>
                    </div>
                    <div class="summary-row">
                        <span>Diskon</span>
                        <span><input type="number" id="diskonInput" value="0" onchange="updateGrandTotal()" style="width:100px; text-align:right;"> </span>
                    </div>
                    <div class="summary-row total">
                        <span>Grand Total</span>
                        <span id="grandTotal">Rp 0</span>
                    </div>
                </div>
                <div class="cart-actions">
                    <button class="btn-secondary" onclick="clearCart()">Kosongkan</button>
                    <button class="btn-primary" onclick="showPaymentModal()">Bayar</button>
                </div>
            </div>
        </div>
        
        <!-- Informasi Tambahan -->
        <div class="transaction-info">
            <div class="info-row">
                <div class="form-group">
                    <label>ID Konsumen</label>
                    <input type="text" id="idKonsumen" placeholder="C001">
                </div>
                <div class="form-group">
                    <label>Nama Konsumen</label>
                    <input type="text" id="namaKonsumen" placeholder="Cari konsumen..." onkeyup="searchKonsumen(this.value)">
                    <div id="konsumenSearchResult" style="position:absolute; background:white; border:1px solid #ddd; max-height:150px; overflow-y:auto; width:200px; display:none;"></div>
                </div>
            </div>
        </div>
    `;
    
    // Simpan reference ke window untuk fungsi global
    window.cart = cart;
}

// Load semua produk dari semua tipe
async function loadAllProducts() {
    try {
        const [barang, pulsa, pembayaran, servis] = await Promise.all([
            getAllMaster('barang'),
            getAllMaster('pulsa'),
            getAllMaster('pembayaran'),
            getAllMaster('servis')
        ]);
        
        currentProducts = { barang, pulsa, pembayaran, servis };
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Gagal memuat data produk', 'error');
    }
}

// Render product list berdasarkan tab aktif
function renderProductList() {
    const products = currentProducts[activeTab] || [];
    const filtered = filterProductsBySearch(products);
    
    if (filtered.length === 0) {
        return '<div style="text-align:center; padding:20px;">Tidak ada produk</div>';
    }
    
    return filtered.map(product => {
        const productId = product.id;
        const productName = product.nama_barang || product.nama_servis || product.operator + ' ' + formatRupiah(product.nominal) || product.provider;
        const price = product.harga_jual || product.fee_jual || product.biaya_jasa || 0;
        const stock = product.stok || product.stok_deposit || (activeTab === 'servis' ? 999 : 0);
        
        return `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${productName}</div>
                    <div class="product-price">${formatRupiah(price)}</div>
                    <div class="product-stock">Stok: ${stock === 999 ? '∞' : stock}</div>
                </div>
                <div class="product-actions">
                    <input type="number" id="qty_${productId}" min="1" max="${stock === 999 ? 999 : stock}" value="1" style="width:60px;">
                    <button class="btn-add" onclick="addToCart('${activeTab}', '${productId}', '${productName.replace(/'/g, "\\'")}', ${price})">Tambah</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter produk berdasarkan search
let searchKeyword = '';
function filterProductsBySearch(products) {
    if (!searchKeyword) return products;
    return products.filter(p => {
        const name = p.nama_barang || p.nama_servis || p.operator || p.provider || '';
        return name.toLowerCase().includes(searchKeyword.toLowerCase());
    });
}

function searchProducts(keyword) {
    searchKeyword = keyword;
    const productList = document.getElementById('productList');
    if (productList) {
        productList.innerHTML = renderProductList();
    }
}

// Switch tab
function switchTab(tab) {
    activeTab = tab;
    
    // Update UI tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh product list
    const productList = document.getElementById('productList');
    if (productList) {
        productList.innerHTML = renderProductList();
    }
}

// Add to cart
function addToCart(tipe, id, nama, harga) {
    const qtyInput = document.getElementById(`qty_${id}`);
    let qty = 1;
    if (qtyInput) qty = parseInt(qtyInput.value) || 1;
    
    // Cek stok untuk barang fisik
    if (tipe === 'barang') {
        const product = currentProducts.barang.find(p => p.id === id);
        if (product && qty > product.stok) {
            showToast(`Stok tidak mencukupi. Stok tersedia: ${product.stok}`, 'warning');
            return;
        }
    }
    
    // Cek stok deposit untuk pulsa/pembayaran
    if (tipe === 'pulsa' || tipe === 'pembayaran') {
        const products = tipe === 'pulsa' ? currentProducts.pulsa : currentProducts.pembayaran;
        const product = products.find(p => p.id === id);
        if (product && qty > (product.stok_deposit || 999)) {
            showToast(`Stok deposit tidak mencukupi`, 'warning');
            return;
        }
    }
    
    const existingItem = cart.find(item => item.id === id && item.tipe === tipe);
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({
            id: id,
            tipe: tipe,
            nama: nama,
            harga: harga,
            qty: qty
        });
    }
    
    updateCartDisplay();
    showToast(`${nama} ditambahkan ke keranjang`, 'success');
}

// Update tampilan keranjang
function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    let total = 0;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Keranjang kosong</div>';
        cartTotalSpan.textContent = formatRupiah(0);
        updateGrandTotal();
        return;
    }
    
    cartContainer.innerHTML = cart.map((item, index) => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        
        let tipeIcon = '';
        switch(item.tipe) {
            case 'barang': tipeIcon = '📱'; break;
            case 'pulsa': tipeIcon = '📡'; break;
            case 'pembayaran': tipeIcon = '💳'; break;
            case 'servis': tipeIcon = '🔧'; break;
        }
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${tipeIcon} ${item.nama}</div>
                    <div class="cart-item-price">${formatRupiah(item.harga)}</div>
                    <div class="cart-item-qty">
                        <button class="btn-qty-minus" onclick="updateCartQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="btn-qty-plus" onclick="updateCartQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-subtotal">${formatRupiah(subtotal)}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
    }).join('');
    
    cartTotalSpan.textContent = formatRupiah(total);
    updateGrandTotal();
}

// Update quantity
function updateCartQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    
    const newQty = item.qty + delta;
    
    if (newQty < 1) {
        removeFromCart(index);
        return;
    }
    
    // Cek stok
    if (item.tipe === 'barang') {
        const product = currentProducts.barang.find(p => p.id === item.id);
        if (product && newQty > product.stok) {
            showToast(`Stok tidak mencukupi. Maksimal ${product.stok}`, 'warning');
            return;
        }
    }
    
    if (item.tipe === 'pulsa' || item.tipe === 'pembayaran') {
        const products = item.tipe === 'pulsa' ? currentProducts.pulsa : currentProducts.pembayaran;
        const product = products.find(p => p.id === item.id);
        if (product && newQty > (product.stok_deposit || 999)) {
            showToast(`Stok deposit tidak mencukupi`, 'warning');
            return;
        }
    }
    
    item.qty = newQty;
    updateCartDisplay();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Clear cart
function clearCart() {
    if (cart.length > 0 && confirm('Kosongkan keranjang?')) {
        cart = [];
        updateCartDisplay();
        showToast('Keranjang dikosongkan', 'info');
    }
}

// Update grand total (total - diskon)
function updateGrandTotal() {
    const totalSpan = document.getElementById('cartTotal');
    const diskonInput = document.getElementById('diskonInput');
    const grandTotalSpan = document.getElementById('grandTotal');
    
    if (!totalSpan || !diskonInput || !grandTotalSpan) return;
    
    const total = parseRupiah(totalSpan.textContent);
    const diskon = parseInt(diskonInput.value) || 0;
    const grandTotal = Math.max(0, total - diskon);
    
    grandTotalSpan.textContent = formatRupiah(grandTotal);
}

// Search konsumen
let konsumenList = [];
async function searchKonsumen(keyword) {
    const resultDiv = document.getElementById('konsumenSearchResult');
    if (!keyword || keyword.length < 2) {
        resultDiv.style.display = 'none';
        return;
    }
    
    if (konsumenList.length === 0) {
        konsumenList = await getAllMaster('konsumen');
    }
    
    const filtered = konsumenList.filter(k => 
        k.nama.toLowerCase().includes(keyword.toLowerCase()) ||
        k.email?.toLowerCase().includes(keyword.toLowerCase()) ||
        k.telepon?.includes(keyword)
    );
    
    if (filtered.length > 0) {
        resultDiv.innerHTML = filtered.map(k => `
            <div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee;" onclick="selectKonsumen('${k.id}', '${k.nama.replace(/'/g, "\\'")}')">
                <strong>${k.nama}</strong><br>
                <small>${k.email || ''} | ${k.telepon || ''}</small>
            </div>
        `).join('');
        resultDiv.style.display = 'block';
    } else {
        resultDiv.style.display = 'none';
    }
}

function selectKonsumen(id, nama) {
    document.getElementById('idKonsumen').value = id;
    document.getElementById('namaKonsumen').value = nama;
    document.getElementById('konsumenSearchResult').style.display = 'none';
}

// Show payment modal
function showPaymentModal() {
    if (cart.length === 0) {
        showToast('Keranjang masih kosong', 'warning');
        return;
    }
    
    const grandTotalSpan = document.getElementById('grandTotal');
    const grandTotal = parseRupiah(grandTotalSpan.textContent);
    
    const modal = document.getElementById('globalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Pembayaran';
    
    modalBody.innerHTML = `
        <form id="paymentForm">
            <div class="form-group">
                <label>Grand Total</label>
                <input type="text" id="modalGrandTotal" value="${formatRupiah(grandTotal)}" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label>Jumlah Bayar</label>
                <input type="number" id="jumlahBayar" placeholder="Masukkan jumlah bayar" oninput="calculateKembalian()">
            </div>
            <div class="form-group">
                <label>Kembalian</label>
                <input type="text" id="kembalian" readonly style="background:#f5f5f5;">
            </div>
            <div class="form-group">
                <label>Metode Pembayaran</label>
                <select id="metodeBayar">
                    <option value="Cash">Cash</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer">Transfer</option>
                </select>
            </div>
        </form>
    `;
    
    // Override save button
    const saveBtn = modal.querySelector('.modal-save');
    saveBtn.textContent = 'Proses Transaksi';
    saveBtn.onclick = async () => {
        await prosesTransaksi();
    };
    
    modal.style.display = 'flex';
    
    // Add global function for kembalian
    window.calculateKembalian = function() {
        const total = grandTotal;
        const bayar = parseInt(document.getElementById('jumlahBayar')?.value) || 0;
        const kembalian = bayar - total;
        const kembalianInput = document.getElementById('kembalian');
        if (kembalianInput) {
            kembalianInput.value = kembalian >= 0 ? formatRupiah(kembalian) : 'Kurang Rp ' + formatRupiah(Math.abs(kembalian));
        }
    };
}

// Proses transaksi
async function prosesTransaksi() {
    const idKonsumen = document.getElementById('idKonsumen')?.value;
    const diskon = parseInt(document.getElementById('diskonInput')?.value) || 0;
    const metodeBayar = document.getElementById('metodeBayar')?.value;
    const jumlahBayar = parseInt(document.getElementById('jumlahBayar')?.value) || 0;
    const grandTotalSpan = document.getElementById('grandTotal');
    const grandTotal = parseRupiah(grandTotalSpan.textContent);
    
    if (!idKonsumen) {
        showToast('Pilih konsumen terlebih dahulu', 'warning');
        return;
    }
    
    if (jumlahBayar < grandTotal) {
        showToast('Jumlah bayar kurang', 'warning');
        return;
    }
    
    // Prepare items
    const items = cart.map(item => {
        const subtotal = item.harga * item.qty;
        return {
            tipe_produk: item.tipe,
            id_ref: item.id,
            qty: item.qty,
            harga_satuan: item.harga,
            subtotal: subtotal
        };
    });
    
    const data = {
        id_konsumen: idKonsumen,
        total_bayar: grandTotal + diskon,
        diskon: diskon,
        grand_total: grandTotal,
        metode_pembayaran: metodeBayar,
        items: JSON.stringify(items)
    };
    
    showLoading(true);
    
    try {
        const result = await savePenjualan(data);
        if (result.success) {
            showToast(`Transaksi berhasil! ID: ${result.id_transaksi}`, 'success');
            closeModal();
            // Reset cart dan refresh
            cart = [];
            updateCartDisplay();
            document.getElementById('idKonsumen').value = '';
            document.getElementById('namaKonsumen').value = '';
            document.getElementById('diskonInput').value = 0;
            
            // Reload products to update stock
            await loadAllProducts();
            document.getElementById('productList').innerHTML = renderProductList();
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Export global functions
window.addToCart = addToCart;
window.switchTab = switchTab;
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.searchProducts = searchProducts;
window.searchKonsumen = searchKonsumen;
window.selectKonsumen = selectKonsumen;
window.showPaymentModal = showPaymentModal;
window.updateGrandTotal = updateGrandTotal;
