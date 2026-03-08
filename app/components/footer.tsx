export default function Footer() {
  return (
    <footer className="border-t border-line/80 bg-background/85">
      <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div className="relative flex flex-col gap-4 sm:min-h-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5 text-sm">
            <a
              href="https://linkedin.com/in/amir3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Amiros3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition hover:text-foreground"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs text-accent sm:absolute sm:right-0 sm:bottom-0">
            Open to software engineering opportunities
          </p>
        </div>
      </div>
    </footer>
  );
}
