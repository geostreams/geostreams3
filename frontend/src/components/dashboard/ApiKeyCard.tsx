import { Copy, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import useApiKeyCopy from "../../hooks/useApiKeyCopy";
import Card from "../ui/Card";

/** Generates a token and copies it; used on the API tab and the profile page. */
const ApiKeyCard = ({ className }: { className?: string }) => {
    const { isGenerating, generateAndCopy } = useApiKeyCopy();

    return (
        <Card
            title="API Key"
            subtitle="Generate and manage your API token"
            className={className}
        >
            <div className="flex flex-col items-center gap-4 p-2 text-center">
                <KeyRound aria-hidden="true" className="size-12 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Generate an API token to access Geostreams programmatically.
                    Keep your token secure and don&apos;t share it with others.
                </p>
                <Button
                    size="lg"
                    className="w-full"
                    onClick={generateAndCopy}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2
                            aria-hidden="true"
                            className="animate-spin motion-reduce:animate-none"
                        />
                    ) : (
                        <Copy aria-hidden="true" />
                    )}
                    {isGenerating ? "Generating..." : "Generate & Copy Token"}
                </Button>
            </div>
        </Card>
    );
};

export default ApiKeyCard;
