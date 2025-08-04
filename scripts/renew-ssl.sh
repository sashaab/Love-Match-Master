#!/bin/bash

# Скрипт для обновления SSL сертификатов

set -e

# Загружаем переменные из .env
if [ -f .env ]; then
    source .env
else
    echo "❌ Файл .env не найден"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ Домен не указан в .env файле"
    exit 1
fi

echo "🔄 Обновление SSL сертификата для домена: $DOMAIN"

# Обновляем сертификат
docker-compose run --rm certbot renew

# Перезапускаем nginx для применения нового сертификата
echo "🔄 Перезапускаем nginx..."
docker-compose restart nginx

echo "✅ SSL сертификат обновлен" 