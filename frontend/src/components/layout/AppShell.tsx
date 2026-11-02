import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
    return (
        <TooltipProvider delayDuration={200}>
            <div className="relative min-h-screen bg-background text-foreground">
                <ContourBackdrop className="fixed inset-0 -z-0 h-full w-full opacity-[0.12]" />
                <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
                    {nav}
                    <main id="main" className="min-w-0 flex-1">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster position="top-center" />
        </TooltipProvider>
    );
}
