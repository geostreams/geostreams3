import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends Omit<ComponentProps<"section">, "title"> {
    title?: ReactNode;
    subtitle?: ReactNode;
    action?: ReactNode;
}

/** Bordered panel with an optional heading row (title, subtitle, action). */
const Card = ({
    title,
    subtitle,
    action,
    children,
    className,
    ...props
}: CardProps) => (
    <section
        className={cn(
            "flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm",
            className,
        )}
        {...props}
    >
        {(title || subtitle || action) && (
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    {title && (
                        <h2 className="font-heading text-lg font-semibold">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        )}
        <div className="flex-1">{children}</div>
    </section>
);

export default Card;
