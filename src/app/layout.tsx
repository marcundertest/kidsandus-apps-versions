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
  metadataBase: new URL('https://kidsandus-apps-versions.netlify.app/'),
  title: {
    default: 'Kids&Us Apps Versions',
    template: '%s | Kids&Us Apps Versions',
  },
  description:
    'Dashboard for monitoring Kids&Us mobile and desktop apps versions across stores (Google Play, App Store, Microsoft Store).',
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
    title: 'Kids&Us Apps Versions',
    description: 'Dashboard for monitoring Kids&Us mobile and desktop apps versions across stores.',
    url: 'https://kidsandus-apps-versions.netlify.app/',
    siteName: 'Kids&Us Apps Versions',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids&Us Apps Versions',
    description: 'Dashboard for monitoring Kids&Us mobile and desktop apps versions across stores.',
    creator: '@marcundertest',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kids&Us Apps Versions',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
