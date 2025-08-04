# 🖥️ Настройка сервера для развертывания

## Предварительные требования

### 1. Установка Docker и Docker Compose

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# Включить и запустить Docker
sudo systemctl enable docker
sudo systemctl start docker

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER
```

### 2. Настройка файрвола

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### 3. Настройка DNS

Убедитесь, что ваш домен указывает на IP-адрес сервера:

```bash
# Проверка DNS
nslookup your-domain.com
```

## Развертывание на сервере

### 1. Клонирование репозитория

```bash
git clone git@github.com:Celebricy-team/celebricy-game.git
cd celebricy-game
```

### 2. Настройка переменных окружения

```bash
cp env.example .env
nano .env
```

Укажите ваш домен и email:
```env
DOMAIN=your-domain.com
CERTBOT_EMAIL=your-email@example.com
```

### 3. Проверка состояния сервера

```bash
./scripts/check-server.sh
```

### 4. Запуск приложения

```bash
./scripts/deploy.sh
```

## Устранение неполадок

### Проблема: "Connection refused" при получении SSL

**Причины:**
- Порт 80 заблокирован файрволом
- Приложение не запущено
- Неправильная настройка DNS

**Решение:**
1. Проверьте файрвол:
```bash
sudo ufw status
# или
sudo firewall-cmd --list-ports
```

2. Убедитесь, что приложение запущено:
```bash
docker-compose ps
```

3. Проверьте логи:
```bash
docker-compose logs nginx
docker-compose logs app
```

### Проблема: DNS не разрешается

**Решение:**
1. Проверьте настройки DNS в панели управления доменом
2. Убедитесь, что A-запись указывает на правильный IP
3. Подождите обновления DNS (может занять до 24 часов)

### Проблема: Сертификат не обновляется

**Решение:**
```bash
./scripts/renew-ssl.sh
```

## Мониторинг

### Просмотр логов

```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs nginx
docker-compose logs app
docker-compose logs certbot

# Логи в реальном времени
docker-compose logs -f
```

### Статус сервисов

```bash
docker-compose ps
```

### Перезапуск сервисов

```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart nginx
```

## Автоматическое обновление

Для автоматического обновления SSL сертификатов добавьте в crontab:

```bash
# Открыть crontab
crontab -e

# Добавить строку для обновления каждые 12 часов
0 */12 * * * cd /path/to/celebricy-game && ./scripts/renew-ssl.sh
```

## Безопасность

### Рекомендации:

1. **Регулярные обновления:**
```bash
docker-compose pull
docker-compose up -d
```

2. **Резервное копирование:**
```bash
# Создать бэкап
tar -czf backup-$(date +%Y%m%d).tar.gz .env ssl/ certbot-etc/ certbot-var/
```

3. **Мониторинг ресурсов:**
```bash
docker stats
```

## Поддержка

При возникновении проблем:

1. Запустите диагностику: `./scripts/check-server.sh`
2. Проверьте логи: `docker-compose logs`
3. Убедитесь, что все порты открыты
4. Проверьте настройки DNS 