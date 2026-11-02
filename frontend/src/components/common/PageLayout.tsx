import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageMaxWidth = "xs" | "sm" | "md" | "lg" | "xl";

const MAX_WIDTH: Record<PageMaxWidth, string> = {
    xs: "max-w-xl",
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
};

interface PageLayoutProps {
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    maxWidth?: PageMaxWidth;
    showHeader?: boolean;
    className?: string;
}

const PageLayout = ({
    title,
    subtitle,
    children,
    maxWidth = "lg",
    showHeader = true,
    className,
}: PageLayoutProps) => {
    return (
        <div
            className={cn(
                "mx-auto min-h-[calc(100vh-3.5rem)] lg:min-h-screen w-full px-4 py-6 md:px-6 md:py-8",
                MAX_WIDTH[maxWidth],
                className,
            )}
        >
            {showHeader && (title || subtitle) && (
                <header className="mb-6 border-b border-border pb-4 md:mb-8">
                    {title && (
                        <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-1 max-w-2xl text-base text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </header>
            )}
            <div>{children}</div>
        </div>
    );
};

export default PageLayout;
