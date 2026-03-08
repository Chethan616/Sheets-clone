import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-error-container">
        <span className="text-4xl">404</span>
      </div>
      <h1 className="text-2xl font-medium text-on-surface">Page not found</h1>
      <p className="text-sm text-on-surface-variant">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary transition-shadow hover:shadow-elevation-1"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
