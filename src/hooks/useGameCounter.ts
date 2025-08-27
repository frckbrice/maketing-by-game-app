import { useState, useEffect } from 'react';
import { realtimeService } from '@/lib/firebase/services';
import type { GameCounter } from '@/types';

export function useGameCounter(gameId: string) {
  const [counter, setCounter] = useState<GameCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    // Get initial counter value
    const fetchInitialCounter = async () => {
      try {
        const initialCounter = await realtimeService.getGameCounter(gameId);
        setCounter(initialCounter);
      } catch (err) {
        setError('Failed to fetch initial counter');
        console.error('Error fetching initial counter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCounter();

    // Set up real-time listener
    const unsubscribe = realtimeService.onGameCounterChange(gameId, data => {
      setCounter(data);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  const incrementParticipants = async () => {
    try {
      await realtimeService.incrementParticipants(gameId);
    } catch (err) {
      setError('Failed to increment participants');
      console.error('Error incrementing participants:', err);
      throw err;
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await realtimeService.updateGameCounter(gameId, { status });
    } catch (err) {
      setError('Failed to update game status');
      console.error('Error updating game status:', err);
      throw err;
    }
  };

  return {
    counter,
    loading,
    error,
    incrementParticipants,
    updateStatus,
  };
}
