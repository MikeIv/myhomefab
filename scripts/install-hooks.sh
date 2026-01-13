#!/bin/sh

# Скрипт для установки git hooks
# Копирует pre-commit и pre-push hooks в .git/hooks/

echo "📦 Установка git hooks..."

# Создаем директорию hooks если её нет
mkdir -p .git/hooks

# Копируем pre-commit hook
cp scripts/pre-commit-hook .git/hooks/pre-commit

# Копируем pre-push hook
cp scripts/pre-push-hook .git/hooks/pre-push

# Делаем hooks исполняемыми
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

echo "✅ Git hooks установлены!"
echo "Теперь перед каждым коммитом и push будет выполняться проверка кода."
