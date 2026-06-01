from database import get_db

async def get_all_products(category_id=None, min_price=None, max_price=None):
    db = await get_db()
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    if category_id is not None:
        query += " AND category_id = ?"
        params.append(category_id)
    if min_price is not None:
        query += " AND price >= ?"
        params.append(min_price)
    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)
    query += " ORDER BY id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]

async def get_product(product_id: int):
    db = await get_db()
    cursor = await db.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None

async def create_product(data: dict):
    db = await get_db()
    cursor = await db.execute(
        """INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (data["name"], data.get("description", ""), data["price"],
         data.get("stock_quantity", 0), data.get("category_id", 1), data.get("image_url", ""))
    )
    await db.commit()
    new_id = cursor.lastrowid
    await db.close()
    return await get_product(new_id)

async def update_product(product_id: int, data: dict):
    db = await get_db()
    await db.execute(
        """UPDATE products
           SET name=?, description=?, price=?, stock_quantity=?, category_id=?, image_url=?
           WHERE id=?""",
        (data["name"], data.get("description", ""), data["price"],
         data.get("stock_quantity", 0), data.get("category_id", 1),
         data.get("image_url", ""), product_id)
    )
    await db.commit()
    await db.close()
    return await get_product(product_id)

async def delete_product(product_id: int):
    db = await get_db()
    await db.execute("DELETE FROM products WHERE id=?", (product_id,))
    await db.commit()
    await db.close()

async def update_stock(product_id: int, quantity_change: int):
    db = await get_db()
    cursor = await db.execute("SELECT stock_quantity FROM products WHERE id=?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        await db.close()
        return None
    new_stock = row["stock_quantity"] + quantity_change
    if new_stock < 0:
        await db.close()
        raise ValueError("Недостаточно товара")
    await db.execute("UPDATE products SET stock_quantity=? WHERE id=?", (new_stock, product_id))
    await db.commit()
    await db.close()
    return await get_product(product_id)

async def get_all_categories():
    db = await get_db()
    cursor = await db.execute("SELECT id, name FROM categories ORDER BY id")
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]