// ==================== DASHBOARD NAVIGATION ====================

// Inisialisasi dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    initSidebar();
    initSidebarToggle();
    initLogout();
    
    // Load default page (dashboard home)
    loadPage('dashboard-home');
});

// Inisialisasi menu sidebar berdasarkan role
function initSidebar() {
    const menuList = document.getElementById('mainMenu');
    if (!menuList) return;
    
    const role = getCurrentRole();
    const menus = ROLE_MENU[role] || ROLE_MENU.kasir;
    
    menuList.innerHTML = '';
    
    menus.forEach(menu => {
        const li = document.createElement('li');
        li.setAttribute('data-page', menu.page);
        li.innerHTML = `
            <span class="menu-icon">${menu.icon}</span>
            <span class="menu-text">${menu.label}</span>
        `;
        li.addEventListener('click', () => {
            // Set active class
            document.querySelectorAll('#mainMenu li').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
            
            // Load page
            loadPage(menu.page);
            
            // Update title
            document.getElementById('pageTitle').textContent = menu.label;
        });
        menuList.appendChild(li);
    });
    
    // Set active first menu
    const firstMenu = menuList.querySelector('li');
    if (firstMenu) firstMenu.classList.add('active');
}

// Inisialisasi toggle sidebar
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }
}

// Inisialisasi logout button
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Yakin ingin logout?')) {
                logout();
            }
        });
    }
}

// Load page berdasarkan page name
async function loadPage(pageName) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    // Show loading
    contentArea.innerHTML = '<div class="loading">Memuat...</div>';
    
    // Panggil renderer berdasarkan page name
    const renderer = PAGE_RENDERERS[pageName];
    if (renderer) {
        await renderer(contentArea);
    } else {
        contentArea.innerHTML = '<div class="loading">Halaman tidak ditemukan</div>';
    }
}

// ==================== DASHBOARD HOME RENDERER ====================
async function renderDashboard(container) {
    try {
        const stats = await getDashboardStats();
        
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h3>💰 Penjualan Hari Ini</h3>
                    <p class="stat-value">${formatRupiah(stats.penjualan_hari_ini || 0)}</p>
                </div>
                <div class="stat-card">
                    <h3>📦 Total Stok Barang</h3>
                    <p class="stat-value">${formatNumber(stats.total_stok || 0)}</p>
                </div>
                <div class="stat-card">
                    <h3>👥 Total Konsumen</h3>
                    <p class="stat-value">${formatNumber(stats.total_konsumen || 0)}</p>
                </div>
                <div class="stat-card">
                    <h3>🏭 Total Supplier</h3>
                    <p class="stat-value">${formatNumber(stats.total_supplier || 0)}</p>
                </div>
            </div>
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
                <h3>Selamat Datang di Sistem Counter HP</h3>
                <p style="margin-top: 10px; color: var(--gray);">
                    Sistem ini mendukung penjualan Handphone, Aksesoris, Pulsa, 
                    Pembayaran Online, dan Servis. Gunakan menu di samping untuk mengelola data.
                </p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<div class="error-message">Gagal memuat dashboard: ${error.message}</div>`;
    }
}

// ==================== MASTER RENDERER GENERIC ====================
async function renderMaster(masterType, container) {
    try {
        const data = await getAllMaster(masterType);
        const columns = MASTER_COLUMNS[masterType];
        
        if (!columns) {
            container.innerHTML = '<div class="loading">Konfigurasi master tidak ditemukan</div>';
            return;
        }
        
        // Header dengan tombol tambah
        container.innerHTML = `
            <div class="section-header">
                <h3>Master ${masterType.charAt(0).toUpperCase() + masterType.slice(1)}</h3>
                <button class="btn-primary" onclick="showAddModal('${masterType}')">+ Tambah</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.label}</th>`).join('')}
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="masterTableBody">
                        ${renderMasterRows(data, columns)}
                    </tbody>
                </table>
            </div>
        `;
        
    } catch (error) {
        container.innerHTML = `<div class="error-message">Gagal memuat data: ${error.message}</div>`;
    }
}

function renderMasterRows(data, columns) {
    if (!data || data.length === 0) {
        return '<tr><td colspan="100%" style="text-align:center">Tidak ada data</td></tr>';
    }
    
    return data.map(item => `
        <tr>
            ${columns.map(col => {
                let value = item[col.key] || '-';
                if (col.key.includes('harga') || col.key.includes('biaya') || col.key.includes('fee')) {
                    value = formatRupiah(value);
                }
                return `<td>${value}</td>`;
            }).join('')}
            <td class="actions">
                <button class="btn-edit" onclick="editMaster('${masterType}', '${item.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteMasterItem('${masterType}', '${item.id}')">Hapus</button>
            </td>
        </tr>
    `).join('');
}

// Fungsi global untuk modal
function showAddModal(masterType) {
    const columns = MASTER_COLUMNS[masterType];
    if (!columns) return;
    
    const modal = document.getElementById('globalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Tambah ${masterType}`;
    
    // Generate form
    modalBody.innerHTML = `
        <form id="masterForm">
            ${columns.filter(col => !col.readonly).map(col => `
                <div class="form-group">
                    <label>${col.label}</label>
                    ${col.type === 'textarea' ? 
                        `<textarea name="${col.key}" ${col.required ? 'required' : ''}></textarea>` :
                    col.type === 'select' ?
                        `<select name="${col.key}" ${col.required ? 'required' : ''}>
                            <option value="">Pilih</option>
                            ${col.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>` :
                        `<input type="${col.type}" name="${col.key}" ${col.required ? 'required' : ''}>`
                    }
                </div>
            `).join('')}
        </form>
    `;
    
    // Override save button
    const saveBtn = modal.querySelector('.modal-save');
    const oldSaveHandler = saveBtn.onclick;
    saveBtn.onclick = async () => {
        const form = document.getElementById('masterForm');
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        
        try {
            showLoading(true);
            await createMaster(masterType, data);
            showToast('Data berhasil ditambahkan', 'success');
            closeModal();
            // Refresh page
            renderMaster(masterType, document.getElementById('contentArea'));
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            showLoading(false);
        }
    };
    
    modal.style.display = 'flex';
}

// Fungsi global untuk delete
window.deleteMasterItem = async function(masterType, id) {
    const confirmed = await confirmAction(`Yakin hapus data ini?`);
    if (!confirmed) return;
    
    try {
        showLoading(true);
        await deleteMaster(masterType, id);
        showToast('Data berhasil dihapus', 'success');
        renderMaster(masterType, document.getElementById('contentArea'));
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// Fungsi global untuk edit
window.editMaster = async function(masterType, id) {
    try {
        const data = await getAllMaster(masterType);
        const item = data.find(d => d.id === id);
        if (!item) throw new Error('Data tidak ditemukan');
        
        const columns = MASTER_COLUMNS[masterType];
        
        const modal = document.getElementById('globalModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Edit ${masterType}`;
        
        modalBody.innerHTML = `
            <form id="masterForm">
                ${columns.filter(col => !col.readonly).map(col => `
                    <div class="form-group">
                        <label>${col.label}</label>
                        ${col.type === 'textarea' ? 
                            `<textarea name="${col.key}" ${col.required ? 'required' : ''}>${item[col.key] || ''}</textarea>` :
                        col.type === 'select' ?
                            `<select name="${col.key}" ${col.required ? 'required' : ''}>
                                <option value="">Pilih</option>
                                ${col.options.map(opt => `<option value="${opt}" ${item[col.key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>` :
                            `<input type="${col.type}" name="${col.key}" value="${item[col.key] || ''}" ${col.required ? 'required' : ''}>`
                        }
                    </div>
                `).join('')}
            </form>
        `;
        
        const saveBtn = modal.querySelector('.modal-save');
        saveBtn.onclick = async () => {
            const form = document.getElementById('masterForm');
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            
            try {
                showLoading(true);
                await updateMaster(masterType, id, data);
                showToast('Data berhasil diupdate', 'success');
                closeModal();
                renderMaster(masterType, document.getElementById('contentArea'));
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                showLoading(false);
            }
        };
        
        modal.style.display = 'flex';
    } catch (error) {
        showToast(error.message, 'error');
    }
};

function closeModal() {
    const modal = document.getElementById('globalModal');
    modal.style.display = 'none';
}

// Event listener untuk close modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('globalModal');
    if (modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        
        if (closeBtn) closeBtn.onclick = closeModal;
        if (cancelBtn) cancelBtn.onclick = closeModal;
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
});
