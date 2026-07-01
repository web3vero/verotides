'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full flex flex-col bg-black overflow-x-hidden antialiased font-mono">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-primary">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-red-500">CRITICAL SYSTEM FAILURE</h2>
          <p className="mb-8 opacity-75">{error.message || 'An unexpected telemetry error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 border border-primary hover:bg-primary/20 transition-colors uppercase tracking-wider text-xs"
          >
            Initiate Reboot Sequence
          </button>
        </div>
      </body>
    </html>
  );
}
