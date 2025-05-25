import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { useSignalR } from '@/hooks/use-signalr';
import { useChatMessages, ChatMessage } from '@/hooks/use-chat-messages';
import { useCleanup } from '@/lib/cleanup';
import { performanceService } from '@/services/performance-service';
import { errorService } from '@/services/error-service';
import { ChatService } from '@/services/chat-service';

interface ChatContextConfig {
  baseUrl: string;
}

interface ChatContextValue {
  messages: ChatMessage[];
  isLoading: boolean;
  hasMore: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearMessages: () => void;
  connectionError: Error | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  config,
  children,
}: {
  config: ChatContextConfig;
  children: React.ReactNode;
}) {
  const cleanup = useCleanup();
  const chatService = useRef(new ChatService(config)).current;
  const [error, setError] = useState<Error | null>(null);

  // Initialize chat messages with virtualization and batching
  const {
    messages,
    addMessage,
    addMessages,
    loadMoreMessages: loadMore,
    clearMessages,
    hasMore,
    isLoading,
  } = useChatMessages();

  // Initialize SignalR connection
  const { on, invoke, connectionError } = useSignalR({
    url: `${config.baseUrl}/chatHub`,
    autoReconnect: true
  });

  // Load initial chat history
  useEffect(() => {
    const loadInitialHistory = async () => {
      try {
        const userId = localStorage.getItem('autocomp-user-id');
        if (!userId) return;
        
        const history = await chatService.loadChatHistory(userId);
        if (history && Array.isArray(history)) {
          addMessages(history);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setError(error as Error);
      }
    };

    loadInitialHistory();
  }, [chatService, addMessages]);

  // Set up real-time message handling
  useEffect(() => {
    const unsubscribe = on<ChatMessage>('ReceiveMessage', (message) => {
      performanceService.startMeasure('chat:message:receive');
      addMessage(message);
      performanceService.endMeasure('chat:message:receive');
    });

    cleanup.add(unsubscribe);
  }, [on, addMessage, cleanup]);

  const sendMessage = useCallback(async (content: string, attachments: File[] = []) => {
    performanceService.startMeasure('chat:message:send');

    try {
      const userId = localStorage.getItem('autocomp-user-id');
      if (!userId) {
        throw new Error('User ID not found');
      }

      if (connectionError) {
        throw new Error('Chat connection is not available');
      }

      // Process attachments first if any
      const processedAttachments = await Promise.all(
        attachments.map(async (file) => {
          return await chatService.uploadAttachment(file, userId, 'user');
        })
      );

      const message: Partial<ChatMessage> = {
        content,
        sender: 'user',
        timestamp: new Date(),
        attachments: processedAttachments,
      };

      await invoke('SendMessage', message);
      performanceService.endMeasure('chat:message:send', { success: true });
    } catch (error) {
      performanceService.endMeasure('chat:message:send', { success: false, error });
      errorService.captureError(error, { content, attachments });
      throw error;
    }
  }, [invoke, connectionError, chatService]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await loadMore();
  }, [isLoading, hasMore, loadMore]);

  const contextValue = React.useMemo(
    () => ({
      messages,
      isLoading,
      hasMore,
      sendMessage,
      loadMoreMessages,
      clearMessages,
      connectionError: error || connectionError,
    }),
    [
      messages,
      isLoading,
      hasMore,
      sendMessage,
      loadMoreMessages,
      clearMessages,
      error,
      connectionError,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}