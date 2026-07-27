from pydantic import BaseModel, Field 
from app.models.commitment import VerificationType, CommitmentStatus
from datetime import datetime 


class CommitmentCreate(BaseModel):
    stake_pence: int = Field(gt = 0)  
    deadline: datetime 
    verification_type: VerificationType

class CommitmentOut(BaseModel):
    id: int 
    task_id : int 
    stake_pence:int 
    deadline: datetime
    verification_type: VerificationType
    status: CommitmentStatus
    task_title: str 

    class Config:
        from_attributes = True 

    


