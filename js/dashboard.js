// ==================== DASHBOARD NAVIGATION ====================

// Inisialisasi dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    initSidebar();
    initSidebarToggle();
    initLogout();
    updateDateTime();
    
    // Load default page (dashboard home)
    loadPage('home');
});

// Set interval untuk update jam
setInterval(updateDateTime, 1000);

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

// Load page berdasarkan page name (load dari file HTML)
async function loadPage(pageName) {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    // Show loading
    contentArea.innerHTML = '<div class="loading">Memuat...</div>';
    
    // Dapatkan file HTML dari mapping
    const pageFile = PAGE_FILES[pageName];
    if (!pageFile) {
        contentArea.innerHTML = '<div class="error-message">Halaman tidak ditemukan</div>';
        return;
    }
    
    try {
        // Fetch file HTML
        const response = await fetch(pageFile);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        
        // Parse HTML dan eksekusi script di dalamnya
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Ekstrak dan eksekusi script
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
            document.body.removeChild(newScript);
        });
        
        // Tampilkan konten (tanpa script)
        const contentHtml = tempDiv.innerHTML;
        contentArea.innerHTML = contentHtml;
        
        // Trigger event untuk halaman yang dimuat
        const event = new CustomEvent('pageLoaded', { detail: { page: pageName } });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('Error loading page:', error);
        contentArea.innerHTML = `<div class="error-message">Gagal memuat halaman: ${error.message}</div>`;
    }
}

// ==================== RENDER FUNCTIONS (Fallback jika fetch gagal) ====================

// Fungsi render dashboard (sebagai fallback jika home.html tidak bisa di-load)
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
        
        // Untuk mobile: tambah class mobile-open
        if (window.innerWidth <= 768) {
            const menuItems = document.querySelectorAll('#mainMenu li');
            menuItems.forEach(item => {
                item.addEventListener('click', () => {
                    sidebar.classList.remove('mobile-open');
                });
            });
        }
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

// Update realtime datetime
function updateDateTime() {
    const elem = document.getElementById('dateTime');
    if (elem) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elem.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// Export fungsi ke global
window.loadPage = loadPage;
window.renderDashboard = renderDashboard;
