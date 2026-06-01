import aiosqlite

DATABASE = "orders.db"

async def get_db():
    db = await aiosqlite.connect(DATABASE)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    db = await get_db()
    await db.execute("""
        CREATE TABLE IF NOT EXISTS order_statuses (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT NOT NULL,
            status_id INTEGER NOT NULL DEFAULT 1,
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            delivery_address TEXT,
            payment_method TEXT,
            total_amount REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        )
    """)
    # Заполняем статусы, если их нет
    statuses = [
        (1, "new"), (2, "processing"), (3, "paid"),
        (4, "shipped"), (5, "completed"), (6, "cancelled")
    ]
    for s in statuses:
        await db.execute("INSERT OR IGNORE INTO order_statuses (id, name) VALUES (?, ?)", s)
    await db.commit()
    await db.close()