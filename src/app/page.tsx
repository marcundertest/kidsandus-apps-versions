'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { DashboardTable } from '@/components/DashboardTable';
import { UpdateControl } from '@/components/UpdateControl';
import { DashboardData } from '@/lib/types';
import { toast } from 'sonner';

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.status === 404) {
        setIsLoading(false);
        return;
      }
      if (!response.ok) throw new Error('Failed to load data');
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (adminKey?: string) => {
    const isAdminAttempt = typeof adminKey !== 'undefined';
    let progressTimer: NodeJS.Timeout | undefined;

    if (!isAdminAttempt) {
      setIsUpdating(true);
    } else {
      progressTimer = setTimeout(() => {
        setIsUpdating(true);
      }, 2000);
    }

    const toastId = toast.loading(
      isAdminAttempt ? 'Verifying admin access...' : 'Updating data...'
    );

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      // Send the header if it's an admin attempt (even if empty string)
      if (isAdminAttempt) headers['x-admin-key'] = adminKey;

      const response = await fetch('/api/update', {
        method: 'POST',
        headers,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }

      setData(result.data);
      toast.success('Data updated successfully', { id: toastId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      toast.error(message, { id: toastId });
    } finally {
      if (progressTimer) clearTimeout(progressTimer);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-2 md:py-3">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <h1 className="text-xl font-semibold tracking-tight">Kids&Us App Versions</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto max-w-5xl flex-1 px-4 py-6">
        <main>
          <div className="mb-6">
            <UpdateControl
              lastUpdate={data?.lastUpdate ?? null}
              onUpdate={handleUpdate}
              isUpdating={isUpdating}
              isLoading={isLoading}
            />
          </div>

          {!isLoading && !data ? (
            <div className="bg-card overflow-hidden rounded-md border">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground px-4 py-12 text-center text-[0.8125rem]">
                      <div>
                        Please click{' '}
                        <span onClick={() => handleUpdate()} className="cursor-pointer underline">
                          here
                        </span>{' '}
                        to generate the data.
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <DashboardTable
              apps={data?.apps || []}
              isLoading={isLoading || (isUpdating && !data)}
            />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
