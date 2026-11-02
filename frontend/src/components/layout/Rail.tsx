/* eslint-disable react/no-multi-comp -- small private helpers of the rail */
import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import {
    BookOpen,
    CircleUser,
    KeyRound,
    LogIn,
    LogOut,
    Menu,
    RadioTower,
    SlidersHorizontal,
    type LucideIcon,
} from "lucide-react";

import { getApiDocsUrl } from "@/lib/apiDocs";
import { parseDashboardTab } from "@/lib/dashboardTabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface RailItemBase {
    label: string;
    icon: LucideIcon;
    authOnly?: boolean;
}

type RailItem =
    | (RailItemBase & { kind: "external"; href: string })
    | (RailItemBase & { kind: "route"; to: string })
    | (RailItemBase & { kind: "tab"; to: string; tab: number });

const ITEMS: RailItem[] = [
    {
        label: "Sensors",
        icon: RadioTower,
        kind: "tab",
        to: "/dashboard?tab=0",
        tab: 0,
        authOnly: true,
    },
    {
        label: "Data properties",
        icon: SlidersHorizontal,
        kind: "tab",
        to: "/dashboard?tab=1",
        tab: 1,
        authOnly: true,
    },
    {
        label: "API access",
        icon: KeyRound,
        kind: "tab",
        to: "/dashboard?tab=2",
        tab: 2,
        authOnly: true,
    },
    {
        kind: "external",
        label: "API docs",
        icon: BookOpen,
        href: getApiDocsUrl(),
    },
    {
        kind: "route",
        label: "Profile",
        icon: CircleUser,
        to: "/profile",
        authOnly: true,
    },
];

const itemClass = (active: boolean) =>
    cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60",
    );

const getInitials = (name?: string) =>
    name
        ? name
              .split(" ")
              .map((word) => word.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "U";

function useActiveTab() {
    const { pathname, search } = useLocation();
    if (!pathname.startsWith("/dashboard")) return null;
    return parseDashboardTab(new URLSearchParams(search).get("tab"));
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
    const auth = useAuth();
    const { pathname } = useLocation();
    const activeTab = useActiveTab();

    return (
        <nav aria-label="Main" className="flex flex-col gap-1">
            {ITEMS.filter((item) => !item.authOnly || auth.isAuthenticated).map(
                (item) => {
                    const Icon = item.icon;
                    const content = (
                        <>
                            <Icon className="size-5 shrink-0" aria-hidden />
                            <span>{item.label}</span>
                        </>
                    );
                    if (item.kind === "external") {
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={itemClass(false)}
                                onClick={onNavigate}
                            >
                                {content}
                                <span className="sr-only">
                                    (opens in a new tab)
                                </span>
                            </a>
                        );
                    }
                    const active =
                        item.kind === "tab"
                            ? activeTab === item.tab
                            : pathname === item.to;
                    return (
                        <Link
                            key={item.label}
                            to={item.to}
                            aria-current={active ? "page" : undefined}
                            className={itemClass(active)}
                            onClick={onNavigate}
                        >
                            {content}
                        </Link>
                    );
                },
            )}
        </nav>
    );
}

function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
        return (
            <Button
                variant="secondary"
                className="w-full justify-start gap-3"
                onClick={() => auth.signinRedirect()}
            >
                <LogIn className="size-5" aria-hidden />
                Sign in
            </Button>
        );
    }

    const name =
        auth.user?.profile.name || auth.user?.profile.preferred_username;

    const handleLogout = async () => {
        try {
            auth.removeUser();
            await auth.signoutRedirect();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error during logout:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(itemClass(false), "w-full text-left")}
                >
                    <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground"
                    >
                        {getInitials(auth.user?.profile.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                        {name || "Account"}
                    </span>
                    <span className="sr-only">Open user menu</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="min-w-56">
                <DropdownMenuLabel className="font-normal">
                    <span className="block text-xs text-muted-foreground">
                        Signed in as
                    </span>
                    <span className="block truncate font-medium">{name}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/profile" onClick={onNavigate}>
                        <CircleUser aria-hidden /> Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                    <LogOut aria-hidden /> Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <Link
            to="/"
            onClick={onNavigate}
            className="rounded-md px-3 py-2 font-heading text-xl font-semibold tracking-wide text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
            Geostreams3
        </Link>
    );
}

function IconTooltip({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

/**
 * Navigation rail. Labelled sidebar from `lg` up; below that, a top bar whose
 * icon-only menu button opens the same links in a left Sheet.
 */
export function Rail() {
    const [open, setOpen] = useState(false);
    const auth = useAuth();

    return (
        <>
            <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 bg-sidebar p-3 text-sidebar-foreground lg:flex">
                <Brand />
                <NavItems />
                <div className="mt-auto">
                    <UserMenu />
                </div>
            </aside>

            <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-2 py-2 text-sidebar-foreground lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                    <IconTooltip label="Open menu">
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open menu"
                                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Menu className="size-5" aria-hidden />
                            </Button>
                        </SheetTrigger>
                    </IconTooltip>
                    <SheetContent
                        side="left"
                        className="w-72 gap-6 border-sidebar-border bg-sidebar p-3 text-sidebar-foreground [&>button]:text-sidebar-foreground"
                    >
                        <SheetHeader className="p-0">
                            <SheetTitle className="px-3 py-2 font-heading text-xl text-sidebar-foreground">
                                Geostreams3
                                <span className="sr-only"> menu</span>
                            </SheetTitle>
                            <SheetDescription className="sr-only">
                                Site navigation
                            </SheetDescription>
                        </SheetHeader>
                        <NavItems onNavigate={() => setOpen(false)} />
                        <div className="mt-auto">
                            <UserMenu onNavigate={() => setOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
                <Brand />
                {auth.isAuthenticated ? (
                    <IconTooltip label="Profile">
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Link to="/profile" aria-label="Profile">
                                <CircleUser className="size-5" aria-hidden />
                            </Link>
                        </Button>
                    </IconTooltip>
                ) : (
                    <IconTooltip label="Sign in">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sign in"
                            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            onClick={() => auth.signinRedirect()}
                        >
                            <LogIn className="size-5" aria-hidden />
                        </Button>
                    </IconTooltip>
                )}
            </header>
        </>
    );
}
