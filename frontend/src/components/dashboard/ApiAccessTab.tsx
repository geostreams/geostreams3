import { Code } from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl, getApiDocsUrl } from "@/lib/apiDocs";
import ApiKeyCard from "./ApiKeyCard";
import Card from "../ui/Card";

const getCurlExamples = (baseApiUrl: string) => [
    {
        title: "List Sensors",
        cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/sensors/`,
    },
    {
        title: "Create Sensor",
        cmd: `curl -X POST -H "Authorization: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"my-sensor","source":"test","geoType":"Point","geometry":{"type":"Point","coordinates":[-89.4,40.1,0]},"properties":{}}' \\
  ${baseApiUrl}data/sensors/`,
    },
    {
        title: "List Streams",
        cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/streams/`,
    },
    {
        title: "List Datapoints",
        cmd: `curl -H "Authorization: YOUR_API_KEY" ${baseApiUrl}data/datapoints/`,
    },
    {
        title: "Get Daily Aggregates",
        cmd: `curl "${baseApiUrl}data/cache/day/?sensor_id=1&parameter=temperature"`,
    },
];

const ApiAccessTab = () => {
    const baseApiUrl = getApiBaseUrl();

    return (
        <div className="grid gap-6 md:grid-cols-12">
            <ApiKeyCard className="md:col-span-5" />
            <Card
                className="md:col-span-7"
                title="API Quick Reference"
                subtitle="Common API endpoints and usage examples"
                action={
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={getApiDocsUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Code aria-hidden="true" />
                            Full Docs
                        </a>
                    </Button>
                }
            >
                <p className="mb-3 text-sm text-muted-foreground">
                    Base URL:{" "}
                    <code className="break-all rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        {baseApiUrl}
                    </code>
                </p>
                <Accordion type="single" collapsible>
                    {getCurlExamples(baseApiUrl).map((example) => (
                        <AccordionItem
                            key={example.title}
                            value={example.title}
                        >
                            <AccordionTrigger>{example.title}</AccordionTrigger>
                            <AccordionContent>
                                <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs">
                                    {example.cmd}
                                </pre>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Card>
        </div>
    );
};

export default ApiAccessTab;
