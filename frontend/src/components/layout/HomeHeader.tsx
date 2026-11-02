import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { BookOpen, LogIn } from "lucide-react";

import { getApiDocsUrl } from "@/lib/apiDocs";
import { Button } from "@/components/ui/button";

/** Transparent top bar for the landing page: brand, API docs, sign in. */
export function HomeHeader() {
    const auth = useAuth();

    return (
        <header className="absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
            <Link
                to="/"
                className="rounded-md px-2 py-1 font-heading text-xl font-semibold tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                Geostreams3
            </Link>
            <nav aria-label="Main" className="flex items-center gap-1">
                <Button variant="ghost" asChild>
                    <a
                        href={getApiDocsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <BookOpen aria-hidden /> API docs
                        <span className="sr-only">(opens in a new tab)</span>
                    </a>
                </Button>
                <Button variant="ghost" onClick={() => auth.signinRedirect()}>
                    <LogIn aria-hidden /> Sign in
                </Button>
            </nav>
        </header>
    );
}
