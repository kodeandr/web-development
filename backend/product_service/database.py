import aiosqlite

DATABASE = "products.db"

async def get_db():
    db = await aiosqlite.connect(DATABASE)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    db = await get_db()
    # Таблица категорий
    await db.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    """)
    # Таблица товаров (добавим, если ещё нет)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            sku TEXT,
            name TEXT NOT NULL,
            description TEXT,
            power_watt INTEGER,
            lumen INTEGER,
            color_temp_k INTEGER,
            life_hours INTEGER,
            price REAL NOT NULL,
            stock_quantity INTEGER DEFAULT 0,
            image_url TEXT
        )
    """)

    # Заполним категории, если они отсутствуют
    cursor = await db.execute("SELECT COUNT(*) FROM categories")
    count = (await cursor.fetchone())[0]
    if count == 0:
        categories = [
            "Галогенные лампы",
            "Светодиодные лампы (LED)",
            "Ксеноновые лампы",
            "Лампы накаливания"
        ]
        for cat in categories:
            await db.execute("INSERT INTO categories (name) VALUES (?)", (cat,))
        await db.commit()

    # Добавим один тестовый товар, если таблица products пуста
    cursor = await db.execute("SELECT COUNT(*) FROM products")
    count = (await cursor.fetchone())[0]
    if count == 0:
        await db.execute(
            "INSERT INTO products (name, price, stock_quantity, category_id) VALUES (?, ?, ?, ?)",
            ("Светодиодная лампа", 250, 100, 1)
        )
        await db.commit()
    await db.close()