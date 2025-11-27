const API_BASE = "http://localhost:8000";

export interface RoomResponse {
  roomId: string;
  code: string;
  language: string;
}

export interface AutocompleteRequest {
  code: string;
  cursorPosition: number;
  language: string;
}

export interface AutocompleteResponse {
  suggestion: string;
  confidence: number;
}

export const api = {
  async createRoom(language: string = "python"): Promise<RoomResponse> {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    if (!response.ok) throw new Error("Failed to create room");
    return response.json();
  },

  async getRoom(roomId: string): Promise<RoomResponse> {
    const response = await fetch(`${API_BASE}/rooms/${roomId}`);
    if (!response.ok) throw new Error("Room not found");
    return response.json();
  },

  async getAutocomplete(
    request: AutocompleteRequest,
  ): Promise<AutocompleteResponse> {
    const response = await fetch(`${API_BASE}/autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Autocomplete failed");
    return response.json();
  },
};
