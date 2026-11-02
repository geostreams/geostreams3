import { CircleCheck, Mail, User } from "lucide-react";
import { useAuth } from "react-oidc-context";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageLayout from "../components/common/PageLayout";
import ApiKeyCard from "../components/dashboard/ApiKeyCard";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

function UserProfile() {
    const auth = useAuth();
    const profile = auth.user?.profile;

    if (!profile) {
        return (
            <PageLayout>
                <LoadingSpinner message="Loading user profile..." />
            </PageLayout>
        );
    }

    const name = profile.name;
    const emailVerified = profile.email_verified;

    return (
        <PageLayout
            title="User Profile"
            subtitle="Manage your account and access your API credentials"
            maxWidth="md"
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <Card
                    className="lg:col-span-2"
                    title="Profile Information"
                    subtitle="Your account details and status"
                >
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
                        >
                            {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                            <p className="mb-2 break-words font-heading text-2xl font-semibold">
                                {name || "Unknown User"}
                            </p>
                            <Badge
                                variant={emailVerified ? "default" : "outline"}
                            >
                                {emailVerified && (
                                    <CircleCheck aria-hidden="true" />
                                )}
                                {emailVerified
                                    ? "Email Verified"
                                    : "Email Not Verified"}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <dl className="space-y-5">
                        <div className="flex items-center gap-3">
                            <User
                                aria-hidden="true"
                                className="size-5 text-primary"
                            />
                            <div className="min-w-0">
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Username
                                </dt>
                                <dd className="break-all">
                                    {profile.preferred_username}
                                </dd>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail
                                aria-hidden="true"
                                className="size-5 text-primary"
                            />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Email Status
                                </dt>
                                <dd>
                                    {emailVerified
                                        ? "Verified"
                                        : "Not Verified"}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </Card>

                <ApiKeyCard />
            </div>
        </PageLayout>
    );
}

export default UserProfile;
