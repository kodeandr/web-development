from pydantic import BaseModel
from typing import Optional

class ProductCreate(BaseModel):
    category_id: int
    sku: str
    name: str
    description: Optional[str] = None
    power_watt: int
    lumen: Optional[int] = None
    color_temp_k: Optional[int] = None
    life_hours: Optional[int] = None
    price: float
    stock_quantity: int = 0