from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
from app.database import get_db
from app.models import List as ListModel, User
from app.schemas import ListWithItems, ShareLinkResponse
from app.auth import get_current_user

router = APIRouter()


def generate_share_token():
    """Generar token único de 16 caracteres"""
    return secrets.token_urlsafe(16)


@router.post("/{list_id}/share", response_model=ShareLinkResponse)
def create_share_link(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generar link para compartir una lista"""
    # Verificar que la lista existe y pertenece al usuario
    list_obj = db.query(ListModel).filter(
        ListModel.id == list_id,
        ListModel.user_id == current_user.id
    ).first()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista no encontrada"
        )
    
    # Si ya tiene token, devolverlo
    if list_obj.share_token:
        return {
            "share_token": list_obj.share_token,
            "share_url": f"https://listify.space/shared/{list_obj.share_token}"
        }
    
    # Generar nuevo token
    share_token = generate_share_token()
    list_obj.share_token = share_token
    list_obj.is_shared = True
    
    db.commit()
    db.refresh(list_obj)
    
    return {
        "share_token": share_token,
        "share_url": f"https://listify.space/shared/{share_token}"
    }


@router.delete("/{list_id}/share", status_code=status.HTTP_204_NO_CONTENT)
def revoke_share_link(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revocar acceso compartido de una lista"""
    list_obj = db.query(ListModel).filter(
        ListModel.id == list_id,
        ListModel.user_id == current_user.id
    ).first()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista no encontrada"
        )
    
    list_obj.share_token = None
    list_obj.is_shared = False
    
    db.commit()
    return None


@router.get("/shared/{share_token}", response_model=ListWithItems)
def get_shared_list(
    share_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener una lista compartida por su token"""
    list_obj = db.query(ListModel).filter(
        ListModel.share_token == share_token
    ).first()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lista compartida no encontrada o el link ha expirado"
        )
    
    return list_obj