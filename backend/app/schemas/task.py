from pydantic import BaseModel
from datetime import datetime
from app.models.task import TaskKind

class TaskCreate(BaseModel):
    title:str 
    kind:TaskKind 
    due_at: datetime
    recurrence: str | None = None

class TaskOut(BaseModel):
    title:str 
    kind:TaskKind
    id: int 
    module_id: int
    due_at:datetime
    recurrence: str|None = None 
    
    class Config:
        from_attributes = True 


    