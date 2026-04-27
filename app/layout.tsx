import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import '@/bones/registry';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const interHeading = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'WHEN, open-source scheduling',
    template: '%s · WHEN',
  },
  description:
    'Lightweight, open-source scheduling. Self-host on Vercel free tier. Own your design and your data.',
  openGraph: {
    title: 'WHEN, open-source scheduling',
    description: 'Lightweight, open-source scheduling. Self-host on Vercel free tier.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interHeading.variable} ${plexMono.variable} ${GeistMono.variable}`}
      style={{ ['--font-display' as string]: 'var(--font-geist-mono)' }}
    >
      <body className="min-h-screen bg-white text-slate-800 antialiased">{children}</body>
    </html>
  );
}
