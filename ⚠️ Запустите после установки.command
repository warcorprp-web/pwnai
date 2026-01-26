#!/bin/bash

echo "Искра Терминал - Снятие карантина"
echo "===================================="
echo ""
echo "Этот скрипт снимет карантин с приложения."
echo "Потребуется ввести пароль администратора."
echo ""

# Путь к приложению
APP_PATH="/Applications/Искра Терминал.app"

# Проверяем установлено ли приложение
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Приложение не найдено в /Applications/"
    echo "Сначала перетащите Искра Терминал.app в папку Applications"
    echo ""
    read -p "Нажмите Enter для выхода..."
    exit 1
fi

echo "Снимаем карантин..."
sudo xattr -cr "$APP_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Готово! Теперь можно запускать Искра Терминал"
    echo ""
    read -p "Запустить приложение сейчас? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[YyДд]$ ]]; then
        open "$APP_PATH"
    fi
else
    echo ""
    echo "❌ Ошибка. Попробуйте запустить вручную:"
    echo "sudo xattr -cr '$APP_PATH'"
fi

echo ""
read -p "Нажмите Enter для выхода..."
