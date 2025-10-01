from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import List as ListModel
from app.schemas import ListCreate, ListUpdate, ListResponse, ListWithItems

router = APIRouter()


@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(list_data: ListCreate, db: Session = Depends(get_db)):
    """Crear una nueva lista"""
    new_list = ListModel(**list_data.model_dump())
    db.add(new_list)
    db.commit()
    db.refresh(new_list)
    return new_list


@router.get("/", response_model=List[ListResponse])
def get_all_lists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las listas"""
    lists = db.query(ListModel).offset(skip).limit(limit).all()
    return lists


@router.get("/{list_id}", response_model=ListWithItems)
def get_list_by_id(list_id: int, db: Session = Depends(get_db)):
    """Obtener una lista específica con todos sus items"""
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    return list_obj


@router.put("/{list_id}", response_model=ListResponse)
def update_list(list_id: int, list_data: ListUpdate, db: Session = Depends(get_db)):
    """Actualizar una lista"""
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    
    update_data = list_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(list_obj, key, value)
    
    db.commit()
    db.refresh(list_obj)
    return list_obj


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(list_id: int, db: Session = Depends(get_db)):
    """Eliminar una lista y todos sus items"""
    list_obj = db.query(ListModel).filter(ListModel.id == list_id).first()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lista con id {list_id} no encontrada"
        )
    
    db.delete(list_obj)
    db.commit()
    return None