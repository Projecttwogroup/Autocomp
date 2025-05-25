import { useState, useRef, useCallback, useEffect } from 'react';
import { performanceService } from '@/services/performance-service';
import { useCleanup } from '@/lib/cleanup';

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  name?: string;
  attachments?: Array<{ name: string; url: string }>;
}

interface MessageBatch {
  messages: ChatMessage[];
  timestamp: number;
}

export function useChatMessages(batchSize = 50, batchInterval = 100) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const batchQueueRef = useRef<MessageBatch[]>([]);
  const batchTimeoutRef = useRef<number>();
  const cleanup = useCleanup();

  // Process message batches
  const processBatches = useCallback(() => {
    performanceService.startMeasure('chat:batch:process');
    
    if (batchQueueRef.current.length === 0) return;

    const now = Date.now();
    const batchesToProcess = batchQueueRef.current.filter(
      batch => now - batch.timestamp >= batchInterval
    );

    if (batchesToProcess.length === 0) return;

    // Merge all messages from batches
    const newMessages = batchesToProcess.flatMap(batch => batch.messages);
    
    setMessages(prevMessages => {
      const merged = [...prevMessages, ...newMessages];
      // Sort by timestamp if needed
      return merged.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    // Remove processed batches
    batchQueueRef.current = batchQueueRef.current.filter(
      batch => !batchesToProcess.includes(batch)
    );

    performanceService.endMeasure('chat:batch:process', {
      batchCount: batchesToProcess.length,
      messageCount: newMessages.length,
    });
  }, [batchInterval]);

  // Schedule batch processing
  useEffect(() => {
    const intervalId = setInterval(processBatches, batchInterval);
    cleanup.add(() => clearInterval(intervalId));
  }, [processBatches, batchInterval, cleanup]);

  const addMessage = useCallback((message: ChatMessage) => {
    performanceService.startMeasure('chat:message:add');

    let currentBatch = batchQueueRef.current[batchQueueRef.current.length - 1];
    
    if (!currentBatch || currentBatch.messages.length >= batchSize) {
      currentBatch = {
        messages: [],
        timestamp: Date.now(),
      };
      batchQueueRef.current.push(currentBatch);
    }

    currentBatch.messages.push(message);

    performanceService.endMeasure('chat:message:add', {
      batchSize: currentBatch.messages.length,
    });
  }, [batchSize]);

  const addMessages = useCallback((newMessages: ChatMessage[]) => {
    performanceService.startMeasure('chat:messages:add');

    // Split messages into batches
    for (let i = 0; i < newMessages.length; i += batchSize) {
      const batchMessages = newMessages.slice(i, i + batchSize);
      batchQueueRef.current.push({
        messages: batchMessages,
        timestamp: Date.now(),
      });
    }

    performanceService.endMeasure('chat:messages:add', {
      totalMessages: newMessages.length,
      batchCount: Math.ceil(newMessages.length / batchSize),
    });
  }, [batchSize]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    performanceService.startMeasure('chat:messages:load');

    try {
      // TODO: Implement API call to load more messages
      const moreMessages: ChatMessage[] = [];
      addMessages(moreMessages);

      setHasMore(moreMessages.length === batchSize);
      performanceService.endMeasure('chat:messages:load', { 
        success: true,
        count: moreMessages.length 
      });
    } catch (error) {
      performanceService.endMeasure('chat:messages:load', { 
        success: false,
        error 
      });
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, batchSize, addMessages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    batchQueueRef.current = [];
    setHasMore(true);
  }, []);

  // Cleanup batching on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    addMessage,
    addMessages,
    loadMoreMessages,
    clearMessages,
    hasMore,
    isLoading,
  };
}