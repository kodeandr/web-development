import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

async def fix():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Снимаем NOT NULL с sku и power_watt (и других, если нужно)
        await conn.execute("ALTER TABLE products ALTER COLUMN sku DROP NOT NULL;")
        print("✅ Ограничение NOT NULL снято с sku")
        
        await conn.execute("ALTER TABLE products ALTER COLUMN power_watt DROP NOT NULL;")
        print("✅ Ограничение NOT NULL снято с power_watt")

        # На всякий случай добавим image_url, если его ещё нет (в прошлый раз не сработало)
        try:
            await conn.execute("ALTER TABLE products ADD COLUMN image_url VARCHAR(500);")
            print("✅ Колонка image_url добавлена")
        except asyncpg.exceptions.DuplicateColumnError:
            print("ℹ️ Колонка image_url уже существует")
        
        print("Готово!")
    finally:
        await conn.close()

asyncio.run(fix())