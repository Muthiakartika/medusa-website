/**
 * Bring a form's thank-you into view once it has replaced the form.
 *
 * The scroll is also what lets Cloudflare Zaraz count the enquiry: its
 * Element Visibility trigger only looks for the panel at load and on each
 * `scroll` or `resize` (PROJECT.md §15). A panel that lands already on screen
 * moves nothing and fires no scroll, so in that case one is dispatched on the
 * document, which is where Zaraz listens. A smooth scroll that did move has
 * fired its own.
 */
export function showThanks(el: HTMLElement | null) {
  if (!el) return;
  const before = window.scrollY;
  el.scrollIntoView({ block: "start", behavior: "smooth" });
  window.setTimeout(() => {
    if (window.scrollY === before) document.dispatchEvent(new Event("scroll"));
  }, 800);
}
