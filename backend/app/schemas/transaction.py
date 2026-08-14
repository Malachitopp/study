from pydantic import BaseModel







from datetime import datetime

class TransactionOut(BaseModel):
    id: int
    amount_pence: int
    reason: str
    commitment_id: int
    task_title: str
    created_at: datetime

    
    class Config:
        from_attributes = True
        
