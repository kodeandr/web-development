from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import asyncpg
import httpx
from datetime import datetime
import secrets
from database import get_db_pool           # <-- абсолютный импорт

app = FastAPI(title="Order Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCT_SERVICE_URL = "http://localhost:8000"

@app.on_event("startup")
async def startup():
    app.state.pool = await get_db_pool()

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

def generate_order_number():
    now = datetime.now().strftime("%y%m%d%H%M%S")
    suffix = secrets.token_hex(2)
    return f"ORD-{now}{suffix}"

@app.get("/orders")
async def list_orders(status_id: Optional[int] = None, limit: int = 50):
    async with app.state.pool.acquire() as conn:
        query = """
            SELECT o.order_number, o.created_at, o.customer_name, o.total_amount, os.name as status
            FROM orders o
            JOIN order_statuses os ON o.status_id = os.id
        """
        params = []
        if status_id is not None:
            query += " WHERE o.status_id = $1"
            params.append(status_id)
        query += " ORDER BY o.created_at DESC LIMIT $" + str(len(params)+1)
        params.append(limit)
        rows = await conn.fetch(query, *params)
        return {"items": [dict(r) for r in rows], "total": len(rows)}

@app.get("/orders/{order_number}")
async def get_order(order_number: str):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT o.*, os.name as status_name
            FROM orders o
            JOIN order_statuses os ON o.status_id = os.id
            WHERE o.order_number = $1
        """, order_number)
        if not row:
            raise HTTPException(404, "Order not found")
        items = await conn.fetch("SELECT * FROM order_items WHERE order_id = $1", row["id"])
        return {
            "order_number": row["order_number"],
            "status": row["status_name"],
            "customer_name": row["customer_name"],
            "customer_phone": row["customer_phone"],
            "customer_email": row["customer_email"],
            "delivery_address": row["delivery_address"],
            "payment_method": row["payment_method"],
            "total_amount": float(row["total_amount"]),
            "created_at": row["created_at"].isoformat(),
            "items": [dict(item) for item in items]
        }

@app.post("/orders", status_code=201)
async def create_order(order_data: dict):
    required = ["customer_name", "customer_phone", "customer_email", "delivery_address", "payment_method", "items"]
    for field in required:
        if field not in order_data:
            raise HTTPException(400, f"Missing field: {field}")
    items = order_data["items"]
    if not isinstance(items, list) or len(items) == 0:
        raise HTTPException(400, "Items must be a non-empty list")

    async with app.state.pool.acquire() as conn:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for item in items:
                prod_id = item["product_id"]
                qty = item["quantity"]
                resp = await client.get(f"{PRODUCT_SERVICE_URL}/products/{prod_id}")
                if resp.status_code != 200:
                    raise HTTPException(400, f"Product {prod_id} not found")
                product = resp.json()
                stock = product.get("stock_quantity", 0)
                if stock < qty:
                    raise HTTPException(400, f"Not enough stock for product {prod_id}. Available: {stock}")
                await client.put(f"{PRODUCT_SERVICE_URL}/products/{prod_id}", json={"stock_quantity": stock - qty})

        order_number = generate_order_number()
        total_amount = sum(item["quantity"] * item["price"] for item in items)

        order_id = await conn.fetchval("""
            INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_address, payment_method, total_amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        """, order_number, order_data["customer_name"], order_data["customer_phone"],
            order_data["customer_email"], order_data["delivery_address"], order_data["payment_method"], total_amount)

        for item in items:
            async with httpx.AsyncClient() as client:
                prod_resp = await client.get(f"{PRODUCT_SERVICE_URL}/products/{item['product_id']}")
                product_name = prod_resp.json().get("name", "Unknown")
            await conn.execute("""
                INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
                VALUES ($1, $2, $3, $4, $5)
            """, order_id, item["product_id"], product_name, item["price"], item["quantity"])

        return {"order_number": order_number, "total_amount": total_amount, "status": "new"}

@app.patch("/orders/{order_number}/status")
async def update_order_status(order_number: str, status_update: dict):
    status_id = status_update.get("status_id")
    if status_id is None:
        raise HTTPException(400, "Missing status_id")
    async with app.state.pool.acquire() as conn:
        result = await conn.execute("""
            UPDATE orders SET status_id = $1, updated_at = CURRENT_TIMESTAMP
            WHERE order_number = $2
        """, status_id, order_number)
        if result == "UPDATE 0":
            raise HTTPException(404, "Order not found")
        return {"message": "Status updated"}