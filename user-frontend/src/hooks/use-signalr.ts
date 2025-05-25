import * as signalR from '@microsoft/signalr';
import { useRef, useEffect, useCallback, useState } from 'react';
import { performanceService } from '@/services/performance-service';

interface SignalRConfig {
  url: string;
  autoReconnect?: boolean;
}

export function useSignalR(config: SignalRConfig) {
  const { url, autoReconnect = true } = config;
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const methodHandlers = useRef(new Map<string, Function[]>());
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const createConnection = useCallback(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.onclose((error) => {
      if (error) {
        setConnectionError(error);
        console.error('SignalR Connection closed with error:', error);
      }
    });

    connection.onreconnecting((error) => {
      console.warn('SignalR Reconnecting:', error);
    });

    connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      setConnectionError(null);
    });

    connectionRef.current = connection;
    return connection;
  }, [url]);

  const on = useCallback(<T>(methodName: string, newHandler: (data: T) => void) => {
    if (!methodHandlers.current.has(methodName)) {
      methodHandlers.current.set(methodName, []);
      
      connectionRef.current?.on(methodName, (...args: any[]) => {
        const handlers = methodHandlers.current.get(methodName) || [];
        handlers.forEach(handler => handler(...args));
      });
    }

    const handlers = methodHandlers.current.get(methodName) || [];
    handlers.push(newHandler);
    methodHandlers.current.set(methodName, handlers);

    return () => {
      const currentHandlers = methodHandlers.current.get(methodName) || [];
      const updatedHandlers = currentHandlers.filter(h => h !== newHandler);
      
      if (updatedHandlers.length === 0) {
        connectionRef.current?.off(methodName);
        methodHandlers.current.delete(methodName);
      } else {
        methodHandlers.current.set(methodName, updatedHandlers);
      }
    };
  }, []);

  const invoke = useCallback(async <T>(methodName: string, ...args: any[]): Promise<T> => {
    if (!connectionRef.current || connectionRef.current.state === signalR.HubConnectionState.Disconnected) {
      try {
        const connection = createConnection();
        await connection.start();
        setConnectionError(null);
      } catch (error) {
        setConnectionError(error as Error);
        throw error;
      }
    }

    performanceService.startMeasure(`signalr:invoke:${methodName}`);

    try {
      const result = await connectionRef.current!.invoke<T>(methodName, ...args);
      performanceService.endMeasure(`signalr:invoke:${methodName}`, { success: true });
      return result;
    } catch (error) {
      performanceService.endMeasure(`signalr:invoke:${methodName}`, { success: false, error });
      throw error;
    }
  }, [createConnection]);

  useEffect(() => {
    const startConnection = async () => {
      if (!connectionRef.current) {
        try {
          const connection = createConnection();
          await connection.start();
          setConnectionError(null);
        } catch (error) {
          setConnectionError(error as Error);
          console.error('Failed to start SignalR connection:', error);
        }
      }
    };

    startConnection();

    return () => {
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [createConnection]);

  return {
    on,
    invoke,
    connectionError
  };
}