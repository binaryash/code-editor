"""Service layer handling database operations for collaboration rooms."""

import uuid

from sqlalchemy.orm import Session

from ..models import Room
from ..schemas import RoomCreate


class RoomService:
    """
    Provides static methods to create, retrieve, and update Room records
    in the database.
    """

    @staticmethod
    def create_room(db: Session, room_data: RoomCreate) -> Room:
        """
        Generates a short ID and creates a new room record with the
        specified language.
        """
        room_id = str(uuid.uuid4())[:8]  # Short room ID
        room = Room(id=room_id, code="", language=room_data.language)
        db.add(room)
        db.commit()
        db.refresh(room)
        return room

    @staticmethod
    def get_room(db: Session, room_id: str) -> Room:
        """Retrieves a room record by its unique identifier."""
        return db.query(Room).filter(Room.id == room_id).first()

    @staticmethod
    def update_room_code(db: Session, room_id: str, code: str) -> Room:
        """
        Updates the code content for a specific room and persists changes
        to the database.
        """
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            room.code = code
            db.commit()
            db.refresh(room)
        return room
