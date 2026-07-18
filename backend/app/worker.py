from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.commitment import Commitment, CommitmentStatus
from app.models.checkin import Checkin
from app.models.transaction import Transaction

def process_deadlines():
    db: Session = SessionLocal() 
    try: 
        overdue = (
            db.query(Commitment).filter(Commitment.status == 
                                        CommitmentStatus.active, 
                                        Commitment.deadline 
                                        < datetime.now(timezone.utc)).all()
        )
        for commitment in overdue:
            has_checkin = db.query(Checkin).filter(Checkin.commitment_id
                                                   == commitment.id).first() is not None

            if has_checkin:
                commitment.status = CommitmentStatus.completed
            else:
                commitment.status = CommitmentStatus.failed 
                db.add(Transaction(
                    commitment_id = commitment.id,
                    amount_pence = commitment.stake_pence, 
                    stripe_payment_id = None, 
                    reason = "Commitment failed: deadline passed with no check-in",
                ))

        db.commit()
    finally:
        db.close() 
    