from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List as ListType
from app.database import get_db
from app.models import Item as ItemModel, List as ListModel, User
from app.schemas import ItemCreate, ItemUpdate, Item
from app.auth import get_current_user

router = APIRouter()


def verify_list_access(list_id: int, user_id: int, db: Session):
    """Verificar que el usuario tiene acceso a la lista (dueño o compartida)"""
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    
    # Permitir acceso si es el dueño O si la lista está compartida
    if list_obj.user_id != user_id and not list_obj.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a esta lista"
        )
    
    return list_obj


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(
    item_data: ItemCreate, 
    list_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear un nuevo item en una lista"""
    verify_list_access(list_id, current_user.id, db)
    
    new_item = ItemModel(**item_data.model_dump(), list_id=list_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.get("/list/{list_id}", response_model=ListType[Item])
def get_items_by_list(
    list_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todos los items de una lista específica"""
    verify_list_access(list_id, current_user.id, db)
    
    items = db.query(ItemModel).filter(ItemModel.list_id == list_id).all()
    return items


@router.get("/{item_id}", response_model=Item)
def get_item_by_id(
    item_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener un item específico"""
    item = db.query(ItemModel).join(ListModel).filter(
        ItemModel.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    # Verificar acceso
    if item.list.user_id != current_user.id and not item.list.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este item"
        )
    
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(
    item_id: int, 
    item_data: ItemUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar un item"""
    item = db.query(ItemModel).join(ListModel).filter(
        ItemModel.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    # Verificar acceso
    if item.list.user_id != current_user.id and not item.list.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este item"
        )
    
    update_data = item_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}/toggle", response_model=Item)
def toggle_item_checked(
    item_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Alternar el estado checked de un item"""
    item = db.query(ItemModel).join(ListModel).filter(
        ItemModel.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    # Verificar acceso
    if item.list.user_id != current_user.id and not item.list.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este item"
        )
    
    item.checked = not item.checked
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar un item"""
    item = db.query(ItemModel).join(ListModel).filter(
        ItemModel.id == item_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item con id {item_id} no encontrado"
        )
    
    # Verificar acceso
    if item.list.user_id != current_user.id and not item.list.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este item"
        )
    
    db.delete(item)
    db.commit()
    return None