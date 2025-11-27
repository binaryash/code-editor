import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Circle } from "lucide-react";

interface User {
  id: string;
  name: string;
}

interface Props {
  users: User[];
}

export const UserList: React.FC<Props> = ({ users }) => {
  const getAvatarColor = (id: string) => {
    const colors = [
      "bg-[#569cd6]", // Blue
      "bg-[#ce9178]", // Orange
      "bg-[#4ec9b0]", // Cyan
      "bg-[#c586c0]", // Purple
      "bg-[#4fc1ff]", // Light Blue
      "bg-[#b5cea8]", // Green
      "bg-[#dcdcaa]", // Yellow
    ];
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="h-full bg-[#252526]">
      <div className="p-4 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2 text-[#cccccc]">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Connected Users</span>
          <Badge className="ml-auto font-mono text-xs bg-[#3e3e42] text-[#cccccc] border-none hover:bg-[#3e3e42]">
            {users.length}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-[#3e3e42] mx-auto mb-3" />
            <p className="text-sm text-[#858585]">No users connected</p>
            <p className="text-xs text-[#6a6a6a] mt-1">
              Share the room ID to collaborate
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-[#2a2d2e] transition-colors cursor-pointer"
            >
              <Avatar className={`h-9 w-9 ${getAvatarColor(user.id)}`}>
                <AvatarFallback className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#cccccc] truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle className="h-2 w-2 fill-[#16825d] text-[#16825d]" />
                  <span className="text-xs text-[#858585]">Active</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
