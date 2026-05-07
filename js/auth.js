// ==================== AUTHENTICATION ====================

// Data session
let currentUser = {
    isLoggedIn: false,
    email: null,
    role: null,
    nama: null
};

// Cek status login di halaman dashboard
function checkAuth() {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            currentUser.isLoggedIn = true;
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

// Handle login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Jika di halaman dashboard, cek auth
    if (window.location.pathname.includes('dashboard.html')) {
        if (!checkAuth()) {
            window.location.href = 'index.html';
        } else {
            // Update user info di sidebar
            updateUserInfo();
        }
    }
});

// Function login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!email || !password) {
        errorDiv.textContent = 'Email dan password harus diisi';
        return;
    }
    
    errorDiv.textContent = '';
    showLoading(true);
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Simpan session
            currentUser = {
                isLoggedIn: true,
                email: result.email,
                role: result.role,
                nama: result.nama || result.email
            };
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showToast('Login berhasil!', 'success');
            
            // Redirect ke dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            errorDiv.textContent = result.message;
        }
    } catch (error) {
        errorDiv.textContent = 'Login gagal: ' + error.message;
    } finally {
        showLoading(false);
    }
}

// Function logout
function logout() {
    localStorage.removeItem('user');
    currentUser = {
        isLoggedIn: false,
        email: null,
        role: null,
        nama: null
    };
    window.location.href = 'index.html';
}

// Update user info di sidebar
function updateUserInfo() {
    const userNameSpan = document.querySelector('.user-name');
    const userRoleSpan = document.getElementById('userRole');
    
    if (userNameSpan) {
        userNameSpan.textContent = currentUser.nama || currentUser.email;
    }
    if (userRoleSpan) {
        let roleText = currentUser.role || '';
        roleText = roleText.charAt(0).toUpperCase() + roleText.slice(1);
        userRoleSpan.textContent = roleText;
    }
}

// Get current user role
function getCurrentRole() {
    return currentUser.role;
}

// Check if user has permission
function hasPermission(menuId) {
    const role = currentUser.role;
    if (!role) return false;
    
    const menus = ROLE_MENU[role];
    if (!menus) return false;
    
    return menus.some(menu => menu.id === menuId);
}

// Export ke global
window.getCurrentRole = getCurrentRole;
window.logout = logout;
