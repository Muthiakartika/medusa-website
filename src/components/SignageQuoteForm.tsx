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
import { submitSignageQuote } from "@/app/actions";
import Honeypot from "@/components/Honeypot";
import Icon from "@/components/Icon";
import Turnstile from "@/components/Turnstile";
import { EMPTY_STATE, type EnquiryState } from "@/lib/enquiry";
import { shrinkPhoto } from "@/lib/photo-shrink";
import {
  isAcceptedPhoto,
  isShown,
  MAX_PHOTOS,
  PHOTO_ACCEPT,
  PHOTO_BUDGET,
  PHOTO_GUIDE,
  PRIVACY_LINK,
  QUOTE_FIELDS,
  QUOTE_FORM,
  QUOTE_FORM_ID,
  type QuoteField,
  validateQuote,
} from "@/lib/signage-quote";
import { CONTACT } from "@/lib/site";
import { EVENTS, track } from "@/lib/track";

/**
 * The vehicle signage removal quote form — schema, labels and rules in
 * `lib/signage-quote.ts`, the action in `app/actions.ts`.
 *
 * Built the way `WheelCheckForm` is, for the same reason: it is dispatched
 * from `onSubmit` rather than through `<form action>`, because a form action
 * resets the form when it settles and the photographs could not be put back.
 * Here the photographs are not in the file input at all — they are held in
 * state, shrunk, previewed and removable one by one, and appended to the
 * submission by hand — so a failed submission keeps every one of them.
 *
 * The browser checks the answers first, with the function the server uses,
 * so a missed question is flagged before ten photographs go anywhere.
 */

const CONTROL =
  "w-full rounded-[10px] border border-white/15 bg-black/40 px-4 py-3.5 text-[16px] font-normal text-white transition-colors placeholder:text-white/35 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none";

const FAILED: EnquiryState = {
  status: "error",
  message: `Sorry, we could not send that just now. Please call ${CONTACT.phone} or email ${CONTACT.email} and we will pick it up right away.`,
};

/** Long edge a photograph is shrunk to: ten have to fit one request. */
const MAX_EDGE = 1600;

/** At three photographs the brief's recommendation is met. */
const RECOMMENDED = 3;

type Photo = { key: number; file: File; url: string };

export default function SignageQuoteForm({
  id,
  thanks,
  whatsapp,
}: {
  id: string;
  /** The brief's "After submission display". */
  thanks: { title: string; body: string[]; whatsappLabel: string };
  whatsapp: string;
}) {
  const uid = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  /* The answers that decide which questions are asked — "If YES" twice.
     Everything else stays uncontrolled. */
  const [live, setLive] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(0);
  const nextKey = useRef(0);
  /* Every preview URL made, so the last of them go when the form does. */
  const previews = useRef(new Set<string>());
  const thanksRef = useRef<HTMLDivElement>(null);

  const [state, dispatch, pending] = useActionState(
    async (prev: EnquiryState, data: FormData): Promise<EnquiryState> => {
      try {
        const result = await submitSignageQuote(prev, data);
        setErrors(result.errors ?? {});
        if (result.status === "ok") track(EVENTS.quoteSubmitted, { form: QUOTE_FORM_ID });
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
    if (state.status === "ok") thanksRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
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

  const addPhotos = async (picked: File[]) => {
    if (!picked.length) return;
    const accepted = picked.filter(isAcceptedPhoto);
    const room = Math.max(0, MAX_PHOTOS - photos.length);
    const take = accepted.slice(0, room);

    let note = "";
    if (accepted.length < picked.length) note = "Please choose JPG, PNG, HEIC or WebP photographs.";
    if (accepted.length > take.length) note = `Up to ${MAX_PHOTOS} photographs can be sent with one enquiry.`;
    setErrors((prev) => {
      const next = { ...prev };
      if (note) next.photos = note;
      else delete next.photos;
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
    setPhotos((prev) => [...prev, ...added].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (key: number) => {
    const gone = photos.find((p) => p.key === key);
    if (gone) {
      URL.revokeObjectURL(gone.url);
      previews.current.delete(gone.url);
    }
    setPhotos((prev) => prev.filter((p) => p.key !== key));
    clear("photos");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || busy) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    for (const p of photos) data.append("photos", p.file, p.file.name);

    const value = (name: string) => {
      const v = data.get(name);
      return typeof v === "string" ? v.trim() : "";
    };
    const all = (name: string) =>
      data.getAll(name).flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : []));

    const { errors: found } = validateQuote(value, all);
    if (!photos.length) found.photos = "Please upload at least one photograph.";
    else if (photos.reduce((sum, p) => sum + p.file.size, 0) > PHOTO_BUDGET) {
      found.photos = "Those photographs are too large to send together. Please remove some, or choose smaller ones.";
    }

    const first = QUOTE_FIELDS.find((f) => found[f.name]);
    if (first) {
      setErrors(found);
      const target =
        first.kind === "photos"
          ? form.querySelector<HTMLElement>(`#${CSS.escape(`${id}-photos`)}`)
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
      <div
        ref={thanksRef}
        className="surface scroll-mt-28 p-8 text-center sm:p-12"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/40">
          <Icon name="check" size={28} strokeWidth={2.2} className="text-gold" />
        </span>
        <p className="mx-auto mt-6 max-w-[22ch] font-[family-name:var(--font-sub)] text-[24px] leading-tight text-white uppercase sm:text-[28px]">
          {thanks.title}
        </p>
        {thanks.body.map((p) => (
          <p key={p} className="measure mx-auto mt-3 text-[16px] leading-[27px] font-normal text-body">
            {p}
          </p>
        ))}
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
      aria-label="Vehicle signage removal quote"
      className="surface relative p-5 sm:p-8 lg:p-10"
    >
      <Honeypot />

      <p className="text-[13px] leading-[20px] font-normal text-white/55">
        Fields marked <span className="text-gold">*</span> are required.
      </p>

      {QUOTE_FORM.groups.map((group, gi) => {
        const fields = group.fields.filter((f) => isShown(f, read));
        /* A group that is one question carries it as its title. */
        const lead = group.fields[0];
        const titled = lead.label === group.title;
        const multiField = fields.filter((f) => f.kind !== "confirm").length > 1;
        return (
          <fieldset
            key={group.title}
            className={`m-0 min-w-0 border-0 p-0 ${gi ? "mt-8 border-t border-white/[0.08] pt-7" : "mt-6"}`}
          >
            <legend className="float-left w-full p-0 font-[family-name:var(--font-sub)] text-[15.5px] leading-snug tracking-[0.06em] text-gold uppercase sm:text-[16.5px]">
              {group.title}
              {titled && "required" in lead && lead.required && <Required />}
            </legend>
            {group.note && (
              <p className="clear-left pt-1.5 text-[14px] leading-[21px] font-normal text-white/55">{group.note}</p>
            )}

            <div className={`clear-left grid gap-5 pt-4 ${multiField ? "sm:grid-cols-2" : ""}`}>
              {fields.map((f, fi) =>
                f.kind === "photos" ? (
                  <PhotoField
                    key={f.name}
                    id={`${id}-photos`}
                    inputId={`${uid}-${f.name}`}
                    photos={photos}
                    busy={busy > 0}
                    error={errors[f.name]}
                    onAdd={addPhotos}
                    onRemove={removePhoto}
                  />
                ) : (
                  <Field
                    key={f.name}
                    field={f}
                    id={`${uid}-${f.name}`}
                    error={errors[f.name]}
                    hideLabel={titled && fi === 0}
                  />
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
          className="btn btn-gold min-h-[56px] w-full rounded-full px-9 text-[15px] disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : busy ? "Preparing photos…" : QUOTE_FORM.submit}
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

function Field({
  field,
  id,
  error,
  hideLabel,
}: {
  field: Exclude<QuoteField, { kind: "photos" }>;
  id: string;
  error?: string;
  /** The group's title already asks this question. */
  hideLabel: boolean;
}) {
  const errorId = `${id}-error`;
  const invalid = error ? (true as const) : undefined;
  const describedBy = error ? errorId : undefined;
  const required = "required" in field && field.required;
  /* The "If YES" questions sit under the answer that asked for them. */
  const follow = "showIf" in field && field.showIf ? "border-l-2 border-gold/40 pl-4 sm:col-span-2" : "";

  if (field.kind === "radio" || field.kind === "multi") {
    const multi = field.kind === "multi";
    const options = (
      <div
        className="flex flex-wrap gap-2"
        aria-invalid={invalid}
        aria-describedby={describedBy}
      >
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
    );

    /* The group's own question is its legend already; a follow-up question
       inside a group is a fieldset of its own. */
    return (
      <div className={`sm:col-span-2 ${follow}`}>
        {hideLabel ? (
          options
        ) : (
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="p-0 font-[family-name:var(--font-sub)] text-[15px] leading-snug text-white">
              {field.label}
              {required && <Required />}
            </legend>
            <div className="mt-3">{options}</div>
          </fieldset>
        )}
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  if (field.kind === "confirm") {
    const privacy = field.name === "privacy";
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
        {/* "Link 'Privacy Policy' underneath." */}
        {privacy && (
          <a
            href={PRIVACY_LINK.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-inline mt-3 ml-[38px] text-[14px] text-gold"
          >
            {PRIVACY_LINK.label}
            <Icon name="arrow" size={14} />
          </a>
        )}
      </div>
    );
  }

  const optional = "optional" in field && field.optional;
  const label = (
    <label
      htmlFor={id}
      className={
        hideLabel
          ? "sr-only"
          : "flex items-baseline justify-between gap-3 font-[family-name:var(--font-sub)] text-[15px] leading-snug text-white"
      }
    >
      <span>
        {field.label}
        {required && <Required />}
      </span>
      {optional && (
        <span className="font-[family-name:var(--font-ui)] text-[10.5px] tracking-[0.16em] text-white/45 uppercase">
          Optional
        </span>
      )}
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
    return (
      <div className="sm:col-span-2">
        {label}
        {field.hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-[13.5px] leading-[20px] font-normal text-white/50">
            {field.hint}
          </p>
        )}
        <textarea
          {...shared}
          aria-describedby={[field.hint ? `${id}-hint` : "", describedBy ?? ""].join(" ").trim() || undefined}
          rows={5}
          className={`${CONTROL} mt-2.5 min-h-[140px] resize-y ${error ? "border-[#ff8f8f]" : ""}`}
        />
        {error && <ErrorText id={errorId} text={error} />}
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <div>
        {label}
        {/* Alone in its group, a select would otherwise run the card's width. */}
        <div className={`relative ${hideLabel ? "sm:max-w-[380px]" : "mt-2"}`}>
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
    <div className={follow}>
      {label}
      <div className="mt-2">
        <input
          {...shared}
          type={field.kind === "number" ? "text" : field.kind}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          {...(field.kind === "tel" ? { inputMode: "tel" as const } : {})}
          {...(field.kind === "number" ? { inputMode: "numeric" as const, pattern: "[0-9]*", maxLength: 4 } : {})}
          {...(field.name === "registration" || field.name === "postcode" ? { autoCapitalize: "characters" } : {})}
          className={`${CONTROL} ${field.kind === "number" ? "sm:max-w-[200px]" : ""} ${error ? "border-[#ff8f8f]" : ""}`}
        />
      </div>
      {error && <ErrorText id={errorId} text={error} />}
    </div>
  );
}

/* ── Photographs ─────────────────────────────────────────────────────────
   "Upload Photos* … Allow multiple images." What to photograph beside the
   drop area, the photographs under it as numbered, removable previews. */

function PhotoField({
  id,
  inputId,
  photos,
  busy,
  error,
  onAdd,
  onRemove,
}: {
  id: string;
  inputId: string;
  photos: Photo[];
  busy: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (key: number) => void;
}) {
  const [over, setOver] = useState(false);
  const full = photos.length >= MAX_PHOTOS;
  const met = photos.length >= RECOMMENDED;

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    if (!full) onAdd([...e.dataTransfer.files]);
  };

  return (
    <div id={id} tabIndex={-1} className="scroll-mt-32 outline-none sm:col-span-2">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-6">
        <div>
          <p className="font-[family-name:var(--font-sub)] text-[15px] text-white">
            Upload Photos
            <Required />
          </p>
          <p className="mt-3 text-[14px] leading-[21px] font-normal text-white/60">{PHOTO_GUIDE.lead}</p>
          <ol className="mt-2.5 grid gap-2">
            {PHOTO_GUIDE.items.map((item, i) => (
              <li key={item} className="flex gap-3 text-[14.5px] leading-[21px] font-semibold text-white/90">
                <span className="w-4 shrink-0 font-[family-name:var(--font-display)] text-[17px] leading-[21px] text-gold">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>

        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            if (!full) setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          aria-disabled={full || undefined}
          className={`group relative flex min-h-[168px] flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-5 py-6 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold/70 ${
            full ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${
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
            {busy ? "Preparing photos…" : "Upload Files"}
          </span>
          <span className="mt-1.5 text-[12.5px] leading-[18px] font-normal text-white/50">
            JPG, JPEG, PNG, HEIC, WebP · up to {MAX_PHOTOS}
          </span>
          <input
            id={inputId}
            type="file"
            multiple
            accept={PHOTO_ACCEPT}
            disabled={full}
            aria-describedby={error ? `${id}-error` : `${id}-count`}
            onChange={(e) => {
              onAdd([...(e.currentTarget.files ?? [])]);
              e.currentTarget.value = "";
            }}
            className="sr-only"
          />
        </label>
      </div>

      {photos.length > 0 && (
        <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
          {photos.map((p, i) => (
            <Thumb key={p.key} photo={p} n={i + 1} onRemove={() => onRemove(p.key)} />
          ))}
        </ul>
      )}

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
          {PHOTO_GUIDE.recommended}
          {photos.length > 0 && (
            <span className="text-white/45">
              {" "}
              · {photos.length} of {MAX_PHOTOS} added
            </span>
          )}
        </span>
      </p>
      {error && <ErrorText id={`${id}-error`} text={error} />}
    </div>
  );
}

function Thumb({ photo, n, onRemove }: { photo: Photo; n: number; onRemove: () => void }) {
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
      <span className="absolute top-1.5 left-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink/85 px-1.5 font-[family-name:var(--font-display)] text-[13px] leading-none text-gold">
        {n}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove photo ${n}`}
        className="absolute top-1 right-1 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:text-gold"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/85 ring-1 ring-white/20">
          <Icon name="close" size={13} strokeWidth={2.4} />
        </span>
      </button>
    </li>
  );
}
