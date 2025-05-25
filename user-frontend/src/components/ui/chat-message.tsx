import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  id: string;
  content: string;
  sender: "user" | "agent" | "ai";
  timestamp: Date;
  name?: string;
  attachments?: Array<{ name: string; url: string }>;
  formatTime: (date: Date) => string;
}

export const ChatMessage = React.memo(
  ({ content, sender, timestamp, name, attachments, formatTime }: MessageProps) => {
    return (
      <div
        className={cn("flex", {
          "justify-end": sender === "user",
          "justify-start": sender === "agent" || sender === "ai",
        })}
      >
        <div
          className={cn("flex flex-col max-w-[80%] md:max-w-[70%] space-y-2", {
            "items-end": sender === "user",
            "items-start": sender !== "user",
          })}
        >
          {sender !== "user" && name && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={sender === "agent" ? "https://i.pravatar.cc/100?img=5" : undefined}
                  alt={name}
                />
                <AvatarFallback className={sender === "ai" ? "bg-autocomp-600" : undefined}>
                  {sender === "ai" ? <Bot className="h-4 w-4" /> : name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{name}</span>
            </div>
          )}

          {content && (
            <div
              className={cn("rounded-lg px-4 py-2 text-sm", {
                "bg-primary text-primary-foreground": sender === "user",
                "bg-muted": sender !== "user",
              })}
            >
              {content}
            </div>
          )}

          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.url} className="max-w-[200px] max-h-[200px]">
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </a>
                </div>
              ))}
            </div>
          )}

          <span className="text-xs text-muted-foreground">
            {formatTime(new Date(timestamp))}
          </span>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.sender === nextProps.sender &&
      prevProps.timestamp.getTime() === nextProps.timestamp.getTime() &&
      prevProps.name === nextProps.name &&
      JSON.stringify(prevProps.attachments) === JSON.stringify(nextProps.attachments)
    );
  }
);