import asyncpg

DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

_pool = None

async def get_db_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
    return _pool