import asyncpg

DATABASE_URL = "postgresql://postgres:123@localhost/lamp_shop"

async def get_db_pool():
    return await asyncpg.create_pool(DATABASE_URL)
