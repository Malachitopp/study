from typing import List
from fastapi import APIRouter, Depends, HTTPException, status 
from sqlalchemy.orm import Session

from app.database import get_db 
from app.core.deps import get_current_user
from app.models.user import User
from app.models.module import Module 
from app.schemas.task import TaskCreate, TaskOut
from app.models.task import Task 
from app.models.commitment import Commitment 

router = APIRouter(prefix="/modules/{module_id}/tasks", tags = ["tasks"]) 


def get_owned_module( module_id: int, db:Session,current_user:User )->Module:
    module = db.query(Module).filter(Module.id == module_id, 
                                     Module.user_id == current_user.id).first() 
    if module is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Module not found")
    return module

@router.post("/", response_model = TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(module_id: int, task_in:TaskCreate, db:Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    module = get_owned_module(module_id, db,current_user)
    task = Task(module_id = module.id,**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task 

@router.get("/", response_model = List[TaskOut])
def list_tasks(module_id:int, db:Session = Depends(get_db), current_user: User
               = Depends(get_current_user)):
    module = get_owned_module(module_id, db, current_user)
    return db.query(Task).filter(Task.module_id == module.id).all() 

my_tasks = APIRouter(prefix="/tasks", tags=["tasks"])

@my_tasks.get("/", response_model = List[TaskOut])
def get_tasks( db:Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return db.query(Task).join(Task.module).filter(Module.user_id==
                                                    current_user.id).all()

@router.delete("/{task_id}", status_code = status.HTTP_204_NO_CONTENT)
def delete_task(task_id:int, module_id:int, db:Session = Depends(get_db),
                current_user:User = Depends(get_current_user)):
    module= get_owned_module(module_id, db, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.module_id == module.id).first()
    if not task:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail="Task not found")
    ineligible = db.query(Commitment).filter(Commitment.task_id == task_id).first()
    if ineligible:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Task has associated commitments and cannot be deleted")
    db.delete(task)
    db.commit() 