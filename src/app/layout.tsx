import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
