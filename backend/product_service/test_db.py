import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

async def test():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Подключение успешно!")

        tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        print("Таблицы в БД:", [t['table_name'] for t in tables])

        if 'products' in [t['table_name'] for t in tables]:
            columns = await conn.fetch(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'"
            )
            print("Колонки products:")
            for c in columns:
                print(f"  {c['column_name']} ({c['data_type']})")
        else:
            print("❌ Таблица products отсутствует!")

        await conn.close()
    except Exception as e:
        print("❌ Ошибка:", e)

asyncio.run(test())