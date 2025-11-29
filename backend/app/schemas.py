"""Schema file for backend."""

from datetime import datetime

from pydantic import BaseModel


class RoomCreate(BaseModel):
    """Schema for creating a new collaboration room."""

    language: str = "python"


class RoomResponse(BaseModel):
    """Schema for the room details returned to the client."""

    roomId: str
    code: str
    language: str

    class Config:
        from_attributes = True


class AutocompleteRequest(BaseModel):
    """Schema for code autocomplete requests containing context."""

    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    """Schema for the AI-generated autocomplete suggestion."""

    suggestion: str
    confidence: float


class CodeUpdate(BaseModel):
    """Schema for real-time code updates from a user."""

    code: str
    userId: str
    timestamp: str
