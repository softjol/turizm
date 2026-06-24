export default function PageStub() {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold capitalize">host messages</h1>
      <p className="mt-2 text-muted-foreground">
        Раздел в разработке. Здесь появится содержимое согласно ТЗ.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-dashed border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
