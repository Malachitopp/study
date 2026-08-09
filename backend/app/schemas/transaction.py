from pydantic import BaseModel







class TransactionOut(BaseModel):
    id: int 
    amount_pence: int 
    reason: str
    commitment_id: int
    task_title: str 

    
    class Config:
        from_attributes = True
        
