/**
 * The hidden field every enquiry form carries: a person leaves it empty, a
 * bot that fills every input it finds does not.
 *
 * Its name and label mean nothing to a browser on purpose. Until 2026-11-02
 * it was `__company`, labelled "Company", and Chrome's autofill — or a
 * password manager — filled it whenever a visitor picked their name or email
 * from the suggestions and their saved profile had a company. The input sits
 * in a 0×0 wrapper but is itself 175×26, so to a browser it is a field like
 * any other. Those enquiries were dropped as bots without a word (PROJECT.md
 * §11).
 */
export const HONEYPOT = "__leave_empty";
