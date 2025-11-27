import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
}

interface EditorState {
  code: string;
  language: string;
  users: User[];
  roomId: string | null;
  isConnected: boolean;
  suggestion: string;
}

const initialState: EditorState = {
  code: "",
  language: "python",
  users: [],
  roomId: null,
  isConnected: false,
  suggestion: "",
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSuggestion: (state, action: PayloadAction<string>) => {
      state.suggestion = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
  },
});

export const {
  setCode,
  setLanguage,
  setUsers,
  setRoomId,
  setConnected,
  setSuggestion,
  addUser,
  removeUser,
} = editorSlice.actions;

export default editorSlice.reducer;
