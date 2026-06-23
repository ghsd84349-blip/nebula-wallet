// База данных активов (изначально всё по нулям)
const cryptoAssets = [
    { name: "Bitcoin", ticker: "BTC", icon: "₿", balance: 0.00, price: 65000 },
    { name: "Ethereum", ticker: "ETH", icon: "Ξ", balance: 0.00, price: 3500 },
    { name: "Tether", ticker: "USDT", icon: "₮", balance: 0.00, price: 1.00 },
    { name: "Solana", ticker: "SOL", icon: "S", balance: 0.00, price: 140 },
    { name: "Binance Coin", ticker: "BNB", icon: "B", balance: 0.00, price: 580 },
    { name: "Ripple", ticker: "XRP", icon: "✕", balance: 0.00, price: 0.60 }
];

const assetsContainer = document.getElementById('assets-container');
const searchInput = document.getElementById('crypto-search');

// Функция отрисовки списка монет
function renderAssets(filterText = "") {
    // Очищаем контейнер перед обновлением
    assetsContainer.innerHTML = '';

    // Фильтруем монеты по названию или тикеру
    const filteredAssets = cryptoAssets.filter(asset => 
        asset.name.toLowerCase().includes(filterText.toLowerCase()) || 
        asset.ticker.toLowerCase().includes(filterText.toLowerCase())
    );

    // Создаем карточки
    filteredAssets.forEach(asset => {
        const fiatValue = (asset.balance * asset.price).toFixed(2);
        
        const assetHTML = `
            <div class="asset-item">
                <div class="asset-info">
                    <div class="asset-icon">${asset.icon}</div>
                    <div>
                        <span class="asset-name">${asset.name}</span>
                        <span class="asset-ticker">${asset.ticker}</span>
                    </div>
                </div>
                <div class="asset-balance-info">
                    <span class="asset-amount">${asset.balance.toFixed(2)} ${asset.ticker}</span>
                    <span class="asset-fiat">$${fiatValue}</span>
                </div>
            </div>
        `;
        assetsContainer.insertAdjacentHTML('beforeend', assetHTML);
    });
}

// Слушатель для поля поиска
searchInput.addEventListener('input', (e) => {
    renderAssets(e.target.value);
});

// Логика работы модального окна P2P
const p2pModal = document.getElementById('p2p-modal');
const openP2pBtn = document.getElementById('open-p2p');
const closeP2pBtn = document.getElementById('close-p2p');

openP2pBtn.addEventListener('click', () => {
    p2pModal.classList.add('active');
});

closeP2pBtn.addEventListener('click', () => {
    p2pModal.classList.remove('active');
});

// Закрытие P2P окна при клике вне его области
p2pModal.addEventListener('click', (e) => {
    if (e.target === p2pModal) {
        p2pModal.classList.remove('active');
    }
});

// Установка приложения (PWA)
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

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

// Первоначальная отрисовка
renderAssets();
