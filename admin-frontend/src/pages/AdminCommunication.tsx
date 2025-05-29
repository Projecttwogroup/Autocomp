import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Send, Paperclip, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface ChatConversation {
  lastAttachmentUrl: any;
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
  attachmentUrl?: string;
  attachmentName?: string;
}

const formatDateSeparator = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDate = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDate(date, today)) return "Today";
  if (isSameDate(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const AdminCommunication = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

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
        const withDefaults = users.map((u: any) => {
          const timestamp = u.lastTimestamp ? u.lastTimestamp + "Z" : "";

          return {
            ...u,
            lastMessage: u.lastMessage || "",
            lastAttachmentUrl: u.lastAttachmentUrl || "",
            lastTimestamp: timestamp,
            unreadCount: u.unreadCount || 0,
            messages: [],
          };
        });

        setConversations(withDefaults);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch("https://localhost:7181/api/chat/users")
        .then((res) => res.json())
        .then((users) => {
          const withDefaults = users.map((u: any) => {
            const timestamp = u.lastTimestamp ? u.lastTimestamp + "Z" : "";

            return {
              ...u,
              lastMessage: u.lastMessage || "",
              lastTimestamp: timestamp,
              unreadCount: u.unreadCount || 0,
              messages: [],
            };
          });

          setConversations(withDefaults);
        })
        .catch(console.error);
    }, 3000); // fetch every 3 seconds

    return () => clearInterval(intervalId); // cleanup
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

        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === selectedChat.userId
              ? {
                  ...conv,
                  lastMessage: newMessage.trim(),
                  lastTimestamp: now,
                  messages: [...conv.messages, newMsg],
                }
              : conv
          )
        );

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
    if (!selectedChat) return;

    const now = new Date().toISOString();

    if (newMessage.trim()) {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "admin",
        message: newMessage.trim(),
        timestamp: now,
      };

      await fetch("https://localhost:7181/api/chathub/sendmessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedChat.userId,
          sender: "admin",
          content: newMessage.trim(),
        }),
      });

      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, newMsg],
      });

      setNewMessage("");
      scrollToBottom();
    }
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
    if (!timestamp) return "";

    const jordanDate = new Date(
      new Date(timestamp + "Z").toLocaleString("en-US", {
        timeZone: "Asia/Amman",
      })
    );

    const jordanNow = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Amman",
      })
    );

    const isToday =
      jordanDate.getDate() === jordanNow.getDate() &&
      jordanDate.getMonth() === jordanNow.getMonth() &&
      jordanDate.getFullYear() === jordanNow.getFullYear();

    return isToday
      ? jordanDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : jordanDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 overflow-hidden max-h-[100vh]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Communication</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col h-[calc(100vh-130px)]">
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
            <CardContent className="overflow-y-auto flex-1">
              {filteredConversations.length > 0 ? (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                        selectedChat?.id === conversation.id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={async () => {
                        setSelectedUser({
                          userId: conversation.userId,
                          userName: conversation.userName,
                          email: "",
                        });

                        const res = await fetch(
                          `https://localhost:7181/api/chat/${conversation.userId}`
                        );
                        const data = await res.json();
                        const messages = data.map((msg: any, i: number) => ({
                          id: `msg-${i}`,
                          sender: msg.sender,
                          message: msg.content,
                          timestamp: msg.timestamp + "Z",
                          attachmentUrl: msg.attachmentUrl || undefined,
                          attachmentName: msg.attachmentName || undefined,
                        }));

                        setSelectedChat({
                          ...conversation,
                          messages,
                        });

                        // Give a slight delay to allow DOM to render first, then scroll
                        setTimeout(() => {
                          messagesEndRef.current?.scrollIntoView({
                            behavior: "auto",
                          });
                        }, 0);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
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
                            {conversation.lastMessage?.trim()?.length
                              ? conversation.lastMessage.trim()
                              : conversation.lastAttachmentUrl
                              ? "[Image]"
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.lastTimestamp
                          ? formatTime(conversation.lastTimestamp)
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
                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
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
                  <div className="flex flex-col min-h-[500px] h-[calc(100vh-270px)]">
                    <div className="grow overflow-y-auto p-4">
                      <div className="space-y-4 overflow-y-auto h-full pr-1">
                        {selectedChat.messages.length === 0 ? (
                          <div className="text-muted-foreground text-sm text-center">
                            No messages yet.
                          </div>
                        ) : (
                          <>
                            {" "}
                            {(() => {
                              const result: JSX.Element[] = [];
                              let lastDate: string | null = null;

                              selectedChat.messages.forEach((message) => {
                                const dateObj = new Date(message.timestamp);
                                const currentDate =
                                  formatDateSeparator(dateObj);

                                if (currentDate !== lastDate) {
                                  result.push(
                                    <div
                                      key={`separator-${dateObj.toISOString()}`}
                                      className="text-center text-xs text-muted-foreground my-4"
                                    >
                                      <span className="inline-block py-1 px-3 bg-muted rounded-full">
                                        {currentDate}
                                      </span>
                                    </div>
                                  );
                                  lastDate = currentDate;
                                }

                                result.push(
                                  <div
                                    key={message.id}
                                    className={`flex ${
                                      message.sender === "admin"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <div className="max-w-[80%] flex flex-col gap-1">
                                      <>
                                        {message.message && (
                                          <div
                                            className={`px-4 py-2 rounded-lg inline-block ${
                                              message.sender === "admin"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                                            }`}
                                          >
                                            <p>{message.message}</p>
                                          </div>
                                        )}

                                        {message.attachmentUrl &&
                                          (/\.(jpg|jpeg|png|gif|ico)$/i.test(
                                            message.attachmentUrl
                                          ) ? (
                                            <img
                                              src={message.attachmentUrl}
                                              alt={message.attachmentName}
                                              onClick={() =>
                                                setEnlargedImage(
                                                  message.attachmentUrl!
                                                )
                                              }
                                              className="rounded-lg object-cover max-w-[200px] max-h-[200px] mt-1 cursor-pointer hover:opacity-80"
                                            />
                                          ) : /\.(mp4|webm|ogg)$/i.test(
                                              message.attachmentUrl
                                            ) ? (
                                            <video
                                              controls
                                              className="rounded-lg object-cover max-w-[200px] max-h-[200px] mt-1"
                                            >
                                              <source
                                                src={message.attachmentUrl}
                                              />
                                              Your browser does not support the
                                              video tag.
                                            </video>
                                          ) : (
                                            <a
                                              href={message.attachmentUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="underline text-blue-500 block mt-1"
                                            >
                                              📎 {message.attachmentName}
                                            </a>
                                          ))}
                                        <div
                                          className={`text-xs mt-1 text-right ${
                                            message.sender === "admin"
                                              ? "text-blue-100"
                                              : "text-gray-500 dark:text-gray-400"
                                          }`}
                                        >
                                          {formatTime(message.timestamp)}
                                        </div>
                                      </>
                                    </div>
                                  </div>
                                );
                              });

                              return result;
                            })()}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="border-t px-4 py-1">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center h-[50px]">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-[42px] w-[42px]"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>

                          <Textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full px-3 py-2 text-base border border-input shadow-sm rounded-md resize-none leading-none min-h-0 h-[38px]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />

                          <Button
                            onClick={handleSendMessage}
                            className="h-[42px] w-[42px] p-0"
                          >
                            <Send className="h-4 w-4" />
                          </Button>

                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !selectedChat) return;

                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("userId", selectedChat.userId);
                              formData.append("sender", "admin");

                              const response = await fetch(
                                "https://localhost:7181/api/chathub/sendattachments",
                                {
                                  method: "POST",
                                  body: formData,
                                }
                              );

                              if (!response.ok) {
                                toast({
                                  title: "Failed to upload attachment.",
                                });
                                return;
                              }

                              const result = await response.json();
                              const now = new Date().toISOString();

                              const newMsg: ChatMessage = {
                                id: `att-${Date.now()}`,
                                sender: "admin",
                                message: null,
                                timestamp: now,
                                attachmentUrl: result.url,
                                attachmentName: result.name,
                              };

                              setSelectedChat({
                                ...selectedChat,
                                messages: [...selectedChat.messages, newMsg],
                              });
                              setConversations((prev) =>
                                prev.map((conv) =>
                                  conv.userId === selectedChat.userId
                                    ? {
                                        ...conv,
                                        lastMessage: "", // Force empty so "[Image]" shows
                                        lastTimestamp: now,
                                      }
                                    : conv
                                )
                              );

                              setTimeout(scrollToBottom, 100);
                            }}
                          />
                        </div>
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
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="Enlarged"
            className="max-w-full max-h-full rounded-lg border border-white"
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCommunication;
