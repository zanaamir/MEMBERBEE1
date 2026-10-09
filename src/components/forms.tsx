"use client";

import { createContext, startTransition, use, useActionState, useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { initialFormState, type FormState } from "@/lib/form";
import { Alert, buttonClass } from "./ui";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const FormContext = createContext<{ state: FormState; pending: boolean }>({ state: initialFormState, pending: false });

/**
 * Form bound to a server action. Works without JavaScript (plain POST); with JS it
 * submits in a transition so typed values survive validation errors.
 */
export function ActionForm({
  action,
  children,
  className = "space-y-5",
  resetOnSuccess = false,
  successMessage = true,
  ...rest
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage?: boolean;
} & Omit<ComponentProps<"form">, "action" | "children" | "className">) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  const showMessage = state.message && (!state.ok || successMessage);

  return (
    <FormContext value={{ state, pending }}>
      <form
        ref={ref}
        action={formAction}
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter;
          const formData = new FormData(event.currentTarget, submitter);
          startTransition(() => formAction(formData));
        }}
        className={className}
        noValidate
        {...rest}
      >
        {showMessage && <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>}
        {children}
      </form>
    </FormContext>
  );
}

export function useFormContext() {
  return use(FormContext);
}

function useField(name: string) {
  const { state } = useFormContext();
  return { error: state.errors?.[name]?.[0], echoed: state.values?.[name] };
}

const inputClass =
  "block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink shadow-sm placeholder:text-stone-400 focus:border-honey-500 focus:outline-none focus:ring-2 focus:ring-honey-200 aria-[invalid=true]:border-red-400 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-muted";

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  name,
  label,
  hint,
  defaultValue,
  ...props
}: { name: string; label: string; hint?: string } & Omit<ComponentProps<"input">, "name">) {
  const id = useId();
  const { error, echoed } = useField(name);
  const keepValue = props.type !== "password";
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        name={name}
        defaultValue={keepValue ? (echoed ?? defaultValue) : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={inputClass}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  defaultValue,
  ...props
}: { name: string; label: string; hint?: string } & Omit<ComponentProps<"textarea">, "name">) {
  const id = useId();
  const { error, echoed } = useField(name);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        name={name}
        defaultValue={echoed ?? defaultValue}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} min-h-28`}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  options,
  placeholder,
  defaultValue,
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
} & Omit<ComponentProps<"select">, "name">) {
  const id = useId();
  const { error, echoed } = useField(name);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        name={name}
        defaultValue={echoed ?? defaultValue ?? ""}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  value = "on",
}: {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
  value?: string;
}) {
  const id = useId();
  const { error } = useField(name);
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          id={id}
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          aria-invalid={!!error}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-honey-600"
        />
        <span>{label}</span>
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/** Group of checkboxes sharing one name; submitted as multiple values. */
export function CheckboxGroup({
  name,
  legend,
  options,
  defaultValues = [],
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  defaultValues?: string[];
}) {
  const { error } = useField(name);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="cursor-pointer rounded-full border border-line bg-white px-3.5 py-1.5 text-sm transition-colors has-[:checked]:border-honey-500 has-[:checked]:bg-honey-100 has-[:checked]:font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-honey-300"
          >
            <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValues.includes(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
} & Omit<ComponentProps<"button">, "type" | "children">) {
  const { pending } = useFormContext();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${buttonClass(variant)} ${className}`} {...props}>
      {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}

/** Button that submits a small server-action form, asking for confirmation first. */
export function ConfirmButton({
  message,
  children,
  className,
  ...props
}: { message: string; children: ReactNode } & Omit<ComponentProps<"button">, "type" | "onClick" | "children">) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
