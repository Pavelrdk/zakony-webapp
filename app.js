/**
 * Super App для Telegram - Законы РФ
 * Включает: Монитор, Поиск, Настройки
 */

// Состояние приложения
const state = {
    selectedRoles: new Set(),
    selectedTags: new Set(),
    currentTab: 'home',
    settingsScreen: 'roles', // roles -> settings -> success
    searchSource: 'my' // 'my' or 'all'
};

// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
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

    // Дата по умолчанию: сегодня
    const today = new Date().toISOString().split('T')[0];
    dom.dateEnd.value = today;
    // Start date = месяц назад
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    dom.dateStart.value = lastMonth.toISOString().split('T')[0];
});

function init() {
    // 1. Пытаемся загрузить данные из CloudStorage
    tg.CloudStorage.getItems(['selectedTags', 'selectedRoles'], (err, result) => {
        if (!err && result) {
            if (result.selectedTags) {
                try {
                    const tags = JSON.parse(result.selectedTags);
                    tags.forEach(t => state.selectedTags.add(t));
                } catch (e) { console.error("Error parsing tags", e); }
            }
            if (result.selectedRoles) {
                try {
                    const roles = JSON.parse(result.selectedRoles);
                    roles.forEach(r => state.selectedRoles.add(r));
                } catch (e) { console.error("Error parsing roles", e); }
            }
        }

        // После загрузки рендерим UI
        renderRoles();
        renderAllTags();
        updateHomePreview();
    });

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

    // Если перешли в настройки, сбрасываем на первый экран
    if (tabId === 'settings') {
        // Если уже есть выбор, можно показать сразу настройки?
        // Но пользователь просил "сразу в темах добавить".
        // Логичнее начать с ролей, если их нет. А если есть - можно и теги.
        // Но пока оставим старт с ролей для простоты flow.
        showSettingsScreen('roles');
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
    switchTab('search');
    // Можно сразу искать, но лучше дать пользователю подтвердить кнопкой
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
        source: state.searchSource
    };

    // Используем sendData (закрывает WebApp и шлет данные боту)
    tg.sendData(JSON.stringify(data));
    // Не закрываем сами пока (sendData обычно закрывает, но на всякий)
    // tg.close(); вызывается автоматически telegram-ом при sendData
}

/* ================= SETTINGS LOGIC ================= */

function showSettingsScreen(screenName) {
    // Hide all inside settings tab
    Object.values(dom.settingsScreens).forEach(s => {
        if (s) s.classList.remove('active');
    });

    if (dom.settingsScreens[screenName]) {
        dom.settingsScreens[screenName].classList.add('active');
        state.settingsScreen = screenName;
    }

    // Если перешли к "Все темы" (settings), обновим список (вдруг роли поменялись)
    if (screenName === 'settings') {
        renderAllTags();
    }

    updateFab();
    dom.tabs.settings.scrollTop = 0;
}

function updateFab() {
    dom.fabContainer.innerHTML = '';

    if (state.currentTab !== 'settings') return;

    if (state.settingsScreen === 'roles') {
        // Кнопка "Далее" ведет сразу к выбору всех тем
        // Если ничего не выбрано - тоже можно идти
        dom.fabContainer.innerHTML = `<button class="fab-btn" onclick="showSettingsScreen('settings')">Выбрать темы →</button>`;
    } else if (state.settingsScreen === 'settings') {
        dom.fabContainer.innerHTML = `
            <button class="fab-btn" style="background:#8e8e93; margin-right:auto" onclick="showSettingsScreen('roles')">← Роли</button>
            <button class="fab-btn" onclick="saveSettings()">Сохранить ✓</button>
         `;

        // Добавляем подсказку внизу списка
        addHintToSettings();
    }
}

function addHintToSettings() {
    const container = document.getElementById('all-tags-container');
    // Проверяем, есть ли подсказка
    if (!document.getElementById('settings-hint')) {
        const hint = document.createElement('div');
        hint.id = 'settings-hint';
        hint.className = 'subtitle';
        hint.style.textAlign = 'center';
        hint.style.marginTop = '20px';
        hint.textContent = "👆 Это темы, которые мы подобрали. Удалите лишние или добавьте новые.";
        container.appendChild(hint);
    }
}

// ---- Render Logic ----

function renderRoles() {
    const container = document.getElementById('roles-container');
    container.innerHTML = '';

    for (const [key, group] of Object.entries(ROLES)) {
        const section = document.createElement('div');
        section.className = 'category-section';
        // section.innerHTML = `<div class="category-title">${group.title}</div>`; 
        // Не отображаем заголовок группы ("КТО ВЫ?"), так как он есть в заголовке экрана
        // Либо отображаем, если групп несколько. У нас 2 группы (Соц и Бизнес)
        // Давайте отобразим для ясности
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = group.title;
        container.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'chips-grid';

        grid.innerHTML = group.items.map(role => `
            <div class="chip ${state.selectedRoles.has(role.code) ? 'selected' : ''}" 
                 data-role="${role.code}" 
                 data-tags="${role.tags.join(',')}"
                 onclick="toggleRole(this)">
                <span class="chip-icon">${role.emoji}</span> ${role.name}
            </div>
        `).join('');

        section.appendChild(grid);
        container.appendChild(section);
    }

    // Привязывать onclick не обязательно через JS, можно инлайн (как выше)
}

// Сделаем глобальными для вызова из HTML
window.toggleRole = function (chip) {
    const roleCode = chip.dataset.role;
    const tags = chip.dataset.tags.split(',');

    if (state.selectedRoles.has(roleCode)) {
        state.selectedRoles.delete(roleCode);
        chip.classList.remove('selected');
        // При удалении роли НЕ удаляем теги сразу, 
        // так как пользователь мог их вручную добавить или они нужны другой роли
        // Логика: Роль -> добавляет теги. Снятие роли -> ничего не удаляет (безопаснее), 
        // или удаляет только если тег не выбран вручную?
        // Просьба пользователя: "сразу в темах человек и добавит что нехватает или удалит лишнее"
        // Значит оставим "ADD only" логику при выборе роли.
    } else {
        state.selectedRoles.add(roleCode);
        chip.classList.add('selected');
        // Добавляем теги
        tags.forEach(t => state.selectedTags.add(t));
    }

    // Сохраняем промежуточное состояние
    saveToCloud();
    updateFab();
};

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
             <div class="chip ${state.selectedTags.has(t.code) ? 'selected' : ''}" 
                  data-tag="${t.code}"
                  onclick="toggleTag(this)">
                ${t.name}
            </div>
        `).join('');

        section.appendChild(grid);
        container.appendChild(section);
    }
}

window.toggleTag = function (chip) {
    const t = chip.dataset.tag;
    if (state.selectedTags.has(t)) {
        state.selectedTags.delete(t);
        chip.classList.remove('selected');
    } else {
        state.selectedTags.add(t);
        chip.classList.add('selected');
    }
    saveToCloud();
};

function groupTagsByCategory() {
    const res = {};
    for (const [code, t] of Object.entries(TAGS)) {
        if (!res[t.category]) res[t.category] = [];
        res[t.category].push({ code, ...t });
    }
    return res;
}

function saveToCloud() {
    // Сохранение в CloudStorage
    const rolesStr = JSON.stringify(Array.from(state.selectedRoles));
    const tagsStr = JSON.stringify(Array.from(state.selectedTags));

    tg.CloudStorage.setItem('selectedRoles', rolesStr);
    tg.CloudStorage.setItem('selectedTags', tagsStr);
}

window.saveSettings = function () {
    const data = {
        action: 'save_settings',
        roles: Array.from(state.selectedRoles),
        tags: Array.from(state.selectedTags)
    };
    tg.sendData(JSON.stringify(data));
    // tg.close();
};

/* Globals for inline calls */
window.switchTab = switchTab;
window.quickSearch = quickSearch;
window.doSearch = doSearch;
window.setPreset = setPreset;
window.toggleSearchSource = toggleSearchSource;
window.showSettingsScreen = showSettingsScreen;
