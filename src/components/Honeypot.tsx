import { useId } from "react";
import { HONEYPOT } from "@/lib/honeypot";

/** Hidden from people, tempting to bots, and named so autofill passes it by. */
export default function Honeypot() {
  const id = useId();
  return (
    <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input id={id} type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
    </div>
  );
}
