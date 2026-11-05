"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { submitPaintSpillQuote } from "@/app/repairs/car-interior-paint-spill-removal/actions";
import Honeypot from "@/components/Honeypot";
import Icon from "@/components/Icon";
import Turnstile from "@/components/Turnstile";
import { showThanks } from "@/lib/show-thanks";
import { EMPTY_STATE, type EnquiryState } from "@/lib/enquiry";
import { TRACK } from "@/lib/paint-spill";
import {
  isAcceptedPhoto,
  isShown,
  PHOTO_ACCEPT,
  PHOTO_BUDGET,
  PHOTO_GUIDE,
  QUOTE_FIELDS,
  QUOTE_FORM,
  QUOTE_FORM_ID,
  type QuoteField,
  validateQuote,
} from "@/lib/paint-spill-quote";
import { shrinkPhoto } from "@/lib/photo-shrink";
import { CONTACT } from "@/lib/site";
import { track } from "@/lib/track";

/**
 * The car interior paint spill removal quote form — schema, labels and rules
 * in `lib/paint-spill-quote.ts`, the action beside the route
 * (`app/repairs/car-interior-paint-spill-removal/actions.ts`).
 *
 * Built the way `SignageQuoteForm` is, for the same reason: it is dispatched
 * from `onSubmit` rather than through `<form action>`, because a form action
 * resets the form when it settles and the photographs could not be put back.
 * The photographs are held in state instead — shrunk, previewed and removable
 * one by one — and appended to the submission by hand, so a failed
 * submission keeps every one of them.
 *
 * Two photo fields: the brief's PHOTO 1–5, required, and the paint label,
 * asked only once the customer says they still have the tin. A photograph a
 * browser cannot decode — an iPhone's HEIC on a desktop browser — is sent as
 * it is and shows by name; the budget check at submit is what stops a set too
 * large for the server to take.
 *
 * "Track: Paint Spill Quote Submitted, Photo Upload" — the first when the
 * server accepts it, the second each time photographs are added.
 */

const CONTROL =
  "w-full rounded-[10px] border border-white/15 bg-black/40 px-4 py-3.5 text-[16px] font-normal text-white transition-colors placeholder:text-white/35 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none";

const FAILED: EnquiryState = {
  status: "error",
  message: `Sorry, we could not send that just now. Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`,
};

/** Long edge a photograph is shrunk to: nine have to fit one request. */
const MAX_EDGE = 1600;

/** At the brief's five photographs, its list is met. */
const RECOMMENDED = PHOTO_GUIDE.items.length;

type Photo = { key: number; file: File; url: string };
type PhotoSpec = Extract<QuoteField, { kind: "photos" }>;

const PHOTO_FIELDS = QUOTE_FIELDS.filter((f): f is PhotoSpec => f.kind === "photos");

export default function PaintSpillQuoteForm({
  id,
  thanks,
  whatsapp,
}: {
  id: string;
  /** The brief's "AFTER SUBMISSION — Display:". */
  thanks: { title: string; body: string[]; strong: string; whatsappLabel: string };
  whatsapp: string;
}) {
  const uid = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  /* The answers that decide which questions are asked — "If YES" twice.
     Everything else stays uncontrolled. */
  const [live, setLive] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [busy, setBusy] = useState(0);
  const nextKey = useRef(0);
  /* Every preview URL made, so the last of them go when the form does. */
  const previews = useRef(new Set<string>());
  const thanksRef = useRef<HTMLDivElement>(null);

  const [state, dispatch, pending] = useActionState(
    async (prev: EnquiryState, data: FormData): Promise<EnquiryState> => {
      try {
        const result = await submitPaintSpillQuote(prev, data);
        setErrors(result.errors ?? {});
        if (result.status === "ok") track(TRACK.submitted, { form: QUOTE_FORM_ID });
        return result;
      } catch {
        /* A rejected request — the network, or a body over the server's
           limit — would otherwise surface as an error boundary. */
        return FAILED;
      }
    },
    EMPTY_STATE,
  );

  useEffect(() => {
    const made = previews.current;
    return () => made.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (state.status === "ok") showThanks(thanksRef.current);
  }, [state.status]);

  const read = (name: string) => live[name] ?? "";

  const clear = (...names: string[]) => {
    if (!names.some((n) => errors[n])) return;
    setErrors((prev) => {
      const next = { ...prev };
      for (const n of names) delete next[n];
      return next;
    });
  };

  const onChange = (e: ChangeEvent<HTMLFormElement>) => {
    const t = e.target as unknown as HTMLInputElement | HTMLSelectElement;
    if (!t.name) return;
    if (t.type === "radio") setLive((l) => ({ ...l, [t.name]: t.value }));
    clear(t.name);
  };

  const addPhotos = async (field: PhotoSpec, picked: File[]) => {
    if (!picked.length) return;
    const have = photos[field.name] ?? [];
    const accepted = picked.filter(isAcceptedPhoto);
    const room = Math.max(0, field.max - have.length);
    const take = accepted.slice(0, room);

    let note = "";
    if (accepted.length < picked.length) note = "Please choose JPG, PNG, HEIC or WebP photographs.";
    if (accepted.length > take.length) {
      note =
        field.max === 1
          ? "One photograph can be sent here. Remove this one to choose another."
          : `Up to ${field.max} photographs can be sent with one enquiry.`;
    }
    setErrors((prev) => {
      const next = { ...prev };
      if (note) next[field.name] = note;
      else delete next[field.name];
      return next;
    });
    if (!take.length) return;

    setBusy((n) => n + 1);
    const ready = await Promise.all(take.map((f) => shrinkPhoto(f, MAX_EDGE)));
    setBusy((n) => n - 1);
    const added = ready.map((file) => {
      const url = URL.createObjectURL(file);
      previews.current.add(url);
      return { key: ++nextKey.current, file, url };
    });
    /* Two picks made in quick succession can both see room for the last
       slots; the cap holds either way. */
    setPhotos((prev) => ({ ...prev, [field.name]: [...(prev[field.name] ?? []), ...added].slice(0, field.max) }));
    track(TRACK.photoUpload, { form: QUOTE_FORM_ID, field: field.name, count: String(added.length) });
  };

  const removePhoto = (name: string, key: number) => {
    const gone = photos[name]?.find((p) => p.key === key);
    if (gone) {
      URL.revokeObjectURL(gone.url);
      previews.current.delete(gone.url);
    }
    setPhotos((prev) => ({ ...prev, [name]: (prev[name] ?? []).filter((p) => p.key !== key) }));
    clear(name);
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
    const all = (name: string) =>
      data.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

    /* Only the photo fields being asked go with it — a label photo chosen
       before the answer changed to "No" stays behind. */
    const sending = PHOTO_FIELDS.filter((f) => isShown(f, value));
    for (const f of sending) for (const p of photos[f.name] ?? []) data.append(f.name, p.file, p.file.name);

    const { errors: found } = validateQuote(value, all);
    for (const f of sending) {
      if (f.required && !photos[f.name]?.length) found[f.name] = "Please upload at least one photograph.";
    }
    const bytes = sending.reduce((sum, f) => sum + (photos[f.name] ?? []).reduce((s, p) => s + p.file.size, 0), 0);
    if (bytes > PHOTO_BUDGET) {
      found.photos = "Those photographs are too large to send together. Please remove some, or choose smaller ones.";
    }

    const first = QUOTE_FIELDS.find((f) => found[f.name]);
    if (first) {
      setErrors(found);
      const target =
        first.kind === "photos"
          ? form.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${first.name}`)}`)
          : form.querySelector<HTMLElement>(`[name="${first.name}"]`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setErrors({});
    startTransition(() => dispatch(data));
  };

  if (state.status === "ok") {
    return (
      <div ref={thanksRef} className="surface scroll-mt-28 p-8 text-center sm:p-12" role="status" aria-live="polite">
        <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/40">
          <Icon name="check" size={28} strokeWidth={2.2} className="text-gold" />
        </span>
        <p className="mx-auto mt-6 max-w-[24ch] font-[family-name:var(--font-sub)] text-[24px] leading-tight text-white uppercase sm:text-[28px]">
          {thanks.title}
        </p>
        {thanks.body.map((p) => (
          <p key={p} className="measure mx-auto mt-3 text-[16px] leading-[27px] font-normal text-body">
            {p}
          </p>
        ))}
        <p className="mx-auto mt-6 flex max-w-[560px] gap-3 rounded-[12px] bg-gold/[0.08] px-5 py-4 text-left text-[14px] leading-[21px] font-semibold tracking-[0.02em] text-white ring-1 ring-gold/35">
          <Icon name="warning" size={19} className="mt-px shrink-0 text-gold" />
          {thanks.strong}
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold mt-8 min-h-[52px] w-full rounded-full px-7 text-[15px] sm:w-auto"
        >
          <Icon name="whatsapp" size={19} className="mr-2.5 shrink-0" />
          {thanks.whatsappLabel}
        </a>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      onChange={onChange}
      noValidate
      aria-label={QUOTE_FORM.title}
      className="surface relative p-5 sm:p-8 lg:p-10"
    >
      <Honeypot />

      <p className="text-[13px] leading-[20px] font-normal text-white/55">
        Fields marked <span className="text-gold">*</span> are required.
      </p>

      {QUOTE_FORM.groups.map((group, gi) => {
        const fields = group.fields.filter((f) => isShown(f, read));
        const multiField = fields.filter((f) => f.kind !== "confirm").length > 1;
        return (
          <fieldset
            key={group.title}
            className={`m-0 min-w-0 border-0 p-0 ${gi ? "mt-8 border-t border-white/[0.08] pt-7" : "mt-6"}`}
          >
            <legend className="float-left w-full p-0 font-[family-name:var(--font-sub)] text-[15.5px] leading-snug tracking-[0.06em] text-gold uppercase sm:text-[16.5px]">
              {group.title}
            </legend>

            <div className={`clear-left grid gap-5 pt-4 ${multiField ? "sm:grid-cols-2" : ""}`}>
              {fields.map((f) =>
                f.kind === "photos" ? (
                  <PhotoField
                    key={f.name}
                    field={f}
                    id={`${id}-${f.name}`}
                    inputId={`${uid}-${f.name}`}
                    photos={photos[f.name] ?? []}
                    busy={busy > 0}
                    error={errors[f.name]}
                    onAdd={(files) => addPhotos(f, files)}
                    onRemove={(key) => removePhoto(f.name, key)}
                  />
                ) : (
                  <Field key={f.name} field={f} id={`${uid}-${f.name}`} error={errors[f.name]} />
                ),
              )}
            </div>
          </fieldset>
        );
      })}

      {/* A token is spent the moment the server checks it; `state` changes
          identity once per settled submission, which is the reset signal. */}
      <Turnstile resetOn={state} />

      <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.08] pt-7 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending || busy > 0}
          className="btn btn-gold min-h-[56px] w-full rounded-full px-7 text-center text-[15px] leading-[19px] disabled:opacity-60 sm:w-auto sm:px-9"
        >
          {pending ? "Sending…" : busy ? "Preparing photos…" : QUOTE_FORM.submit}
          {!pending && !busy && <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />}
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

function ErrorText({ id, text, className = "" }: { id?: string; text: string; className?: string }) {
  return (
    <p id={id} className={`mt-2 text-[13.5px] leading-[19px] font-normal text-[#ff8f8f] ${className}`}>
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

/** The "IF YES" questions sit under the answer that asked for them. */
const FOLLOW = "border-l-2 border-gold/40 pl-4";

function Field({
  field,
  id,
  error,
}: {
  field: Exclude<QuoteField, { kind: "photos" }>;
  id: string;
  error?: string;
}) {
  const errorId = `${id}-error`;
  const invalid = error ? (true as const) : undefined;
  const describedBy = error ? errorId : undefined;
  const required = "required" in field && field.required;
  const follow = "showIf" in field && field.showIf ? FOLLOW : "";

  if (field.kind === "radio" || field.kind === "multi") {
    const multi = field.kind === "multi";
    const hint = multi ? field.hint : undefined;
    return (
      <div className={`sm:col-span-2 ${follow}`}>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="p-0 font-[family-name:var(--font-sub)] text-[15px] leading-snug text-white">
            {field.label}
            {required && <Required />}
          </legend>
          {hint && <p className="mt-1.5 text-[14px] leading-[21px] font-normal text-white/55">{hint}</p>}
          <div className="mt-3 flex flex-wrap gap-2" aria-invalid={invalid} aria-describedby={describedBy}>
            {field.options.map((option) => (
              <label
                key={option}
                className={`group inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-full border bg-black/40 px-4 py-2 text-[15px] leading-tight font-normal text-white/85 transition-colors hover:border-white/40 has-[:checked]:border-gold has-[:checked]:bg-gold has-[:checked]:font-semibold has-[:checked]:text-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/70 ${
                  error ? "border-[#ff8f8f]/70" : "border-white/15"
                }`}
              >
                <input type={multi ? "checkbox" : "radio"} name={field.name} value={option} className="sr-only" />
                {multi && (
                  <span
                    aria-hidden
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-white/35 text-transparent transition-colors group-has-[:checked]:border-ink group-has-[:checked]:bg-ink group-has-[:checked]:text-gold"
                  >
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                )}
                {option}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  if (field.kind === "confirm") {
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
            className={`mt-0.5 flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] border bg-black/40 text-transparent transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold/70 ${
              error ? "border-[#ff8f8f]" : "border-white/30"
            }`}
          >
            <Icon name="check" size={16} strokeWidth={2.6} />
          </span>
          <span className="text-[15px] leading-[24px] font-semibold text-white/90">
            {field.label}
            {required && <Required />}
          </span>
        </label>
        {error && <ErrorText id={errorId} text={error} className="pl-[38px]" />}
      </div>
    );
  }

  const label = (
    <label htmlFor={id} className="block font-[family-name:var(--font-sub)] text-[15px] leading-snug text-white">
      {field.label}
      {required && <Required />}
    </label>
  );
  const shared = {
    id,
    name: field.name,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    "aria-required": required || undefined,
  };

  if (field.kind === "textarea") {
    const hintId = field.hint ? `${id}-hint` : "";
    return (
      <div className={`sm:col-span-2 ${follow}`}>
        {label}
        {field.hint && (
          <p id={hintId} className="mt-1.5 text-[13.5px] leading-[20px] font-normal text-white/50">
            {field.hint}
          </p>
        )}
        <textarea
          {...shared}
          aria-describedby={[hintId, describedBy ?? ""].join(" ").trim() || undefined}
          rows={field.showIf ? 3 : 5}
          className={`${CONTROL} mt-2.5 resize-y ${field.showIf ? "min-h-[100px]" : "min-h-[140px]"} ${
            error ? "border-[#ff8f8f]" : ""
          }`}
        />
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div>
        {label}
        <div className="relative mt-2 sm:max-w-[380px]">
          <select
            {...shared}
            defaultValue=""
            className={`${CONTROL} cursor-pointer appearance-none pr-11 ${error ? "border-[#ff8f8f]" : ""}`}
          >
            <option value="">Please choose…</option>
            {field.options.map((o) => (
              <option key={o} value={o} className="bg-ink-panel">
                {o}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-right"
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-gold"
          />
        </div>
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  return (
    <div>
      {label}
      <div className="mt-2">
        <input
          {...shared}
          type={field.kind}
          autoComplete={field.autoComplete}
          {...(field.inputMode ? { inputMode: field.inputMode, maxLength: 4 } : {})}
          {...(field.name === "registration" || field.name === "postcode" ? { autoCapitalize: "characters" } : {})}
          className={`${CONTROL} ${field.inputMode ? "sm:max-w-[200px]" : ""} ${error ? "border-[#ff8f8f]" : ""}`}
        />
      </div>
      {error && <ErrorText id={errorId} text={error} />}
    </div>
  );
}

/* ── Photographs ─────────────────────────────────────────────────────────
   "Upload Photos* … Please upload: PHOTO 1 … PHOTO 5 … Allow multiple
   files." What to photograph beside the drop area and the photographs
   under it as numbered, removable previews. The label photo is the same
   control for one file, under the answer that asked for it. */

function PhotoField({
  field,
  id,
  inputId,
  photos,
  busy,
  error,
  onAdd,
  onRemove,
}: {
  field: PhotoSpec;
  id: string;
  inputId: string;
  photos: Photo[];
  busy: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (key: number) => void;
}) {
  const [over, setOver] = useState(false);
  const single = field.max === 1;
  const full = photos.length >= field.max;
  const met = photos.length >= RECOMMENDED;

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    if (!full) onAdd([...e.dataTransfer.files]);
  };

  const heading = (
    <p className="font-[family-name:var(--font-sub)] text-[15px] text-white">
      {field.label}
      {field.required && <Required />}
    </p>
  );

  const drop = (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        if (!full) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      aria-disabled={full || undefined}
      className={`group relative flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-5 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/70 ${
        single ? "min-h-[120px] py-5" : "min-h-[168px] py-6"
      } ${full ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
        error
          ? "border-[#ff8f8f]/80 bg-[#ff8f8f]/[0.04]"
          : over
            ? "border-gold bg-gold/[0.08]"
            : "border-white/20 bg-black/40 hover:border-gold/60"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35 transition-colors group-hover:bg-gold group-hover:text-ink">
        <Icon name={busy ? "clock" : "camera"} size={22} />
      </span>
      <span className="mt-3.5 font-[family-name:var(--font-ui)] text-[13px] font-semibold tracking-[0.16em] text-white uppercase">
        {busy ? "Preparing photos…" : single ? "Upload File" : "Upload Files"}
      </span>
      <span className="mt-1.5 text-[12.5px] leading-[18px] font-normal text-white/50">
        JPG, JPEG, PNG, HEIC, WebP{single ? "" : ` · up to ${field.max}`}
      </span>
      <input
        id={inputId}
        type="file"
        multiple={!single}
        accept={PHOTO_ACCEPT}
        disabled={full}
        aria-describedby={error ? `${id}-error` : single ? undefined : `${id}-count`}
        onChange={(e) => {
          onAdd([...(e.currentTarget.files ?? [])]);
          e.currentTarget.value = "";
        }}
        className="sr-only"
      />
    </label>
  );

  return (
    <div
      id={id}
      tabIndex={-1}
      className={`scroll-mt-32 outline-none sm:col-span-2 ${field.showIf ? FOLLOW : ""}`}
    >
      {single ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:items-center sm:gap-6">
          <div>
            {heading}
            {field.hint && (
              <p className="mt-2 flex items-center gap-2 text-[14px] leading-[21px] font-semibold text-gold">
                <Icon name="star" size={15} className="shrink-0" />
                {field.hint}
              </p>
            )}
          </div>
          {drop}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-6">
          <div>
            {heading}
            <p className="mt-3 text-[14px] leading-[21px] font-normal text-white/60">{PHOTO_GUIDE.lead}</p>
            <ol className="mt-2.5 grid gap-2.5">
              {PHOTO_GUIDE.items.map((item, i) => (
                <li key={item} className="flex gap-3 text-[14.5px] leading-[21px] font-semibold text-white/90">
                  <span className="w-[66px] shrink-0 pt-px font-[family-name:var(--font-ui)] text-[11px] leading-[20px] font-semibold tracking-[0.14em] whitespace-nowrap text-gold uppercase">
                    Photo {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          {drop}
        </div>
      )}

      {photos.length > 0 && (
        <ul className={`mt-5 grid gap-2.5 ${single ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5"}`}>
          {photos.map((p, i) => (
            <Thumb key={p.key} photo={p} n={single ? undefined : i + 1} onRemove={() => onRemove(p.key)} />
          ))}
        </ul>
      )}

      {!single && (
        <p
          id={`${id}-count`}
          className={`mt-4 flex items-center gap-2 text-[13.5px] leading-[20px] font-normal ${
            met ? "text-white/75" : "text-white/55"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              met ? "bg-gold text-ink" : "bg-white/[0.06] text-white/50 ring-1 ring-white/15"
            }`}
          >
            {met ? (
              <Icon name="check" size={12} strokeWidth={3} />
            ) : (
              <span className="text-[11px] leading-none font-semibold">{photos.length}</span>
            )}
          </span>
          <span>
            {photos.length} of {field.max} added
          </span>
        </p>
      )}
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}

function Thumb({ photo, n, onRemove }: { photo: Photo; n?: number; onRemove: () => void }) {
  /* A HEIC a desktop browser cannot draw is still sent; it shows by name. */
  const [drawable, setDrawable] = useState(true);
  return (
    <li className="relative aspect-square overflow-hidden rounded-[10px] bg-black/40 ring-1 ring-white/10">
      {drawable ? (
        /* A local object URL, not an asset: next/image has nothing to do here. */
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" onError={() => setDrawable(false)} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center">
          <Icon name="camera" size={20} className="text-gold" />
          <span className="w-full truncate text-[11px] font-normal text-white/60">{photo.file.name}</span>
        </span>
      )}
      {n !== undefined && (
        <span className="absolute top-1.5 left-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink/85 px-1.5 font-[family-name:var(--font-display)] text-[13px] leading-none text-gold">
          {n}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={n !== undefined ? `Remove photo ${n}` : "Remove photo"}
        className="absolute top-1 right-1 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-gold"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/85 ring-1 ring-white/20">
          <Icon name="close" size={13} strokeWidth={2.4} />
        </span>
      </button>
    </li>
  );
}
