// База токенов (Изначально строго по нулям)
const cryptoAssets = [
    { name: "Bitcoin", code: "BTC", logo: "₿", balance: 0.00, price: 65000 },
    { name: "Ethereum", code: "ETH", logo: "Ξ", balance: 0.00, price: 3500 },
    { name: "Tether", code: "USDT", logo: "₮", balance: 0.00, price: 1.00 },
    { name: "Solana", code: "SOL", logo: "S", balance: 0.00, price: 140 },
    { name: "Binance Coin", code: "BNB", logo: "B", balance: 0.00, price: 580 },
    { name: "Ripple", code: "XRP", logo: "✕", balance: 0.00, price: 0.60 }
];

const assetsList = document.getElementById('assets-list');
const coinSearch = document.getElementById('coin-search');

// Функция вывода токенов с фильтрацией
function renderCoins(filter = "") {
    assetsList.innerHTML = "";
    
    const filtered = cryptoAssets.filter(c => 
        c.name.toLowerCase().includes(filter.toLowerCase()) || 
        c.code.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(c => {
        const fiat = (c.balance * c.price).toFixed(2);
        const row = `
            <div class="asset-row">
                <div class="asset-main">
                    <div class="asset-logo">${c.logo}</div>
                    <div class="asset-details">
                        <span class="asset-name">${c.name}</span>
                        <span class="asset-code">${c.code}</span>
                    </div>
                </div>
                <div class="asset-vals">
                    <span class="asset-bal">${c.balance.toFixed(2)} ${c.code}</span>
                    <span class="asset-fiat">$${fiat}</span>
                </div>
            </div>
        `;
        assetsList.insertAdjacentHTML('beforeend', row);
    });
}

// Слушатель ввода для поиска
coinSearch.addEventListener('input', (e) => {
    renderCoins(e.target.value);
});

// Управление модальным окном P2P
const p2pModal = document.getElementById('p2p-modal');
const p2pTrigger = document.getElementById('p2p-trigger');
const closeModal = document.getElementById('close-modal');

p2pTrigger.addEventListener('click', () => {
    p2pModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    p2pModal.classList.remove('active');
});

p2pModal.addEventListener('click', (e) => {
    if(e.target === p2pModal) p2pModal.classList.remove('remove');
    // Закрытие при клике по фону
    if (e.target === p2pModal) {
        p2pModal.classList.remove('active');
    }
});

// Кнопка принудительной установки PWA на ПК
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

// Инициализация первой сборки интерфейса
renderCoins();
