"use client";

import { type ChangeEvent, type FormEvent, startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitWheelCheck } from "@/app/actions";
import Honeypot from "@/components/Honeypot";
import Icon from "@/components/Icon";
import Turnstile from "@/components/Turnstile";
import { CONTACT } from "@/lib/site";
import { EMPTY_STATE, type EnquiryState } from "@/lib/enquiry";
import { shrinkPhoto } from "@/lib/photo-shrink";
import { showThanks } from "@/lib/show-thanks";
import { EVENTS, track } from "@/lib/track";
import {
  isShown,
  PHOTO_BUDGET,
  PHOTO_FIELDS,
  validateWheelCheck,
  WHEEL_FORM,
  type WheelField,
} from "@/lib/wheel-check";

/**
 * The WHEELUV™ suitability & booking form — schema, labels and rules in
 * `lib/wheel-check.ts`, the action in `app/actions.ts`.
 *
 * Submitted by hand rather than through `<form action>`, for one reason: a
 * form action resets the form when it settles, and a reset file input cannot
 * be refilled. A visitor whose submission failed at the last gate would lose
 * four photographs they had just chosen. Dispatching from `onSubmit` leaves
 * every input exactly as it was.
 *
 * The browser checks the answers first, with the same function the server
 * uses, so a missed radio is flagged before any photograph is uploaded.
 */

const CONTROL =
  "w-full rounded-[10px] border border-white/15 bg-black/40 px-4 py-3.5 text-[16px] font-normal text-white transition-colors placeholder:text-white/40 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none";

const FAILED: EnquiryState = {
  status: "error",
  message: `Sorry, we could not send that just now. Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`,
};

export default function WheelCheckForm({ id }: { id: string }) {
  const uid = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  /* The answers that decide which questions are asked — only the "IF YES"
     pair today. Everything else stays uncontrolled. */
  const [live, setLive] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(0);

  const [state, dispatch, pending] = useActionState(
    async (prev: EnquiryState, data: FormData): Promise<EnquiryState> => {
      try {
        const result = await submitWheelCheck(prev, data);
        setErrors(result.errors ?? {});
        if (result.status === "ok") track(EVENTS.submitted, { form: "wheeluv-suitability" });
        return result;
      } catch {
        /* A rejected request — the network, or a body over the server's
           limit — would otherwise surface as an error boundary. */
        return FAILED;
      }
    },
    EMPTY_STATE,
  );

  /* The thank-you replaces the form; bring it into view, as the quote forms
     do (`lib/show-thanks.ts`). */
  useEffect(() => {
    if (state.status === "ok") showThanks(document.getElementById(id));
  }, [state, id]);

  const read = (name: string) => live[name] ?? "";

  const onChange = (e: ChangeEvent<HTMLFormElement>) => {
    const t = e.target as unknown as HTMLInputElement | HTMLSelectElement;
    if (!t.name) return;
    if (t.type === "radio" || t.tagName === "SELECT") setLive((l) => ({ ...l, [t.name]: t.value }));
    /* Answering a flagged question clears its flag, and a new photograph
       clears the size warning. */
    const cleared = t.type === "file" ? [t.name, "__photos"] : [t.name];
    if (cleared.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        for (const k of cleared) delete next[k];
        return next;
      });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => {
      const v = data.get(name);
      return typeof v === "string" ? v.trim() : "";
    };

    const { errors: found } = validateWheelCheck(value);
    let bytes = 0;
    for (const f of PHOTO_FIELDS) {
      const file = data.get(f.name);
      if (file instanceof File && file.size) bytes += file.size;
    }
    if (bytes > PHOTO_BUDGET) {
      found.__photos = "Those photographs are too large to send together. Please choose smaller ones, or fewer.";
    }

    if (Object.keys(found).length) {
      setErrors(found);
      const first = Object.keys(found)[0];
      const target =
        first === "__photos"
          ? form.querySelector<HTMLElement>(`#${CSS.escape(id)}-photos`)
          : form.querySelector<HTMLElement>(`[name="${first}"]`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setErrors({});
    startTransition(() => dispatch(data));
  };

  if (state.status === "ok") {
    return (
      <div id={id} className="surface scroll-mt-28 p-8 text-center sm:p-12" role="status" aria-live="polite">
        <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/40">
          <Icon name="check" size={28} strokeWidth={2.2} className="text-gold" />
        </span>
        <p className="mt-6 font-[family-name:var(--font-sub)] text-[24px] text-white uppercase">Thank you</p>
        <p className="measure mx-auto mt-3 text-[16px] leading-[27px] font-normal text-body">{state.message}</p>
      </div>
    );
  }

  const titleId = `${uid}-title`;
  const errorCount = Object.keys(errors).length;

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      aria-labelledby={titleId}
      className="surface relative scroll-mt-28 p-6 sm:p-8 lg:p-10"
    >
      <Honeypot />

      <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.2em] text-gold uppercase">
        {WHEEL_FORM.eyebrow}
      </p>
      <h3 id={titleId} className="mt-2 font-[family-name:var(--font-heading)] text-[26px] leading-[1.1] font-black text-white uppercase sm:text-[30px]">
        {WHEEL_FORM.title}
      </h3>
      <p className="mt-3 text-[13px] leading-[20px] font-normal text-white/50">
        Fields marked <span className="text-gold">*</span> are required.
      </p>

      {WHEEL_FORM.groups.map((group) => {
        const fields = group.fields.filter((f) => isShown(f, read));
        const isPhotos = fields.some((f) => f.kind === "photo");
        const groupId = `${uid}-${group.title.replace(/\W+/g, "-").toLowerCase()}`;
        return (
          <div
            key={group.title}
            role="group"
            aria-labelledby={groupId}
            className="mt-8 border-t border-white/[0.08] pt-7"
          >
            <h4
              id={groupId}
              className="font-[family-name:var(--font-sub)] text-[15px] tracking-[0.08em] text-gold uppercase"
            >
              {group.title}
            </h4>
            {group.note && (
              <p className="mt-1.5 text-[14px] leading-[21px] font-normal text-white/60">{group.note}</p>
            )}

            {isPhotos ? (
              <div
                id={`${id}-photos`}
                tabIndex={-1}
                className="mt-5 grid scroll-mt-28 grid-cols-2 gap-3 outline-none sm:gap-4"
              >
                {fields.map((f) =>
                  f.kind === "photo" ? (
                    <PhotoInput key={f.name} field={f} id={`${uid}-${f.name}`} error={errors[f.name]} onBusy={setBusy} />
                  ) : null,
                )}
                {errors.__photos && <ErrorText id={`${uid}-photos-error`} text={errors.__photos} className="col-span-2" />}
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {fields.map((f) => (
                  <Field key={f.name} field={f} id={`${uid}-${f.name}`} error={errors[f.name]} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* A token is spent the moment the server checks it; `state` changes
          identity once per settled submission, which is the reset signal. */}
      <Turnstile resetOn={state} />

      <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-7 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending || busy > 0}
          className="btn btn-gold min-h-[52px] w-full rounded-full text-[15px] disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : busy ? "Preparing photos…" : WHEEL_FORM.submit}
          {!pending && !busy && <Icon name="arrow" size={18} className="ml-2.5" />}
        </button>
        {(errorCount > 0 || state.status === "error") && (
          <p role="status" aria-live="polite" className="text-[15px] leading-[22px] font-normal text-[#ff8f8f]">
            {state.status === "error" && state.message && !errorCount
              ? state.message
              : "Please check the highlighted fields and try again."}
          </p>
        )}
      </div>
    </form>
  );
}

function ErrorText({ id, text, className = "" }: { id: string; text: string; className?: string }) {
  return (
    <p id={id} className={`mt-2 text-[13px] font-normal text-[#ff8f8f] ${className}`}>
      {text}
    </p>
  );
}

function Required() {
  return (
    <span className="ml-1 text-gold" aria-hidden>
      *
    </span>
  );
}

function Field({ field, id, error }: { field: WheelField; id: string; error?: string }) {
  const errorId = `${id}-error`;
  const invalid = error ? (true as const) : undefined;
  const describedBy = error ? errorId : undefined;
  /* The "IF YES" pair sits under the question that asked for it. */
  const follow = field.showIf ? "border-l-2 border-gold/40 pl-4" : "";

  if (field.kind === "radio") {
    return (
      <div className={`sm:col-span-2 ${follow}`}>
        <p id={`${id}-label`} className="font-[family-name:var(--font-sub)] text-[15px] text-white">
          {field.label}
          {field.required && <Required />}
        </p>
        <div
          role="radiogroup"
          aria-labelledby={`${id}-label`}
          aria-required={field.required || undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="mt-3 flex flex-wrap gap-2"
        >
          {field.options.map((option) => (
            <label key={option} className="cursor-pointer">
              <input type="radio" name={field.name} value={option} className="peer sr-only" />
              <span
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-[15px] leading-tight font-normal text-white/85 transition-colors hover:border-white/40 peer-checked:border-gold peer-checked:bg-gold peer-checked:font-semibold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold/70 ${
                  error ? "border-[#ff8f8f]/70" : "border-white/15"
                } bg-black/40`}
              >
                {option}
              </span>
            </label>
          ))}
        </div>
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  if (field.kind === "checkbox") {
    return (
      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3.5">
          <input
            type="checkbox"
            name={field.name}
            value="yes"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border bg-black/40 text-transparent transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold/70 ${
              error ? "border-[#ff8f8f]" : "border-white/30"
            }`}
          >
            <Icon name="check" size={15} strokeWidth={2.6} />
          </span>
          <span className="text-[14.5px] leading-[23px] font-normal text-white/80">
            {field.label}
            {field.required && <Required />}
          </span>
        </label>
        {error && <ErrorText id={errorId} text={error} className="pl-[36px]" />}
      </div>
    );
  }

  if (field.kind === "photo") return null;

  const label = (
    <label htmlFor={id} className="block font-[family-name:var(--font-sub)] text-[15px] text-white">
      {field.label}
      {field.required && <Required />}
    </label>
  );
  const shared = {
    id,
    name: field.name,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    "aria-required": field.required || undefined,
    className: `${CONTROL} ${error ? "border-[#ff8f8f]" : ""}`,
  };

  return (
    <div className={`${field.kind === "select" ? "sm:col-span-2" : ""} ${follow}`}>
      {label}
      <div className="mt-2">
        {field.kind === "select" ? (
          <select {...shared} defaultValue="">
            <option value="">Please choose…</option>
            {field.options.map((o) => (
              <option key={o} value={o} className="bg-ink-panel">
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...shared}
            type={field.kind}
            autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
            {...(field.kind === "tel" ? { inputMode: "tel" as const } : {})}
            {...(field.name === "registration" || field.name === "postcode"
              ? { autoCapitalize: "characters" }
              : {})}
          />
        )}
      </div>
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}

/* ── Photographs ─────────────────────────────────────────────────────────
   Each is shrunk before it is sent (`lib/photo-shrink.ts`). */

function PhotoInput({
  field,
  id,
  error,
  onBusy,
}: {
  field: Extract<WheelField, { kind: "photo" }>;
  id: string;
  error?: string;
  onBusy: (update: (n: number) => number) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ url: string; name: string; kb: number } | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const file = el.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setWorking(true);
    onBusy((n) => n + 1);
    const ready = await shrinkPhoto(file);
    if (ready !== file && typeof DataTransfer !== "undefined") {
      const dt = new DataTransfer();
      dt.items.add(ready);
      el.files = dt.files;
    }
    setPreview({ url: URL.createObjectURL(ready), name: ready.name, kb: Math.round(ready.size / 1024) });
    setWorking(false);
    onBusy((n) => n - 1);
  };

  const clear = () => {
    if (input.current) input.current.value = "";
    setPreview(null);
  };

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className={`group relative flex aspect-square cursor-pointer sm:aspect-[16/10] flex-col items-center justify-center overflow-hidden rounded-[12px] border border-dashed text-center transition-colors ${
          error ? "border-[#ff8f8f]" : preview ? "border-gold/60" : "border-white/20 hover:border-gold/60"
        } bg-black/40`}
      >
        {preview ? (
          <>
            {/* A local object URL, not an asset: next/image has nothing to do here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)] px-3 pt-6 pb-2.5 text-left">
              <span className="block font-[family-name:var(--font-sub)] text-[13px] text-white uppercase">
                {field.label}
              </span>
              <span className="block truncate text-[12px] font-normal text-white/70">{field.hint}</span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center px-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35 transition-colors group-hover:bg-gold group-hover:text-ink sm:h-[42px] sm:w-[42px]">
              <Icon name={working ? "clock" : "camera"} size={20} />
            </span>
            <span className="mt-2.5 font-[family-name:var(--font-sub)] text-[14px] text-white uppercase sm:mt-3">
              {field.label}
            </span>
            <span className="mt-0.5 text-[12.5px] leading-[17px] font-normal text-white/60">{field.hint}</span>
          </span>
        )}
        <input
          ref={input}
          id={id}
          name={field.name}
          type="file"
          accept="image/*"
          onChange={onPick}
          aria-invalid={error ? true : undefined}
          className="sr-only"
        />
      </label>
      {preview && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[12px] font-normal text-white/55">
            {preview.name} · {preview.kb} KB
          </span>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 font-[family-name:var(--font-ui)] text-[11px] tracking-[0.1em] text-white/70 uppercase hover:text-gold"
            aria-label={`Remove ${field.label}`}
          >
            Remove
          </button>
        </div>
      )}
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}
