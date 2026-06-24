import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettings() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold">Настройки</h1>
      <p className="mt-1 text-muted-foreground">Параметры платформы</p>

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">Основные</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Название платформы">
              <Input defaultValue="Туризм Сары-Челек" />
            </Field>
            <Field label="Контактный телефон">
              <Input defaultValue="+996 700 00 00 00" />
            </Field>
            <Field label="Комиссия платформы, %">
              <Input type="number" defaultValue="10" />
            </Field>
            <Field label="Размер задатка по умолчанию, %">
              <Input type="number" defaultValue="30" />
            </Field>
            <Field label="Валюта">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Сом (KGS)</option>
                <option>Доллар (USD)</option>
              </select>
            </Field>
            <Field label="Язык по умолчанию">
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Русский</option>
                <option>Кыргызский</option>
                <option>English</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-lg font-bold">Модерация</h2>
          <label className="mt-4 flex items-center justify-between">
            <span className="text-sm">Новые гостиницы требуют одобрения</span>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-[hsl(var(--primary))]"
            />
          </label>
          <label className="mt-3 flex items-center justify-between">
            <span className="text-sm">Отзывы только от проживавших гостей</span>
            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-[hsl(var(--primary))]"
            />
          </label>
        </div>

        <Button size="lg" className="rounded-xl">
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
