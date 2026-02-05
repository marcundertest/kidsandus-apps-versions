'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface UpdateControlProps {
  lastUpdate: string | null;
  onUpdate: () => Promise<void>;
  isUpdating: boolean;
}

export function UpdateControl({ lastUpdate, onUpdate, isUpdating }: UpdateControlProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isUpdating) {
      // Use a small delay or check to avoid synchronous cascading render warning
      const timeout = setTimeout(() => {
        setProgress((prev) => (prev === 0 ? 10 : prev));
      }, 0);

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    } else if (progress > 0) {
      const completeTimeout = setTimeout(() => setProgress(100), 0);
      const timer = setTimeout(() => setProgress(0), 1000);
      return () => {
        clearTimeout(completeTimeout);
        clearTimeout(timer);
      };
    }
  }, [isUpdating, progress]);

  useEffect(() => {
    if (!lastUpdate) return;

    const checkCooldown = () => {
      const last = new Date(lastUpdate).getTime();
      const now = new Date().getTime();
      const diffMinutes = (now - last) / (1000 * 60);
      const remaining = Math.max(0, 60 - Math.floor(diffMinutes));
      setCooldownRemaining(remaining);
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 60000);
    return () => clearInterval(interval);
  }, [lastUpdate, isUpdating]);

  const formatLastUpdate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Never';
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={onUpdate}
          disabled={isUpdating || cooldownRemaining > 0}
          size="sm"
          className="h-8 w-fit shrink-0 px-4"
        >
          {isUpdating ? 'Updating...' : 'Update Data'}
        </Button>
        <span className="text-muted-foreground text-[13px] whitespace-nowrap">
          Last update: {lastUpdate ? formatLastUpdate(lastUpdate) : 'Never'}
          {cooldownRemaining > 0 && ` (${cooldownRemaining}m)`}
        </span>
      </div>

      {(isUpdating || progress > 0) && (
        <div className="animate-in fade-in slide-in-from-top-1 space-y-1.5 duration-300">
          <Progress value={progress} className="h-1.5" />
          <p className="text-muted-foreground text-[11px]">
            {progress === 100 ? 'Complete' : 'Updating...'}
          </p>
        </div>
      )}
    </div>
  );
}
