import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            Jenca Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to manage your bookings and content.
          </p>
        </div>

        <div className="mt-8 card p-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
