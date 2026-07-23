from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.commitment import Commitment, CommitmentStatus
from app.models.user import User
from app.models import Transaction
from app.schemas.transaction import TransactionOut
from typing import List
from app.models import Task, Module



my_transactions = APIRouter(prefix="/transactions", tags = ["transactions"])

@my_transactions.get("/", response_model = List[TransactionOut])
def transactions(db:Session = Depends(get_db), 
                 current_user: User = Depends(get_current_user)
                 ):
    return db.query(Transaction).join(Transaction.commitment).join(
        Commitment.task
    ).join(Task.module).filter(Module.user_id == current_user.id).all() 






