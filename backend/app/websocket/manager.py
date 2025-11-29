"""
WebSocket connection manager for real-time collaborative code editing.
Handles room management, user tracking, and message broadcasting.
"""

import json
from datetime import datetime
from typing import Dict, List, Set

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages WebSocket connections, room states, and message broadcasting
    for collaborative sessions.
    """

    def __init__(self):
        """
        Initializes storage for active connections, room code states,
        and user mappings.
        """
        # room_id -> list of websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # room_id -> current code state
        self.room_states: Dict[str, str] = {}
        # websocket -> user_id
        self.user_ids: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        """
        Accepts a new WebSocket connection, joins the specified room,
        and syncs initial state.
        """
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.room_states[room_id] = ""

        self.active_connections[room_id].append(websocket)
        self.user_ids[websocket] = user_id

        # Send current state to new user
        await websocket.send_json(
            {
                "type": "init",
                "code": self.room_states[room_id],
                "users": self.get_room_users(room_id),
            }
        )

        # Notify others about new user
        await self.broadcast_to_room(
            room_id,
            {
                "type": "user_joined",
                "userId": user_id,
                "users": self.get_room_users(room_id),
            },
            exclude=websocket,
        )

    def disconnect(self, websocket: WebSocket, room_id: str):
        """Removes a connection from a room and cleans up empty rooms."""
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)

            if len(self.active_connections[room_id]) == 0:
                del self.active_connections[room_id]
                if room_id in self.room_states:
                    del self.room_states[room_id]

        user_id = self.user_ids.pop(websocket, None)
        return user_id

    def get_room_users(self, room_id: str) -> List[str]:
        """Returns a list of user IDs currently active in the specified room."""
        if room_id not in self.active_connections:
            return []
        return [
            self.user_ids.get(ws, "unknown") for ws in self.active_connections[room_id]
        ]

    async def broadcast_to_room(
        self, room_id: str, message: dict, exclude: WebSocket = None
    ):
        """
        Sends a JSON message to all connected clients in a room,
        optionally excluding the sender.
        """
        if room_id not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[room_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn, room_id)

    async def update_code(self, room_id: str, code: str, websocket: WebSocket):
        """
        Updates the stored code state and broadcasts the change to
        other users in the room.
        """
        self.room_states[room_id] = code
        user_id = self.user_ids.get(websocket, "unknown")

        await self.broadcast_to_room(
            room_id,
            {
                "type": "code_update",
                "code": code,
                "userId": user_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
            exclude=websocket,
        )


manager = ConnectionManager()
