from fastapi import FastAPI
from app.routers import auth
from app import models  # noqa: F401 -- ensures every model is registered before any query runs

from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.worker import process_deadlines

from app.routers import commitments
from app.routers import tasks
from app.routers import modules 

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(process_deadlines, "interval", minutes=1)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title = "StudyMaxx", lifespan=lifespan) 

app.include_router(auth.router) 

app.include_router(modules.router) 

app.include_router(tasks.router)

app.include_router(commitments.router)


@app.get("/health")
def get_health():
    return {"status":"ok"}


