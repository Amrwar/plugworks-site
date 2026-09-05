import { SERVICES } from "@/data/services";

/** What the contact form collects. */
export type Enquiry = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
};

/** A per-field complaint, keyed by field name. Empty means the form is good. */
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

/** The choice for work that does not fit the service list. */
export const OTHER_SERVICE = "other";

/** Every value the service picker may carry, including the empty default. */
export function serviceChoices(): string[] {
  return ["", ...SERVICES.map((s) => s.id), OTHER_SERVICE];
}

/** The shortest message worth sending to a studio. */
export const MIN_MESSAGE = 20;

/**
 * Whether an address is plausible enough to reply to.
 *
 * Deliberately not RFC 5322: the form only needs to catch the mistakes people
 * actually make - a missing @, a missing dot in the domain, stray spaces -
 * without rejecting the unusual-but-valid addresses a stricter pattern eats.
 */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed !== value.trim() || /\s/.test(trimmed)) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0 || at !== trimmed.lastIndexOf("@")) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  return !domain.includes("..");
}

/**
 * Reads the form the way the server would.
 *
 * Every field is trimmed before it is judged, so a name of spaces is missing
 * rather than present. `company` is genuinely optional and `service` may be
 * left unchosen, but if one IS chosen it has to be a service we offer.
 */
export function validateEnquiry(input: Partial<Enquiry>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim();
  const service = (input.service ?? "").trim();
  const message = (input.message ?? "").trim();

  if (name === "") errors.name = "Please tell us your name.";
  if (email === "") errors.email = "Please add an email address.";
  else if (!looksLikeEmail(email)) errors.email = "That email address looks wrong.";
  if (service !== "" && service !== OTHER_SERVICE && !SERVICES.some((s) => s.id === service)) {
    errors.service = "Please pick one of our services.";
  }
  if (message === "") errors.message = "Please tell us about the project.";
  else if (message.length < MIN_MESSAGE) {
    errors.message = `Please add a little more detail (${MIN_MESSAGE} characters or so).`;
  }
  return errors;
}

/** True when nothing is wrong with the form. */
export function isSendable(input: Partial<Enquiry>): boolean {
  return Object.keys(validateEnquiry(input)).length === 0;
}

/**
 * The enquiry as it should be stored or sent on.
 *
 * Trimming at the boundary means the rest of the system never has to wonder
 * whether a name arrived with padding, and an unchosen service is an empty
 * string rather than the word "undefined".
 */
export function normaliseEnquiry(input: Partial<Enquiry>): Enquiry {
  return {
    name: (input.name ?? "").trim(),
    email: (input.email ?? "").trim(),
    company: (input.company ?? "").trim(),
    service: (input.service ?? "").trim(),
    message: (input.message ?? "").trim(),
  };
}

/**
 * The fields in the order the form asks for them.
 *
 * `validateEnquiry` builds its complaints in whatever order the checks run,
 * which is not something callers should have to know or depend on. Anything
 * that needs to walk the form in reading order walks this instead.
 */
export const ENQUIRY_FIELDS: readonly (keyof Enquiry)[] = [
  "name",
  "email",
  "company",
  "service",
  "message",
] as const;

/**
 * The first field the visitor needs to go back to.
 *
 * A rejected form used to redraw itself with the complaints in place and
 * leave focus sitting on the submit button, so anyone not looking at the
 * page had no idea anything had happened. This says where to send them:
 * the topmost field with something wrong with it.
 */
export function firstErrorField(errors: EnquiryErrors): keyof Enquiry | undefined {
  return ENQUIRY_FIELDS.find((field) => errors[field] !== undefined);
}
