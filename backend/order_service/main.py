from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime
from schemas import OrderCreate, OrderStatusUpdate
from database import get_db_pool
from auth import verify_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCT_SERVICE_URL = "http://localhost:8000/products"

# Соответствие русских статусов ID в таблице order_statuses
STATUS_MAP = {
    "новый": 1,
    "в обработке": 2,
    "отправлен": 4,
    "доставлен": 5,
    "завершён": 5,
    "отменён": 6
}

REVERSE_STATUS_MAP = {
    1: "новый",
    2: "в обработке",
    4: "отправлен",
    5: "доставлен",
    6: "отменён"
}

async def check_stock_and_reserve(items):
    async with httpx.AsyncClient() as client:
        for item in items:
            resp = await client.get(f"{PRODUCT_SERVICE_URL}/{item.product_id}")
            if resp.status_code != 200:
                raise HTTPException(status_code=404, detail=f"Товар с id {item.product_id} не найден")
            product = resp.json()
            if product["stock_quantity"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Недостаточно товара {product['name']}")

# ========== Приватные эндпоинты (администратор) ==========
@app.get("/orders")
async def list_orders(user=Depends(verify_token)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT o.*, os.name as status_name
            FROM orders o
            JOIN order_statuses os ON o.status_id = os.id
            ORDER BY o.created_at DESC
        """)
    orders = []
    for row in rows:
        order = dict(row)
        status_id = order["status_id"]
        order.pop("status_name", None)
        order["status"] = REVERSE_STATUS_MAP.get(status_id, "новый")
        async with pool.acquire() as conn:
            items_rows = await conn.fetch(
                "SELECT * FROM order_items WHERE order_id = $1", order["id"]
            )
        order["items"] = [dict(it) for it in items_rows]
        orders.append(order)
    return {"items": orders}

@app.get("/orders/{order_number}")
async def get_order(order_number: str, user=Depends(verify_token)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        order = await conn.fetchrow(
            "SELECT o.*, os.name as status_name FROM orders o JOIN order_statuses os ON o.status_id = os.id WHERE o.order_number = $1",
            order_number
        )
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        result = dict(order)
        status_id = result["status_id"]
        result.pop("status_name", None)
        result["status"] = REVERSE_STATUS_MAP.get(status_id, "новый")
        items_rows = await conn.fetch(
            "SELECT * FROM order_items WHERE order_id = $1", result["id"]
        )
        result["items"] = [dict(it) for it in items_rows]
    return result

# ========== Публичный эндпоинт (покупатель) ==========
@app.post("/orders", status_code=201)
async def create_order(order_data: OrderCreate):
    # Шаг 1: проверяем наличие и получаем актуальные цены / названия из product_service
    items_with_product = []
    async with httpx.AsyncClient() as client:
        for item in order_data.items:
            resp = await client.get(f"{PRODUCT_SERVICE_URL}/{item.product_id}")
            if resp.status_code != 200:
                raise HTTPException(status_code=404, detail=f"Товар с id {item.product_id} не найден")
            product = resp.json()
            if product["stock_quantity"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Недостаточно товара {product['name']}")
            items_with_product.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": float(product["price"]),
                "name": product["name"]
            })

    # Вычисляем общую сумму на основе реальных цен
    total = sum(it["price"] * it["quantity"] for it in items_with_product)

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        order = await conn.fetchrow(
            """INSERT INTO orders (order_number, status_id, customer_name, customer_phone,
               customer_email, delivery_address, payment_method, total_amount)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *""",
            order_number, 1,  # статус "новый"
            order_data.customer_name,
            order_data.customer_phone,
            order_data.customer_email,
            order_data.delivery_address,
            order_data.payment_method,
            total
        )

        for it in items_with_product:
            await conn.execute(
                """INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
                   VALUES ($1, $2, $3, $4, $5)""",
                order["id"],
                it["product_id"],
                it["name"],
                it["price"],
                it["quantity"]
            )

    # Ответ собираем на основе реальных данных
    result = dict(order)
    result["status"] = "новый"
    result["items"] = [
        {
            "product_id": it["product_id"],
            "product_name": it["name"],
            "product_price": it["price"],
            "quantity": it["quantity"],
            "total": it["price"] * it["quantity"]
        }
        for it in items_with_product
    ]
    return result

@app.patch("/orders/{order_number}/status")
async def update_order_status(
    order_number: str,
    status_update: OrderStatusUpdate,
    user=Depends(verify_token)
):
    allowed_statuses = ["новый", "в обработке", "отправлен", "доставлен", "отменён"]
    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый статус. Разрешены: {', '.join(allowed_statuses)}"
        )

    new_status_id = STATUS_MAP.get(status_update.status)
    if new_status_id is None:
        raise HTTPException(status_code=400, detail="Неизвестный статус")

    pool = await get_db_pool()
    async with pool.acquire() as conn:
        order = await conn.fetchrow(
            "SELECT * FROM orders WHERE order_number = $1", order_number
        )
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")

        updated = await conn.fetchrow(
            "UPDATE orders SET status_id = $1 WHERE order_number = $2 RETURNING *",
            new_status_id, order_number
        )

    result = dict(updated)
    result["status"] = REVERSE_STATUS_MAP.get(new_status_id, status_update.status)

    async with pool.acquire() as conn:
        items_rows = await conn.fetch(
            "SELECT * FROM order_items WHERE order_id = $1", result["id"]
        )
    result["items"] = [dict(it) for it in items_rows]
    return result

# ========== Публичный эндпоинт для отслеживания заказа (без JWT) ==========
@app.get("/track/{order_number}")
async def track_order(order_number: str):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        order = await conn.fetchrow(
            """SELECT o.order_number, o.status_id, o.created_at, o.total_amount
               FROM orders o
               WHERE o.order_number = $1""",
            order_number
        )
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")

        items_rows = await conn.fetch(
            """SELECT product_name, quantity, product_price
               FROM order_items
               WHERE order_id = (SELECT id FROM orders WHERE order_number = $1)""",
            order_number
        )

    # Преобразуем status_id в русское название через словарь
    status_name = REVERSE_STATUS_MAP.get(order["status_id"], "неизвестно")

    result = {
        "order_number": order["order_number"],
        "status": status_name,
        "created_at": order["created_at"].isoformat(),
        "total_amount": float(order["total_amount"]),
        "items": [
            {
                "name": it["product_name"],
                "quantity": it["quantity"],
                "price": float(it["product_price"])
            }
            for it in items_rows
        ]
    }
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)