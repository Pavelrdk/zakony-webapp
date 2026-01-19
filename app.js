/**
 * Mini App для выбора тем — Законы РФ
 */

// Состояние приложения
const state = {
    selectedRoles: new Set(),
    selectedTags: new Set(),
    currentScreen: 'roles'
};

// Инициализация Telegram WebApp
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Применяем тему Telegram
    const root = document.documentElement;
    root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#3390ec');
    root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
}

// DOM элементы
const screens = {
    roles: document.getElementById('screen-roles'),
    review: document.getElementById('screen-preview'),
    settings: document.getElementById('screen-all'),
    success: document.getElementById('screen-success')
};

const bottomBar = document.getElementById('bottom-bar');

// Инициализация
document.addEventListener('DOMContentLoaded', init);

function init() {
    renderRoles();
    showScreen('roles');
}

// Отрисовка ролей
function renderRoles() {
    const mainContainer = document.getElementById('roles-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = '';

    for (const [groupKey, group] of Object.entries(ROLES)) {
        const section = document.createElement('div');
        section.className = 'category-section';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = group.title;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'chips-grid';

        grid.innerHTML = group.items.map(role => `
            <div class="chip" data-role="${role.code}" data-tags="${role.tags.join(',')}">
                <span class="chip-icon">${role.emoji}</span>
                ${role.name}
            </div>
        `).join('');

        section.appendChild(grid);
        mainContainer.appendChild(section);
    }

    // Привязываем клики
    mainContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => toggleRole(chip));
    });
}

// Переключение роли
function toggleRole(chip) {
    const roleCode = chip.dataset.role;
    const tags = chip.dataset.tags.split(',');

    if (state.selectedRoles.has(roleCode)) {
        state.selectedRoles.delete(roleCode);
        chip.classList.remove('selected');
        // Убираем теги этой роли
        tags.forEach(tag => {
            if (!isTagUsedByOtherRoles(tag, roleCode)) {
                state.selectedTags.delete(tag);
            }
        });
    } else {
        state.selectedRoles.add(roleCode);
        chip.classList.add('selected');
        // Добавляем теги
        tags.forEach(tag => state.selectedTags.add(tag));
    }

    renderBottomBar('roles');
}

// Проверка использования тега другими ролями
function isTagUsedByOtherRoles(tag, excludeRole) {
    for (const [groupKey, group] of Object.entries(ROLES)) {
        for (const role of group.items) {
            if (role.code !== excludeRole && state.selectedRoles.has(role.code)) {
                if (role.tags.includes(tag)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Управление экранами и навигацией
function showScreen(screenName) {
    // Скрываем все экраны
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });

    // Показываем нужный
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        state.currentScreen = screenName;
        window.scrollTo(0, 0);
        renderBottomBar(screenName);
    }
}

// Отрисовка нижней панели (кнопок)
function renderBottomBar(screenName) {
    if (!bottomBar) return;

    bottomBar.innerHTML = '';
    bottomBar.style.display = 'flex';

    if (screenName === 'roles') {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Далее →';
        // Блокируем, если ничего не выбрано
        if (state.selectedRoles.size === 0) {
            btn.style.opacity = '0.5';
            btn.disabled = true;
        } else {
            btn.onclick = goToReview;
        }
        bottomBar.appendChild(btn);

    } else if (screenName === 'review') {
        const btnSettings = document.createElement('button');
        btnSettings.className = 'btn btn-secondary';
        btnSettings.textContent = '⚙️ Точная настройка';
        btnSettings.onclick = goToSettings;

        const btnSave = document.createElement('button');
        btnSave.className = 'btn';
        btnSave.textContent = 'Сохранить ✓';
        btnSave.onclick = saveAndClose;

        bottomBar.appendChild(btnSettings);
        bottomBar.appendChild(btnSave);

    } else if (screenName === 'settings') {
        const btnBack = document.createElement('button');
        btnBack.className = 'btn btn-secondary';
        btnBack.textContent = '← Назад';
        btnBack.onclick = goToReview;

        const btnSave = document.createElement('button');
        btnSave.className = 'btn';
        btnSave.textContent = 'Сохранить ✓';
        btnSave.onclick = saveAndClose;

        bottomBar.appendChild(btnBack);
        bottomBar.appendChild(btnSave);

    } else {
        bottomBar.style.display = 'none';
    }
}

// Переходы
function goToReview() {
    renderReview();
    showScreen('review');
}

function goToSettings() {
    renderSettings();
    showScreen('settings');
}

// Отрисовка экрана обзора
function renderReview() {
    const rolesDisplay = document.getElementById('selected-roles-list');
    const selectedRoleNames = [];

    for (const [groupKey, group] of Object.entries(ROLES)) {
        for (const role of group.items) {
            if (state.selectedRoles.has(role.code)) {
                selectedRoleNames.push(`${role.emoji} ${role.name}`);
            }
        }
    }
    if (rolesDisplay) {
        rolesDisplay.textContent = selectedRoleNames.join(', ') || 'Нет выбранных ролей';
    }

    const tagsByCategory = groupTagsByCategory();
    const container = document.getElementById('preview-tags-container');
    if (!container) return;

    container.innerHTML = '';

    for (const [catCode, tags] of Object.entries(tagsByCategory)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        // Показываем только если есть выбранные теги в этой категории (для превью)
        const hasSelected = tags.some(t => state.selectedTags.has(t.code));
        if (!hasSelected) continue;

        const group = document.createElement('div');
        group.className = 'tag-group';

        const grid = document.createElement('div');
        grid.className = 'chips-grid';

        grid.innerHTML = tags.filter(t => state.selectedTags.has(t.code)).map(tag => `
            <div class="chip selected" data-tag="${tag.code}">
                ${tag.name} <span style="margin-left:4px; opacity:0.6;">✕</span>
            </div>
        `).join('');

        group.innerHTML = `<div class="category-title">${category.emoji} ${category.name}</div>`;
        group.appendChild(grid);
        container.appendChild(group);
    }

    // Удаление тегов по клику
    // Используем .chip вместо .tag-chip, так как в HTML выше мы используем .chip
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const tagCode = chip.dataset.tag;
            state.selectedTags.delete(tagCode);
            renderReview(); // Перерисовываем
        });
    });
}

// Отрисовка настроек (всех тегов)
function renderSettings() {
    const container = document.getElementById('all-tags-container');
    if (!container) return;
    container.innerHTML = '';

    const tagsByCategory = groupTagsByCategory();

    for (const [catCode, tags] of Object.entries(tagsByCategory)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        const group = document.createElement('div');
        group.className = 'tag-group';

        const grid = document.createElement('div');
        grid.className = 'chips-grid';
        grid.style.marginBottom = '16px';

        grid.innerHTML = tags.map(tag => {
            const isSelected = state.selectedTags.has(tag.code);
            // Добавляем класс selected, если выбрано. Если нет - просто chip (серый)
            return `
                <div class="chip ${isSelected ? 'selected' : ''}" data-tag="${tag.code}">
                    ${tag.name}
                </div>
            `;
        }).join('');

        group.innerHTML = `<div class="category-title">${category.emoji} ${category.name}</div>`;
        group.appendChild(grid);
        container.appendChild(group);
    }

    // Клики
    container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const tagCode = chip.dataset.tag;
            if (state.selectedTags.has(tagCode)) {
                state.selectedTags.delete(tagCode);
                chip.classList.remove('selected');
            } else {
                state.selectedTags.add(tagCode);
                chip.classList.add('selected');
            }
        });
    });
}

// Хелпер группировки тегов
function groupTagsByCategory() {
    const tagsByCategory = {};
    for (const [tagCode, tag] of Object.entries(TAGS)) {
        if (!tagsByCategory[tag.category]) {
            tagsByCategory[tag.category] = [];
        }
        tagsByCategory[tag.category].push({ code: tagCode, ...tag });
    }
    return tagsByCategory;
}

// Сохранение
function saveAndClose() {
    const data = {
        roles: Array.from(state.selectedRoles),
        tags: Array.from(state.selectedTags)
    };

    if (tg) {
        tg.sendData(JSON.stringify(data));
        // На случай если окно не закроется само (хотя должно)
        setTimeout(() => tg.close(), 100);
    } else {
        showScreen('success');
    }
}
