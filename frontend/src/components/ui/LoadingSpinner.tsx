import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    message?: string;
    size?: number;
}

const LoadingSpinner = ({
    message = "Loading...",
    size = 40,
}: LoadingSpinnerProps) => {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-[200px] flex-col items-center justify-center gap-3"
        >
            <Loader2
                aria-hidden="true"
                className="animate-spin text-primary motion-reduce:animate-none"
                style={{ width: size, height: size }}
                strokeWidth={2}
            />
            <p className="text-sm font-medium text-muted-foreground">
                {message}
            </p>
        </div>
    );
};

export default LoadingSpinner;
