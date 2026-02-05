import Image from 'next/image';
import { App } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { VersionBadge } from '@/components/VersionBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardTableProps {
  apps: App[];
  isLoading: boolean;
}

export function DashboardTable({ apps, isLoading }: DashboardTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View (shown below lg breakpoint) */}
      <div className="space-y-4 md:hidden">
        {apps.map((app) => (
          <Card key={app.id} className="border-muted overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 flex flex-row items-center gap-3 space-y-0 px-4 py-3">
              {app.icon ? (
                <Image
                  src={app.icon}
                  alt={app.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md border object-cover"
                  unoptimized
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold">
                  {app.name.charAt(0)}
                </div>
              )}
              <CardTitle className="text-base leading-none font-bold tracking-tight md:text-sm">
                {app.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {app.stores.map((store) => (
                <div key={store.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${store.name} for ${app.name}`}
                      className="text-primary truncate text-[15px] font-medium hover:underline md:text-[13px]"
                    >
                      {store.name}
                    </a>
                    {store.version !== 'N/A' ? (
                      <VersionBadge
                        version={store.version}
                        className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[12px] md:text-[10px]"
                      />
                    ) : (
                      <span className="text-muted-foreground shrink-0 text-[12px] italic md:text-[10px]">
                        N/A
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-[13px] md:text-[11px]">
                    <span>Last Update:</span>
                    <span className="font-medium">{store.lastUpdateDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-card hidden overflow-hidden overflow-x-auto rounded-md border md:block">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-[40%] px-3 py-2 text-[0.75rem] font-semibold">
                  Application
                </TableHead>
                <TableHead className="h-10 w-[25%] px-3 py-2 text-[0.75rem] font-semibold">
                  Store
                </TableHead>
                <TableHead className="h-10 w-[15%] px-3 py-2 text-[0.75rem] font-semibold">
                  Version
                </TableHead>
                <TableHead className="h-10 w-[20%] px-3 py-2 text-[0.75rem] font-semibold">
                  Last Update
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) =>
                app.stores.map((store, index) => (
                  <TableRow
                    key={`${app.id}-${store.id}`}
                    className="hover:bg-muted/50 border-b transition-colors last:border-0"
                  >
                    {index === 0 && (
                      <TableCell rowSpan={app.stores.length} className="px-3 py-2.5 align-top">
                        <div className="flex items-start gap-2">
                          {app.icon ? (
                            <Image
                              src={app.icon}
                              alt={app.name}
                              width={24}
                              height={24}
                              className="app-icon"
                              unoptimized
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className="app-icon bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                              {app.name.charAt(0)}
                            </div>
                          )}
                          <span className="pt-0.5 leading-tight font-semibold">{app.name}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="px-3 py-2.5">
                      <a
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${store.name} for ${app.name}`}
                        className="text-foreground transition-colors hover:underline"
                      >
                        {store.name}
                      </a>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      {store.version !== 'N/A' ? (
                        <VersionBadge
                          version={store.version}
                          className="rounded-[calc(var(--radius)-2px)] px-2 py-0.5 font-mono text-[0.6875rem]"
                        />
                      ) : (
                        <span className="text-muted-foreground text-[0.6875rem] italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-[0.8125rem] whitespace-nowrap">
                      {store.lastUpdateDate}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Mobile Skeleton */}
      <div className="space-y-4 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-muted overflow-hidden shadow-sm">
            <div className="bg-muted/30 flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
            <CardContent className="divide-y p-0">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-12 rounded-[calc(var(--radius)-2px)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block">
        <div className="bg-card overflow-hidden rounded-md border shadow-sm">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-[40%] px-3 py-2 text-[0.75rem] font-semibold">
                  Application
                </TableHead>
                <TableHead className="h-10 w-[25%] px-3 py-2 text-[0.75rem] font-semibold">
                  Store
                </TableHead>
                <TableHead className="h-10 w-[15%] px-3 py-2 text-[0.75rem] font-semibold">
                  Version
                </TableHead>
                <TableHead className="h-10 w-[20%] px-3 py-2 text-[0.75rem] font-semibold">
                  Last Update
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-b last:border-0 hover:bg-transparent">
                  <TableCell className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Skeleton className="h-5 w-12 rounded-[calc(var(--radius)-2px)]" />
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
