from pydantic import BaseModel, Field


class Product(BaseModel):
    name: str
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    category: str