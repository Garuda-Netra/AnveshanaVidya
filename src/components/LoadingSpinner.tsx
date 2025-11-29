export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border-glass border-t-accent-neon rounded-full animate-spin" />
        <span className="sr-only">Loading content...</span>
      </div>
    </div>
  );
}
