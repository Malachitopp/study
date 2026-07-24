from pydantic import BaseModel







class TransactionOut(BaseModel):
    id: int 
    amount_pence: int 
    reason: str
    commitment_id: int

    class Config:
        from_attributes = True
        
