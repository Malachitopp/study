import enum 
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
import sqlalchemy as sa 

class TaskKind(str, enum.Enum):
    problem_sheet = "problem_sheet"
    revision = "revision"
    reading = "reading"
    coursework = "coursework"

class Task(Base):
    __tablename__ = "tasks" 

    id = Column(Integer, primary_key=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable = False)
    title = Column(String, nullable = False)
    kind = Column(SAEnum(TaskKind), nullable = False)
    due_at = Column(DateTime, nullable = False)
    recurrence = Column(String, nullable=True)
    archived = Column(Boolean, nullable=False, server_default=sa.text('false'))

    module = relationship("Module", back_populates="tasks")

    commitments = relationship("Commitment", back_populates="task")
