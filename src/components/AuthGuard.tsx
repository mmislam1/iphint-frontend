'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { selectToken } from '@/lib/store/slices/userSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useSelector(selectToken);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale || 'en';
  const targetPath = `/${locale}/signup`;

  useEffect(() => {
    if (!token && pathname !== targetPath) {
      router.replace(targetPath);
    }
  }, [token, router, pathname, targetPath]);

  if (!token && pathname !== targetPath) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#6366f1]" />
      </div>
    );
  }

  return <>{children}</>;
}