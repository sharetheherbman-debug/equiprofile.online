import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  // Don't render system messages (they're for AI context)
  if (isSystem) return null;

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[75%] sm:max-w-[65%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-blue-500 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-sm",
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
