from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as ListType
from app.database import get_db
from app.models import Item as ItemModel, List as ListModel
from app.schemas import ItemCreate, ItemUpdate, Item

router = APIRouter()


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item_data: ItemCreate, list_id: int, db: Session = Depends(get_db)):
    """Crear un nuevo item en una lista"""
    # Verificar que la lista existe
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    
    new_item = ItemModel(**item_data.model_dump(), list_id=list_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.get("/list/{list_id}", response_model=ListType[Item])
def get_items_by_list(list_id: int, db: Session = Depends(get_db)):
    """Obtener todos los items de una lista específica"""
    # Verificar que la lista existe
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    
    items = db.query(ItemModel).filter(ItemModel.list_id == list_id).all()
    return items


@router.get("/{item_id}", response_model=Item)
def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """Obtener un item específico"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, item_data: ItemUpdate, db: Session = Depends(get_db)):
    """Actualizar un item (cambiar nombre o checked)"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}/toggle", response_model=Item)
def toggle_item_checked(item_id: int, db: Session = Depends(get_db)):
    """Alternar el estado checked de un item"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    item.checked = not item.checked
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Eliminar un item"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    db.delete(item)
    db.commit()
    return None