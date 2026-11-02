import { useEffect, useState } from "react";
import { BookOpen, Database, LineChart, LogIn, Waves } from "lucide-react";
import yaml from "js-yaml";
import axios from "axios";
import { useAuth } from "react-oidc-context";

import { ContourBackdrop } from "@/components/layout/ContourBackdrop";
import { Button } from "@/components/ui/button";
import { getApiDocsUrl } from "@/lib/apiDocs";

interface HomeContent {
    title?: string;
    description?: string;
}

const FEATURES = [
    {
        icon: Waves,
        title: "Scientific data",
        description:
            "Access and manage environmental sensor data with precision and reliability.",
    },
    {
        icon: Database,
        title: "Secure storage",
        description:
            "Your data is safely stored and managed with enterprise-grade security.",
    },
    {
        icon: LineChart,
        title: "Advanced analytics",
        description:
            "Powerful tools for analyzing and visualizing your environmental data.",
    },
];

const apiDocsUrl = getApiDocsUrl();

function Home() {
    const [content, setContent] = useState<HomeContent>({});
    const auth = useAuth();

    useEffect(() => {
        axios
            .get<string>("/description.yaml")
            .then((response) => {
                const data = yaml.load(response.data);
                if (data && typeof data === "object") {
                    setContent(data as HomeContent);
                }
            })
            .catch((error) =>
                // eslint-disable-next-line no-console
                console.error("Error loading the YAML content:", error),
            );
    }, []);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-20 md:px-8 md:pb-10">
            <section className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-14 md:px-12 md:py-24">
                <ContourBackdrop className="absolute inset-0 h-full w-full opacity-30" />
                <div className="relative max-w-2xl">
                    <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                        Great Lakes sensor network
                    </p>
                    <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-6xl">
                        {content.title || "Geostreams"}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                        {content.description ||
                            "A platform for environmental data management and analysis"}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" onClick={() => auth.signinRedirect()}>
                            <LogIn aria-hidden /> Get started
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <a
                                href={apiDocsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <BookOpen aria-hidden /> API docs
                                <span className="sr-only">
                                    (opens in a new tab)
                                </span>
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            <section aria-labelledby="why-geostreams" className="mt-12">
                <h2
                    id="why-geostreams"
                    className="font-heading text-2xl font-semibold md:text-3xl"
                >
                    Why choose Geostreams?
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                    Powerful tools and features designed for environmental data
                    professionals.
                </p>
                <ul className="mt-6 grid gap-4 md:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <li
                            key={title}
                            className="rounded-lg border border-border bg-card p-5"
                        >
                            <Icon className="size-6 text-primary" aria-hidden />
                            <h3 className="mt-3 font-heading text-lg font-semibold">
                                {title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {description}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default Home;
