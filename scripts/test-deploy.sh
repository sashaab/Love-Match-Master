#!/bin/bash

# Скрипт для тестирования развертывания без HTTPS

set -e

echo "🧪 Тестовое развертывание без HTTPS..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Создаем .env файл из примера..."
    cp env.example .env
    echo "Пожалуйста, отредактируйте .env файл"
    exit 1
fi

# Загружаем переменные из .env
source .env

echo "📝 Домен: ${DOMAIN:-не указан}"

# Останавливаем все контейнеры
echo "🛑 Останавливаем все контейнеры..."
docker-compose down

# Используем простую конфигурацию nginx
echo "📝 Используем простую конфигурацию nginx..."
cp nginx-simple.conf nginx.conf

# Запускаем только приложение и nginx
echo "🚀 Запускаем приложение и nginx..."
docker-compose up -d app nginx

# Ждем запуска
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

# Проверяем логи
echo "📋 Логи nginx:"
docker-compose logs nginx

echo "📋 Логи приложения:"
docker-compose logs app

echo ""
echo "✅ Тестовое развертывание завершено"
echo "🌐 Приложение должно быть доступно на http://localhost:80"
echo "🌐 Или на http://${DOMAIN:-localhost}:80 (если домен настроен)" 