/* ============================================================
   NEBULA — script.js
   Логика SPA, поиск по 20 монетам, модальные окна,
   выпуск виртуальной карты, интеграция с Telegram WebApp
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. БАЗА МОНЕТ (ровно 20 реальных монет)
     ============================================================ */

  const COIN_DEFS = [
    // ---------- Первые 10 — всегда видимые ----------
    { id: 1,  name: 'Bitcoin',       ticker: 'BTC',  primary: true,  color: '#F7931A', letter: 'B', price: 67230.50,    change: 1.8,  balance: 0.0142 },
    { id: 2,  name: 'Ethereum',      ticker: 'ETH',  primary: true,  color: '#8C8FF5', letter: 'E', price: 3540.10,     change: 2.4,  balance: 0.31 },
    { id: 3,  name: 'Tether',        ticker: 'USDT', primary: true,  color: '#26A17B', letter: 'T', price: 1.00,        change: 0.0,  balance: 420.00 },
    { id: 4,  name: 'TON Coin',      ticker: 'TON',  primary: true,  color: '#0098EA', letter: 'T', price: 5.62,        change: 3.1,  balance: 58.4 },
    { id: 5,  name: 'Solana',        ticker: 'SOL',  primary: true,  color: '#9945FF', letter: 'S', price: 158.40,      change: -1.2, balance: 2.75 },
    { id: 6,  name: 'Binance Coin',  ticker: 'BNB',  primary: true,  color: '#F0B90B', letter: 'B', price: 588.20,      change: 0.6,  balance: 0.42 },
    { id: 7,  name: 'Ripple',        ticker: 'XRP',  primary: true,  color: '#23A1DE', letter: 'X', price: 0.52,        change: -0.8, balance: 310.0 },
    { id: 8,  name: 'Dogecoin',      ticker: 'DOGE', primary: true,  color: '#C2A633', letter: 'D', price: 0.142,       change: 4.5,  balance: 1520.0 },
    { id: 9,  name: 'Cardano',       ticker: 'ADA',  primary: true,  color: '#0033AD', letter: 'A', price: 0.45,        change: -0.3, balance: 640.0 },
    { id: 10, name: 'Avalanche',     ticker: 'AVAX', primary: true,  color: '#E84142', letter: 'A', price: 35.80,       change: 1.1,  balance: 4.2 },

    // ---------- Вторые 10 — только через поиск ----------
    { id: 11, name: 'Notcoin',       ticker: 'NOT',  primary: false, color: '#1A1D22', letter: 'N', price: 0.0021,      change: -2.1, balance: 0 },
    { id: 12, name: 'TRON',          ticker: 'TRX',  primary: false, color: '#EF0027', letter: 'T', price: 0.118,       change: 0.9,  balance: 0 },
    { id: 13, name: 'Polygon',       ticker: 'POL',  primary: false, color: '#8247E5', letter: 'P', price: 0.38,        change: 2.0,  balance: 0 },
    { id: 14, name: 'Shiba Inu',     ticker: 'SHIB', primary: false, color: '#FFA409', letter: 'S', price: 0.0000182,   change: -1.6, balance: 0 },
    { id: 15, name: 'Litecoin',      ticker: 'LTC',  primary: false, color: '#345D9D', letter: 'L', price: 84.10,       change: 0.4,  balance: 0 },
    { id: 16, name: 'Near Protocol', ticker: 'NEAR', primary: false, color: '#00EC97', letter: 'N', price: 4.92,        change: 3.4,  balance: 0 },
    { id: 17, name: 'Uniswap',       ticker: 'UNI',  primary: false, color: '#FF007A', letter: 'U', price: 7.15,        change: -0.5, balance: 0 },
    { id: 18, name: 'DOGS',          ticker: 'DOGS', primary: false, color: '#F2A900', letter: 'D', price: 0.0008,      change: 5.2,  balance: 0 },
    { id: 19, name: 'Chainlink',     ticker: 'LINK', primary: false, color: '#2A5ADA', letter: 'L', price: 14.62,       change: 1.3,  balance: 0 },
    { id: 20, name: 'Stellar',       ticker: 'XLM',  primary: false, color: '#08B5E5', letter: 'X', price: 0.112,       change: -0.2, balance: 0 }
  ];

  /* ============================================================
     2. STATE
     ============================================================ */

  const state = {
    currentScreen: 'wallet',
    searchQuery: '',
    cardIssued: false,
    cardFrozen: false,
    cardDetailsVisible: false,
    cardNumber: '',
    telegramUser: {
      firstName: 'Cosmonaut',
      id: null
    }
  };

  /* ============================================================
     3. TELEGRAM WEB APP INTEGRATION
     ============================================================ */

  function initTelegram() {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.ready();

        try {
          tg.setHeaderColor && tg.setHeaderColor('#0A0B0D');
          tg.setBackgroundColor && tg.setBackgroundColor('#0A0B0D');
        } catch (e) { /* старые версии клиента могут не поддерживать */ }

        const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
        if (user && user.first_name) {
          state.telegramUser.firstName = user.first_name;
          state.telegramUser.id = user.id || null;
        } else {
          state.telegramUser.firstName = 'Cosmonaut';
          state.telegramUser.id = null;
        }
      } else {
        state.telegramUser.firstName = 'Cosmonaut';
        state.telegramUser.id = null;
      }
    } catch (err) {
      console.warn('Telegram WebApp недоступен, используется браузерный режим.', err);
      state.telegramUser.firstName = 'Cosmonaut';
      state.telegramUser.id = null;
    }

    renderUserInfo();
  }

  function renderUserInfo() {
    const greetingEl = document.getElementById('user-greeting');
    const settingsNameEl = document.getElementById('settings-username');
    const settingsIdEl = document.getElementById('settings-userid');

    if (greetingEl) greetingEl.textContent = 'Привет, ' + state.telegramUser.firstName;
    if (settingsNameEl) settingsNameEl.textContent = state.telegramUser.firstName;
    if (settingsIdEl) {
      settingsIdEl.textContent = state.telegramUser.id
        ? 'ID: ' + state.telegramUser.id
        : 'ID: —';
    }
  }

  /* ============================================================
     4. НАВИГАЦИЯ МЕЖДУ ЭКРАНАМИ
     ============================================================ */

  function switchScreen(screenName) {
    state.currentScreen = screenName;

    document.querySelectorAll('.screen').forEach(function (el) {
      el.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(function (el) {
      el.classList.remove('active');
    });

    const targetScreen = document.getElementById('screen-' + screenName);
    const targetNav = document.querySelector('.nav-item[data-screen="' + screenName + '"]');

    if (targetScreen) targetScreen.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    hapticImpact('light');
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const screen = btn.getAttribute('data-screen');
        switchScreen(screen);
      });
    });
  }

  /* ============================================================
     5. ПОИСК И РЕНДЕР СПИСКА МОНЕТ
     ============================================================ */

  function formatPrice(price) {
    if (price >= 1) {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    // для очень маленьких цен (SHIB, DOGS и т.д.) показываем больше знаков
    return '$' + price.toFixed(price < 0.001 ? 7 : 4);
  }

  function formatBalanceUSD(coin) {
    const usd = coin.balance * coin.price;
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getFilteredCoins(query) {
    const q = query.trim().toLowerCase();

    if (q === '') {
      // Пустой инпут — только первые 10 (primary)
      return COIN_DEFS.filter(function (c) { return c.primary; });
    }

    // Непустой инпут — ищем по ВСЕМ 20 монетам, без учета регистра,
    // совпадение по названию ИЛИ по тикеру
    return COIN_DEFS.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 ||
             c.ticker.toLowerCase().indexOf(q) !== -1;
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildCoinCard(coin, index, isSearchMode) {
    const card = document.createElement('div');
    card.className = 'coin-card';
    card.style.animationDelay = (index * 0.04) + 's';

    const wasHidden = !coin.primary && isSearchMode;

    const changeClass = coin.change > 0 ? 'positive' : (coin.change < 0 ? 'negative' : 'positive');
    const changeSign = coin.change > 0 ? '+' : '';
    const changeArrow = coin.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

    card.innerHTML =
      '<div class="coin-icon" style="background:' + coin.color + '">' + coin.letter + '</div>' +
      '<div class="coin-info">' +
        '<span class="coin-name">' + escapeHTML(coin.name) +
          (wasHidden ? '<span class="coin-badge-new">НАЙДЕНО</span>' : '') +
        '</span>' +
        '<span class="coin-ticker">' + escapeHTML(coin.ticker) + ' · ' + formatPrice(coin.price) + '</span>' +
      '</div>' +
      '<div class="coin-amounts">' +
        '<span class="coin-balance">' + (coin.balance > 0 ? formatBalanceUSD(coin) : '$0.00') + '</span>' +
        '<span class="coin-price-change ' + changeClass + '">' +
          '<i class="fa-solid ' + changeArrow + '"></i> ' + changeSign + Math.abs(coin.change).toFixed(1) + '%' +
        '</span>' +
      '</div>';

    card.addEventListener('click', function () {
      hapticImpact('light');
      showToast(coin.name + ' (' + coin.ticker + ') — баланс ' + (coin.balance > 0 ? coin.balance : 0) + ' ' + coin.ticker);
    });

    return card;
  }

  function renderCoinList() {
    const listEl = document.getElementById('coin-list');
    const emptyEl = document.getElementById('empty-state');
    const titleEl = document.getElementById('list-title');
    const countEl = document.getElementById('list-count');

    if (!listEl) return;

    const query = state.searchQuery;
    const isSearchMode = query.trim() !== '';
    const filtered = getFilteredCoins(query);

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyEl.classList.remove('hidden');
      listEl.classList.add('hidden');
    } else {
      emptyEl.classList.add('hidden');
      listEl.classList.remove('hidden');

      filtered.forEach(function (coin, idx) {
        listEl.appendChild(buildCoinCard(coin, idx, isSearchMode));
      });
    }

    if (isSearchMode) {
      titleEl.textContent = 'Результаты поиска';
      countEl.textContent = filtered.length + ' из 20';
    } else {
      titleEl.textContent = 'Мои активы';
      countEl.textContent = filtered.length + ' из 10';
    }
  }

  function bindSearch() {
    const input = document.getElementById('crypto-search');
    const clearBtn = document.getElementById('search-clear');

    if (!input) return;

    input.addEventListener('input', function () {
      state.searchQuery = input.value;
      clearBtn.classList.toggle('hidden', input.value.length === 0);
      renderCoinList();
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      state.searchQuery = '';
      clearBtn.classList.add('hidden');
      renderCoinList();
      input.focus();
      hapticImpact('light');
    });
  }

  /* ============================================================
     6. МАРКЕТ (модальное окно со всеми 20 монетами)
     ============================================================ */

  function renderMarketList() {
    const marketEl = document.getElementById('market-list');
    if (!marketEl) return;

    marketEl.innerHTML = '';

    COIN_DEFS.forEach(function (coin, idx) {
      const row = document.createElement('div');
      row.className = 'coin-card';
      row.style.animationDelay = (idx * 0.02) + 's';

      const changeClass = coin.change > 0 ? 'positive' : (coin.change < 0 ? 'negative' : 'positive');
      const changeSign = coin.change > 0 ? '+' : '';
      const changeArrow = coin.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

      row.innerHTML =
        '<div class="coin-icon" style="background:' + coin.color + '">' + coin.letter + '</div>' +
        '<div class="coin-info">' +
          '<span class="coin-name">' + escapeHTML(coin.name) + '</span>' +
          '<span class="coin-ticker">' + escapeHTML(coin.ticker) + '</span>' +
        '</div>' +
        '<div class="coin-amounts">' +
          '<span class="coin-balance">' + formatPrice(coin.price) + '</span>' +
          '<span class="coin-price-change ' + changeClass + '">' +
            '<i class="fa-solid ' + changeArrow + '"></i> ' + changeSign + Math.abs(coin.change).toFixed(1) + '%' +
          '</span>' +
        '</div>';

      marketEl.appendChild(row);
    });
  }

  /* ============================================================
     7. МОДАЛЬНЫЕ ОКНА
     ============================================================ */

  function openModal(name) {
    const overlay = document.getElementById('modal-overlay');
    const box = document.getElementById('modal-' + name);

    if (!overlay || !box) return;

    document.querySelectorAll('.modal-box').forEach(function (b) {
      b.classList.remove('is-active');
    });

    box.classList.add('is-active');
    overlay.classList.remove('hidden');

    if (name === 'market') {
      renderMarketList();
    }
    if (name === 'exchange') {
      populateExchangeSelects();
    }

    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });

    hapticImpact('medium');
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.classList.remove('is-visible');

    setTimeout(function () {
      overlay.classList.add('hidden');
      document.querySelectorAll('.modal-box').forEach(function (b) {
        b.classList.remove('is-active');
      });
    }, 300);
  }

  function bindModals() {
    document.querySelectorAll('.action-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const modalName = btn.getAttribute('data-modal');
        openModal(modalName);
      });
    });

    document.querySelectorAll('.modal-close').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    // Получить — копирование адреса
    const copyBtn = document.getElementById('copy-address-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const addressEl = document.getElementById('receive-address');
        const text = addressEl ? addressEl.textContent : '';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }

        showToast('Адрес скопирован в буфер обмена');
        hapticImpact('light');
      });
    }

    // Отправить — подтверждение
    const sendBtn = document.getElementById('send-confirm-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        const addressInput = document.getElementById('send-address');
        const amountInput = document.getElementById('send-amount');

        const address = addressInput.value.trim();
        const amount = amountInput.value.trim();

        if (!address || !amount) {
          showToast('Заполните адрес и сумму');
          hapticImpact('heavy');
          return;
        }

        showToast('Отправлено: ' + amount + ' на адрес ' + address.slice(0, 10) + '...');
        addressInput.value = '';
        amountInput.value = '';
        hapticImpact('medium');
        closeModal();
      });
    }

    // Обменять — подтверждение
    const exchangeBtn = document.getElementById('exchange-confirm-btn');
    if (exchangeBtn) {
      exchangeBtn.addEventListener('click', function () {
        const fromSel = document.getElementById('exchange-from');
        const toSel = document.getElementById('exchange-to');

        if (fromSel.value === toSel.value) {
          showToast('Выберите разные монеты для обмена');
          hapticImpact('heavy');
          return;
        }

        showToast('Обмен ' + fromSel.value + ' → ' + toSel.value + ' выполнен');
        hapticImpact('medium');
        closeModal();
      });
    }
  }

  function populateExchangeSelects() {
    const fromSel = document.getElementById('exchange-from');
    const toSel = document.getElementById('exchange-to');

    if (!fromSel || !toSel) return;

    const optionsHTML = COIN_DEFS.map(function (c) {
      return '<option value="' + c.ticker + '">' + c.name + ' (' + c.ticker + ')</option>';
    }).join('');

    fromSel.innerHTML = optionsHTML;
    toSel.innerHTML = optionsHTML;

    fromSel.value = 'BTC';
    toSel.value = 'USDT';
  }

  /* ============================================================
     8. ВЫПУСК ВИРТУАЛЬНОЙ КАРТЫ
     ============================================================ */

  function generateCardNumber() {
    let groups = [];
    for (let i = 0; i < 4; i++) {
      let group = '';
      for (let j = 0; j < 4; j++) {
        group += Math.floor(Math.random() * 10);
      }
      groups.push(group);
    }
    return groups.join(' ');
  }

  function generateExpiry() {
    const now = new Date();
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = String((now.getFullYear() + 3) % 100).padStart(2, '0');
    return month + '/' + year;
  }

  function bindCardIssue() {
    const issueBtn = document.getElementById('issue-card-btn');
    const issueBlock = document.getElementById('issue-block');
    const cardResult = document.getElementById('card-result');

    if (!issueBtn) return;

    issueBtn.addEventListener('click', function () {
      if (state.cardIssued) return;

      const textSpan = issueBtn.querySelector('.issue-btn-text');
      const loaderSpan = issueBtn.querySelector('.issue-btn-loader');

      issueBtn.classList.add('is-loading');
      textSpan.classList.add('hidden');
      loaderSpan.classList.remove('hidden');
      hapticImpact('medium');

      setTimeout(function () {
        const cardNumber = generateCardNumber();
        const expiry = generateExpiry();
        const holderName = state.telegramUser.firstName.toUpperCase();

        document.getElementById('card-number').textContent = cardNumber;
        document.getElementById('card-holder-name').textContent = holderName;
        document.getElementById('card-expiry').textContent = expiry;

        issueBlock.classList.add('hidden');
        cardResult.classList.remove('hidden');

        state.cardIssued = true;
        state.cardNumber = cardNumber;

        hapticImpact('heavy');
        showToast('Карта Nebula Visa выпущена!');
      }, 1000);
    });

    const freezeBtn = document.getElementById('card-freeze-btn');
    if (freezeBtn) {
      freezeBtn.addEventListener('click', function () {
        state.cardFrozen = !state.cardFrozen;
        const cardEl = document.getElementById('nebula-card');

        freezeBtn.classList.toggle('active-state', state.cardFrozen);
        freezeBtn.innerHTML = state.cardFrozen
          ? '<i class="fa-solid fa-snowflake"></i> Заморожена'
          : '<i class="fa-solid fa-snowflake"></i> Заморозить';

        if (cardEl) {
          cardEl.style.filter = state.cardFrozen ? 'grayscale(0.7) brightness(0.7)' : 'none';
          cardEl.style.transition = 'filter 0.3s ease';
        }

        showToast(state.cardFrozen ? 'Карта заморожена' : 'Карта разморожена');
        hapticImpact('light');
      });
    }

    const detailsBtn = document.getElementById('card-details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', function () {
        state.cardDetailsVisible = !state.cardDetailsVisible;
        const numberEl = document.getElementById('card-number');

        detailsBtn.classList.toggle('active-state', state.cardDetailsVisible);

        if (state.cardDetailsVisible) {
          numberEl.textContent = state.cardNumber || '0000 0000 0000 0000';
          detailsBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Скрыть';
        } else {
          const lastFour = (state.cardNumber || '0000 0000 0000 0000').slice(-4);
          numberEl.textContent = '•••• •••• •••• ' + lastFour;
          detailsBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Реквизиты';
        }

        hapticImpact('light');
      });
    }
  }

  /* ============================================================
     9. НАСТРОЙКИ — ТУМБЛЕРЫ
     ============================================================ */

  function bindSettingsToggles() {
    const toggles = [
      { id: 'toggle-biometrics', onMsg: 'Вход по биометрии включен', offMsg: 'Вход по биометрии отключен' },
      { id: 'toggle-2fa', onMsg: 'Двухфакторная защита включена', offMsg: 'Двухфакторная защита отключена' },
      { id: 'toggle-push', onMsg: 'Push-уведомления включены', offMsg: 'Push-уведомления отключены' },
      { id: 'toggle-price-alerts', onMsg: 'Уведомления о курсе включены', offMsg: 'Уведомления о курсе отключены' }
    ];

    toggles.forEach(function (t) {
      const el = document.getElementById(t.id);
      if (!el) return;

      el.addEventListener('change', function () {
        showToast(el.checked ? t.onMsg : t.offMsg);
        hapticImpact('light');
      });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        hapticImpact('heavy');
        showToast('Для выхода закройте приложение Telegram Mini App');
      });
    }

    const avatarBtn = document.getElementById('avatar-btn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', function () {
        switchScreen('settings');
      });
    }
  }

  /* ============================================================
     10. TOAST УВЕДОМЛЕНИЯ
     ============================================================ */

  let toastTimeout = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.remove('hidden');

    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.classList.add('hidden');
      }, 300);
    }, 2400);
  }

  /* ============================================================
     11. HAPTIC FEEDBACK (Telegram)
     ============================================================ */

  function hapticImpact(style) {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        const styleMap = { light: 'light', medium: 'medium', heavy: 'heavy' };
        window.Telegram.WebApp.HapticFeedback.impactOccurred(styleMap[style] || 'light');
      }
    } catch (e) {
      // безопасно игнорируем в браузере
    }
  }

  /* ============================================================
     12. ГЕНЕРАЦИЯ АДРЕСА КОШЕЛЬКА
     ============================================================ */

  function generateWalletAddress() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let addr = 'UQ';
    for (let i = 0; i < 4; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
    addr += '...';
    for (let i = 0; i < 6; i++) addr += chars.charAt(Math.floor(Math.random() * chars.length));
    return addr;
  }

  /* ============================================================
     13. ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
     ============================================================ */

  function init() {
    initTelegram();
    bindNavigation();
    bindSearch();
    bindModals();
    bindCardIssue();
    bindSettingsToggles();
    renderCoinList();

    const addressEl = document.getElementById('receive-address');
    if (addressEl) {
      addressEl.textContent = generateWalletAddress();
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
