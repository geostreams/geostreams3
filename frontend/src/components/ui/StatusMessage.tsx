import { useEffect } from "react";
import {
    CircleAlert,
    CircleCheck,
    Info,
    TriangleAlert,
    X,
    type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Severity = "success" | "info" | "warning" | "error";

interface StatusMessageProps {
    open: boolean;
    message: string;
    severity?: Severity;
    onClose?: () => void;
    autoHideDuration?: number;
}

const STYLES: Record<Severity, { icon: LucideIcon; className: string }> = {
    success: {
        icon: CircleCheck,
        className: "border-primary bg-primary text-primary-foreground",
    },
    info: {
        icon: Info,
        className: "border-foreground bg-foreground text-background",
    },
    warning: {
        icon: TriangleAlert,
        className: "border-accent bg-accent text-accent-foreground",
    },
    error: {
        icon: CircleAlert,
        className:
            "border-destructive bg-destructive text-destructive-foreground",
    },
};

const StatusMessage = ({
    open,
    message,
    severity = "success",
    onClose,
    autoHideDuration = 4000,
}: StatusMessageProps) => {
    useEffect(() => {
        if (!open || !onClose) return;
        const timer = window.setTimeout(onClose, autoHideDuration);
        return () => window.clearTimeout(timer);
    }, [open, onClose, autoHideDuration, message]);

    if (!open) return null;

    const { icon: Icon, className } = STYLES[severity];

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
            <Alert
                role={severity === "error" ? "alert" : "status"}
                className={cn(
                    "pointer-events-auto flex w-auto max-w-md items-center gap-3 shadow-md animate-in fade-in-0 slide-in-from-top-2",
                    className,
                )}
            >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <AlertDescription className="flex-1 font-medium text-inherit">
                    {message}
                </AlertDescription>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Dismiss message"
                        className="rounded-sm p-0.5 opacity-80 hover:opacity-100"
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>
                )}
            </Alert>
        </div>
    );
};

export default StatusMessage;
