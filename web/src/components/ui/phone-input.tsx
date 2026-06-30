import { useRef } from "react";
import { Input } from "./input";

const PREFIX = "+996 ";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function PhoneInput({ value, onChange, required }: PhoneInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digits = raw.slice(PREFIX.length).replace(/\D/g, "").slice(0, 9);
    onChange(PREFIX + digits);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = ref.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    if ((e.key === "Backspace" || e.key === "Delete") && pos <= PREFIX.length) {
      e.preventDefault();
    }
  }

  function handleClick() {
    const input = ref.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    if (pos < PREFIX.length) {
      input.setSelectionRange(PREFIX.length, PREFIX.length);
    }
  }

  const display = PREFIX + (value.startsWith(PREFIX) ? value.slice(PREFIX.length) : "").replace(/\D/g, "").slice(0, 9);

  return (
    <Input
      ref={ref}
      type="tel"
      value={display}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onFocus={handleClick}
      placeholder={PREFIX + "700 000 000"}
      required={required}
    />
  );
}
