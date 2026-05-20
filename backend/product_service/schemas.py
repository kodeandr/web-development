from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    stock_quantity: int = 0
    category_id: int = 1
    image_url: Optional[str] = None
    # Остальные поля делаем опциональными, чтобы не ломать старые данные
    sku: Optional[str] = None
    power_watt: Optional[int] = None
    lumen: Optional[int] = None
    color_temp_k: Optional[int] = None
    life_hours: Optional[int] = None