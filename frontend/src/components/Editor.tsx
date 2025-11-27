import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { RootState } from "../store/store";
import {
  setCode,
  setUsers,
  setRoomId,
  setConnected,
  setSuggestion,
} from "../store/editorSlice";
import { api } from "../services/api";
import { UserList } from "./UserList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  LogOut,
  Sparkles,
  WifiOff,
  Wifi,
  Code2,
} from "lucide-react";

export const CodeEditor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { code, users, isConnected } = useSelector(
    (state: RootState) => state.editor,
  );

  const wsRef = useRef<WebSocket | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userId] = useState(
    () => `user_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [copied, setCopied] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState("");

  useEffect(() => {
    if (!roomId) return;

    api.getRoom(roomId).catch(() => {
      alert("Room not found");
      navigate("/");
    });

    dispatch(setRoomId(roomId));

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${roomId}?user_id=${userId}`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch(setConnected(true));
      console.log("Connected to room");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "init":
          dispatch(setCode(message.code));
          dispatch(
            setUsers(message.users.map((id: string) => ({ id, name: id }))),
          );
          break;
        case "code_update":
          if (message.userId !== userId) {
            dispatch(setCode(message.code));
          }
          break;
        case "user_joined":
        case "user_left":
          dispatch(
            setUsers(message.users.map((id: string) => ({ id, name: id }))),
          );
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      dispatch(setConnected(false));
      console.log("Disconnected from room");
    };

    return () => {
      ws.close();
    };
  }, [roomId, userId, dispatch, navigate]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;

    dispatch(setCode(value));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "code_change",
          code: value,
          userId,
        }),
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      const position = editorRef.current?.getPosition();
      if (position && editorRef.current) {
        const model = editorRef.current.getModel();
        const offset = model?.getOffsetAt(position) || 0;

        try {
          const result = await api.getAutocomplete({
            code: value,
            cursorPosition: offset,
            language: "python",
          });

          if (result.suggestion && result.confidence > 0.5) {
            setCurrentSuggestion(result.suggestion);
            dispatch(setSuggestion(result.suggestion));
          } else {
            setCurrentSuggestion("");
            dispatch(setSuggestion(""));
          }
        } catch (error) {
          console.error("Autocomplete error:", error);
        }
      }
    }, 600);
  };

  const handleEditorMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.registerCompletionItemProvider("python", {
      triggerCharacters: [".", " "],
      provideCompletionItems: async (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const offset = model.getOffsetAt(position);

        try {
          const result = await api.getAutocomplete({
            code: model.getValue(),
            cursorPosition: offset,
            language: "python",
          });

          if (result.suggestion && result.confidence > 0.5) {
            return {
              suggestions: [
                {
                  label: result.suggestion,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  insertText: result.suggestion,
                  range: range,
                  documentation: `AI Suggestion (${Math.round(result.confidence * 100)}% confidence)`,
                  sortText: "0",
                },
              ],
            };
          }
        } catch (error) {
          console.error("Autocomplete provider error:", error);
        }

        return { suggestions: [] };
      },
    });

    monaco.languages.registerInlineCompletionsProvider("python", {
      provideInlineCompletions: async (model, position) => {
        if (!currentSuggestion) {
          return { items: [] };
        }

        return {
          items: [
            {
              insertText: currentSuggestion,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            },
          ],
        };
      },
      freeInlineCompletions: () => {},
    });

    editor.updateOptions({
      suggest: {
        preview: true,
        showInlineDetails: true,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
    });
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#007acc] rounded">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#cccccc]">Room</span>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs bg-[#3e3e42] text-[#cccccc] border-none hover:bg-[#3e3e42]"
                >
                  {roomId}
                </Badge>
              </div>
              <p className="text-xs text-[#858585]">
                {users.length} {users.length === 1 ? "user" : "users"} connected
              </p>
            </div>
          </div>

          <Button
            onClick={copyRoomId}
            variant="outline"
            size="sm"
            className="gap-2 bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] hover:bg-[#505050] hover:text-white h-8"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy ID
              </>
            )}
          </Button>

          <Badge
            variant={isConnected ? "default" : "destructive"}
            className={`gap-1.5 px-2 py-1 ${isConnected ? "bg-[#16825d] hover:bg-[#16825d] border-none" : "bg-[#f48771] hover:bg-[#f48771] border-none"}`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                <span className="text-xs">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">Disconnected</span>
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {currentSuggestion && (
            <Badge className="gap-2 bg-[#3e3e42] text-[#cccccc] border-none hover:bg-[#3e3e42]">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">AI Suggestion (Tab/Ctrl+Space)</span>
            </Badge>
          )}
          <Button
            onClick={leaveRoom}
            variant="destructive"
            size="sm"
            className="gap-2 h-8 bg-[#f48771] hover:bg-[#f14c4c]"
          >
            <LogOut className="h-3 w-3" />
            Leave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
              wordWrap: "on",
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              tabCompletion: "on",
              acceptSuggestionOnEnter: "on",
              padding: { top: 16, bottom: 16 },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
            }}
          />
        </div>

        <div className="w-80 bg-[#252526] border-l border-[#3e3e42]">
          <UserList users={users} />
        </div>
      </div>
    </div>
  );
};
