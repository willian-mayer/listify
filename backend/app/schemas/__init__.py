from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Schemas para Item
class ItemBase(BaseModel):
    name: str
    checked: bool = False


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    checked: Optional[bool] = None


class Item(ItemBase):
    id: int
    list_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Schemas para List
class ListBase(BaseModel):
    title: str
    description: Optional[str] = None


class ListCreate(ListBase):
    pass


class ListUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class ListWithItems(ListBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[Item] = []

    class Config:
        from_attributes = True


class ListResponse(ListBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True