from pydantic import BaseModel, Field

from datetime import datetime 



class CheckinCreate(BaseModel):
    focus_seconds: int = Field(gt = 0) 

class CheckinOut(BaseModel):
    submitted_at: datetime
    id: int 
    commitment_id: int
    focus_seconds: int

    class Config:
        from_attributes = True 
