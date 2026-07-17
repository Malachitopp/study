from sqlalchemy import create_engine
from app.config import settings 



engine = create_engine(settings.database_url)


from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind = engine, autocommit = False, autoflush=False)

from sqlalchemy.orm import declarative_base

Base = declarative_base() 

def get_db():
    with SessionLocal() as db:
        yield db 

