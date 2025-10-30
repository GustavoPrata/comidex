import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface LoadDataOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Wrapper function to load data from Supabase with retry logic
 * Handles intermittent connection issues and provides better reliability
 */
export async function loadDataWithRetry<T>(
  fetcher: () => Promise<T>,
  options: LoadDataOptions = {}
): Promise<T> {
  const { 
    maxRetries = MAX_RETRIES, 
    retryDelay = RETRY_DELAY,
    onRetry 
  } = options;

  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if Supabase client is ready
      const supabase = createClient();
      
      // Small delay on first attempt to ensure client is ready
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const result = await fetcher();
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Load attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        onRetry?.(attempt, error);
        
        // Exponential backoff: delay increases with each retry
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Hook to ensure data loads properly even on hard refresh
 * Adds loading state management and error recovery
 */
export function useReliableDataLoader<T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadDataWithRetry(loader, {
        onRetry: (attempt) => {
          setRetryCount(attempt);
        }
      });
      
      setData(result);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Failed to load data after retries:', err);
      setError(err?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [loader, ...dependencies]);

  useEffect(() => {
    loadData();
  }, dependencies);

  return { data, loading, error, retryCount, reload: loadData };
}