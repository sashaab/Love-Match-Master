#!/bin/bash

# Скрипт для проверки состояния сервера

set -e

echo "🔍 Проверка состояния сервера..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден"
    echo "Создайте его из env.example: cp env.example .env"
    exit 1
fi

# Загружаем переменные
source .env

echo "📝 Домен: ${DOMAIN:-не указан}"
echo "📧 Email: ${CERTBOT_EMAIL:-не указан}"

# Проверяем DNS
if [ -n "$DOMAIN" ]; then
    echo "🌐 Проверка DNS для $DOMAIN..."
    DOMAIN_IP=$(nslookup $DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    echo "IP адрес: $DOMAIN_IP"
    
    # Проверяем доступность порта 80
    echo "🔌 Проверка доступности порта 80..."
    if curl -s --connect-timeout 5 -I http://$DOMAIN > /dev/null 2>&1; then
        echo "✅ Порт 80 доступен"
    else
        echo "❌ Порт 80 недоступен"
        echo "Возможные причины:"
        echo "  - Приложение не запущено"
        echo "  - Порт заблокирован файрволом"
        echo "  - Неправильная настройка DNS"
    fi
fi

# Проверяем Docker
echo "🐳 Проверка Docker..."
if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker установлен"
    docker --version
else
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверяем Docker Compose
echo "📦 Проверка Docker Compose..."
if command -v docker-compose >/dev/null 2>&1; then
    echo "✅ docker-compose установлен"
    docker-compose --version
elif docker compose version >/dev/null 2>&1; then
    echo "✅ docker compose установлен"
    docker compose version
else
    echo "❌ Docker Compose не установлен"
    exit 1
fi

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose ps
elif docker compose ps >/dev/null 2>&1; then
    docker compose ps
fi

echo ""
echo "💡 Рекомендации:"
echo "1. Убедитесь, что порт 80 открыт в файрволе"
echo "2. Проверьте, что DNS записи настроены правильно"
echo "3. Запустите приложение: ./scripts/deploy.sh"
echo "4. Для отладки используйте: docker-compose logs" 