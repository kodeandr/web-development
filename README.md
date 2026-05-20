# Панель управления интернет-магазина (микросервисная архитектура)

Учебный проект по курсу «Веб-разработка».  
Реализована панель администратора с аутентификацией через JWT, управлением товарами и заказами.  
Frontend: React + Bootstrap 5.3.  
Backend: FastAPI (Python) для сервисов товаров и заказов, Express (Node.js) для сервиса аутентификации.

## Структура проекта
├── auth_service/ # Сервис аутентификации (Node.js + Express)
│ ├── server.js
│ └── package.json
├── backend/
│ ├── product_service/ # Сервис товаров (FastAPI)
│ │ ├── main.py
│ │ ├── auth.py
│ │ ├── database.py
│ │ ├── schemas.py
│ │ └── requirements.txt
│ └── order_service/ # Сервис заказов (FastAPI)
│ ├── main.py
│ ├── auth.py
│ ├── database.py
│ ├── schemas.py
│ └── requirements.txt
├── frontend/ # React-приложение (Vite + Bootstrap 5.3)
│ ├── src/
│ │ ├── pages/
│ │ ├── contexts/
│ │ ├── api/
│ │ └── ...
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
├── uploads/ # Загруженные изображения (опционально)
└── README.md

text

## Требования

- **Node.js** (версия 16+)
- **Python** (версия 3.10+)
- **PostgreSQL** (версия 14+)
- База данных `lamp_shop` с таблицами согласно схеме (см. файлы `database.py`)

## Установка и запуск

### 1. Клонирование репозитория

git clone https://github.com/kodeandr/web-development.git
cd web-development
2. Настройка базы данных
Убедитесь, что PostgreSQL запущен, и база lamp_shop существует.
Пользователь: postgres, пароль: 123 (при необходимости измените в database.py сервисов).

3. Сервис аутентификации (порт 3001)
bash
cd auth_service
npm install
npm start
4. Сервис товаров (порт 8000)
bash
cd backend/product_service
pip install -r requirements.txt
python main.py
5. Сервис заказов (порт 8001)
bash
cd backend/order_service
pip install -r requirements.txt
python main.py
6. Фронтенд (порт 5173)
bash
cd frontend
npm install
npm run dev
Откройте браузер и перейдите по адресу http://localhost:5173.

Учётные данные администратора (по умолчанию)
Логин: admin

Пароль: admin123

Основные сценарии использования
Покупатель (без авторизации)
Просмотр каталога товаров

Фильтрация по категории и цене

Добавление товаров в корзину

Оформление заказа (POST /orders публичный)

Администратор (требуется вход)
Перейдите на /login и войдите.

После успешного входа открывается панель /admin с вкладками «Товары» и «Заказы».

Товары:

Просмотр списка товаров (GET /products с JWT)

Добавление нового товара (POST /products)

Редактирование товара (PUT /products/:id)

Удаление товара (DELETE /products/:id)

Заказы:

Просмотр списка заказов (GET /orders)

Изменение статуса заказа (PATCH /orders/:order_number/status)

Выход: кнопка «Выйти» удаляет JWT и перенаправляет на страницу входа.

Все защищённые эндпоинты требуют заголовок Authorization: Bearer <JWT>.
При отсутствии или невалидном токене возвращается 401 Unauthorized.

API Endpoints
auth_service (Express)
POST /login – аутентификация, возвращает JWT.

POST /register – регистрация нового администратора (опционально).

product_service (FastAPI)
GET /products – список товаров (публичный)

GET /products/{id} – детали товара (публичный)

POST /products – создать товар (JWT)

PUT /products/{id} – обновить товар (JWT)

DELETE /products/{id} – удалить товар (JWT)

GET /categories – список категорий (публичный)

order_service (FastAPI)
GET /orders – список заказов (JWT)

GET /orders/{order_number} – детали заказа (JWT)

POST /orders – создать заказ (публичный)

PATCH /orders/{order_number}/status – сменить статус (JWT)
