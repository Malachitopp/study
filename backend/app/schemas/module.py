from pydantic import BaseModel 

class ModuleCreate(BaseModel):
    name: str
    term: str

class ModuleOut(BaseModel):
    id: int 
    user_id: int 
    name: str
    term: str

    class Config:
        from_attributes = True 