import { CircularLoading } from '@/components/ui/LoadingIndicator';

export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <CircularLoading size="lg" />
    </div>
  );
}
