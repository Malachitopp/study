from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"),nullable = False)
    name = Column(String, nullable = False)
    term = Column(String, nullable=False)

    user = relationship("User", back_populates="modules") 

    tasks = relationship("Task", back_populates="module")