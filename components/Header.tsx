"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Building2, Heart, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <header className="glass sticky top-0 z-50 border-b border-border/50">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 neon-border transition-all group-hover:neon-glow">
                        <Film className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold gradient-text hidden sm:block">
                        CinéNantes
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    className={`gap-2 transition-all ${isActive
                                            ? "neon-glow bg-primary/20 text-primary hover:bg-primary/30"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile menu toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="md:hidden border-t border-border/50 glass px-4 pb-4 pt-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${isActive
                                            ? "bg-primary/20 text-primary neon-border"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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
