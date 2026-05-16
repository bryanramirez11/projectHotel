// shared.js

function getLoginUrl() {
    const href = window.location.href;
    const indexTarget = href.indexOf('/pages/');
    if (indexTarget !== -1) {
        return href.slice(0, indexTarget) + '/index.html';
    }
    const indexTargetBack = href.indexOf('\\pages\\');
    if (indexTargetBack !== -1) {
        return href.slice(0, indexTargetBack) + '\\index.html';
    }
    return 'index.html';
}

function currentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (error) {
        return null;
    }
}



function requireAuth() {
    if (localStorage.getItem('isAuthenticated') !== 'true' || !currentUser()) {
        window.location.href = getLoginUrl();
    }
}

function markActiveNav(pageKey) {
    document.querySelectorAll('.app-nav-item').forEach(item => {
        item.classList.remove('bg-primary-container', 'text-on-primary-container', 'border-l-4', 'border-primary', 'font-semibold');
        item.classList.add('text-secondary');
    });
    const active = document.querySelector(`[data-nav="${pageKey}"]`);
    if (active) {
        active.classList.add('bg-primary-container', 'text-on-primary-container', 'border-l-4', 'border-primary', 'font-semibold');
        active.classList.remove('text-secondary');
    }
}

function initAppPage(pageKey) {
    requireAuth();
    const user = currentUser();
    const label = document.getElementById('userName');
    if (label && user) {
        label.textContent = user.name || user.username || 'Usuario';
    }
    markActiveNav(pageKey);
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    window.location.href = getLoginUrl();
}

window.logout = logout;
window.initAppPage = initAppPage;
window.currentUser = currentUser;
