from typing import List
from fastapi import APIRouter, Depends, status 
from sqlalchemy.orm import Session 

from app.database import get_db 
from app.core.deps import get_current_user 
from app.models.user import User
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleOut
from app.models.task import Task
from app.models.commitment import Commitment
from fastapi import HTTPException


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


@router.delete("/{module_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_module(module_id:int, db:Session =Depends(get_db), current_user:User
                  =Depends(get_current_user)):
    module = db.query(Module).filter(
        module_id == Module.id, Module.user_id == current_user.id).first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    ineligible = db.query(Commitment).join(Task).filter(Task.module_id == module_id).first() 
    if ineligible:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Module has associated commitments and cannot be deleted")
    for task in module.tasks:
        db.delete(task)
    db.delete(module)
    db.commit() 
