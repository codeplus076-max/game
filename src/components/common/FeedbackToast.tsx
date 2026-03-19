import { useEffect, useState } from "react";

export default function FeedbackToast({ message, type = "info", duration = 3000 }: { message: string; type?: "success" | "error" | "info" | "warning"; duration?: number }) {
  const [visible, setVisible] = useState(true);
  const colors = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  };

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border flex items-center gap-3 backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
