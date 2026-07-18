from fastapi import FastAPI
from app.routers import auth
from app import models  # noqa: F401 -- ensures every model is registered before any query runs

app = FastAPI(title = "StudyMaxx") 


app.include_router(auth.router) 


from app.routers import modules 

app.include_router(modules.router) 

from app.routers import tasks

app.include_router(tasks.router)
