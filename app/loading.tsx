export default function Loading() {
  return (
    <main className="app-page animate-pulse" aria-label="Cargando">
      <header className="flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-sm">
        <div className="size-14 rounded-2xl bg-[var(--primary-soft)]" />
        <div className="grid flex-1 gap-3">
          <div className="h-4 w-28 rounded-full bg-[var(--primary-soft)]" />
          <div className="h-8 w-48 rounded-full bg-[var(--primary-soft)]" />
        </div>
        <div className="size-11 rounded-2xl bg-[var(--primary-soft)]" />
      </header>

      <section className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="h-5 w-36 rounded-full bg-[var(--primary-soft)]" />
        <div className="h-14 rounded-2xl bg-[var(--app-bg)]" />
        <div className="h-14 rounded-2xl bg-[var(--app-bg)]" />
        <div className="h-14 rounded-2xl bg-[var(--primary-soft)]" />
      </section>

      <section className="grid gap-3">
        <div className="h-6 w-40 rounded-full bg-[var(--primary-soft)]" />
        {[1, 2, 3].map((item) => (
          <article className="rounded-[1.75rem] bg-white p-5 shadow-sm" key={item}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 gap-3">
                <div className="size-11 rounded-2xl bg-[var(--primary-soft)]" />
                <div className="grid flex-1 gap-3">
                  <div className="h-5 w-36 rounded-full bg-[var(--primary-soft)]" />
                  <div className="h-4 w-48 rounded-full bg-[var(--app-bg)]" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-full bg-[var(--primary-soft)]" />
            </div>
            <div className="mt-5 h-12 rounded-[1.5rem] bg-[var(--app-bg)]" />
          </article>
        ))}
      </section>
    </main>
  );
}
