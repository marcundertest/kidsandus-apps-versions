'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { useMounted } from '@/hooks/use-mounted';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UpdateControlProps {
  lastUpdate: string | null;
  onUpdate: (adminKey?: string) => Promise<void>;
  isUpdating: boolean;
  isLoading: boolean;
}

export function UpdateControl({ lastUpdate, onUpdate, isUpdating, isLoading }: UpdateControlProps) {
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const mounted = useMounted();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isUpdating) {
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
      const remaining = Math.max(0, Math.ceil(60 - diffMinutes));
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

  const getLastUpdateText = () => {
    if (!mounted) return 'Loading...';
    if (isLoading && !lastUpdate) return 'Retrieving data...';
    return `Last update: ${lastUpdate ? formatLastUpdate(lastUpdate) : 'Never'}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === '.') {
        e.preventDefault();
        setShowAdminDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAdminSubmit = () => {
    setShowAdminDialog(false);
    onUpdate(adminKey);
    setAdminKey('');
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onUpdate()}
            disabled={isUpdating || isLoading || cooldownRemaining > 0}
            size="sm"
            className="h-8 w-fit shrink-0 px-4"
          >
            {isUpdating ? 'Updating...' : 'Update Data'}
          </Button>
          <span
            className="text-muted-foreground cursor-default text-[13px] whitespace-nowrap select-none"
            title="Last update time"
          >
            {getLastUpdateText()}
            {mounted && !isLoading && cooldownRemaining > 0 && ` (${cooldownRemaining}m remaining)`}
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

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Admin Force Update</DialogTitle>
            <DialogDescription>
              Enter the admin secret key to bypass the cooldown.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <Label htmlFor="admin-key" className="text-right">
                Secret Key
              </Label>
              <Input
                id="admin-key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="col-span-3 mt-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdminSubmit();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAdminSubmit}>
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
