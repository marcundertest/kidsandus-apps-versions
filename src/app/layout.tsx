import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kidsandus-app-versions.netlify.app/'),
  title: {
    default: 'Kids&Us App Versions',
    template: '%s | Kids&Us App Versions',
  },
  description:
    'Dashboard for monitoring Kids&Us mobile and desktop app versions across stores (Google Play, App Store, Microsoft Store).',
  keywords: ['Kids&Us', 'Apps', 'Versions', 'Dashboard', 'Mobile', 'Education', 'Tracking'],
  authors: [{ name: 'Marc Galindo', url: 'https://marcundertest.com' }],
  creator: 'Marc Galindo',
  publisher: 'Marc Galindo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Kids&Us App Versions',
    description: 'Dashboard for monitoring Kids&Us mobile and desktop app versions across stores.',
    url: 'https://kidsandus-app-versions.netlify.app/',
    siteName: 'Kids&Us App Versions',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids&Us App Versions',
    description: 'Dashboard for monitoring Kids&Us mobile and desktop app versions across stores.',
    creator: '@marcundertest',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kids&Us App Versions',
  },
  icons: {
    icon: [
      {
        url: '/assets/favicon-light.ico',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/assets/favicon-dark.ico',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
