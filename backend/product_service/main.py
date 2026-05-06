from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
import asyncpg
import uuid
import os
import shutil
from schemas import ProductCreate          # <-- абсолютный импорт
from database import get_db_pool           # <-- абсолютный импорт

app = FastAPI(title="Product Service")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтируем папку для раздачи изображений
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup():
    app.state.pool = await get_db_pool()

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

@app.get("/categories")
async def get_categories():
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name FROM categories ORDER BY id")
        return [dict(row) for row in rows]

@app.get("/products")
async def list_products(
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    async with app.state.pool.acquire() as conn:
        query = """
            SELECT p.*, c.name as category_name,
                   (SELECT pi.image_url FROM product_images pi
                    WHERE pi.product_id = p.id AND pi.is_main = true
                    LIMIT 1) AS main_image_url
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
        """
        params = []
        param_idx = 1
        if category_id is not None:
            query += f" AND p.category_id = ${param_idx}"
            params.append(category_id)
            param_idx += 1
        if min_price is not None:
            query += f" AND p.price >= ${param_idx}"
            params.append(min_price)
            param_idx += 1
        if max_price is not None:
            query += f" AND p.price <= ${param_idx}"
            params.append(max_price)
            param_idx += 1
        query += " ORDER BY p.id"
        rows = await conn.fetch(query, *params)
        products = []
        for row in rows:
            product = dict(row)
            main_url = product.pop("main_image_url", None)
            product["images"] = [{"image_url": main_url, "is_main": True}] if main_url else []
            products.append(product)
        return products

@app.get("/products/{product_id}")
async def get_product(product_id: int):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1 AND p.is_active = true
        """, product_id)
        if not row:
            raise HTTPException(404, "Product not found")
        product = dict(row)
        images = await conn.fetch(
            "SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_main DESC",
            product_id
        )
        product["images"] = [dict(img) for img in images]
        return product

@app.post("/products", status_code=201)
async def create_product(product: ProductCreate):
    async with app.state.pool.acquire() as conn:
        try:
            row = await conn.fetchrow("""
                INSERT INTO products (category_id, sku, name, description, power_watt, lumen, color_temp_k, life_hours, price, stock_quantity)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            """, product.category_id, product.sku, product.name, product.description,
               product.power_watt, product.lumen, product.color_temp_k, product.life_hours,
               product.price, product.stock_quantity)
            return {"id": row["id"], "message": "Product created"}
        except Exception as e:
            raise HTTPException(400, detail=str(e))

@app.put("/products/{product_id}")
async def update_product(product_id: int, updates: dict):
    async with app.state.pool.acquire() as conn:
        exists = await conn.fetchval("SELECT id FROM products WHERE id = $1", product_id)
        if not exists:
            raise HTTPException(404, "Product not found")
        if not updates:
            raise HTTPException(400, "No fields to update")
        set_parts = []
        values = []
        for key, value in updates.items():
            set_parts.append(f"{key} = ${len(values)+1}")
            values.append(value)
        values.append(product_id)
        query = f"UPDATE products SET {', '.join(set_parts)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${len(values)}"
        await conn.execute(query, *values)
        return {"message": "Product updated"}

@app.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int):
    async with app.state.pool.acquire() as conn:
        result = await conn.execute("UPDATE products SET is_active = false WHERE id = $1", product_id)
        if result == "UPDATE 0":
            raise HTTPException(404, "Product not found")
        return None

@app.post("/products/{product_id}/images", status_code=201)
async def upload_image(product_id: int, file: UploadFile = File(...), is_main: bool = Form(False)):
    safe_filename = f"{uuid.uuid4()}_{re.sub(r'[^\w\-.]', '_', file.filename)}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    image_url = f"http://localhost:8000/uploads/{safe_filename}"
    async with app.state.pool.acquire() as conn:
        exists = await conn.fetchval("SELECT id FROM products WHERE id = $1", product_id)
        if not exists:
            raise HTTPException(404, "Product not found")
        await conn.execute("""
            INSERT INTO product_images (product_id, image_url, is_main)
            VALUES ($1, $2, $3)
        """, product_id, image_url, is_main)
        if is_main:
            await conn.execute("""
                UPDATE product_images SET is_main = false
                WHERE product_id = $1
            """, product_id)
    return {"image_url": image_url}