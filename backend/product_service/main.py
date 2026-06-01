from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from schemas import ProductCreate
from services import get_all_products, get_product, create_product, update_product, delete_product, update_stock
from auth import verify_token
from database import init_db
from services import get_all_categories

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/categories")
async def get_categories():
    return await get_all_categories()

@app.get("/products")
async def list_products(
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    return await get_all_products(category_id, min_price, max_price)

@app.get("/products/{product_id}")
async def get_single_product(product_id: int):
    product = await get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product

@app.post("/products", status_code=201)
async def add_product(product: ProductCreate, user=Depends(verify_token)):
    return await create_product(product.dict())

@app.put("/products/{product_id}")
async def edit_product(product_id: int, product: ProductCreate, user=Depends(verify_token)):
    updated = await update_product(product_id, product.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return updated

@app.delete("/products/{product_id}", status_code=204)
async def remove_product(product_id: int, user=Depends(verify_token)):
    await delete_product(product_id)
    return None

@app.patch("/products/{product_id}/stock")
async def change_stock(product_id: int, quantity_change: int, user=Depends(verify_token)):
    try:
        product = await update_stock(product_id, quantity_change)
        return product
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)