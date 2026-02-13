"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Building2, Heart, Home, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/cinemas", label: "Cinémas", icon: Building2 },
    { href: "/films", label: "Films", icon: Film },
    { href: "/favoris", label: "Favoris", icon: Heart },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // In light mode when scrolled, use orange/primary background
    const headerBg = scrolled
        ? theme === "light"
            ? "bg-primary/90 backdrop-blur-xl border-primary/20 shadow-lg"
            : "bg-background/70 backdrop-blur-xl border-white/[0.08] shadow-lg"
        : theme === "light"
            ? "bg-background/80 backdrop-blur-xl border-black/[0.06]"
            : "bg-background/60 backdrop-blur-xl border-white/[0.06]";

    // Text colors change when scrolled in light mode
    const isLightScrolled = scrolled && theme === "light";

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${headerBg}`}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex-1 flex items-center gap-2.5 group">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isLightScrolled
                        ? "bg-white/20 border border-white/30"
                        : "bg-primary/15 border border-primary/20 group-hover:bg-primary/25 group-hover:border-primary/40"
                        }`}>
                        <Film className={`h-5 w-5 ${isLightScrolled ? "text-white" : "text-primary"}`} />
                    </div>
                    <span className="text-lg font-bold tracking-tight hidden sm:block">
                        <span className={isLightScrolled ? "text-white" : "text-foreground"}>Ciné</span>
                        <span className={isLightScrolled ? "text-white/80" : "text-primary"}>Nantes</span>
                    </span>
                </Link>

                {/* Desktop Navigation — centered */}
                <nav className={`hidden md:flex items-center justify-center gap-1 rounded-full px-1.5 py-1 border transition-all duration-300 ${isLightScrolled
                    ? "bg-white/10 border-white/20"
                    : "bg-white/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06]"
                    }`}>
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
                                        ? isLightScrolled
                                            ? "bg-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                                            : "bg-primary/15 text-primary shadow-[inset_0_1px_0_rgba(251,191,36,0.1)]"
                                        : isLightScrolled
                                            ? "text-white/70 hover:text-white hover:bg-white/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] dark:hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side: theme toggle + mobile menu */}
                <div className="flex-1 flex items-center justify-end gap-2">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-colors ${isLightScrolled
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                            }`}
                        aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {/* Mobile menu toggle */}
                    <button
                        className={`md:hidden p-2.5 rounded-xl transition-colors ${isLightScrolled
                            ? "text-white/70 hover:text-white hover:bg-white/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                            }`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className={`md:hidden border-t backdrop-blur-xl px-4 pb-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-200 ${isLightScrolled
                    ? "border-white/20 bg-primary/90"
                    : "border-black/[0.06] dark:border-white/[0.06] bg-background/80"
                    }`}>
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
                                        ? isLightScrolled
                                            ? "bg-white/20 text-white"
                                            : "bg-primary/15 text-primary"
                                        : isLightScrolled
                                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                                            : "text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-foreground"
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
