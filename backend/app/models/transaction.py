from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    commitment_id = Column(Integer, ForeignKey("commitments.id"), nullable = False)
    amount_pence = Column(Integer, nullable=False) 
    stripe_payment_id = Column(String, nullable=True)
    reason = Column(String, nullable=False) 
   
    commitment = relationship("Commitment", back_populates="transactions")
    @property
    def task_title(self) -> str:
        return self.commitment.task.title
