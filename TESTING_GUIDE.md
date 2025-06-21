# 🧪 Руководство по тестированию HDF5 Visualizer

## 📊 Статус контейнеров

Сначала проверьте, что все контейнеры запущены:
```bash
docker-compose ps
```

Должны быть активными:
- ✅ `vkr-backend-1` (порт 5001)
- ✅ `vkr-hsds-dn-1` (порт 6101) 
- ✅ `vkr-hsds-head-1` (порт 5100)
- ✅ `vkr-hsds-sn-1` (порт 5101)
- ✅ `vkr-frontend-1` (порт 3007)
- ✅ `vkr-nginx-1` (порт 80)

## 🌐 Web интерфейсы для браузера

### 1. Основное приложение
**URL:** http://localhost  
**Описание:** Главный интерфейс HDF5 Visualizer через Nginx

### 2. Frontend (разработка)
**URL:** http://localhost:3007  
**Описание:** React frontend в режиме разработки

### 3. Backend API документация
**URL:** http://localhost:5001/api/test  
**Описание:** Тест API backend

## 🔧 Тестирование HSDS (напрямую)

### 1. Проверка работы HSDS API
```bash
# Информация о сервере
curl http://localhost:5101/

# Список доменов (файлов)
curl -X GET "http://localhost:5101/domains" \
  -H "Authorization: Basic YWRtaW46YWRtaW4="
```

### 2. Создание тестового файла через HSDS
```bash
# Создать домен (файл)
curl -X PUT "http://localhost:5101/domains/test.h5" \
  -H "Authorization: Basic YWRtaW46YWRtaW4=" \
  -H "Content-Type: application/json"
```

## 🚀 Тестирование Backend API

### 1. Проверка API
```bash
# Тест работоспособности
curl http://localhost:5001/api/test

# Ответ должен быть:
# {"status": true, "data": null, "message": "Success"}
```

### 2. Список файлов в S3 через HSDS
```bash
# Получить список HDF5 файлов в S3
curl http://localhost:5001/api/list_s3_files

# Ответ:
# {"status": true, "data": [...], "message": "S3 files listed"}
```

### 3. Создание Mock HDF5 файла
```bash
# Создать тестовый HDF5 файл в S3
curl -X POST http://localhost:5001/api/generate_mock_hdf5 \
  -H "Content-Type: application/json" \
  -d '{"file_name": "test_data.hdf5"}'

# Ответ:
# {"status": true, "file_name": "test_data.hdf5", "message": "Mock HDF5 generated in S3"}
```

### 4. Получение структуры файла
```bash
# Структура HDF5 файла
curl -X POST http://localhost:5001/api/file_structure \
  -H "Content-Type: application/json" \
  -d '{"file_name": "test_data.hdf5"}'
```

### 5. Получение данных датасета
```bash
# Данные конкретного датасета
curl -X POST http://localhost:5001/api/get_dataset \
  -H "Content-Type: application/json" \
  -d '{"file_name": "test_data.hdf5", "dataset_path": "/Experiment1/temperature"}'
```

## 📂 Управление файловой системой

### 1. Дерево папок (локальное)
```bash
curl http://localhost:5001/api/directory_tree
```

### 2. Список файлов (локальные)
```bash
curl http://localhost:5001/api/get_file_names
```

### 3. Создание папки в S3
```bash
curl -X POST http://localhost:5001/api/s3_create_folder \
  -H "Content-Type: application/json" \
  -d '{"folder_path": "test_folder"}'
```

### 4. Список содержимого папки в S3
```bash
curl -X POST http://localhost:5001/api/s3_list_folder \
  -H "Content-Type: application/json" \
  -d '{"folder_path": ""}'
```

## 🔍 Отладка и логи

### Просмотр логов контейнеров
```bash
# Логи всех HSDS контейнеров
docker-compose logs hsds-head hsds-dn hsds-sn

# Логи backend
docker-compose logs backend

# Логи в реальном времени
docker-compose logs -f hsds-sn
```

### Проверка сетевого подключения
```bash
# Проверка портов
netstat -an | findstr "5100\|5101\|6101\|5001\|80"

# Ping к контейнерам (внутри Docker)
docker exec vkr-backend-1 ping hsds-sn
```

## ⚡ Быстрый тест всей системы

Выполните эти команды по порядку для полной проверки:

```bash
# 1. Проверка backend
curl http://localhost:5001/api/test

# 2. Создание тестового файла
curl -X POST http://localhost:5001/api/generate_mock_hdf5 \
  -H "Content-Type: application/json" \
  -d '{"file_name": "quick_test.hdf5"}'

# 3. Список файлов в S3
curl http://localhost:5001/api/list_s3_files

# 4. Структура созданного файла
curl -X POST http://localhost:5001/api/file_structure \
  -H "Content-Type: application/json" \
  -d '{"file_name": "quick_test.hdf5"}'

# 5. Получение данных
curl -X POST http://localhost:5001/api/get_dataset \
  -H "Content-Type: application/json" \
  -d '{"file_name": "quick_test.hdf5", "dataset_path": "/Experiment1/temperature"}'
```

## 🎯 Ожидаемые результаты

### ✅ Успешный тест:
- Все curl запросы возвращают `{"status": true, ...}`
- Frontend открывается по http://localhost
- Можно создавать, читать и управлять HDF5 файлами

### ❌ Если что-то не работает:

**Backend недоступен:**
```bash
docker-compose logs backend
```

**HSDS не отвечает:**
```bash
docker-compose logs hsds-sn hsds-head hsds-dn
```

**Ошибки S3:**
- Проверьте AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY в `.env`
- Убедитесь, что bucket существует
- Проверьте права доступа к bucket
