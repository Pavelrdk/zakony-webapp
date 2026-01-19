@echo off
echo === Деплой Mini App на сервер ===
echo.
echo Файлы для загрузки:
echo   - index.html
echo   - styles.css
echo   - data.js
echo   - app.js
echo.
echo Сервер: pavelrdk@ea62d5b6e789.vps.myjino.ru
echo Путь: ~/webapp/
echo.
echo Запускаю копирование... (введите пароль когда попросит)
echo.

scp -o StrictHostKeyChecking=no index.html styles.css data.js app.js pavelrdk@ea62d5b6e789.vps.myjino.ru:~/webapp/

echo.
if %errorlevel% == 0 (
    echo === Файлы успешно загружены! ===
) else (
    echo === Ошибка при загрузке ===
)
pause
