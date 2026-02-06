from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models, security, database

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)

@router.post("/", response_model=schemas.Announcement)
def create_announcement(
    ann: schemas.AnnouncementCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_admin)
):
    """
    Create a new announcement. Restricted to Admins.
    """
    return crud.create_announcement(db, ann)

@router.get("/", response_model=List[schemas.Announcement])
def read_announcements(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_db_user)
):
    """
    Get announcements relevant to the current user's role.
    """
    return crud.get_announcements(db, role=current_user.role)
