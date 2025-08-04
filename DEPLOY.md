# 🚀 Быстрое развертывание

## Локальный запуск (без домена)

1. Скопируйте переменные окружения:
```bash
cp env.example .env
```

2. Запустите приложение:
```bash
./scripts/deploy.sh
```

Приложение будет доступно на `http://localhost:80`

## Развертывание на домене с HTTPS

1. Настройте `.env` файл:
```env
DOMAIN=your-domain.com
CERTBOT_EMAIL=your-email@example.com
```

2. Убедитесь, что:
   - Домен указывает на IP вашего сервера
   - Порты 80 и 443 открыты
   - DNS записи настроены

3. Запустите:
```bash
./scripts/deploy.sh
```

Скрипт автоматически:
- Получит SSL сертификат от Let's Encrypt
- Настроит HTTPS редирект
- Запустит приложение на `https://your-domain.com`

## Управление

- **Остановка**: `./scripts/stop.sh`
- **Обновление SSL**: `./scripts/renew-ssl.sh`
- **Логи**: `docker-compose logs`
- **Статус**: `docker-compose ps`

## Архитектура

- **app** - Next.js приложение (порт 3000)
- **nginx** - Веб-сервер и прокси (порты 80/443)
- **certbot** - Автоматические SSL сертификаты

Подробная документация в `DOCKER_README.md` 