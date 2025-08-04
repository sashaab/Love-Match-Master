#!/bin/bash

# Скрипт для принудительной перезагрузки всех сервисов

set -e

echo "🔄 Принудительная перезагрузка всех сервисов..."

# Останавливаем все контейнеры
echo "🛑 Останавливаем все контейнеры..."
docker-compose down

# Удаляем все volumes (осторожно!)
echo "🗑️  Удаляем volumes..."
docker volume rm celebricy-game_certbot-etc celebricy-game_certbot-var celebricy-game_certbot-webroot 2>/dev/null || true

# Удаляем сеть
echo "🌐 Удаляем сеть..."
docker network rm celebricy-game_app-network 2>/dev/null || true

# Очищаем nginx конфигурацию
echo "📝 Очищаем nginx конфигурацию..."
cp nginx-init.conf nginx.conf

# Запускаем заново
echo "🚀 Запускаем сервисы заново..."
docker-compose up -d

# Ждем запуска
echo "⏳ Ждем запуска сервисов..."
sleep 15

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

# Проверяем логи
echo "📋 Логи nginx:"
docker-compose logs nginx

echo "📋 Логи приложения:"
docker-compose logs app

echo ""
echo "✅ Принудительная перезагрузка завершена"
echo "🌐 Проверьте доступность: curl -I http://localhost:80" 