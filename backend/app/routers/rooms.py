"""API routes for creating and retrieving collaborative coding rooms."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import RoomCreate, RoomResponse
from ..services.room_service import RoomService

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomResponse)
def create_room(room_data: RoomCreate, db: Session = Depends(get_db)):
    """Creates a new coding room and returns its details."""
    room = RoomService.create_room(db, room_data)
    return RoomResponse(roomId=room.id, code=room.code, language=room.language)


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Retrieves an existing room by ID or raises 404 if not found."""
    room = RoomService.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse(roomId=room.id, code=room.code, language=room.language)
