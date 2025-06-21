# Настройка HSDS для HDF5 Visualizer

## 🔧 Настройка переменных окружения

Перед запуском необходимо отредактировать файл `.env` и указать ваши реальные данные Яндекс S3:

```bash
# HSDS Configuration
HSDS_USERNAME=admin
HSDS_PASSWORD=admin

# Yandex Cloud S3 Configuration  
AWS_ACCESS_KEY_ID=your_actual_access_key_here  # ЗАМЕНИТЕ на ваш ключ доступа
AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here  # ЗАМЕНИТЕ на ваш секретный ключ
AWS_REGION=ru-central1
AWS_S3_GATEWAY=https://storage.yandexcloud.net
BUCKET_NAME=wintori  # ЗАМЕНИТЕ на имя вашего bucket

# HSDS Cluster Configuration
RESTART_POLICY=unless-stopped
HEAD_RAM=512m
DN_RAM=512m
SN_RAM=512m
SN_CORES=1
DN_CORES=1
HEAD_PORT=5100:5100
DN_PORT=6101:6101
SN_PORT=5101
SN_PORT_RANGE=5101-5105
HSDS_ENDPOINT=http://localhost:5101
LOG_LEVEL=INFO
```

## 🏗️ Архитектура HSDS

Проект теперь использует правильную архитектуру HSDS с тремя узлами:

1. **hsds-head** (порт 5100) - головной узел, координирует работу
2. **hsds-dn** (порт 6101) - узел данных, обрабатывает запросы к данным
3. **hsds-sn** (порт 5101) - сервисный узел, API endpoint для клиентов

## 🚀 Запуск

1. Отредактируйте `.env` файл с вашими учетными данными S3
2. Убедитесь, что Docker и Docker Compose установлены
3. Запустите проект:

```bash
bash start.sh
```

Или вручную:

```bash
docker-compose up -d --build
```

## 🔍 Проверка работы

После запуска проверьте статус контейнеров:

```bash
docker-compose ps
```

Все три HSDS контейнера (hsds-head, hsds-dn, hsds-sn) должны быть в состоянии "Up".

## 🌐 Доступ

- **Frontend**: http://localhost (порт 80)
- **Backend API**: http://localhost:5001
- **HSDS API**: http://localhost:5101

## 📂 Конфигурационные файлы

- `admin/config/config.yml` - основная конфигурация HSDS
- `admin/config/passwd.txt` - файл с учетными данными (admin:admin)

## ❗ Важные замечания

1. **Замените учетные данные**: Обязательно укажите реальные AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY для вашего Яндекс S3
2. **Bucket**: Убедитесь, что указанный bucket существует в вашем S3
3. **Права доступа**: Убедитесь, что у ключей доступа есть права на чтение/запись в указанный bucket

## 🐛 Устранение неполадок

Если HSDS не запускается:

1. Проверьте логи: `docker-compose logs hsds-head hsds-dn hsds-sn`
2. Убедитесь, что все переменные в `.env` заполнены корректно
3. Проверьте доступность S3 и правильность учетных данных
4. Убедитесь, что указанный bucket существует

## 📈 Мониторинг

Для мониторинга состояния HSDS используйте:

```bash
# Логи всех HSDS контейнеров
docker-compose logs -f hsds-head hsds-dn hsds-sn

# Статус
docker-compose ps
``` 