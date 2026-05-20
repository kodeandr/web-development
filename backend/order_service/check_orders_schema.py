import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

async def check():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Таблица orders
        print("=== Таблица orders ===")
        cols = await conn.fetch("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'orders'
            ORDER BY ordinal_position;
        """)
        for c in cols:
            print(f"  {c['column_name']} ({c['data_type']}) nullable={c['is_nullable']}")

        # Таблица order_items
        print("\n=== Таблица order_items ===")
        cols = await conn.fetch("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'order_items'
            ORDER BY ordinal_position;
        """)
        for c in cols:
            print(f"  {c['column_name']} ({c['data_type']}) nullable={c['is_nullable']}")

        # Дополнительно: содержимое order_statuses
        print("\n=== Содержимое order_statuses ===")
        statuses = await conn.fetch("SELECT * FROM order_statuses;")
        for s in statuses:
            print(dict(s))
    finally:
        await conn.close()

asyncio.run(check())