"""Models file for backend."""

from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text

from .database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    code = Column(Text, default="")
    language = Column(String, default="python")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
