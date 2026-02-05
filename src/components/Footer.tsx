export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-6 text-center md:flex-row md:py-8 md:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground/80 text-xs leading-none font-medium">
              &copy; {currentYear} Marc Galindo
            </p>
            <p className="text-muted-foreground/70 text-[10px]">
              All rights reserved. Released under the MIT License.
            </p>
          </div>

          <div className="text-muted-foreground/80 flex items-center gap-4 text-xs">
            <a
              href="https://github.com/marcundertest/kidsandus-apps-versions"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hover:underline"
            >
              GitHub
            </a>
            <span className="hidden opacity-40 md:inline">|</span>
            <a
              href="https://marcundertest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hover:underline"
            >
              marcundertest.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
