export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 sm:pt-20 lg:px-8">
      <div className="glass-card rounded-3xl p-8 shadow-[0_22px_70px_-52px_var(--shadow-accent-strong)] sm:p-12">
        <h1 className="text-5xl leading-tight font-semibold text-foreground sm:text-6xl lg:text-7xl">
          Amir Ibrahim
        </h1>
        <p className="mt-4 text-lg font-medium text-muted sm:text-xl">
          Computer Engineer
        </p>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
          York University B.Eng. Computer Engineering graduate (Jun 2025)
          focused on Java, Node.js, and system design for reliable backend
          systems.
        </p>
        <a
          href="mailto:amir.ibrahim3000@gmail.com"
          className="mt-7 inline-flex text-base font-semibold text-accent underline decoration-accent/70 underline-offset-4 transition hover:text-accent/90"
        >
          Contact: amir.ibrahim3000@gmail.com
        </a>
      </div>
    </section>
  );
}
