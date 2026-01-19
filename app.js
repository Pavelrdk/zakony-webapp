/**
 * Super App для Telegram - Законы РФ
 * Включает: Монитор, Поиск, Настройки
 */

// Состояние приложения
const state = {
    selectedRoles: new Set(),
    selectedTags: new Set(),
    currentTab: 'home',
    settingsScreen: 'roles', // roles -> review -> settings -> success
    searchSource: 'my' // 'my' or 'all'
};

// Инициализация Telegram WebApp
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Настраиваем цвета из темы
    const root = document.documentElement;
    if (tg.themeParams) {
        if (tg.themeParams.bg_color) root.style.setProperty('--bg-color', tg.themeParams.bg_color);
        if (tg.themeParams.text_color) root.style.setProperty('--text-color', tg.themeParams.text_color);
        if (tg.themeParams.hint_color) root.style.setProperty('--hint-color', tg.themeParams.hint_color);
        if (tg.themeParams.button_color) root.style.setProperty('--button-color', tg.themeParams.button_color);
        if (tg.themeParams.button_text_color) root.style.setProperty('--button-text-color', tg.themeParams.button_text_color);
        if (tg.themeParams.secondary_bg_color) root.style.setProperty('--secondary-bg-color', tg.themeParams.secondary_bg_color);
    }
}

// DOM элементы
const dom = {
    tabs: {
        home: document.getElementById('tab-home'),
        search: document.getElementById('tab-search'),
        settings: document.getElementById('tab-settings')
    },
    navItems: {
        home: document.getElementById('nav-home'),
        search: document.getElementById('nav-search'),
        settings: document.getElementById('nav-settings')
    },
    settingsScreens: {
        roles: document.getElementById('screen-roles'),
        review: document.getElementById('screen-preview'),
        settings: document.getElementById('screen-all'),
        success: document.getElementById('screen-success')
    },
    fabContainer: document.getElementById('settings-fab-container'),
    dateStart: document.getElementById('date-start'),
    dateEnd: document.getElementById('date-end')
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Установим сегодняшнюю дату в инпуты как дефолт? Нет, лучше пусто или плейсхолдер.
    // Но лучше дату по умолчанию: Сегодня
    const today = new Date().toISOString().split('T')[0];
    dom.dateEnd.value = today;
    // Start date = месяц назад
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    dom.dateStart.value = lastMonth.toISOString().split('T')[0];
});

function init() {
    // Рендер начального состояния
    renderRoles();
    renderAllTags(); // Рендерим заранее
    updateHomePreview();

    // Включаем первую вкладку
    switchTab('home');
}

/* ================= NAVIGATION ================= */

function switchTab(tabId) {
    // Скрываем все вкладки
    Object.values(dom.tabs).forEach(el => el.classList.remove('active'));
    Object.values(dom.navItems).forEach(el => el.classList.remove('active'));

    // Показываем нужную
    dom.tabs[tabId].classList.add('active');
    dom.navItems[tabId].classList.add('active');
    state.currentTab = tabId;

    // Управление FAB (кнопки есть только в Settings)
    updateFab();

    // Если перешли в настройки, проверяем экран
    if (tabId === 'settings') {
        showSettingsScreen(state.settingsScreen);
    }

    // Если перешли домой - обновляем превью
    if (tabId === 'home') {
        updateHomePreview();
    }
}

/* ================= HOME (MONITOR) ================= */

function updateHomePreview() {
    const list = document.getElementById('home-roles-list');
    const subtitle = document.getElementById('home-subtitle');

    if (state.selectedRoles.size === 0 && state.selectedTags.size === 0) {
        list.textContent = "Нет активных подписок";
        subtitle.textContent = "Начните с настройки тем.";
    } else {
        const count = state.selectedTags.size;
        subtitle.textContent = `Вы отслеживаете ${count} ${getNoun(count, 'тему', 'темы', 'тем')}.`;

        // Список ролей текстом
        const roleNames = [];
        // Пройдемся по ROLES чтобы найти имена
        for (const grp of Object.values(ROLES)) {
            for (const r of grp.items) {
                if (state.selectedRoles.has(r.code)) roleNames.push(r.emoji + ' ' + r.name);
            }
        }
        list.textContent = roleNames.join(', ') || "Точные настройки";
    }
}

function getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
}

/* ================= SEARCH ================= */

function toggleSearchSource(el, source) {
    // UI update
    const group = el.parentElement;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    state.searchSource = source;
}

function setPreset(year) {
    if (year === '2025') {
        dom.dateStart.value = '2025-01-01';
        dom.dateEnd.value = '2025-12-31';
    } else if (year === '2024') {
        dom.dateStart.value = '2024-01-01';
        dom.dateEnd.value = '2024-12-31';
    }
}

function quickSearch(period) {
    const end = new Date();
    const start = new Date();

    if (period === 'week') {
        start.setDate(end.getDate() - 7);
    } else if (period === 'month') {
        start.setMonth(end.getMonth() - 1);
    }

    dom.dateStart.value = start.toISOString().split('T')[0];
    dom.dateEnd.value = end.toISOString().split('T')[0];

    // Auto switch to search tab and do search?
    // Or just submit immediately?
    // Let's submit immediately
    doSearch();
}

function doSearch() {
    const start = dom.dateStart.value;
    const end = dom.dateEnd.value;

    if (!start || !end) {
        tg.showAlert("Выберите даты начала и конца периода.");
        return;
    }

    const data = {
        action: 'search',
        period_start: start,
        period_end: end,
        source: state.searchSource, // 'my' or 'all'
        // Если 'my', бот использует сохраненные подписки пользователя из БД
    };

    sendDataToBot(data);
}

/* ================= SETTINGS LOGIC ================= */

function showSettingsScreen(screenName) {
    // Hide all inside settings tab
    Object.values(dom.settingsScreens).forEach(s => s.classList.remove('active'));

    if (dom.settingsScreens[screenName]) {
        dom.settingsScreens[screenName].classList.add('active');
        state.settingsScreen = screenName;
    }

    // Render dependent content
    if (screenName === 'review') renderReview();
    if (screenName === 'settings') renderSettingsGridOnly(); // Refresh selections

    updateFab();

    // Scroll to top of tab content
    dom.tabs.settings.scrollTop = 0;
}

function updateFab() {
    dom.fabContainer.innerHTML = '';

    if (state.currentTab !== 'settings') return;

    if (state.settingsScreen === 'roles') {
        if (state.selectedRoles.size > 0) {
            dom.fabContainer.innerHTML = `<button class="fab-btn" onclick="showSettingsScreen('review')">Далее →</button>`;
        }
    } else if (state.settingsScreen === 'review') {
        dom.fabContainer.innerHTML = `
            <button class="fab-btn" style="background:#8e8e93; margin-right:auto" onclick="showSettingsScreen('roles')">← Роли</button>
            <button class="fab-btn" onclick="saveSettings()">Сохранить ✓</button>
         `;
        // Add "Fine tuning" logic? 
        // Let's add a button in the layout instead of FAB for "More settings"
        // Actually, let's put "Fine Tune" button in the Review Screen content (already there implies clicking on chips to remove, but we need 'Add more' button)
        // Let's add a "All Themes" button in the content of review screen.
        addFineTuneButtonToReview();

    } else if (state.settingsScreen === 'settings') {
        dom.fabContainer.innerHTML = `
            <button class="fab-btn" style="background:#8e8e93; margin-right:auto" onclick="showSettingsScreen('review')">← Назад</button>
            <button class="fab-btn" onclick="showSettingsScreen('review')">Готово</button>
         `;
    }
}

function addFineTuneButtonToReview() {
    const container = document.getElementById('preview-tags-container');
    // Check if button already exists
    if (!document.getElementById('btn-fine-tune')) {
        const btn = document.createElement('div');
        btn.id = 'btn-fine-tune';
        btn.innerHTML = `<button class="btn btn-secondary" style="margin-top:16px" onclick="showSettingsScreen('settings')">➕ Добавить / Убрать темы</button>`;
        container.parentElement.appendChild(btn); // Append to screen-review, not grid container
    }
}

// ---- Render Logic (Adapted from old app.js) ----

function renderRoles() {
    const container = document.getElementById('roles-container');
    container.innerHTML = '';

    for (const [key, group] of Object.entries(ROLES)) {
        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-title">${group.title}</div>`; // New CSS class? Check styles.

        const grid = document.createElement('div');
        grid.className = 'chips-grid';

        grid.innerHTML = group.items.map(role => `
            <div class="chip" data-role="${role.code}" data-tags="${role.tags.join(',')}">
                <span class="chip-icon">${role.emoji}</span> ${role.name}
            </div>
        `).join('');

        section.appendChild(grid);
        container.appendChild(section);
    }

    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => toggleRole(chip));
    });
}

function toggleRole(chip) {
    const roleCode = chip.dataset.role;
    const tags = chip.dataset.tags.split(',');

    if (state.selectedRoles.has(roleCode)) {
        state.selectedRoles.delete(roleCode);
        chip.classList.remove('selected');
        tags.forEach(t => {
            if (!isTagUsedByOtherRoles(t, roleCode)) state.selectedTags.delete(t);
        });
    } else {
        state.selectedRoles.add(roleCode);
        chip.classList.add('selected');
        tags.forEach(t => state.selectedTags.add(t));
    }
    updateFab();
}

function isTagUsedByOtherRoles(tag, excludeRole) {
    for (const group of Object.values(ROLES)) {
        for (const role of group.items) {
            if (role.code !== excludeRole && state.selectedRoles.has(role.code)) {
                if (role.tags.includes(tag)) return true;
            }
        }
    }
    return false;
}

function renderReview() {
    const rolesList = document.getElementById('selected-roles-list');
    const rolesNames = [];
    state.selectedRoles.forEach(rCode => {
        // Find name
        for (const grp of Object.values(ROLES)) {
            const r = grp.items.find(x => x.code === rCode);
            if (r) rolesNames.push(r.emoji + ' ' + r.name);
        }
    });
    rolesList.textContent = rolesNames.join(', ') || 'Нет ролей';

    const container = document.getElementById('preview-tags-container');
    container.innerHTML = '';

    const tagsByCat = groupTagsByCategory();

    for (const [catCode, tags] of Object.entries(tagsByCat)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        const activeTags = tags.filter(t => state.selectedTags.has(t.code));
        if (activeTags.length === 0) continue;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'category-section';
        groupDiv.innerHTML = `<div class="category-title">${category.emoji} ${category.name}</div>`;

        const grid = document.createElement('div');
        grid.className = 'chips-grid';
        grid.innerHTML = activeTags.map(t => `
            <div class="chip selected" data-tag="${t.code}">
                ${t.name} <span style="opacity:0.6; margin-left:4px">✕</span>
            </div>
        `).join('');

        groupDiv.appendChild(grid);
        container.appendChild(groupDiv);
    }

    // Add delete listeners
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            state.selectedTags.delete(chip.dataset.tag);
            renderReview();
        });
    });

    // Ensure button exists (handled in updateFab -> addFineTuneButton)
    addFineTuneButtonToReview();
}

function renderSettingsGridOnly() {
    // Reuse renderAllTags but just update classes?
    // Easier to re-render or toggle classes.
    // Let's re-render to be safe.
    renderAllTags();
}

function renderAllTags() {
    const container = document.getElementById('all-tags-container');
    container.innerHTML = '';

    const tagsByCat = groupTagsByCategory();

    for (const [catCode, tags] of Object.entries(tagsByCat)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        const section = document.createElement('div');
        section.className = 'category-section';
        section.innerHTML = `<div class="category-title">${category.emoji} ${category.name}</div>`;

        const grid = document.createElement('div');
        grid.className = 'chips-grid';
        grid.innerHTML = tags.map(t => `
             <div class="chip ${state.selectedTags.has(t.code) ? 'selected' : ''}" data-tag="${t.code}">
                ${t.name}
            </div>
        `).join('');

        section.appendChild(grid);
        container.appendChild(section);
    }

    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const t = chip.dataset.tag;
            if (state.selectedTags.has(t)) {
                state.selectedTags.delete(t);
                chip.classList.remove('selected');
            } else {
                state.selectedTags.add(t);
                chip.classList.add('selected');
            }
        });
    });
}

function groupTagsByCategory() {
    const res = {};
    for (const [code, t] of Object.entries(TAGS)) {
        if (!res[t.category]) res[t.category] = [];
        res[t.category].push({ code, ...t });
    }
    return res;
}

function saveSettings() {
    const data = {
        action: 'save_settings',
        roles: Array.from(state.selectedRoles),
        tags: Array.from(state.selectedTags)
    };
    sendDataToBot(data);
}

function sendDataToBot(data) {
    if (tg) {
        tg.sendData(JSON.stringify(data));
        setTimeout(() => tg.close(), 100);
    } else {
        // Mock for browser testing
        console.log("Sending data to bot:", data);
        if (data.action === 'save_settings') showSettingsScreen('success');
    }
}
