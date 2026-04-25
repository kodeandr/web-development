from pydantic import BaseModel
from typing import Optional, List

class Category(BaseModel):
    id: int
    name: str

class ProductBase(BaseModel):
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

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    power_watt: Optional[int] = None
    lumen: Optional[int] = None
    color_temp_k: Optional[int] = None
    life_hours: Optional[int] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None

class ProductImage(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_main: bool

class Product(ProductBase):
    id: int
    is_active: bool
    created_at: str
    updated_at: str
    images: List[ProductImage] = []
