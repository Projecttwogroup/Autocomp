import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button type="submit" disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}