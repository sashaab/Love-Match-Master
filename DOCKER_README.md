# Развертывание с Docker Compose

Этот проект поддерживает развертывание как на домене с HTTPS, так и локально на порту.

## Быстрый старт

### 1. Настройка переменных окружения

Скопируйте файл с примерами переменных:
```bash
cp env.example .env
```

Отредактируйте `.env` файл:

#### Для развертывания на домене с HTTPS:
```env
DOMAIN=your-domain.com
CERTBOT_EMAIL=your-email@example.com
HTTP_PORT=80
HTTPS_PORT=443
```

#### Для локального запуска без HTTPS:
```env
DOMAIN=
CERTBOT_EMAIL=admin@example.com
HTTP_PORT=8080
HTTPS_PORT=8443
```

### 2. Запуск приложения

Используйте скрипт для автоматического развертывания:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Или запустите вручную:
```bash
docker-compose up -d
```

### 3. Остановка приложения

```bash
chmod +x scripts/stop.sh
./scripts/stop.sh
```

Или вручную:
```bash
docker-compose down
```

## Архитектура

Проект использует следующую архитектуру:

- **app** - Next.js приложение (порт 3000)
- **nginx** - Веб-сервер и прокси (порты 80/443)
- **certbot** - Автоматическое получение SSL сертификатов Let's Encrypt

## Настройка домена

### 1. Подготовка домена

Убедитесь, что:
- Домен указывает на IP-адрес вашего сервера
- Порты 80 и 443 открыты в файрволе
- DNS записи настроены правильно

### 2. Настройка .env файла

```env
DOMAIN=your-domain.com
CERTBOT_EMAIL=your-email@example.com
```

### 3. Запуск с HTTPS

```bash
./scripts/deploy.sh
```

Скрипт автоматически:
- Запустит все сервисы
- Получит SSL сертификат от Let's Encrypt
- Настроит HTTPS редирект

## Локальный запуск

Для разработки или тестирования без домена:

```env
DOMAIN=
HTTP_PORT=8080
```

```bash
./scripts/deploy.sh
```

Приложение будет доступно на `http://localhost:8080`

## Обновление SSL сертификатов

Let's Encrypt сертификаты автоматически обновляются каждые 60 дней. Для ручного обновления:

```bash
chmod +x scripts/renew-ssl.sh
./scripts/renew-ssl.sh
```

## Мониторинг

Проверить статус сервисов:
```bash
docker-compose ps
```

Просмотр логов:
```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs app
docker-compose logs nginx
docker-compose logs certbot
```

## Устранение неполадок

### Проблемы с SSL сертификатами

1. Проверьте, что домен правильно настроен:
```bash
nslookup your-domain.com
```

2. Убедитесь, что порты 80 и 443 открыты:
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

3. Проверьте логи certbot:
```bash
docker-compose logs certbot
```

### Проблемы с nginx

1. Проверьте конфигурацию:
```bash
docker-compose exec nginx nginx -t
```

2. Перезапустите nginx:
```bash
docker-compose restart nginx
```

### Проблемы с приложением

1. Проверьте логи приложения:
```bash
docker-compose logs app
```

2. Пересоберите образ:
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DOMAIN` | Домен для HTTPS | - |
| `CERTBOT_EMAIL` | Email для Let's Encrypt | admin@example.com |
| `HTTP_PORT` | Порт для HTTP | 80 |
| `HTTPS_PORT` | Порт для HTTPS | 443 |
| `NODE_ENV` | Окружение Node.js | production |

## Безопасность

- Все HTTP запросы автоматически перенаправляются на HTTPS
- Настроены security headers (HSTS, X-Frame-Options, etc.)
- Используются современные SSL/TLS протоколы
- Сертификаты автоматически обновляются 