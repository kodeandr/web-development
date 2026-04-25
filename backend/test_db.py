import asyncpg
import asyncio

async def test():
    try:
        conn = await asyncpg.connect("postgresql://postgres:123@localhost/lamp_shop")
        version = await conn.fetchval("SELECT version()")
        print("✅ Успешно подключено!")
        print(f"PostgreSQL: {version}")
        await conn.close()
    except Exception as e:
        print("❌ Ошибка:", e)

asyncio.run(test())
