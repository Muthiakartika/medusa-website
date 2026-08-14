"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { submitEnquiry } from "@/app/actions";
import type { FormField } from "@/lib/blocks";
import { cleanLabel, EMPTY_STATE } from "@/lib/enquiry";

export default function EnquiryForm({
  slug,
  index,
  submitLabel,
  fields,
}: {
  slug: string;
  index: number;
  submitLabel: string;
  fields: FormField[];
}) {
  const [state, action] = useActionState(submitEnquiry, EMPTY_STATE);
  const uid = useId();

  return (
    <form
      action={action}
      className="surface mt-7 p-6 sm:p-8"
      noValidate
    >
      <input type="hidden" name="__slug" value={slug} />
      <input type="hidden" name="__form" value={index} />

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          type="text"
          name="__company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5">
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            id={`${uid}-${field.name}`}
            error={state.errors?.[field.name]}
            defaultValue={state.values?.[field.name] ?? ""}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Submit label={submitLabel} />
        {state.status !== "idle" && state.message && (
          <p
            role="status"
            aria-live="polite"
            className={`text-[15px] leading-[22px] font-normal ${
              state.status === "ok" ? "text-gold" : "text-[#ff8f8f]"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-gold rounded-full disabled:opacity-60">
      {pending ? "Sending…" : label}
    </button>
  );
}

const CONTROL =
  "w-full rounded-[10px] border border-white/15 bg-black/40 px-4 py-3.5 text-[15px] font-normal text-white transition-colors placeholder:text-white/40 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none";

function Field({
  field,
  id,
  error,
  defaultValue,
}: {
  field: FormField;
  id: string;
  error?: string;
  defaultValue: string;
}) {
  const label = cleanLabel(field.label);
  const describedBy = error ? `${id}-error` : undefined;
  const shared = {
    id,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
    className: `${CONTROL} ${error ? "border-[#ff8f8f]" : ""}`,
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-[family-name:var(--font-sub)] text-[15px] text-white"
      >
        {label}
        {field.required && (
          <span className="ml-1 text-gold" aria-hidden>
            *
          </span>
        )}
      </label>

      <div className="mt-2">
        {field.type === "textarea" ? (
          <textarea {...shared} rows={field.rows ?? 6} defaultValue={defaultValue} />
        ) : field.type === "select" ? (
          <select {...shared} defaultValue={defaultValue}>
            <option value="" disabled>
              Please choose…
            </option>
            {field.options?.map((o) => (
              <option key={o} value={o} className="bg-ink-panel">
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...shared}
            type={field.type === "file" ? "file" : field.type}
            // A file input's value can't be restored, so never set one.
            {...(field.type === "file" ? { accept: "image/*" } : { defaultValue })}
            {...(field.type === "tel" ? { autoComplete: "tel" } : {})}
            {...(field.type === "email" ? { autoComplete: "email" } : {})}
          />
        )}
      </div>

      {error && (
        <p id={describedBy} className="mt-2 text-[13px] font-normal text-[#ff8f8f]">
          {error}
        </p>
      )}
    </div>
  );
}
