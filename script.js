// ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
const tg = window.Telegram.WebApp;

// Автоматически раскрываем приложение на весь экран телефона
if (tg && typeof tg.expand === 'function') {
    tg.expand();
}

// БАЗА ДАННЫХ ИЗ 20 РЕАЛЬНЫХ МОНЕТ
const cryptoData = [
    // ТОП-10 (Отображаются по умолчанию)
    { name: 'Bitcoin', ticker: 'BTC', price: '$64,250.00', balance: '0.0045', icon: 'fa-brands fa-bitcoin', iconBg: '#F7931A', isTop: true },
    { name: 'Ethereum', ticker: 'ETH', price: '$3,480.20', balance: '0.1250', icon: 'fa-brands fa-ethereum', iconBg: '#627EEA', isTop: true },
    { name: 'Tether', ticker: 'USDT', price: '$1.00', balance: '450.00', icon: 'fa-solid fa-dollar-sign', iconBg: '#26A17B', isTop: true },
    { name: 'TON Coin', ticker: 'TON', price: '$7.35', balance: '35.80', icon: 'fa-solid fa-circle-nodes', iconBg: '#0088CC', isTop: true },
    { name: 'Solana', ticker: 'SOL', price: '$145.60', balance: '1.2000', icon: 'fa-solid fa-bolt', iconBg: '#14F195', isTop: true },
    { name: 'Binance Coin', ticker: 'BNB', price: '$580.40', balance: '0.0000', icon: 'fa-solid fa-cubes', iconBg: '#F3BA2F', isTop: true },
    { name: 'Ripple', ticker: 'XRP', price: '$0.49', balance: '120.00', icon: 'fa-solid fa-x', iconBg: '#23292F', isTop: true },
    { name: 'Dogecoin', ticker: 'DOGE', price: '$0.12', balance: '850.00', icon: 'fa-solid fa-paw', iconBg: '#C2A633', isTop: true },
    { name: 'Cardano', ticker: 'ADA', price: '$0.38', balance: '0.00', icon: 'fa-solid fa-star-of-david', iconBg: '#0033AD', isTop: true },
    { name: 'Avalanche', ticker: 'AVAX', price: '$26.15', balance: '0.00', icon: 'fa-solid fa-mountain', iconBg: '#E84142', isTop: true },
    
    // СКРЫТЫЕ 10 МОНЕТ (Доступны только через поиск)
    { name: 'Notcoin', ticker: 'NOT', price: '$0.014', balance: '15000.00', icon: 'fa-solid fa-circle-dot', iconBg: '#E4B400', isTop: false },
    { name: 'TRON', ticker: 'TRX', price: '$0.118', balance: '0.00', icon: 'fa-solid fa-t', iconBg: '#EF0027', isTop: false },
    { name: 'Polygon', ticker: 'POL', price: '$0.55', balance: '0.00', icon: 'fa-solid fa-draw-polygon', iconBg: '#8247E5', isTop: false },
    { name: 'Shiba Inu', ticker: 'SHIB', price: '$0.000017', balance: '0.00', icon: 'fa-solid fa-dog', iconBg: '#FFA400', isTop: false },
    { name: 'Litecoin', ticker: 'LTC', price: '$72.30', balance: '0.50', icon: 'fa-solid fa-coins', iconBg: '#345D9D', isTop: false },
    { name: 'Near Protocol', ticker: 'NEAR', price: '$4.85', balance: '3.10', icon: 'fa-solid fa-n', iconBg: '#000000', isTop: false },
    { name: 'Uniswap', ticker: 'UNI', price: '$9.20', balance: '0.00', icon: 'fa-solid fa-unicorn', iconBg: '#FF007A', isTop: false },
    { name: 'DOGS', ticker: 'DOGS', price: '$0.0009', balance: '24000.00', icon: 'fa-solid fa-bone', iconBg: '#FFFFFF', isTop: false },
    { name: 'Chainlink', ticker: 'LINK', price: '$13.60', balance: '0.00', icon: 'fa-solid fa-link', iconBg: '#375BD2', isTop: false },
    { name: 'Stellar', ticker: 'XLM', price: '$0.095', balance: '0.00', icon: 'fa-solid fa-shuttle-space', iconBg: '#14B6E7', isTop: false }
];

// ПЕРЕМЕННЫЕ ИНТЕРФЕЙСА
let userName = "Cosmonaut";

// НАСТРОЙКА ИМЕНИ ПОЛЬЗОВАТЕЛЯ ИЗ TELEGRAM
function initTelegramUser() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userName = tg.initDataUnsafe.user.first_name || "Cosmonaut";
    }
    
    // Вставляем имя в разметку на экранах
    document.getElementById('user-greeting').innerText = `Привет, ${userName}`;
    document.getElementById('settings-user-name').innerText = userName;
}

// ДИНАМИЧЕСКИЙ РЕНДЕР КАРТОЧЕК МОНЕТ
function renderCryptoList(searchFilter = '') {
    const container = document.getElementById('crypto-list-container');
    container.innerHTML = ''; // Очищаем контейнер
    
    const query = searchFilter.trim().toLowerCase();
    
    cryptoData.forEach(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(query) || coin.ticker.toLowerCase().includes(query);
        
        // Условие показа: если строка поиска пустая, выводим только ТОП-10. Если пишут — ищем по всем 20 монетам.
        if ((query === '' && coin.isTop) || (query !== '' && matchesSearch)) {
            const coinItem = document.createElement('div');
            coinItem.className = 'crypto-item';
            coinItem.innerHTML = `
                <div class="crypto-left">
                    <div class="crypto-icon" style="background-color: ${coin.iconBg}; color: ${coin.iconBg === '#FFFFFF' ? '#000' : '#fff'}">
                        <i class="${coin.icon}"></i>
                    </div>
                    <div>
                        <div class="crypto-name">${coin.name}</div>
                        <div class="crypto-ticker">${coin.ticker}</div>
                    </div>
                </div>
                <div class="crypto-right">
                    <div class="crypto-balance">${coin.balance} ${coin.ticker}</div>
                    <div class="crypto-rate">${coin.price}</div>
                </div>
            `;
            
            // Клик по монете открывает симуляцию деталей
            coinItem.addEventListener('click', () => {
                openModal(`Баланс ${coin.name}`, `
                    <div class="text-center" style="padding: 10px 0;">
                        <div class="crypto-icon" style="background-color: ${coin.iconBg}; color: ${coin.iconBg === '#FFFFFF' ? '#000' : '#fff'}; width: 50px; height: 50px; margin: 0 auto 12px auto; font-size: 24px;">
                            <i class="${coin.icon}"></i>
                        </div>
                        <h2 style="font-size: 28px; margin-bottom: 4px;">${coin.balance} ${coin.ticker}</h2>
                        <p style="color: var(--text-muted); font-size: 14px;">Равно примерно $${(parseFloat(coin.balance) * parseFloat(coin.price.replace(/[^0-9.]/g, '')) || 0).toFixed(2)}</p>
                        <input type="text" class="modal-body-input" readonly value="Адрес кошелька: nebula-${coin.ticker.toLowerCase()}-7x9F...3w">
                    </div>
                `);
            });
            
            container.appendChild(coinItem);
        }
    });
    
    // Если ничего не найдено
    if (container.children.length === 0) {
        container.innerHTML = `<p class="text-center" style="color: var(--text-muted); padding: 20px;">Монеты не найдены</p>`;
    }
}

// УПРАВЛЕНИЕ НАВИГАЦИЕЙ (ТАБАМИ)
function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const screens = document.querySelectorAll('.app-screen');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetScreenId = tab.getAttribute('data-screen');
            
            // Снимаем активный класс со всех табов и вешаем на текущий
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Скрываем все экраны и открываем нужный
            screens.forEach(screen => {
                screen.classList.add('hidden');
                if (screen.id === targetScreenId) {
                    screen.classList.remove('hidden');
                }
            });
        });
    });
}

// ЛОГИКА ЖИВОГО ПОИСКА
function initSearch() {
    const searchInput = document.getElementById('crypto-search');
    searchInput.addEventListener('input', (e) => {
        renderCryptoList(e.target.value);
    });
}

// ЛОГИКА СИМУЛЯЦИИ ВЫПУСКА КАРТЫ
function initCardSystem() {
    const issueBtn = document.getElementById('btn-issue-card');
    const orderBlock = document.getElementById('card-order-block');
    const cardWrapper = document.getElementById('digital-card-wrapper');
    
    issueBtn.addEventListener('click', () => {
        // Эффект анимации генерации
        issueBtn.innerText = "Генерация реквизитов...";
        issueBtn.disabled = true;
        issueBtn.style.opacity = "0.6";
        
        setTimeout(() => {
            // Генерируем случайные данные для карты
            const randomCardNumber = `4432 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
            const randomCVV = Math.floor(100 + Math.random() * 900);
            
            // Наполняем макет карты данными
            document.getElementById('display-card-number').innerText = randomCardNumber;
            document.getElementById('display-card-holder').innerText = userName.toUpperCase();
            document.getElementById('display-card-expiry').innerText = "08/30";
            document.getElementById('display-card-cvv').innerText = randomCVV;
            
            // Плавное переключение блоков интерфейса
            orderBlock.classList.add('hidden');
            cardWrapper.classList.remove('hidden');
            cardWrapper.style.animation = "fadeIn 0.5s ease-in-out";
        }, 1200);
    });
}

// УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ
const modal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openModal(title, htmlContent) {
    modalTitle.innerText = title;
    modalBody.innerHTML = htmlContent;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

function initModals() {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Обработчики кликов на основные панели быстрых действий
    document.getElementById('btn-receive').addEventListener('click', () => {
        openModal('Получить криптовалюту', `
            <p style="margin-bottom: 12px;">Выберите актив для пополнения счета Nebula Wallet:</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="primary-btn" style="background: rgba(255,255,255,0.03); color: white; text-align: left; border: 1px solid var(--border-color);" onclick="alert('Адрес скопирован!')"><i class="fa-solid fa-circle-nodes" style="color: #0088CC; margin-right: 8px;"></i> Пополнить TON</button>
                <button class="primary-btn" style="background: rgba(255,255,255,0.03); color: white; text-align: left; border: 1px solid var(--border-color);" onclick="alert('Адрес скопирован!')"><i class="fa-solid fa-dollar-sign" style="color: #26A17B; margin-right: 8px;"></i> Пополнить USDT (TRC-20)</button>
            </div>
        `);
    });
    
    document.getElementById('btn-send').addEventListener('click', () => {
        openModal('Отправить перевод', `
            <p>Введите адрес получателя или его @username в Telegram:</p>
            <input type="text" class="modal-body-input" placeholder="@username или адрес кошелька...">
            <p style="margin-top: 10px;">Сумма перевода:</p>
            <input type="number" class="modal-body-input" placeholder="0.00 $">
            <button class="primary-btn" style="margin-top: 14px;" onclick="alert('Симуляция транзакции: перевод отправлен!')">Отправить через Nebula</button>
        `);
    });
    
    document.getElementById('btn-exchange').addEventListener('click', () => {
        openModal('Быстрый обмен', `
            <p>Отдаете:</p>
            <input type="text" class="modal-body-input" value="10 TON" style="text-align: left;">
            <p style="margin-top: 10px;">Получаете:</p>
            <input type="text" class="modal-body-input" value="73.50 USDT" style="text-align: left;" readonly>
            <button class="primary-btn" style="margin-top: 14px;" onclick="alert('Обмен успешно совершен!')">Обменять мгновенно</button>
        `);
    });
    
    document.getElementById('btn-market').addEventListener('click', () => {
        openModal('Nebula P2P Маркет', `
            <div style="text-align: center; padding: 10px 0;">
                <i class="fa-solid fa-shop neon-text" style="font-size: 36px; margin-bottom: 12px;"></i>
                <p>P2P-биржевая платформа находится на техническом обслуживании.</p>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Запуск полноценного торгового стакана ожидается в версии v1.1.0.</p>
            </div>
        `);
    });
}

// ЗАПУСК ПРИЛОЖЕНИЯ ПОСЛЕ ЗАГРУЗКИ ДОМА
document.addEventListener('DOMContentLoaded', () => {
    initTelegramUser();
    renderCryptoList();
    initNavigation();
    initSearch();
    initCardSystem();
    initModals();
});
