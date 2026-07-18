from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title = "StudyMaxx") 


app.include_router(auth.router) 


