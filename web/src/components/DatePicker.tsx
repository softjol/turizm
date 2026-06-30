import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useI18n } from "@/lib/i18n";

interface DatePickerProps {
  /** Value as an ISO date string (YYYY-MM-DD), or empty. */
  value?: string;
  onChange: (value: string) => void;
  /** Earliest selectable date (ISO). */
  min?: string;
  placeholder?: string;
  className?: string;
}

const LOCALES: Record<string, string> = { ru: "ru-RU", en: "en-US", ky: "ky-KG" };

function fromIso(v?: string): Date | undefined {
  return v ? new Date(`${v}T00:00:00`) : undefined;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * A styled date picker: a text trigger that opens a calendar popover.
 * Replaces native <input type="date"> for a consistent, on-brand look.
 */
export function DatePicker({ value, onChange, min, placeholder, className }: DatePickerProps) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const selected = fromIso(value);
  const minDate = fromIso(min);

  const label = selected
    ? selected.toLocaleDateString(LOCALES[lang] ?? "ru-RU", {
        day: "numeric",
        month: "long",
      })
    : (placeholder ?? "-");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={
            className ??
            "w-full text-left text-sm font-medium outline-none " +
              (selected ? "" : "text-muted-foreground")
          }
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minDate}
          disabled={minDate ? { before: minDate } : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(toIso(d));
              setOpen(false);
            }
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
