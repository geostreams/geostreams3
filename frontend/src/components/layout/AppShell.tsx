import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomeHeader } from "./HomeHeader";
import { ContourBackdrop } from "./ContourBackdrop";

interface AppShellProps {
    /** Navigation rail slot. */
    nav?: ReactNode;
    children: ReactNode;
}

/**
 * Page frame: fog background with a faint contour backdrop, a navigation slot,
 * the main landmark, and the app-wide tooltip and toast providers.
 */
export function AppShell({ nav, children }: AppShellProps) {
    // The landing page has no rail, only a transparent header.
    const isHome = useLocation().pathname === "/";
    return (
        <TooltipProvider delayDuration={200}>
            <div className="relative min-h-screen bg-background text-foreground">
                <ContourBackdrop className="fixed inset-0 -z-0 h-full w-full opacity-[0.12]" />
                <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
                    {isHome ? <HomeHeader /> : nav}
                    <main id="main" className="min-w-0 flex-1">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster position="top-center" />
        </TooltipProvider>
    );
}
