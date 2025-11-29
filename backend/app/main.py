"""Main FastAPI application module."""
import json

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .routers import autocomplete, rooms
from .services.room_service import RoomService
from .websocket.manager import manager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pair Programming API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms.router)
app.include_router(autocomplete.router)


@app.get("/")
def read_root():
    return {"message": "Pair Programming API is running"}


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_id: str = "anonymous",
    db: Session = Depends(get_db),
):
    """WebSocket endpoint for real-time collaboration"""

    # Verify room exists
    room = RoomService.get_room(db, room_id)
    if not room:
        await websocket.close(code=4004, reason="Room not found")
        return

    await manager.connect(websocket, room_id, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "code_change":
                code = message.get("code", "")
                await manager.update_code(room_id, code, websocket)

                # Persist to database periodically (simple implementation)
                RoomService.update_room_code(db, room_id, code)

    except WebSocketDisconnect:
        user_id = manager.disconnect(websocket, room_id)
        await manager.broadcast_to_room(
            room_id,
            {
                "type": "user_left",
                "userId": user_id,
                "users": manager.get_room_users(room_id),
            },
        )
