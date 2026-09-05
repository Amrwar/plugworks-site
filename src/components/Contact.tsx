"use client";

import { useRef, useState, type FormEvent } from "react";

import { useReveal } from "@/hooks/useReveal";

import { officeLine } from "@/data/locations";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";
import { SOCIAL_LINKS, socialLabel } from "@/data/social";
import {
  firstErrorField,
  OTHER_SERVICE,
  validateEnquiry,
  type Enquiry,
  type EnquiryErrors,
} from "@/lib/enquiry";

const EMPTY: Enquiry = { name: "", email: "", company: "", service: "", message: "" };

export default function Contact() {
  const { ref: sectionRef, isVisible } = useReveal<HTMLElement>(0.2);
  const [values, setValues] = useState<Enquiry>(EMPTY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (field: keyof Enquiry, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's complaint as soon as the visitor starts fixing it,
    // rather than leaving it shouting until the next submit.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateEnquiry(values);
    setErrors(found);
    const firstBad = firstErrorField(found);
    if (firstBad) {
      // Redrawing the complaints is no use to anyone not looking at the page.
      // Putting the cursor in the first field that needs work announces what
      // is wrong with it, because the field is described by its own message.
      formRef.current?.querySelector<HTMLElement>(`#${firstBad}`)?.focus();
      return;
    }
    setSent(true);
    setValues(EMPTY);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative py-32 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-plug-electric/10 rounded-full blur-glow" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-plug-spark/10 rounded-full blur-glow" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-block font-display text-sm text-plug-electric uppercase tracking-[0.3em] mb-4">
              Get in Touch
            </span>
            <h2
 id="contact-heading"
 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-plug-light leading-tight mb-6">
              Ready to
              <span className="block gradient-text">Plug In?</span>
            </h2>
            <p className="font-body text-lg text-plug-light/60 leading-relaxed mb-10">
              Have a project in mind? Let&apos;s spark a conversation. 
              Whether you&apos;re looking for a creative partner or want to 
              explore possibilities, we&apos;re all ears.
            </p>

            {/* Contact info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-plug-electric/10 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-5 h-5 text-plug-electric" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm text-plug-light/40">Email us</p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="font-body text-plug-light hover:text-plug-electric transition-colors"
                  >
                    {SITE.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-plug-spark/10 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-5 h-5 text-plug-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm text-plug-light/40">Offices</p>
                  <p className="font-body text-plug-light">{officeLine()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-plug-glow/10 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-5 h-5 text-plug-glow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-sm text-plug-light/40">Follow us</p>
                  <ul className="flex flex-wrap gap-x-3 gap-y-1">
                    {SOCIAL_LINKS.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={socialLabel(link)}
                          className="font-body text-plug-light hover:text-plug-electric transition-colors"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact form */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="gradient-border p-8 md:p-10">
              <form ref={formRef} className="space-y-6" onSubmit={onSubmit} noValidate>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-body text-sm text-plug-light/60 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                    autoComplete="name"
                      value={values.name}
                      onChange={(event) => update("name", event.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className="w-full px-4 py-3 bg-plug-black/50 border border-white/10 rounded-xl text-plug-light font-body focus:border-plug-electric focus:outline-none focus:ring-1 focus:ring-plug-electric transition-all"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-2 font-body text-sm text-plug-spark">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-body text-sm text-plug-light/60 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                    autoComplete="email"
                      value={values.email}
                      onChange={(event) => update("email", event.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className="w-full px-4 py-3 bg-plug-black/50 border border-white/10 rounded-xl text-plug-light font-body focus:border-plug-electric focus:outline-none focus:ring-1 focus:ring-plug-electric transition-all"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-2 font-body text-sm text-plug-spark">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block font-body text-sm text-plug-light/60 mb-2">
                    Company / Brand
                  </label>
                  <input
                    type="text"
                    id="company"
                    autoComplete="organization"
                    value={values.company}
                    onChange={(event) => update("company", event.target.value)}
                    aria-invalid={errors.company ? true : undefined}
                    aria-describedby={errors.company ? "company-error" : undefined}
                    className="w-full px-4 py-3 bg-plug-black/50 border border-white/10 rounded-xl text-plug-light font-body focus:border-plug-electric focus:outline-none focus:ring-1 focus:ring-plug-electric transition-all"
                    placeholder="Your company name"
                  />
                  {errors.company && (
                    <p id="company-error" className="mt-2 font-body text-sm text-plug-spark">
                      {errors.company}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="service" className="block font-body text-sm text-plug-light/60 mb-2">
                    What are you looking for?
                  </label>
                  <select
                    id="service"
                    value={values.service}
                    onChange={(event) => update("service", event.target.value)}
                    aria-invalid={errors.service ? true : undefined}
                    aria-describedby={errors.service ? "service-error" : undefined}
                    className="w-full px-4 py-3 bg-plug-black/50 border border-white/10 rounded-xl text-plug-light font-body focus:border-plug-electric focus:outline-none focus:ring-1 focus:ring-plug-electric transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                    <option value={OTHER_SERVICE}>Something else</option>
                  </select>
                  {errors.service && (
                    <p id="service-error" className="mt-2 font-body text-sm text-plug-spark">
                      {errors.service}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block font-body text-sm text-plug-light/60 mb-2">
                    Tell us about your project
                  </label>
                  <textarea
                    id="message"
                    value={values.message}
                    onChange={(event) => update("message", event.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    rows={4}
                    className="w-full px-4 py-3 bg-plug-black/50 border border-white/10 rounded-xl text-plug-light font-body focus:border-plug-electric focus:outline-none focus:ring-1 focus:ring-plug-electric transition-all resize-none"
                    placeholder="Share your vision..."
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-2 font-body text-sm text-plug-spark">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full btn-electric px-8 py-4 bg-gradient-to-r from-plug-electric to-plug-glow text-plug-black font-display font-bold rounded-xl hover:shadow-lg hover:shadow-plug-electric/30 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Send Message
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </span>
                </button>

                {sent && (
                  <p role="status" className="font-body text-sm text-plug-electric text-center">
                    Thanks — we have your message and will be in touch shortly.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
