import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Send, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface User {
  userId: string;
  userName: string;
  email: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string | null;
  timestamp: string;
}

const AdminCommunication = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("https://localhost:7181/api/chat/users")
      .then((res) => res.json())
      .then((users) => {
        const withDefaults = users.map((u: any) => ({
          ...u,
          lastMessage: u.lastMessage || "",
          lastTimestamp: u.lastTimestamp || "",
          unreadCount: u.unreadCount || 0,
          messages: [],
        }));
        setConversations(withDefaults);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();

      // Mark messages as read when selecting a chat
      if (selectedChat.unreadCount > 0) {
        const now = new Date().toISOString();

        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: "admin",
          message: newMessage.trim(),
          timestamp: now,
        };

        const updatedConversations = conversations.map((conv) => {
          if (conv.id === selectedChat.id) {
            return {
              ...conv,
              lastMessage: newMessage.trim(),
              lastTimestamp: now,
              messages: Array.isArray(conv.messages)
                ? [...conv.messages, newMsg]
                : [newMsg],
            };
          }
          return conv;
        });

        setConversations(updatedConversations);
        setSelectedChat({
          ...selectedChat,
          unreadCount: 0,
          messages: selectedChat.messages.map((msg) => ({
            ...msg,
            read: true,
          })),
        });
      }
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      message: newMessage.trim(),
      timestamp: now,
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          lastMessage: newMessage.trim(),
          lastTimestamp: now,
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedChat({
      ...selectedChat,
      lastMessage: newMessage.trim(),
      lastTimestamp: now,
      messages: [...selectedChat.messages, newMsg],
    });
    setNewMessage("");

    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${selectedChat.userName}.`,
    });

    setTimeout(scrollToBottom, 100);
    await fetch("https://localhost:7181/api/chathub/sendmessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedChat.userId,
        sender: "admin",
        content: newMessage.trim(),
      }),
    });
    await fetch(`https://localhost:7181/api/chat/${selectedChat.userId}`)
      .then((res) => res.json())
      .then((data) => {
        const messages = data.map((msg: any, i: number) => ({
          id: `msg-${i}`,
          sender: msg.sender,
          message: msg.content,
          timestamp: msg.timestamp + "Z",
        }));

        setSelectedChat((prev) => (prev ? { ...prev, messages } : prev));
      });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Amman",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Communication</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
              <CardDescription>Chat with users</CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100vh-280px)] overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                        selectedChat?.id === conversation.id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedUser({
                          userId: conversation.userId,
                          userName: conversation.userName,
                          email: "", // optional if you don’t use email
                        });

                        fetch(
                          `https://localhost:7181/api/chat/${conversation.userId}`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            const messages = data.map(
                              (msg: any, i: number) => ({
                                id: `msg-${i}`,
                                sender: msg.sender,
                                message: msg.content,
                                timestamp: msg.timestamp + "Z",
                              })
                            );
                            setSelectedChat({
                              ...conversation,
                              messages,
                            });
                          });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {conversation.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {conversation.userName}
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full px-1.5 py-0.5 text-[10px]">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.lastTimestamp
                          ? formatDate(conversation.lastTimestamp)
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No conversations found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {selectedChat.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedChat.userName}</CardTitle>
                        <CardDescription>{selectedChat.userId}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col h-[calc(100vh-300px)]">
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-4">
                        {selectedChat.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "admin"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                message.sender === "admin"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              <p>{message.message}</p>
                              <div
                                className={`text-xs mt-1 text-right ${
                                  message.sender === "admin"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[80px]"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} className="h-auto">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2 text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunication;
