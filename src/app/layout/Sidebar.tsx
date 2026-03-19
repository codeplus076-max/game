"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard", icon: "⎈" },
        { href: "/defend", label: "Defenses", icon: "🛡️" },
        { href: "/attack", label: "Offense", icon: "⚔️" },
        { href: "/quiz", label: "Training", icon: "🧠" },
        { href: "/study", label: "Intel Archive", icon: "📚" },
    ];

    return (
        <aside className="w-64 bg-cyber-panel border-r border-cyber-border flex flex-col h-full shadow-2xl z-10 sticky top-0">
            <div className="p-6 border-b border-cyber-border/50">
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-emerald-400 tracking-tighter uppercase">
                    Cyber Siege
                </h1>
                <div className="text-xs text-cyber-border-hl tracking-widest mt-1 uppercase">Command Terminal</div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                                ? "bg-cyber-accent/10 border-cyber-accent/40 text-cyber-accent shadow-[inset_4px_0_0_0_rgba(14,165,233,1)]"
                                : "border-transparent text-gray-400 hover:bg-cyber-panel-light hover:text-gray-200"
                                }`}
                        >
                            <span className={`text-xl ${isActive ? "opacity-100" : "opacity-60"}`}>{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-cyber-border/50 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyber-panel-light border border-cyber-border flex items-center justify-center text-xs font-bold text-gray-500">
                        OP
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-200">Operator</div>
                        <div className="text-xs text-cyber-success flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-success block animate-pulse" />
                            Connected
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
