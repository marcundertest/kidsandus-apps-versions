'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { DashboardTable } from '@/components/DashboardTable';
import { UpdateControl } from '@/components/UpdateControl';
import { DashboardData } from '@/lib/types';

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch('/api/update', { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Update failed');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-5xl flex-1 px-4 py-6">
        <header className="mb-6 border-b pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Kids&Us Apps Versions</h1>
            <ThemeToggle />
          </div>

          <UpdateControl
            lastUpdate={data?.lastUpdate ?? null}
            onUpdate={handleUpdate}
            isUpdating={isUpdating}
            isLoading={isLoading}
          />

          {error && (
            <p className="text-destructive animate-in fade-in mt-2 text-xs duration-300">
              Error: {error}
            </p>
          )}
        </header>

        <main>
          {!isLoading && !data ? (
            <div className="bg-card overflow-hidden rounded-md border">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="text-muted-foreground px-4 py-12 text-center text-[0.8125rem]">
                      <div>
                        Please click{' '}
                        <span onClick={handleUpdate} className="cursor-pointer underline">
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
