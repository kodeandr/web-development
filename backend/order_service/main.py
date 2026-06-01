from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from schemas import OrderCreate, OrderStatusUpdate
from services import create_order, get_all_orders, get_order, update_order_status
from auth import verify_token
from database import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATUS_MAP = {
    "новый": 1,
    "в обработке": 2,
    "отправлен": 4,
    "доставлен": 5,
    "отменён": 6
}

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/orders")
async def list_orders(user=Depends(verify_token)):
    return {"items": await get_all_orders()}

@app.get("/orders/{order_number}")
async def get_single_order(order_number: str, user=Depends(verify_token)):
    order = await get_order(order_number)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order

@app.post("/orders", status_code=201)
async def place_order(order_data: OrderCreate):
    items_with_product = []
    async with httpx.AsyncClient() as client:
        for item in order_data.items:
            resp = await client.get(f"http://localhost:8000/products/{item.product_id}")
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

    try:
        order = await create_order(order_data, items_with_product)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/orders/{order_number}/status")
async def change_status(order_number: str, status_update: OrderStatusUpdate, user=Depends(verify_token)):
    allowed = ["новый", "в обработке", "отправлен", "доставлен", "отменён"]
    if status_update.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Допустимые статусы: {', '.join(allowed)}")

    new_id = STATUS_MAP.get(status_update.status)
    if new_id is None:
        raise HTTPException(status_code=400, detail="Неизвестный статус")

    updated = await update_order_status(order_number, new_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return updated

@app.get("/track/{order_number}")
async def track(order_number: str):
    order = await get_order(order_number)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)