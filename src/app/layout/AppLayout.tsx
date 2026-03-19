"use client";

import Sidebar from "./Sidebar";
import CurrencyBadge from "@/components/common/CurrencyBadge";
import { useGameData } from "@/hooks/useGameData";
import LoadingState from "@/components/common/LoadingState";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    // Using user-demo across the app
    const { user, isLoading } = useGameData("user-demo");

    // If initial load and not ready, return full page loader
    if (isLoading && !user) {
        return (
            <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
                <LoadingState message="Initializing Secure Connection..." />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-cyber-bg text-cyber-text font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col xl:max-w-7xl relative mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-cyber-bg">

                {/* Top bar for currency */}
                <header className="sticky top-0 z-10 bg-cyber-bg/80 backdrop-blur-md border-b border-cyber-border p-4 flex justify-between items-center shadow-sm">
                    <div className="text-sm text-gray-400 font-mono tracking-wider hide-on-mobile">
                        SECURE NET // ENCRYPTED
                    </div>
                    <div className="flex items-center gap-4">
                        <CurrencyBadge type="crypto" amount={user?.cryptoCurrency ?? 0} />
                        <CurrencyBadge type="tokens" amount={user?.quizTokens ?? 0} />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden p-6 lg:p-10 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_#3d6beb_0%,_transparent_50%)]" />
                    {children}
                </main>
            </div>
        </div>
    );
}
