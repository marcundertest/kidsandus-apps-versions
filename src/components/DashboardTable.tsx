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
import { Badge } from '@/components/ui/badge';
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
      <div className="space-y-4 lg:hidden">
        {apps.map((app) => (
          <Card key={app.id} className="border-muted overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 flex-row items-center gap-3 space-y-0 px-4 py-3">
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
              <CardTitle className="text-sm leading-none font-bold tracking-tight">
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
                      className="text-primary truncate text-[13px] font-medium hover:underline"
                    >
                      {store.name}
                    </a>
                    {store.version !== 'N/A' ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]"
                      >
                        {store.version}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground shrink-0 text-[10px] italic">N/A</span>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                    <span>Actualización:</span>
                    <span className="font-medium">{store.lastUpdateDate}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-card hidden overflow-hidden overflow-x-auto rounded-md border lg:block">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-foreground h-10 w-[300px] px-3 py-2 text-[0.75rem] font-semibold">
                  Application
                </TableHead>
                <TableHead className="text-foreground h-10 px-3 py-2 text-[0.75rem] font-semibold">
                  Store
                </TableHead>
                <TableHead className="text-foreground h-10 px-3 py-2 text-[0.75rem] font-semibold">
                  Version
                </TableHead>
                <TableHead className="text-foreground h-10 px-3 py-2 text-[0.75rem] font-semibold">
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
                      <TableCell
                        rowSpan={app.stores.length}
                        className="px-3 py-[0.625rem] align-top"
                      >
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
                    <TableCell className="px-3 py-[0.625rem]">
                      <a
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground transition-colors hover:underline"
                      >
                        {store.name}
                      </a>
                    </TableCell>
                    <TableCell className="px-3 py-[0.625rem]">
                      {store.version !== 'N/A' ? (
                        <Badge
                          variant="secondary"
                          className="rounded-[calc(var(--radius)-2px)] px-2 py-0.5 font-mono text-[0.6875rem]"
                        >
                          {store.version}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[0.6875rem] italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[0.625rem] text-[0.8125rem] whitespace-nowrap">
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
      <div className="space-y-4 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-muted overflow-hidden shadow-sm">
            <div className="bg-muted/20 flex items-center gap-3 border-b px-4 py-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-4 w-32" />
            </div>
            <CardContent className="divide-y p-0">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block">
        <div className="bg-card overflow-hidden rounded-md border shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Application</TableHead>
                <TableHead className="w-[180px]">Store</TableHead>
                <TableHead className="w-[120px]">Version</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="border-r px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-sm" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-4">
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
