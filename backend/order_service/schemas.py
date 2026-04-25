from pydantic import BaseModel
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: str
    delivery_address: str
    payment_method: str
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status_id: int

class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    total: float

class OrderResponse(BaseModel):
    order_number: str
    status: str
    customer_name: str
    customer_phone: str
    customer_email: str
    delivery_address: str
    payment_method: str
    total_amount: float
    created_at: str
    items: List[OrderItemResponse]
