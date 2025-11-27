import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Code2, Plus, LogIn } from "lucide-react";

export const Home: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const room = await api.createRoom("python");
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] p-4">
      <Card className="w-full max-w-md border-[#3e3e42] bg-[#252526] shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="p-4 bg-[#007acc] rounded-lg">
              <Code2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-[#cccccc] mb-2">
              Pair Programming
            </CardTitle>
            <CardDescription className="text-[#858585] text-base">
              Real-time collaborative code editor with AI assistance
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full h-12 text-base font-medium bg-[#007acc] hover:bg-[#005a9e] text-white border-none"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {loading ? "Creating..." : "Create New Room"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-[#3e3e42]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#252526] px-3 text-[#858585] font-medium">
                Or join existing
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
              className="h-12 bg-[#3e3e42] border-[#3e3e42] text-[#cccccc] placeholder:text-[#858585] focus-visible:ring-1 focus-visible:ring-[#007acc] focus-visible:border-[#007acc]"
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              variant="secondary"
              className="w-full h-12 text-base font-medium bg-[#3e3e42] hover:bg-[#505050] text-[#cccccc] border-none"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Join Room
            </Button>
          </div>
        </CardContent>

        <div className="px-6 pb-6">
          <Separator className="bg-[#3e3e42] mb-4" />
          <p className="text-xs text-center text-[#6a6a6a]">
            Built with FastAPI, React, WebSockets & Monaco Editor
          </p>
        </div>
      </Card>
    </div>
  );
};
