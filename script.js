// Изначально баланс 0
let totalBalance = 0.00;
const installBtn = document.getElementById('installBtn');
let deferredPrompt;

// Логика установки на ПК
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

// Логика кнопки перевода
document.getElementById('action-btn').addEventListener('click', () => {
    alert("Функция перевода доступна. Ваш баланс: $" + totalBalance.toFixed(2));
});
