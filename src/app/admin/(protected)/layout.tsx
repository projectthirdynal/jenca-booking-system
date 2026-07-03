import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/services': 'Services',
  '/admin/staff': 'Staff',
  '/admin/customers': 'Customers',
  '/admin/availability': 'Availability',
  '/admin/content': 'Content',
  '/admin/branding': 'Branding',
  '/admin/gallery': 'Gallery',
  '/admin/settings': 'Settings',
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Get failed notification count for the bell icon
  const { count: failedCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  // Determine breadcrumb from pathname
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || headerList.get('referer') || '';
  const adminPath = pathname.replace(/^https?:\/\/[^/]+/, '');
  const breadcrumb = BREADCRUMB_MAP[adminPath] || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar
          userEmail={user.email || null}
          failedCount={failedCount || 0}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
