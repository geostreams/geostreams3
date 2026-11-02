import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyButtonProps {
    text: string;
    /** Accessible name, e.g. "Copy List Sensors command". */
    label: string;
}

/** Icon button that copies `text` to the clipboard and confirms with a toast. */
const CopyButton = ({ text, label }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            toast.error("Failed to copy. Please try again.");
            return;
        }
        toast.success("Copied to clipboard");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={copy}
        >
            {copied ? (
                <Check aria-hidden="true" />
            ) : (
                <Copy aria-hidden="true" />
            )}
        </Button>
    );
};

export default CopyButton;
