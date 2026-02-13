"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Building2, Heart, Home, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/cinemas", label: "Cinémas", icon: Building2 },
    { href: "/films", label: "Films", icon: Film },
    { href: "/favoris", label: "Favoris", icon: Heart },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/[0.06] supports-[backdrop-filter]:bg-background/40">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/20 transition-all group-hover:bg-primary/25 group-hover:border-primary/40 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.15)]">
                        <Film className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold tracking-tight hidden sm:block">
                        <span className="text-foreground">Ciné</span>
                        <span className="text-primary">Nantes</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-1.5 py-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_rgba(251,191,36,0.1)]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile menu toggle */}
                <button
                    className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="md:hidden border-t border-white/[0.06] bg-background/80 backdrop-blur-xl px-4 pb-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                            ? "bg-primary/15 text-primary"
                                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </header>
    );
}
