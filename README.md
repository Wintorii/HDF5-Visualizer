# HDF5 Analytics Dashboard

Веб-приложение для визуализации HDF5 файлов с использованием React фронтенда и Flask бэкенда.

## 🚀 Быстрый старт

### Запуск всего проекта (рекомендуется)

Самый простой способ запустить весь проект:

```bash
# Клонируйте репозиторий
git clone https://github.com/Wintorii/HDF5-Visualizer.git

# Запустите проект с помощью скрипта
./start.sh
```

После запуска приложение будет доступно по адресу: **http://localhost**

### Альтернативный запуск через Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка всех сервисов
docker-compose down
```

## 🎨 Запуск только фронтенда

Если вы хотите работать только с фронтендом (например, для разработки UI), вы можете запустить его отдельно:

### Предварительные требования

- **Node.js** версии 18 или выше
- **npm** или **yarn**

### Установка зависимостей

```bash
cd frontend
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Фронтенд будет доступен по адресу: **http://localhost:5173**

### Другие команды для фронтенда

```bash
# Сборка для продакшена
npm run build

# Предварительный просмотр собранного приложения
npm run preview

# Проверка кода линтером
npm run lint
```

## 🏗️ Структура проекта

```
main/
├── frontend/          # React приложение
├── backend/           # Flask API
├── nginx/            # Nginx конфигурация
├── admin/            # Конфигурационные файлы
├── docker-compose.yml # Docker Compose конфигурация
└── start.sh          # Скрипт запуска
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корневой директории проекта:

```env
# HSDS настройки
HSDS_ENDPOINT=http://hsds-sn:5101
BUCKET_NAME=your-bucket-name
HSDS_USERNAME=your-username
HSDS_PASSWORD=your-password

# AWS настройки (если используется S3)
AWS_S3_GATEWAY=false
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Память для сервисов
HEAD_RAM=1g
SN_RAM=1g
DN_RAM=1g

# Количество ядер
SN_CORES=1
DN_CORES=1

# Порты
HEAD_PORT=5100
SN_PORT=5101
DN_PORT=6101

# Политика перезапуска
RESTART_POLICY=unless-stopped

# Уровень логирования
LOG_LEVEL=INFO
```

## 🐳 Docker сервисы

Проект включает следующие сервисы:

- **frontend** (порт 3007) - React приложение
- **backend** (порт 5001) - Flask API
- **hsds-head** (порт 5100) - HSDS головной узел
- **hsds-sn** (порт 5101) - HSDS сервисный узел
- **hsds-dn** (порт 6101) - HSDS узел данных
- **nginx** (порт 80) - Веб-сервер

## 🧪 Тестирование

### Тесты бэкенда

```bash
# Запуск тестов через Docker
docker-compose exec backend python manage.py test

# Или локально (если установлен Python)
cd backend
pip install -r requirements.txt
python manage.py test
```

## 📝 Разработка

### Работа с фронтендом

1. Перейдите в директорию `frontend/`
2. Установите зависимости: `npm install`
3. Запустите в режиме разработки: `npm run dev`
4. Откройте http://localhost:5173

### Работа с бэкендом

1. Перейдите в директорию `backend/`
2. Установите зависимости: `pip install -r requirements.txt`
3. Запустите Flask приложение: `python manage.py run`

## 🚨 Устранение неполадок

### Проблемы с портами

Если порты заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - 3008:5173  # Измените 3007 на 3008
```

### Проблемы с правами доступа

```bash
# На Linux/Mac дайте права на выполнение скрипта
chmod +x start.sh
```

### Очистка Docker

```bash
# Удаление всех контейнеров и образов
docker-compose down --rmi all --volumes --remove-orphans
```

## 📚 Дополнительная документация

- [HSDS Setup Guide](HSDS_SETUP.md)
- [Testing Guide](TESTING_GUIDE.md)
- [OpenAPI Specification](openapi.yaml)
