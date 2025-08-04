#!/bin/bash

# Скрипт для ручного включения HTTPS

set -e

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден"
    exit 1
fi

# Загружаем переменные
source .env

if [ -z "$DOMAIN" ]; then
    echo "❌ Домен не указан в .env файле"
    exit 1
fi

echo "🔒 Включаем HTTPS для домена: $DOMAIN"

# Создаем полную конфигурацию с HTTPS
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # HTTP - редирект на HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files \$uri =404;
        }
        
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # HTTPS конфигурация
    server {
        listen 443 ssl;
        http2 on;
        server_name $DOMAIN;
        
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        # SSL настройки
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Безопасность
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF

echo "✅ HTTPS конфигурация создана"

# Перезапускаем nginx
echo "🔄 Перезапускаем nginx..."
docker-compose restart nginx

echo "✅ HTTPS включен для домена: $DOMAIN"
echo "🌐 Приложение доступно на https://$DOMAIN" 