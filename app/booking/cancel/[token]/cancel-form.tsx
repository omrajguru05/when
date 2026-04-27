'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type Props = {
  token: string;
  alreadyCancelled: boolean;
  hostUsername: string;
};

export function CancelForm({ token, alreadyCancelled, hostUsername }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyCancelled);

  const onCancel = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Could not cancel.');
        setSubmitting(false);
        return;
      }
      setDone(true);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Network error.');
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 space-y-4">
        <Alert tone="success" title="Booking cancelled">
          We've sent confirmation emails to both parties.
        </Alert>
        <Link href={`/${hostUsername}`}>
          <Button variant="secondary" size="md" className="w-full">
            Book another time
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Button
        type="button"
        variant="danger"
        size="md"
        className="w-full"
        isLoading={submitting}
        onClick={onCancel}
      >
        Cancel booking
      </Button>
      <Link href={`/${hostUsername}`}>
        <Button variant="ghost" size="md" className="w-full">
          Keep booking
        </Button>
      </Link>
    </div>
  );
}
