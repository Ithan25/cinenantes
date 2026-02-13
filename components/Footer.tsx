export default function Footer() {
    return (
        <footer className="border-t border-border/50 bg-card/30">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🎬</span>
                        <span className="font-bold gradient-text">CinéNantes</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Toutes les séances de cinéma à Nantes et périphérie.
                        <br className="sm:hidden" />
                        <span className="hidden sm:inline"> · </span>
                        Données issues d&apos;Allociné. Projet non affilié.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} CinéNantes
                    </p>
                </div>
            </div>
        </footer>
    );
}
