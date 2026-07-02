import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

async function getFooterContent() {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const { data } = await supabase.from('content_blocks').select('*');
  const blocks: Record<string, string> = {};
  data?.forEach((block) => {
    blocks[block.block_key] = block.content;
  });
  return blocks;
}

export async function Footer() {
  const content = await getFooterContent();

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-display text-xs font-bold text-white">
                JA
              </span>
              <span className="font-display text-base font-semibold text-white">
                Jenca Aesthetics
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              {content['footer_tagline'] ||
                'Premium skincare treatments in a calm, welcoming environment.'}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {content['contact_phone'] && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{content['contact_phone']}</span>
                </li>
              )}
              {content['contact_email'] && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{content['contact_email']}</span>
                </li>
              )}
              {content['contact_address'] && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{content['contact_address']}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Jenca Aesthetics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
