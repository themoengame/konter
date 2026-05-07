// ==================== MASTER BARANG ====================

// Export fungsi ke global untuk dipanggil dari dashboard.js
window.renderMasterBarang = async function(container) {
    await renderMaster('barang', container);
};

// Override renderMaster untuk barang (jika perlu custom)
// Karena kita menggunakan generic renderMaster, tidak perlu fungsi khusus
