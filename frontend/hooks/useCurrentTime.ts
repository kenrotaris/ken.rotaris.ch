import { useState, useEffect } from 'react';
import { formatGreeting, formatDateTime } from '@/lib/utils';

interface CurrentTime {
  greeting: string;
  time: string;
}

/**
 * Hook to get current time and greeting, updated every second
 */
export function useCurrentTime(timezone: string = 'UTC'): CurrentTime {
  const [greeting, setGreeting] = useState('Hello');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setGreeting(formatGreeting(now));
      setTime(formatDateTime(now, timezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return { greeting, time };
}
