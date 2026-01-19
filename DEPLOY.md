# Деплой Mini App — Инструкция

## Что сделано

Mini App для выбора тем создан в папке `webapp/`:
- `index.html` — главная страница
- `styles.css` — стили с Telegram-темой
- `data.js` — роли и теги
- `app.js` — логика

## Локальное тестирование

Запущен сервер на http://localhost:8080

Откройте в браузере для проверки интерфейса.

## Деплой на сервер

### 1. Скопировать файлы на VPS

```bash
scp -r webapp/* pavelrdk@ea62d5b6e789.vps.myjino.ru:~/webapp/
```

### 2. Настроить веб-сервер (nginx)

Создайте конфиг для поддомена (например `app.yourdomain.ru`):

```nginx
server {
    listen 80;
    server_name app.yourdomain.ru;
    
    root /home/pavelrdk/webapp;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 3. Включить HTTPS (обязательно для Telegram)

```bash
sudo certbot --nginx -d app.yourdomain.ru
```

### 4. Подключить к боту

В `@BotFather`:
1. `/mybots` → выбрать бота
2. `Bot Settings` → `Menu Button` → `Configure menu button`
3. Или через API: настроить Web App URL

### 5. Обработка данных в боте

Добавить обработчик в `handlers.py`:

```python
from aiogram import types

@dp.message(F.web_app_data)
async def handle_webapp_data(message: types.Message):
    import json
    data = json.loads(message.web_app_data.data)
    
    roles = data.get('roles', [])
    tags = data.get('tags', [])
    
    # Сохраняем в БД
    # db.save_user_preferences(message.from_user.id, roles, tags)
    
    await message.answer(f"✅ Сохранено! Выбрано тем: {len(tags)}")
```

## Структура данных

При сохранении Mini App отправляет JSON:

```json
{
    "roles": ["pensioner", "driver"],
    "tags": ["pensions", "benefits", "zhkh", "pdd", "osago"]
}
```
