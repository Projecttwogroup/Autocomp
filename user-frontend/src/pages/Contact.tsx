import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Bot, Paperclip, Send, HeadsetIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as signalR from "@microsoft/signalr";

interface Message {
  id: string;
  content: string | null;
  sender: "user" | "agent" | "ai";
  timestamp: Date;
  name?: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

const Contact = () => {
  const [activeTab, setActiveTab] = useState<string>("support");
  const [message, setMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState<Message[]>([]);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const ticketId = searchParams.get("ticket");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = localStorage.getItem("autocomp-user-id");
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

useEffect(() => {
  requestAnimationFrame(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  });
}, [activeTab]);


  const loadAiHistory = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/ai/history/${userId}`);
      if (!res.ok) throw new Error("Failed to load AI history");

      const history = await res.json();
      const mapped = history.flatMap((item: any) => [
        {
          id: `user-${item.id}-prompt`,
          content: item.content,
          sender: "user",
          timestamp: new Date(item.timestamp),
        },
        {
          id: `ai-${item.id}-response`,
          content: item.response,
          sender: "ai",
          name: "AI Assistant",
          timestamp: new Date(item.timestamp),
        },
      ]);

      setAiMessages(mapped);
    } catch (err) {
      console.error("AI history error", err);
    }
  };

  useEffect(() => {
    loadAiHistory();
  }, [userId]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/chat/${userId}`);
        if (!response.ok) throw new Error("Failed to load chat history");

        const history = await response.json();

        const processedMessages = history.map((entry: any) => ({
          id: Math.random().toString(36).substring(2),
          content: entry.content,
          sender: entry.sender === "admin" ? "agent" : entry.sender,
          timestamp: new Date(entry.timestamp + "Z"),
          name:
            entry.sender === "admin"
              ? "Support Team"
              : entry.sender === "ai"
              ? "AI Assistant"
              : undefined,
          attachments: entry.attachmentUrl
            ? [
                {
                  name: entry.attachmentName,
                  url: entry.attachmentUrl,
                },
              ]
            : undefined,
        }));

        // Separate messages by type
        setSupportMessages(
          processedMessages.filter((msg: Message) => msg.sender !== "ai")
        );
      } catch (error) {
        console.error("Failed to load chat history:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadChatHistory();
  }, [userId, toast]);

  // Initialize SignalR connection
  useEffect(() => {
    const startConnection = async () => {
      try {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl("/chatHub")
          .withAutomaticReconnect()
          .build();

        connection.on(
          "ReceiveMessage",
          (
            userId: string,
            sender: string,
            content: string | null,
            timestamp: string,
            attachments: Array<{ name: string; url: string }>
          ) => {
            const newMessage: Message = {
              id: `${sender}-${Date.now()}`,
              content,
              sender:
                sender === "admin"
                  ? "agent"
                  : (sender as "user" | "agent" | "ai"),
              timestamp: new Date(timestamp),
              attachments: attachments?.length > 0 ? attachments : undefined,
              name:
                sender === "admin"
                  ? "Support Team"
                  : sender === "ai"
                  ? "AI Assistant"
                  : undefined,
            };

            if (sender === "ai") {
              setAiMessages((prev) => [...prev, newMessage]);
            } else {
              setSupportMessages((prev) => [...prev, newMessage]);
            }
          }
        );

        await connection.start();
        hubConnectionRef.current = connection;
        console.log("SignalR Connected");
      } catch (err) {
        console.error("SignalR Connection Error:", err);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service. Please try again.",
          variant: "destructive",
        });
      }
    };

    startConnection();

    return () => {
      hubConnectionRef.current?.stop();
    };
  }, [toast]);

  useEffect(() => {
    const container = messagesEndRef.current?.closest(".overflow-y-auto");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [supportMessages, aiMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [activeTab]); // Trigger scrolling when the active tab changes

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!message.trim() || !userId) return;

    try {
      setLoading(true);

      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        sender: "user",
        timestamp: new Date(),
      };

      if (activeTab === "support") {
        await fetch("/api/chathub/sendmessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            sender: "user",
            content: message,
          }),
        });
      } else {
        setAiMessages((prev) => [...prev, newUserMessage]);
        setMessage("");

        // Send message to the AI Assistant API
        const response = await fetch("/api/ai/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            prompt: message,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();

        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
          name: "AI Assistant",
        };

        setAiMessages((prev) => [...prev, aiResponse]);
      }

      setMessage(""); // Clear the textbox after sending
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userId) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      formData.append("sender", "user");

      const response = await fetch("/api/chathub/sendattachments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const attachmentInfo = await response.json();

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Amman",
    });
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderMessagesWithSeparators = (messages: Message[]) => {
    const result: JSX.Element[] = [];
    let lastDate: string | null = null;

    messages.forEach((msg) => {
      const currentDate = formatDateSeparator(msg.timestamp);
      if (currentDate !== lastDate) {
        result.push(
          <div
            key={`separator-${msg.timestamp}`}
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
          key={msg.id}
          className={cn("flex", {
            "justify-end": msg.sender === "user",
            "justify-start": msg.sender !== "user",
          })}
        >
          <div
            className={cn(
              "flex flex-col max-w-[80%] md:max-w-[70%] space-y-2",
              {
                "items-end": msg.sender === "user",
                "items-start": msg.sender !== "user",
              }
            )}
          >
            {msg.sender !== "user" && msg.name && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className={cn({
                      "bg-autocomp-600": msg.sender === "ai",
                      "bg-blue-600": msg.sender === "agent"
                    })}
                  >
                    {msg.sender === "ai" ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : msg.sender === "agent" ? (
                      <HeadsetIcon className="h-4 w-4 text-white" />
                    ) : (
                      msg.name.charAt(0)
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{msg.name}</span>
              </div>
            )}

            {msg.content && (
              <div
                className={cn("rounded-lg px-4 py-2 text-sm", {
                  "bg-primary text-primary-foreground": msg.sender === "user",
                  "bg-muted": msg.sender !== "user",
                })}
              >
                {msg.content}
              </div>
            )}

            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {msg.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="text-xs bg-background border rounded-lg px-2 py-1 flex items-center gap-1"
                  >
                    {attachment.url.match(/\.(jpeg|jpg|gif|png|ico)$/i) ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="rounded-lg object-cover w-full h-full max-w-[200px] max-h-[200px] cursor-pointer hover:opacity-80"
                        onClick={() => setEnlargedImage(attachment.url)}
                      />
                    ) : attachment.url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        controls
                        className="rounded-lg object-cover w-full h-full max-w-[200px] max-h-[200px]"
                      >
                        <source
                          src={attachment.url}
                          type={`video/${attachment.url.split(".").pop()}`}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <>
                        <Paperclip className="h-3 w-3" />
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {attachment.name}
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            <span className="text-xs text-muted-foreground">
              {formatTime(msg.timestamp)}
            </span>
          </div>
        </div>
      );
    });

    return result;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground">
          Get in touch with our support team for assistance.
        </p>
      </div>

      <Tabs
        defaultValue="support"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="support">Support Chat</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-col space-y-1.5">
                <CardTitle>
                  {activeTab === "support"
                    ? "Technical Support"
                    : "AI Assistant"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "support" ? (
                    <span className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Support agent online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-autocomp-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-autocomp-500"></span>
                      </span>
                      Powered by AI
                    </span>
                  )}
                </CardDescription>
              </div>
              {ticketId && (
                <Badge
                  variant="outline"
                  className="bg-autocomp-50 text-autocomp-600 border-autocomp-200 dark:bg-autocomp-950 dark:text-autocomp-400 dark:border-autocomp-800"
                >
                  Request: {ticketId}
                </Badge>
              )}
            </CardHeader>

            <TabsContent value="support" className="m-0">
              <CardContent className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {renderMessagesWithSeparators(supportMessages)}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-2 bg-muted text-sm">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <form
                  onSubmit={handleSendMessage}
                  className="flex w-full items-center space-x-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <Input
                    type="text"
                    placeholder={
                      activeTab === "support"
                        ? "Type your message..."
                        : "Ask the AI assistant..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || loading}
                    className="bg-autocomp-500 hover:bg-autocomp-600"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </TabsContent>

            <TabsContent value="ai" className="m-0">
              <CardContent className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {renderMessagesWithSeparators(aiMessages)}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-2 bg-muted text-sm">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <form
                  onSubmit={handleSendMessage}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    type="text"
                    placeholder="Ask the AI assistant..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || loading}
                    className="bg-autocomp-500 hover:bg-autocomp-600"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </TabsContent>
          </Card>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Sunday - Thursday</span>
                  <span className="font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="text-sm text-muted-foreground pt-2">
                  All times are in your local timezone. Support is available
                  whenever you need it.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Email</span>
                  <a
                    href="mailto:projecttwogroup1@gmail.com"
                    className="font-medium text-autocomp-600 dark:text-autocomp-400 hover:underline"
                  >
                    projecttwogroup1@gmail.com{" "}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span>Phone</span>
                  <span className="font-medium">+962781234567</span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium">
                    Main Office, IT Department
                  </span>
                </div>
                <div className="text-sm text-muted-foreground pt-2">
                  For urgent issues outside of business hours, please call the
                  emergency support line.
                </div>
              </CardContent>
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
      </Tabs>
    </div>
  );
};

export default Contact;
