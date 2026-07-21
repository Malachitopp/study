from sqlalchemy import Column, Integer, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True)
    commitment_id = Column(Integer, ForeignKey("commitments.id"), nullable = False)
    submitted_at = Column(DateTime(timezone=True), nullable = False)
    evidence_url = Column(String, nullable=True)
    focus_seconds = Column(Integer, nullable=True)

    commitment = relationship("Commitment", back_populates="checkins")
