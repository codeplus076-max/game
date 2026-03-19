export default function ErrorState({ message, retryAction }: { message: string; retryAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-950/20 border border-red-900/50 rounded-lg text-center">
      <div className="text-red-400 mb-2 font-medium">Error</div>
      <p className="text-sm text-red-200/70 mb-4">{message}</p>
      {retryAction && (
        <button
          onClick={retryAction}
          className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-sm rounded-md transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
