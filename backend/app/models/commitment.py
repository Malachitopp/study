import enum
from sqlalchemy import String, Integer, DateTime, Enum as SAEnum, Column, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CommitmentStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled" 

class VerificationType(str, enum.Enum):

    timer = "timer"
    photo = "photo"
    both = "both" 

class Commitment(Base):
    __tablename__ = "commitments"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable = False)
    stake_pence = Column(Integer, nullable = False) 
    deadline = Column(DateTime(timezone=True), nullable = False)
    verification_type = Column(SAEnum(VerificationType),nullable = False )
    status = Column(SAEnum(CommitmentStatus), nullable = False, default = CommitmentStatus.active)
    required_seconds = Column(Integer, nullable=False) 
    @property
    def module_title(self) -> str:
        return self.task.module.name


    task = relationship("Task", back_populates="commitments")
    
    checkins = relationship("Checkin", back_populates="commitment")

    transactions = relationship("Transaction", back_populates="commitment")
