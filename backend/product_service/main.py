from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from typing import Optional, List
import asyncpg
import uuid
import os
import shutil
from pydantic import BaseModel

app = FastAPI(title="Product Service", version="1.0")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

@app.on_event("startup")
async def startup():
    app.state.pool = await asyncpg.create_pool(DATABASE_URL)

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

# Модель для создания товара
class ProductCreate(BaseModel):
    category_id: int
    sku: str
    name: str
    description: Optional[str] = None
    power_watt: int
    lumen: Optional[int] = None
    color_temp_k: Optional[int] = None
    life_hours: Optional[int] = None
    price: float
    stock_quantity: int = 0

@app.get("/categories")
async def get_categories():
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name FROM categories ORDER BY id")
        return [dict(row) for row in rows]

@app.get("/products")
async def list_products(
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20,
    offset: int = 0
):
    async with app.state.pool.acquire() as conn:
        query = """
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
        """
        params = []
        if category_id is not None:
            query += f" AND p.category_id = ${len(params)+1}"
            params.append(category_id)
        if min_price is not None:
            query += f" AND p.price >= ${len(params)+1}"
            params.append(min_price)
        if max_price is not None:
            query += f" AND p.price <= ${len(params)+1}"
            params.append(max_price)
        
        count_query = f"SELECT COUNT(*) FROM ({query}) AS filtered"
        total = await conn.fetchval(count_query, *params)
        
        query += f" ORDER BY p.id LIMIT ${len(params)+1} OFFSET ${len(params)+2}"
        params.extend([limit, offset])
        rows = await conn.fetch(query, *params)
        
        return {
            "items": [dict(row) for row in rows],
            "total": total,
            "limit": limit,
            "offset": offset
        }

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
        images_rows = await conn.fetch("SELECT id, product_id, image_url, is_main FROM product_images WHERE product_id = $1 ORDER BY is_main DESC", product_id)
        product["images"] = [dict(img) for img in images_rows]
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
        sets = []
        values = []
        for key, value in updates.items():
            sets.append(f"{key} = ${len(values)+1}")
            values.append(value)
        values.append(product_id)
        query = f"UPDATE products SET {', '.join(sets)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${len(values)}"
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
async def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    is_main: bool = Form(False)
):
    # Проверяем существование товара
    async with app.state.pool.acquire() as conn:
        exists = await conn.fetchval("SELECT id FROM products WHERE id = $1", product_id)
        if not exists:
            raise HTTPException(404, "Product not found")
    
    # Формируем безопасное имя файла
    safe_filename = f"{uuid.uuid4()}_{file.filename.replace(' ', '_')}"
    filepath = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Сохраняем файл
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(500, f"Failed to save file: {str(e)}")
    
    # Сохраняем запись в БД
    image_url = f"/uploads/{safe_filename}"   # будет доступно по этому URL, если настроить статику
    async with app.state.pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO product_images (product_id, image_url, is_main)
            VALUES ($1, $2, $3)
        """, product_id, image_url, is_main)
        # Если is_main = True, сбрасываем флаг у других изображений
        if is_main:
            await conn.execute("""
                UPDATE product_images SET is_main = false
                WHERE product_id = $1 AND id != (
                    SELECT id FROM product_images
                    WHERE product_id = $1 AND is_main = true
                    LIMIT 1
                )
            """, product_id)
    
    return {"image_url": image_url, "message": "Image uploaded"}