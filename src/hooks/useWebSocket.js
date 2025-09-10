/**
 * Custom React hook for WebSocket connection with automatic reconnection
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    protocols = [],
    shouldReconnect = true
  } = options;

  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  
  const reconnectTimeoutId = useRef(null);
  const reconnectCount = useRef(0);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url, protocols);
      socketRef.current = ws;
      setSocket(ws);

      ws.onopen = (event) => {
        console.log('WebSocket connected:', url);
        setReadyState(WebSocket.OPEN);
        setConnectionStatus('Connected');
        reconnectCount.current = 0;
        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data, event);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setLastMessage(event.data);
          onMessage?.(event.data, event);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setReadyState(WebSocket.CLOSED);
        setConnectionStatus('Disconnected');
        setSocket(null);
        socketRef.current = null;
        onClose?.(event);

        // Attempt to reconnect if enabled and within retry limits
        if (shouldReconnect && reconnectCount.current < maxReconnectAttempts) {
          reconnectCount.current += 1;
          setConnectionStatus(`Reconnecting... (${reconnectCount.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutId.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCount.current >= maxReconnectAttempts) {
          setConnectionStatus('Connection failed');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setConnectionStatus('Error');
        onError?.(event);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('Connection failed');
    }
  }, [url, protocols, onMessage, onOpen, onClose, onError, shouldReconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
    }
    
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageStr);
      return true;
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
      return false;
    }
  }, []);

  const sendJsonMessage = useCallback((message) => {
    return sendMessage(JSON.stringify(message));
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
    };
  }, []);

  return {
    socket,
    lastMessage,
    readyState,
    connectionStatus,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;
