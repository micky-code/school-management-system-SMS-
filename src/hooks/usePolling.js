/**
 * Custom React hook for polling data as WebSocket fallback
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const usePolling = (fetchFunction, options = {}) => {
  const {
    interval = 5000,
    enabled = true,
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onError?.(err);
        console.error('Polling error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFunction, enabled, onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled) {
      // Fetch immediately
      fetchData();
      
      // Then set up interval
      intervalRef.current = setInterval(fetchData, interval);
    }
  }, [fetchData, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refreshData,
    startPolling,
    stopPolling
  };
};

export default usePolling;
