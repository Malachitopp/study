from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.checkin import Checkin
from app.models.commitment import Commitment, CommitmentStatus
from app.models.user import User
from app.schemas.checkin import CheckinCreate, CheckinOut


checkin_router = APIRouter(
    prefix="/commitments/{commitment_id}/checkins", 
    tags=["checkins"])


def get_owned_commitment(db:Session, commitment_id: int, current_user:User)-> Commitment:
    commitment = db.query(Commitment).filter(Commitment.id == commitment_id).first()
    if commitment is None or commitment.task.module.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Commitments not found") 
    return commitment

@checkin_router.post("/", response_model=CheckinOut,status_code=status.HTTP_201_CREATED)
def create_checkin(
    commitment_id: int,
    checkin_in: CheckinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    commitment = get_owned_commitment(db, commitment_id, current_user)

    now = datetime.now(timezone.utc)

    if commitment.status != CommitmentStatus.active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail = f"Commitment is already {commitment.status.value}"
        )
    if now > commitment.deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline has passed"
        )
    REQUIRED_FOCUS_SECONDS = 1500
    #move into commitments
    if checkin_in.focus_seconds < REQUIRED_FOCUS_SECONDS:
        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Focus time not long enough"
        )
    checkin = Checkin(
        commitment_id = commitment.id, 
        submitted_at = now,
        focus_seconds = checkin_in.focus_seconds
    )
    
    db.add(checkin) 
    commitment.status = CommitmentStatus.completed
    db.commit()
    db.refresh(checkin) 

    return checkin 
