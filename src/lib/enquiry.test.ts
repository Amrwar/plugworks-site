import { describe, expect, it } from "vitest";
import {
  ENQUIRY_FIELDS,
  firstErrorField,
  isSendable,
  looksLikeEmail,
  MIN_MESSAGE,
  normaliseEnquiry,
  OTHER_SERVICE,
  serviceChoices,
  validateEnquiry,
} from "./enquiry";

const good = {
  name: "Nadia",
  email: "nadia@example.com",
  company: "Northwind",
  service: "content-production",
  message: "We are launching a product in Cairo and need a film.",
};

describe("recognising an email address", () => {
  it("accepts an ordinary address", () => {
    expect(looksLikeEmail("nadia@example.com")).toBe(true);
  });

  it("accepts a subdomain", () => {
    expect(looksLikeEmail("nadia@mail.example.co.uk")).toBe(true);
  });

  it("accepts a plus tag", () => {
    expect(looksLikeEmail("nadia+studio@example.com")).toBe(true);
  });

  it("refuses an address with no at sign", () => {
    expect(looksLikeEmail("nadia.example.com")).toBe(false);
  });

  it("refuses two at signs", () => {
    expect(looksLikeEmail("nadia@@example.com")).toBe(false);
  });

  it("refuses a domain with no dot", () => {
    expect(looksLikeEmail("nadia@example")).toBe(false);
  });

  it("refuses a domain that ends in a dot", () => {
    expect(looksLikeEmail("nadia@example.")).toBe(false);
  });

  it("refuses a doubled dot in the domain", () => {
    expect(looksLikeEmail("nadia@example..com")).toBe(false);
  });

  it("refuses an address with a space in it", () => {
    expect(looksLikeEmail("nadia @example.com")).toBe(false);
  });

  it("refuses an empty local part", () => {
    expect(looksLikeEmail("@example.com")).toBe(false);
  });
});

describe("reading the enquiry form", () => {
  it("passes a complete enquiry", () => {
    expect(validateEnquiry(good)).toEqual({});
    expect(isSendable(good)).toBe(true);
  });

  it("asks for a name when it is missing", () => {
    expect(validateEnquiry({ ...good, name: "" }).name).toBeDefined();
  });

  it("treats a name of spaces as missing", () => {
    expect(validateEnquiry({ ...good, name: "   " }).name).toBeDefined();
  });

  it("asks for an email when it is missing", () => {
    expect(validateEnquiry({ ...good, email: "" }).email).toBeDefined();
  });

  it("complains differently about a malformed email", () => {
    const blank = validateEnquiry({ ...good, email: "" }).email;
    const wrong = validateEnquiry({ ...good, email: "nope" }).email;
    expect(wrong).toBeDefined();
    expect(wrong).not.toBe(blank);
  });

  it("lets the company be left out", () => {
    expect(validateEnquiry({ ...good, company: "" })).toEqual({});
  });

  it("lets the service be left unchosen", () => {
    expect(validateEnquiry({ ...good, service: "" })).toEqual({});
  });

  it("refuses a service we do not offer", () => {
    expect(validateEnquiry({ ...good, service: "time-travel" }).service).toBeDefined();
  });

  it("accepts every service we do offer", () => {
    for (const id of ["brand-experiences", "event-production", "digital-experiences"]) {
      expect(validateEnquiry({ ...good, service: id }).service).toBeUndefined();
    }
  });

  it("asks for a message when it is missing", () => {
    expect(validateEnquiry({ ...good, message: "" }).message).toBeDefined();
  });

  it("asks for more when the message is too short", () => {
    expect(validateEnquiry({ ...good, message: "hi" }).message).toBeDefined();
  });

  it("accepts a message exactly at the minimum", () => {
    const message = "x".repeat(MIN_MESSAGE);
    expect(validateEnquiry({ ...good, message }).message).toBeUndefined();
  });

  it("measures the message after trimming", () => {
    const message = "  " + "x".repeat(MIN_MESSAGE - 1) + "  ";
    expect(validateEnquiry({ ...good, message }).message).toBeDefined();
  });

  it("collects every problem at once rather than stopping at the first", () => {
    const errors = validateEnquiry({ name: "", email: "nope", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("treats a missing field and an absent key the same way", () => {
    expect(validateEnquiry({})).toEqual(validateEnquiry({ name: "", email: "", message: "" }));
  });

  it("accepts the catch-all choice for work that fits no service", () => {
    expect(validateEnquiry({ ...good, service: OTHER_SERVICE }).service).toBeUndefined();
  });

  it("offers the empty default, every service and the catch-all", () => {
    expect(serviceChoices()).toEqual([
      "",
      "brand-experiences",
      "content-production",
      "event-production",
      "campaign-strategy",
      "creative-direction",
      "digital-experiences",
      OTHER_SERVICE,
    ]);
  });

  it("accepts every choice the picker can offer", () => {
    for (const choice of serviceChoices()) {
      expect(validateEnquiry({ ...good, service: choice }).service).toBeUndefined();
    }
  });

  it("says the form is not sendable while anything is wrong", () => {
    expect(isSendable({ ...good, email: "nope" })).toBe(false);
  });
});

describe("normalising an enquiry", () => {
  it("trims every field", () => {
    expect(
      normaliseEnquiry({ name: "  Nadia  ", email: " nadia@example.com ", message: "  hello  " })
    ).toEqual({ name: "Nadia", email: "nadia@example.com", company: "", service: "", message: "hello" });
  });

  it("turns a missing field into an empty string", () => {
    expect(normaliseEnquiry({})).toEqual({
      name: "",
      email: "",
      company: "",
      service: "",
      message: "",
    });
  });

  it("leaves an already-clean enquiry alone", () => {
    const clean = {
      name: "Nadia",
      email: "nadia@example.com",
      company: "Northwind",
      service: "other",
      message: "A long enough message to pass.",
    };
    expect(normaliseEnquiry(clean)).toEqual(clean);
  });

  it("agrees with the validator about what is empty", () => {
    const padded = { name: "   ", email: "  ", message: "  " };
    expect(Object.keys(validateEnquiry(padded)).sort()).toEqual(["email", "message", "name"]);
    expect(normaliseEnquiry(padded).name).toBe("");
  });
});

describe("ENQUIRY_FIELDS", () => {
  it("lists the fields in the order the form asks for them", () => {
    expect(ENQUIRY_FIELDS).toEqual(["name", "email", "company", "service", "message"]);
  });

  it("covers every field an enquiry carries", () => {
    const enquiry = normaliseEnquiry({});
    expect([...ENQUIRY_FIELDS].sort()).toEqual(Object.keys(enquiry).sort());
  });
});

describe("firstErrorField", () => {
  it("finds nothing wrong with a form that is good", () => {
    expect(firstErrorField({})).toBeUndefined();
  });

  it("names the only field that is wrong", () => {
    expect(firstErrorField({ message: "too short" })).toBe("message");
  });

  it("sends the visitor to the topmost problem, not the first one checked", () => {
    expect(firstErrorField({ message: "too short", name: "missing" })).toBe("name");
  });

  it("prefers the email over the message, as the form is laid out", () => {
    expect(firstErrorField({ message: "too short", email: "wrong" })).toBe("email");
  });

  it("ignores a field explicitly marked as fine", () => {
    expect(firstErrorField({ name: undefined, email: "wrong" })).toBe("email");
  });

  it("points somewhere real for every form the validator rejects", () => {
    const rejected = [
      {},
      { name: "Ada" },
      { name: "Ada", email: "ada@example.com" },
      { name: "Ada", email: "nope", message: "A long enough message to pass." },
      { name: "Ada", email: "ada@example.com", service: "time-travel", message: "A long enough message." },
    ];
    for (const input of rejected) {
      const errors = validateEnquiry(input);
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      const field = firstErrorField(errors);
      expect(field).toBeDefined();
      expect(errors[field as keyof typeof errors]).toBeDefined();
    }
  });

  it("finds nothing to fix on a form that is ready to send", () => {
    const ready = {
      name: "Ada",
      email: "ada@example.com",
      company: "",
      service: "",
      message: "We would like to talk about a launch film.",
    };
    expect(isSendable(ready)).toBe(true);
    expect(firstErrorField(validateEnquiry(ready))).toBeUndefined();
  });
});
