import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jenca Aesthetics — Book Your Appointment',
    template: '%s — Jenca Aesthetics',
  },
  description:
    'Book your skincare appointment at Jenca Aesthetics. Browse treatments, pick a time, and confirm in under a minute.',
  openGraph: {
    title: 'Jenca Aesthetics — Book Your Appointment',
    description: 'Book your skincare appointment online. No account needed.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
