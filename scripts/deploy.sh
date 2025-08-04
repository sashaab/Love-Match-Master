#!/bin/bash

# Скрипт для развертывания приложения с поддержкой домена и HTTPS

set -e

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Создаем .env файл из примера..."
    cp env.example .env
    echo "Пожалуйста, отредактируйте .env файл и укажите домен и email для HTTPS"
    exit 1
fi

# Загружаем переменные из .env
source .env

echo "🚀 Запуск приложения..."

if [ -n "$DOMAIN" ]; then
    echo "📝 Домен указан: $DOMAIN"
    echo "🔒 Будет настроен HTTPS с Let's Encrypt"
    
    # Создаем директорию для SSL сертификатов
    mkdir -p ssl
    
    # Копируем HTTPS конфигурацию nginx
    cp nginx-https.conf nginx.conf
    
    # Запускаем сервисы
    docker-compose up -d
    
    # Ждем запуска nginx
    echo "⏳ Ждем запуска nginx..."
    sleep 15
    
    # Получаем SSL сертификат (сначала staging для тестирования)
    echo "🔐 Получаем SSL сертификат (staging)..."
    docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $CERTBOT_EMAIL --agree-tos --no-eff-email --staging -d $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ Staging сертификат получен успешно"
        
        # Получаем production сертификат
        echo "🔐 Получаем production SSL сертификат..."
        docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $CERTBOT_EMAIL --agree-tos --no-eff-email -d $DOMAIN
        
        if [ $? -eq 0 ]; then
            echo "✅ Production сертификат получен успешно"
        else
            echo "⚠️  Не удалось получить production сертификат, используем staging"
        fi
    else
        echo "❌ Не удалось получить SSL сертификат"
        echo "Проверьте, что домен $DOMAIN указывает на этот сервер и порт 80 открыт"
    fi
    
    # Перезапускаем nginx для применения сертификата
    echo "🔄 Перезапускаем nginx..."
    docker-compose restart nginx
    
    echo "✅ Приложение запущено на https://$DOMAIN"
else
    echo "🏠 Домен не указан, запускаем локально на порту $HTTP_PORT"
    
    # Используем базовую конфигурацию nginx (без HTTPS)
    # nginx.conf уже настроен для локального запуска
    
    # Запускаем только приложение и nginx без certbot
    docker-compose up -d app nginx
    
    echo "✅ Приложение запущено на http://localhost:$HTTP_PORT"
fi

echo "📊 Статус сервисов:"
docker-compose ps 