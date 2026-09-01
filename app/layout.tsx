import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: 'Agency AI Signature Studio',
  description: 'Create a polished, on-brand Agency AI email signature.',
  openGraph: {
    title: 'Agency AI Signature Studio',
    description: 'Make every email feel considered.',
    images: [{ url: '/og.png', width: 1731, height: 908, alt: 'Agency AI Signature Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agency AI Signature Studio',
    description: 'Make every email feel considered.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
