const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
          Community Navigator
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
          Electric Technocracy Community Navigator
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">
          A multilingual civic portal documenting the doctrines, deeds, archives, and
          research foundations of the planetary transition to an Electric Technocracy.
        </p>
        <p className="mb-8 text-base text-muted-foreground">
          Explore the World Succession Deed 1400/98, Direct Smart Democracy, Universal
          Basic Income, the Tech-Tax on machine productivity, post-scarcity economics,
          and the Juridical Singularity across 35 languages.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/index.html"
            className="rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Open the full dossier
          </a>
          <a
            href="/ubi-pros-cons.html"
            className="rounded-md border border-border px-5 py-3 font-medium hover:bg-muted"
          >
            UBI Pros &amp; Cons guide
          </a>
        </div>
      </section>
    </main>
  );
};

export default Index;
