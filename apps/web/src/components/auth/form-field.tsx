import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
