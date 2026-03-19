export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-full min-h-[160px] text-gray-400">
      <div className="w-8 h-8 border-2 border-cyber-border border-t-cyber-accent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium tracking-wide animate-pulse">{message}</p>
    </div>
  );
}
