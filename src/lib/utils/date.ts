import { format } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy');
  } catch {
    return 'N/A';
  }
}

export function parseGooglePlayDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return formatDate(date.toISOString());
  } catch {
    return dateStr;
  }
}
