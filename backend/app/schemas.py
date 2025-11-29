from datetime import datetime

from pydantic import BaseModel


class RoomCreate(BaseModel):
    language: str = "python"


class RoomResponse(BaseModel):
    roomId: str
    code: str
    language: str

    class Config:
        from_attributes = True


class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    suggestion: str
    confidence: float


class CodeUpdate(BaseModel):
    code: str
    userId: str
    timestamp: str
