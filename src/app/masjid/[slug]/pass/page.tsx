'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { setActiveMasjidId } from '../../../../lib/storage';

export default function ScopedMasjidPassRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      setActiveMasjidId(slug);
      router.replace(`/pass?masjid=${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <p className="text-sm font-bold text-stone-600">Loading gate pass...</p>
    </div>
  );
}
