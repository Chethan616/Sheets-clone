import { CircularLoading, LinearLoading } from '@/components/ui/LoadingIndicator';

export default function EditorLoading() {
  return (
    <div className="flex h-screen flex-col bg-surface">
      <LinearLoading />
      <div className="flex flex-1 items-center justify-center">
        <CircularLoading size="lg" />
      </div>
    </div>
  );
}
