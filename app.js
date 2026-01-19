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
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f0f0f0');
}

// DOM элементы
const screens = {
    roles: document.getElementById('screen-roles'),
    review: document.getElementById('screen-review'),
    settings: document.getElementById('screen-settings'),
    success: document.getElementById('screen-success')
};

// Инициализация
document.addEventListener('DOMContentLoaded', init);

function init() {
    renderRoles();
    bindEvents();
}

// Отрисовка ролей на первом экране
// Отрисовка ролей на первом экране
function renderRoles() {
    const mainContainer = document.getElementById('roles-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = '';

    for (const [groupKey, group] of Object.entries(ROLES)) {
        // Создаем секцию
        const section = document.createElement('div');
        section.className = 'category-section';

        // Заголовок секции
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = group.title;
        section.appendChild(title);

        // Сетка для чипсов
        const grid = document.createElement('div');
        grid.className = 'chips-grid';

        // Чипсы
        grid.innerHTML = group.items.map(role => `
            <div class="chip" data-role="${role.code}" data-tags="${role.tags.join(',')}">
                <span class="chip-icon">${role.emoji}</span>
                ${role.name}
            </div>
        `).join('');

        section.appendChild(grid);
        mainContainer.appendChild(section);
    }
}

// Привязка событий
function bindEvents() {
    // Клик по чипсам ролей
    document.querySelectorAll('#screen-roles .chip').forEach(chip => {
        chip.addEventListener('click', () => toggleRole(chip));
    });

    // Кнопка "Далее"
    document.getElementById('btn-next').addEventListener('click', goToReview);

    // Кнопка "Точная настройка"
    document.getElementById('btn-settings').addEventListener('click', goToSettings);

    // Кнопка "Назад"
    document.getElementById('btn-back').addEventListener('click', goToReview);

    // Кнопки сохранения
    document.getElementById('btn-save').addEventListener('click', saveAndClose);
    document.getElementById('btn-save-settings').addEventListener('click', saveAndClose);
}

// Переключение роли
function toggleRole(chip) {
    const roleCode = chip.dataset.role;
    const tags = chip.dataset.tags.split(',');

    if (state.selectedRoles.has(roleCode)) {
        state.selectedRoles.delete(roleCode);
        chip.classList.remove('selected');
        // Убираем теги этой роли (если они не используются другими ролями)
        tags.forEach(tag => {
            if (!isTagUsedByOtherRoles(tag, roleCode)) {
                state.selectedTags.delete(tag);
            }
        });
    } else {
        state.selectedRoles.add(roleCode);
        chip.classList.add('selected');
        // Добавляем теги роли
        tags.forEach(tag => state.selectedTags.add(tag));
    }

    updateNextButton();
}

// Проверка, используется ли тег другими выбранными ролями
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

// Обновление кнопки "Далее"
function updateNextButton() {
    const btn = document.getElementById('btn-next');
    btn.disabled = state.selectedRoles.size === 0;
}

// Переход на экран обзора
function goToReview() {
    showScreen('review');
    renderReview();
}

// Переход на экран настроек
function goToSettings() {
    showScreen('settings');
    renderSettings();
}

// Показать экран
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
    state.currentScreen = screenName;
    window.scrollTo(0, 0);
}

// Отрисовка экрана обзора
function renderReview() {
    // Показываем выбранные роли
    const rolesDisplay = document.getElementById('roles-display');
    const selectedRoleNames = [];

    for (const [groupKey, group] of Object.entries(ROLES)) {
        for (const role of group.items) {
            if (state.selectedRoles.has(role.code)) {
                selectedRoleNames.push(`${role.emoji} ${role.name}`);
            }
        }
    }
    rolesDisplay.textContent = selectedRoleNames.join(', ');

    // Группируем теги по категориям
    const tagsByCategory = {};
    for (const tagCode of state.selectedTags) {
        const tag = TAGS[tagCode];
        if (!tag) continue;

        if (!tagsByCategory[tag.category]) {
            tagsByCategory[tag.category] = [];
        }
        tagsByCategory[tag.category].push({ code: tagCode, ...tag });
    }

    // Отрисовываем теги
    const container = document.getElementById('tags-preview');
    container.innerHTML = '';

    for (const [catCode, tags] of Object.entries(tagsByCategory)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        const group = document.createElement('div');
        group.className = 'tag-group';
        group.innerHTML = `
            <div class="tag-group-title">── ${category.emoji} ${category.name} ──</div>
            <div class="chips">
                ${tags.map(tag => `
                    <div class="chip tag-chip selected" data-tag="${tag.code}">
                        ${tag.name}
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(group);
    }

    // Привязываем клики для удаления тегов
    container.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => toggleTagInReview(chip));
    });
}

// Переключение тега на экране обзора
function toggleTagInReview(chip) {
    const tagCode = chip.dataset.tag;

    if (state.selectedTags.has(tagCode)) {
        state.selectedTags.delete(tagCode);
        chip.classList.remove('selected');
        chip.classList.add('disabled');
    } else {
        state.selectedTags.add(tagCode);
        chip.classList.add('selected');
        chip.classList.remove('disabled');
    }
}

// Отрисовка экрана настроек
function renderSettings() {
    const container = document.getElementById('tags-full');
    container.innerHTML = '';

    // Группируем все теги по категориям
    const tagsByCategory = {};
    for (const [tagCode, tag] of Object.entries(TAGS)) {
        if (!tagsByCategory[tag.category]) {
            tagsByCategory[tag.category] = [];
        }
        tagsByCategory[tag.category].push({ code: tagCode, ...tag });
    }

    for (const [catCode, tags] of Object.entries(tagsByCategory)) {
        const category = CATEGORIES[catCode];
        if (!category) continue;

        const group = document.createElement('div');
        group.className = 'tag-group';
        group.innerHTML = `
            <div class="tag-group-title">── ${category.emoji} ${category.name} ──</div>
            <div class="chips">
                ${tags.map(tag => {
            const isSelected = state.selectedTags.has(tag.code);
            return `
                        <div class="chip tag-chip ${isSelected ? 'selected' : 'disabled'}" data-tag="${tag.code}">
                            ${tag.name}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
        container.appendChild(group);
    }

    // Привязываем клики
    container.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => toggleTagInSettings(chip));
    });
}

// Переключение тега на экране настроек
function toggleTagInSettings(chip) {
    const tagCode = chip.dataset.tag;

    if (state.selectedTags.has(tagCode)) {
        state.selectedTags.delete(tagCode);
        chip.classList.remove('selected');
        chip.classList.add('disabled');
    } else {
        state.selectedTags.add(tagCode);
        chip.classList.add('selected');
        chip.classList.remove('disabled');
    }
}

// Сохранение и закрытие
function saveAndClose() {
    const data = {
        roles: Array.from(state.selectedRoles),
        tags: Array.from(state.selectedTags)
    };

    console.log('Saving data:', data);

    // Отправляем данные в бота
    if (tg) {
        tg.sendData(JSON.stringify(data));
    } else {
        // Для тестирования без Telegram
        showScreen('success');
        console.log('Data would be sent:', data);
    }
}
