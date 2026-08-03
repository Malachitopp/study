from pydantic import BaseModel, Field 
from app.models.commitment import VerificationType, CommitmentStatus
from datetime import datetime 
from app.schemas.task import TaskOut

class CommitmentCreate(BaseModel):
    stake_pence: int = Field(gt = 0)  
    deadline: datetime 
    verification_type: VerificationType
    required_seconds: int = Field(gt = 0 )

class CommitmentOut(BaseModel):
    id: int 
    task_id : int 
    stake_pence:int 
    deadline: datetime
    verification_type: VerificationType
    status: CommitmentStatus
    required_seconds: int 
    task:TaskOut
    module_title: str 
    created_at: datetime 

    class Config:
        from_attributes = True 

    


