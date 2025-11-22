// Theme toggling and persistence (uses SweetAlert2 for notifications)
function applyThemeClass(t) {
    document.documentElement.classList.remove('dark-theme');
    if (t === 'dark') document.documentElement.classList.add('dark-theme');
}

function setTheme(mode) {
    if (mode === 'system') {
        localStorage.removeItem('theme');
        // apply system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyThemeClass(prefersDark ? 'dark' : 'light');
        Swal.fire({ icon: 'info', title: 'Theme', text: 'Theme set to system' });
        return;
    }
    localStorage.setItem('theme', mode);
    applyThemeClass(mode);
    Swal.fire({ icon: 'success', title: 'Theme', text: 'Theme set to ' + mode });
}

function resetTheme() {
    localStorage.removeItem('theme');
    applyThemeClass('light');
    Swal.fire({ icon: 'success', title: 'Theme', text: 'Theme reset to default' });
}

function showSavedTheme() {
    const t = localStorage.getItem('theme') || 'system';
    Swal.fire({ icon: 'info', title: 'Saved theme', text: t });
}

// On load, apply saved theme or system
(function () {
    const saved = localStorage.getItem('theme');
    if (saved) applyThemeClass(saved);
    else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyThemeClass(prefersDark ? 'dark' : 'light');
    }
})();
