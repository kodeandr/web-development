import httpx
from datetime import datetime
from database import get_db

PRODUCT_SERVICE_URL = "http://localhost:8000/products"

STATUS_MAP = {
    "новый": 1,
    "в обработке": 2,
    "отправлен": 4,
    "доставлен": 5,
    "отменён": 6
}

REVERSE_STATUS_MAP = {v: k for k, v in STATUS_MAP.items()}

async def create_order(order_data, items_with_product):
    db = await get_db()
    total = sum(it["price"] * it["quantity"] for it in items_with_product)
    order_number = f"ORD-{datetime.now().strftime('%m%d%H%M%S')}"

    cursor = await db.execute(
        """INSERT INTO orders (order_number, status_id, customer_name, customer_phone,
           customer_email, delivery_address, payment_method, total_amount)
           VALUES (?, 1, ?, ?, ?, ?, ?, ?)""",
        (order_number, order_data.customer_name, order_data.customer_phone,
         order_data.customer_email, order_data.delivery_address,
         order_data.payment_method, total)
    )
    order_id = cursor.lastrowid

    for it in items_with_product:
        await db.execute(
            "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) "
            "VALUES (?, ?, ?, ?, ?)",
            (order_id, it["product_id"], it["name"], it["price"], it["quantity"])
        )

    await db.commit()
    cursor = await db.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = await cursor.fetchone()
    order = dict(order)

    # Списываем остатки через product_service
    async with httpx.AsyncClient() as client:
        for it in items_with_product:
            await client.patch(
                f"{PRODUCT_SERVICE_URL}/{it['product_id']}/stock?quantity_change=-{it['quantity']}"
            )

    cursor = await db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items_rows = await cursor.fetchall()
    order["items"] = [dict(it) for it in items_rows]
    order["status"] = "новый"
    await db.close()
    return order

async def get_all_orders():
    db = await get_db()
    cursor = await db.execute(
        """SELECT o.*, os.name as status_name
           FROM orders o
           JOIN order_statuses os ON o.status_id = os.id
           ORDER BY o.created_at DESC"""
    )
    rows = await cursor.fetchall()
    orders = []
    for row in rows:
        order = dict(row)
        order["status"] = REVERSE_STATUS_MAP.get(order["status_id"], row["status_name"])
        cursor_items = await db.execute(
            "SELECT product_name, product_price, quantity FROM order_items WHERE order_id = ?",
            (order["id"],)
        )
        items = await cursor_items.fetchall()
        order["items"] = [
            {
                "name": it["product_name"],
                "price": it["product_price"],
                "quantity": it["quantity"]
            }
            for it in items
        ]
        orders.append(order)
    await db.close()
    return orders

async def get_order(order_number: str):
    db = await get_db()
    cursor = await db.execute(
        "SELECT o.*, os.name as status_name FROM orders o "
        "JOIN order_statuses os ON o.status_id = os.id "
        "WHERE o.order_number = ?",
        (order_number,)
    )
    row = await cursor.fetchone()
    if not row:
        await db.close()
        return None
    order = dict(row)
    # Конвертируем статус в русский через ID
    order["status"] = REVERSE_STATUS_MAP.get(order["status_id"], row["status_name"])
    # Получаем товары
    cursor_items = await db.execute(
        "SELECT product_name, product_price, quantity FROM order_items WHERE order_id = ?",
        (order["id"],)
    )
    items = await cursor_items.fetchall()
    # Приводим товары к удобному для фронтенда виду
    order["items"] = [
        {
            "name": it["product_name"],
            "price": it["product_price"],
            "quantity": it["quantity"]
        }
        for it in items
    ]
    await db.close()
    return order

async def update_order_status(order_number: str, new_status_id: int):
    db = await get_db()
    await db.execute("UPDATE orders SET status_id = ? WHERE order_number = ?",
                     (new_status_id, order_number))
    await db.commit()
    await db.close()
    return await get_order(order_number)