#!/bin/bash

# Скрипт для диагностики проблем с nginx

set -e

echo "🔍 Диагностика проблем с nginx..."

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""

# Проверяем логи nginx
echo "📋 Логи nginx:"
docker-compose logs nginx

echo ""

# Проверяем логи приложения
echo "📋 Логи приложения:"
docker-compose logs app

echo ""

# Проверяем конфигурацию nginx
echo "🔧 Проверяем конфигурацию nginx:"
if [ -f nginx.conf ]; then
    echo "Конфигурация nginx.conf:"
    cat nginx.conf
else
    echo "❌ Файл nginx.conf не найден"
fi

echo ""

# Проверяем порты
echo "🔌 Проверяем порты:"
netstat -tlnp | grep :80 || echo "Порт 80 не слушается"
netstat -tlnp | grep :443 || echo "Порт 443 не слушается"

echo ""

# Проверяем volumes
echo "💾 Проверяем volumes:"
docker volume ls | grep celebricy-game

echo ""

# Проверяем сеть
echo "🌐 Проверяем сеть:"
docker network ls | grep celebricy-game

echo ""

echo "💡 Рекомендации:"
echo "1. Если nginx не запускается, попробуйте: ./scripts/test-deploy.sh"
echo "2. Если проблема в конфигурации, проверьте синтаксис nginx.conf"
echo "3. Если порты заняты, остановите другие сервисы"
echo "4. Для полной перезагрузки: docker-compose down && docker-compose up -d" 