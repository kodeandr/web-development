from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from schemas import ProductCreate
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

# ---------- Публичные эндпоинты (без авторизации) ----------
@app.get("/categories")
async def get_categories():
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        categories = await conn.fetch("SELECT * FROM categories ORDER BY id")
    return [dict(cat) for cat in categories]

@app.get("/products")
async def list_products(
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        if category_id is not None:
            query += " AND category_id = $1"
            params.append(category_id)
        if min_price is not None:
            query += f" AND price >= ${len(params)+1}"
            params.append(min_price)
        if max_price is not None:
            query += f" AND price <= ${len(params)+1}"
            params.append(max_price)
        query += " ORDER BY id"
        rows = await conn.fetch(query, *params)
    return [dict(row) for row in rows]

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM products WHERE id = $1", product_id)
        if not row:
            raise HTTPException(status_code=404, detail="Товар не найден")
    return dict(row)

# ---------- Приватные эндпоинты (только с JWT) ----------
@app.post("/products", status_code=201)
async def create_product(product: ProductCreate, user=Depends(verify_token)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        query = """
        INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """
        row = await conn.fetchrow(
            query,
            product.name,
            product.description,
            product.price,
            product.stock_quantity,
            product.category_id,
            product.image_url
        )
    return dict(row)

@app.put("/products/{product_id}")
async def update_product(product_id: int, product: ProductCreate, user=Depends(verify_token)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM products WHERE id = $1", product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Товар не найден")

        query = """
        UPDATE products
        SET name = $1, description = $2, price = $3, stock_quantity = $4,
            category_id = $5, image_url = $6
        WHERE id = $7
        RETURNING *
        """
        row = await conn.fetchrow(
            query,
            product.name,
            product.description,
            product.price,
            product.stock_quantity,
            product.category_id,
            product.image_url,
            product_id
        )
    return dict(row)

@app.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, user=Depends(verify_token)):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM products WHERE id = $1", product_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Товар не найден")
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)