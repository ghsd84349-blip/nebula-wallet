// ============================================================================
// СЕКЦИЯ 1: ЖЕСТКОЕ СТИРАНИЕ УСТАРЕВШЕГО КЭША И СЕРВИС-ВОРКЕРОВ ШАБЛОНА
// ============================================================================
(function clearOldCacheIntegrity() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (let registration of registrations) {
                registration.unregister().then(function() {
                    console.log("System Node: Устаревший сервис-воркер удален.");
                });
            }
        });
    }
    if ('caches' in window) {
        caches.keys().then(function(keys) {
            keys.forEach(function(key) {
                caches.delete(key);
            });
        });
        console.log("System Node: Глобальный кэш очищен.");
    }
})();

// ============================================================================
// СЕКЦИЯ 2: ИСХОДНЫЕ ДАННЫЕ И СОСТОЯНИЕ (STATE) ПРИЛОЖЕНИЯ
// ============================================================================
const appState = {
    currentCurrency: 'USD',
    p2pMode: 'buy',
    activeTab: 'assets'
};

// Реестр токенов (Начальные балансы строго 0.00)
const cryptoRegistry = [
    { name: "Bitcoin", ticker: "BTC", glyph: "₿", balance: 0.00, priceUSD: 64120.50, priceRUB: 5642500 },
    { name: "Ethereum", ticker: "ETH", glyph: "Ξ", balance: 0.00, priceUSD: 3450.25, priceRUB: 303600 },
    { name: "Tether", ticker: "USDT", glyph: "₮", balance: 0.00, priceUSD: 1.00, priceRUB: 88.20 },
    { name: "Solana", ticker: "SOL", glyph: "S", balance: 0.00, priceUSD: 136.80, priceRUB: 12040 },
    { name: "Binance Coin", ticker: "BNB", glyph: "B", balance: 0.00, priceUSD: 572.10, priceRUB: 50340 },
    { name: "Ripple", ticker: "XRP", glyph: "✕", balance: 0.00, priceUSD: 0.56, priceRUB: 49.30 },
    { name: "Cardano", ticker: "ADA", glyph: "A", balance: 0.00, priceUSD: 0.38, priceRUB: 33.40 },
    { name: "Chainlink", ticker: "LINK", glyph: "L", balance: 0.00, priceUSD: 14.15, priceRUB: 1245 }
];

// Книга заявок P2P рынка
const p2pMarketBook = {
    buy: [
        { merchant: "CryptoViking", rate: "88.45 RUB", limits: "5,000 - 90,000 RUB", orders: "98% (120 сделок)" },
        { merchant: "Saturn_Finance", rate: "88.60 RUB", limits: "15,000 - 450,000 RUB", orders: "99% (2405 сделок)" },
        { merchant: "Matrix_OTC", rate: "88.75 RUB", limits: "2,000 - 35,000 RUB", orders: "94% (89 сделок)" },
        { merchant: "Urals_Node", rate: "89.10 RUB", limits: "10,000 - 150,000 RUB", orders: "100% (410 сделок)" }
    ],
    sell: [
        { merchant: "GoldRub_Liquidity", rate: "87.90 RUB", limits: "4,000 - 120,000 RUB", orders: "97% (1800 сделок)" },
        { merchant: "Quantum_P2P", rate: "87.75 RUB", limits: "20,000 - 600,000 RUB", orders: "99% (830 сделок)" },
        { merchant: "Siberian_Express", rate: "87.40 RUB", limits: "500 - 15,000 RUB", orders: "92% (54 сделки)" },
        { merchant: "SberCrypto_OTC", rate: "87.25 RUB", limits: "50,000 - 1,000,000 RUB", orders: "100% (1150 сделок)" }
    ]
};

// Логи транзакций по умолчанию
let transactionHistory = [
    { type: "receive", title: "Входящий перевод USDT", date: "22.06.2026 14:32", amount: "+250.00 USDT", status: "Выполнено", active: false },
    { type: "swap", title: "Обмен ETH на USDT", date: "19.06.2026 09:15", amount: "-0.05 ETH", status: "Выполнено", active: false }
];

// ============================================================================
// СЕКЦИЯ 3: ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ КЛИКОВ НАВИГАЦИИ (SPA ROUTING)
// ============================================================================
document.addEventListener("DOMContentLoaded", function() {
    initNavigationDock();
    initSearchEngine();
    initP2PInterface();
    initUtilityTriggers();
    renderAllModules();
});

function initNavigationDock() {
    const tabs = {
        'dock-btn-assets': 'tab-page-assets',
        'dock-btn-p2p': 'tab-page-p2p',
        'dock-btn-history': 'tab-page-history',
        'dock-btn-settings': 'tab-page-settings'
    };

    Object.keys(tabs).forEach(btnId => {
        document.getElementById(btnId).addEventListener('click', function() {
            // Сброс активных классов на кнопках дока
            document.querySelectorAll('.nebula-dock-tab').forEach(b => b.classList.remove('active'));
            // Сброс активных вкладок контента
            document.querySelectorAll('.nebula-tab-page').forEach(p => p.classList.remove('active'));

            // Активация целевых элементов
            this.classList.add('active');
            document.getElementById(tabs[btnId]).classList.add('active');
            
            // Фиксация стейта
            appState.activeTab = tabs[btnId].replace('tab-page-', '');
        });
    });

    // Связка кнопки P2P на главном экране со вкладкой меню
    document.getElementById('action-p2p-tab-trigger').addEventListener('click', function() {
        document.getElementById('dock-btn-p2p').click();
    });
}

// ============================================================================
// СЕКЦИЯ 4: РЕНДЕРИНГ И ЛОГИКА ВКЛАДКИ АКТИВОВ И КРИПТОПОИСКА
// ============================================================================
function renderAssetLedger(filterText = "") {
    const mountNode = document.getElementById('ledger-mount-point');
    const counterBadge = document.getElementById('ledger-items-counter');
    mountNode.innerHTML = "";

    const query = filterText.trim().toLowerCase();
    const filteredCoins = cryptoRegistry.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.ticker.toLowerCase().includes(query)
    );

    counterBadge.textContent = `${filteredCoins.length} монет${filteredCoins.length === 1 ? 'а' : filteredCoins.length > 1 && filteredCoins.length < 5 ? 'ы' : ''}`;

    if (filteredCoins.length === 0) {
        mountNode.innerHTML = `
            <div style="text-align:center; padding:40px 10px; color:#767693; font-size:13px; border:1px dashed var(--border-grid); border-radius:20px;">
                Криптовалюта "${filterText}" не обнаружена в реестре ядра.
            </div>
        `;
        return;
    }

    filteredCoins.forEach(coin => {
        const activePrice = appState.currentCurrency === 'USD' ? coin.priceUSD : coin.priceRUB;
        const symbol = appState.currentCurrency === 'USD' ? '$' : '₽';
        const fiatValue = (coin.balance * activePrice).toFixed(2);

        const rowHTML = `
            <div class="nebula-ledger-row" data-ticker="${coin.ticker}">
                <div class="nebula-row-left-meta">
                    <div class="nebula-glyph-avatar">${coin.glyph}</div>
                    <div class="nebula-ticker-details">
                        <span class="nebula-coin-fullname">${coin.name}</span>
                        <span class="nebula-coin-ticker-code">${coin.ticker}</span>
                    </div>
                </div>
                <div class="nebula-row-right-values">
                    <span class="nebula-crypto-holdings">${coin.balance.toFixed(2)} ${coin.ticker}</span>
                    <span class="nebula-fiat-valuation">${symbol}${fiatValue}</span>
                </div>
            </div>
        `;
        mountNode.insertAdjacentHTML('beforeend', rowHTML);
    });

    // Навешивание обработчиков клика по строкам монет
    mountNode.querySelectorAll('.nebula-ledger-row').forEach(row => {
        row.addEventListener('click', function() {
            const ticker = this.getAttribute('data-ticker');
            const targetCoin = cryptoRegistry.find(c => c.ticker === ticker);
            openSystemModal(
                `Управление нодой ${targetCoin.name}`,
                `
                <div style="display:flex; flex-direction:column; gap:14px; padding-top:10px;">
                    <p style="font-size:13px; color:var(--text-slate);">Доступный баланс на вашем адресе равен нулю. Для совершения внешних транзакций пополните кошелек.</p>
                    <div style="background:var(--space-void); padding:12px; border-radius:12px; border:1px solid var(--border-grid);">
                        <span style="font-size:11px; color:var(--text-slate); display:block; margin-bottom:4px;">Адрес депозита ${targetCoin.ticker}</span>
                        <code style="font-size:12px; color:var(--neon-cyan); word-break:break-all;">0x71C84349b1ipNebulaCoreNodeDepositAddress</code>
                    </div>
                    <button class="nebula-deal-action-execute-btn" style="width:100%; padding:14px;" onclick="closeSystemModal()">Закрыть окно</button>
                </div>
                `
            );
        });
    });
}

function initSearchEngine() {
    const searchInput = document.getElementById('nebula-crypto-live-search');
    const clearBtn = document.getElementById('nebula-search-clear-trigger');

    searchInput.addEventListener('input', function(e) {
        const val = e.target.value;
        clearBtn.style.display = val.length > 0 ? 'block' : 'none';
        renderAssetLedger(val);
    });

    clearBtn.addEventListener('click', function() {
        searchInput.value = "";
        clearBtn.style.display = 'none';
        renderAssetLedger();
    });
}

// ============================================================================
// СЕКЦИЯ 5: РЕНДЕРИНГ И ЛОГИКА P2P МАРКЕТПЛЕЙСА
// ============================================================================
function renderP2POrderBook() {
    const p2pMount = document.getElementById('p2p-orderbook-mount-point');
    p2pMount.innerHTML = "";

    const activeOrders = p2pMarketBook[appState.p2pMode];

    activeOrders.forEach(order => {
        const rateColorClass = appState.p2pMode === 'sell' ? 'sell-color' : '';
        const btnStyleClass = appState.p2pMode === 'sell' ? 'sell-btn-style' : '';
        const btnText = appState.p2pMode === 'buy' ? 'Купить USDT' : 'Продать USDT';

        const cardHTML = `
            <div class="nebula-p2p-deal-sheet">
                <div class="nebula-deal-info-block">
                    <div class="nebula-merchant-name">
                        👤 ${order.merchant}
                        <span class="nebula-merchant-stat">${order.orders}</span>
                    </div>
                    <div class="nebula-deal-limits-label">Лимиты: ${order.limits}</div>
                    <div class="nebula-deal-exchange-rate ${rateColorClass}">${order.rate}</div>
                </div>
                <button class="nebula-deal-action-execute-btn ${btnStyleClass}" data-merchant="${order.merchant}" data-rate="${order.rate}">
                    ${btnText}
                </button>
            </div>
        `;
        p2pMount.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Навешивание логики ордеров
    p2pMount.querySelectorAll('.nebula-deal-action-execute-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const merchant = this.getAttribute('data-merchant');
            const rate = this.getAttribute('data-rate');
            openSystemModal(
                `Инициализация P2P сделки`,
                `
                <div style="display:flex; flex-direction:column; gap:14px; padding-top:6px;">
                    <div style="background:var(--nebula-deep); padding:14px; border-radius:16px; border:1px solid var(--border-grid);">
                        <p style="font-size:13px; margin-bottom:4px;">Контрагент: <strong>${merchant}</strong></p>
                        <p style="font-size:13px;">Фиксированный курс: <strong style="color:var(--neon-cyan);">${rate}</strong></p>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:12px; color:var(--text-slate);">Укажите сумму сделки:</label>
                        <input type="number" placeholder="Минимум 1000" style="background:var(--space-void); border:1px solid var(--border-grid); padding:12px; border-radius:12px; color:white; font-size:14px;">
                    </div>
                    <button class="nebula-deal-action-execute-btn" style="width:100%; padding:14px; margin-top:6px;" onclick="simulateTransactionCreation('${merchant}', '${rate}')">Открыть ордер</button>
                </div>
                `
            );
        });
    });
}

function initP2PInterface() {
    const buyBtn = document.getElementById('p2p-mode-buy-btn');
    const sellBtn = document.getElementById('p2p-mode-sell-btn');

    buyBtn.addEventListener('click', function() {
        sellBtn.classList.remove('active-sell');
        this.classList.add('active');
        appState.p2pMode = 'buy';
        renderP2POrderBook();
    });

    sellBtn.addEventListener('click', function() {
        buyBtn.classList.remove('active');
        this.classList.add('active-sell');
        appState.p2pMode = 'sell';
        renderP2POrderBook();
    });
}

function simulateTransactionCreation(merchant, rate) {
    closeSystemModal();
    
    // Добавление кастомной транзакции в массив истории
    const now = new Date();
    const timeStr = `${now.getDate()}.${now.getMonth()+1}.${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;
    
    transactionHistory.unshift({
        type: appState.p2pMode === 'buy' ? 'receive' : 'minus',
        title: `P2P Сделка с ${merchant}`,
        date: timeStr,
        amount: appState.p2pMode === 'buy' ? "+10.00 USDT" : "-10.00 USDT",
        status: "В процессе",
        active: true
    });

    renderHistoryLog();
    // Перекидываем пользователя на вкладку истории, чтобы он увидел ордер
    document.getElementById('dock-btn-history').click();
}

// ============================================================================
// СЕКЦИЯ 6: РЕНДЕРИНГ ИСТОРИИ И ВСПОМОГАТЕЛЬНЫЕ МОДУЛИ
// ============================================================================
function renderHistoryLog() {
    const histMount = document.getElementById('history-log-mount-point');
    histMount.innerHTML = "";

    if (transactionHistory.length === 0) {
        histMount.innerHTML = `
            <div style="text-align:center; padding:40px 10px; color:#767693; font-size:13px; border:1px dashed var(--border-grid); border-radius:20px;">
                Журнал операций пуст.
            </div>
        `;
        return;
    }

    transactionHistory.forEach(item => {
        const signClass = item.type === 'receive' ? 'plus' : 'minus';
        const icon = item.type === 'receive' ? '📥' : item.type === 'swap' ? '💱' : '📤';
        const statusStyle = item.active ? 'style="color:var(--neon-amber);"' : '';

        const itemHTML = `
            <div class="nebula-history-item-row">
                <div class="nebula-row-left-meta">
                    <div class="nebula-history-type-badge">${icon}</div>
                    <div class="nebula-history-meta-block">
                        <span class="nebula-history-operation-title">${item.title}</span>
                        <span class="nebula-history-timestamp">${item.date}</span>
                    </div>
                </div>
                <div class="nebula-history-amounts">
                    <span class="nebula-history-crypto-val ${signClass}">${item.amount}</span>
                    <span class="nebula-history-status-txt" ${statusStyle}>${item.status}</span>
                </div>
            </div>
        `;
        histMount.insertAdjacentHTML('beforeend', itemHTML);
    });
}

function initUtilityTriggers() {
    // Очистка логов истории
    document.getElementById('clear-history-log-btn').addEventListener('click', function() {
        transactionHistory = [];
        renderHistoryLog();
    });

    // Мультивалютный переключатель (USD / RUB) на главном экране
    const currencyTabs = document.querySelectorAll('.nebula-currency-tab');
    currencyTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            currencyTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            appState.currentCurrency = this.textContent.trim();
            
            // Перерендер главного баланса и списка монет под новую валюту
            const balanceDisplay = document.getElementById('main-portfolio-fiat-balance');
            balanceDisplay.textContent = appState.currentCurrency === 'USD' ? '$0.00' : '0.00₽';
            renderAssetLedger();
        });
    });

    // Копирование адреса кошелька в буфер
    document.getElementById('copy-address-trigger').addEventListener('click', function() {
        const rawAddress = "0x71C84349b1ipNebulaCoreSpaceWalletAddress";
        navigator.clipboard.writeText(rawAddress).then(() => {
            const originalText = this.textContent;
            this.textContent = "✅";
            setTimeout(() => this.textContent = originalText, 1500);
        });
    });

    // Триггеры остальных кнопок быстрого меню
    document.getElementById('action-send-trigger').addEventListener('click', () => {
        alert("Ошибка сети: На вашем балансе недостаточно средств для оплаты лимитного газа (Gas Fee).");
    });
    document.getElementById('action-receive-trigger').addEventListener('click', () => {
        document.getElementById('copy-address-trigger').click();
        alert("Ваш публичный криптографический адрес скопирован в буфер обмена.");
    });
    document.getElementById('action-swap-trigger').addEventListener('click', () => {
        alert("Модуль мгновенных свопов NebulaSwap заблокирован до синхронизации локальной ноды.");
    });
}

// ============================================================================
// СЕКЦИЯ 7: УПРАВЛЕНИЕ ОВЕРЛЕЕМ ГЛОБАЛЬНЫХ МОДАЛЬНЫХ ОКОН
// ============================================================================
const globalModal = document.getElementById('global-system-modal');

function openSystemModal(title, htmlContent) {
    document.getElementById('modal-title-field').textContent = title;
    document.getElementById('modal-content-field').innerHTML = htmlContent;
    globalModal.classList.add('active');
}

function closeSystemModal() {
    globalModal.classList.remove('active');
}

document.getElementById('global-modal-close-btn').addEventListener('click', closeSystemModal);
globalModal.addEventListener('click', function(e) {
    if (e.target === globalModal) closeSystemModal();
});

// ============================================================================
// СЕКЦИЯ 8: ИНТЕГРАЦИЯ УСТАНОВЩИКА ПРИЛОЖЕНИЯ (PWA HARDWARE)
// ============================================================================
let hardwarePrompt;
const hardwareBtn = document.getElementById('pwa-install-hardware-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    hardwarePrompt = e;
    hardwareBtn.style.display = 'inline-block';
});

hardwareBtn.addEventListener('click', () => {
    if (hardwarePrompt) {
        hardwarePrompt.prompt();
        hardwarePrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Пользователь установил Nebula Space Wallet на десктоп.');
            }
            hardwarePrompt = null;
            hardwareBtn.style.display = 'none';
        });
    }
});

// Глобальный рендеринг всех блоков при запуске ноды
function renderAllModules() {
    renderAssetLedger();
    renderP2POrderBook();
    renderHistoryLog();
}
