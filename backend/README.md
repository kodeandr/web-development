# Интернет-магазин лампочек — микросервисы товаров и заказов

## Описание проекта

Два микросервиса для интернет-магазина светодиодных ламп:
- **product-service** — управление товарами, категориями, остатками, изображениями.
- **order-service** — создание заказов, проверка остатков через product-service, изменение статуса заказов.

## Технологии
- Python 3.14+
- FastAPI
- asyncpg
- PostgreSQL
- Uvicorn

## Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone https://github.com/kodeandr/web-development.git
cd web-development
2. Создать и настроить базу данных PostgreSQL
sql
CREATE DATABASE lamp_shop;
Выполнить скрипт создания таблиц (содержится в init.sql).

3. Установить зависимости
bash
cd product_service
pip install -r requirements.txt
cd ../order_service
pip install -r requirements.txt
4. Запустить микросервисы
product-service (порт 8000):

bash
cd product_service
uvicorn main:app --reload --port 8000
order-service (порт 8001) — в другом терминале:

bash
cd order_service
uvicorn main:app --reload --port 8001
5. Тестирование в Postman
Импортируйте коллекции из папки postman_collections (примеры запросов).
Базовые эндпоинты:

GET /categories — список категорий

GET /products?category_id=1&min_price=100 — товары с фильтрацией

POST /products — создание товара (JSON)

POST /orders — создание заказа (JSON с массивом items)

PATCH /orders/{order_number}/status — изменение статуса

Структура репозитория
text
web-development/
├── product_service/
│   ├── main.py
│   ├── database.py
│   ├── schemas.py
│   └── requirements.txt
├── order_service/
│   ├── main.py
│   ├── database.py
│   ├── schemas.py
│   └── requirements.txt
├── init.sql                # скрипт создания таблиц
├── .gitignore
└── README.md
Видеодемонстрация
Ссылка на видео: https://disk.360.yandex.ru/i/6qVQQ3mtERzopg

Автор
Коробов Денис

text

### Как добавить README в Git

```powershell
# Из корневой папки проекта
echo "# web-development" > README.md   # если файла нет, или отредактируйте существующий
git add README.md
git commit -m "Add README"
git push origin main