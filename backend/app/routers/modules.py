from typing import List
from fastapi import APIRouter, Depends, status 
from sqlalchemy.orm import Session 

from app.database import get_db 
from app.core.deps import get_current_user 
from app.models.user import User
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleOut

router = APIRouter(prefix="/modules", tags = ["modules"]) 

@router.post("/", response_model=ModuleOut, status_code=status.HTTP_201_CREATED)
def create_module(module_in: ModuleCreate, db:Session = Depends(get_db),
                  current_user: User= Depends(get_current_user)):
    module = Module(user_id = current_user.id, name = module_in.name,
                    term = module_in.term)
    db.add(module)
    db.commit()
    db.refresh(module)
    return module 

@router.get("/", response_model = List[ModuleOut])
def list_modules(db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Module).filter(Module.user_id ==current_user.id).all() 