from fastapi import Depends, APIRouter, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.models.task import Task
from app.models.commitment import Commitment
from app.schemas.commitment import CommitmentCreate, CommitmentOut
from app.models.module import Module

router = APIRouter(prefix="/tasks/{task_id}/commitments", tags = ["commitments"]) 


def get_owned_tasks(db:Session, task_id:int, current_user:User) -> Task:
    task =db.query(Task).filter(Task.id == task_id).first() 
    if task is None or task.module.user_id != current_user.id:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND,
                            detail="Task not found") 
    return task 

@router.post("/", response_model = CommitmentOut, status_code=status.HTTP_201_CREATED)
def create_commitment(task_id: int, commitment_in: CommitmentCreate, db:Session=
                      Depends(get_db), current_user: 
                      User = Depends(get_current_user)):
    task = get_owned_tasks(db, task_id, current_user)
    commitment = Commitment(task_id= task.id, **commitment_in.model_dump())
    db.add(commitment)
    db.commit()
    db.refresh(commitment)

    return commitment

@router.get("/", response_model = List[CommitmentOut])
def list_commitments(task_id: int, db:Session = Depends(get_db),
                     current_user:User = Depends(get_current_user)):
    task = get_owned_tasks(db, task_id, current_user)
    return db.query(Commitment).filter(Commitment.task_id == task.id ).all() 



my_commitments = APIRouter(prefix="/commitments", tags = ["commitments"]) 

@my_commitments.get("/", response_model = List[CommitmentOut])
def all_commitments(db:Session = Depends(get_db),
                    current_user:User = Depends(get_current_user)):
    return db.query(Commitment).join(Commitment.task).join(Task.module).filter(
        Module.user_id == current_user.id
    ).all() 

