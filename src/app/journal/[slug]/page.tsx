import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import JournalCard from "@/components/JournalCard";
import JsonLd from "@/components/JsonLd";
import Navigation from "@/components/Navigation";
import PageHeader from "@/components/PageHeader";
import { JOURNAL, journalEntry, moreReading, publishedLabel } from "@/data/journal";
import { teamMember } from "@/data/team";
import { breadcrumbJsonLd, journalJsonLd } from "@/lib/jsonld";
import { metaDescription, pageTitle, pageUrl } from "@/lib/seo";
import { readingMinutes } from "@/lib/text";

type PageProps = {
  params: { slug: string } | Promise<{ slug: string }>;
};

/** Every note is known at build time, so every note is a static page. */
export function generateStaticParams() {
  return JOURNAL.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const entry = journalEntry(slug);
  if (!entry) return { title: pageTitle("Journal") };
  return {
    title: pageTitle(entry.title),
    description: metaDescription(entry.standfirst),
    alternates: { canonical: pageUrl(`journal/${entry.slug}`) },
  };
}

export default async function JournalNote({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  const entry = journalEntry(slug);
  if (!entry) notFound();

  const author = teamMember(entry.authorId);
  const minutes = readingMinutes(entry.body);
  const more = moreReading(entry.slug, 2);

  return (
    <div className="min-h-screen bg-plug-black">
      <Navigation />
      <JsonLd document={journalJsonLd(entry)} />
      <JsonLd
        document={breadcrumbJsonLd([
          { label: "Home", path: "" },
          { label: "Journal", path: "journal" },
          { label: entry.title },
        ])}
      />
      <main id="main">
        <PageHeader
          eyebrow="Journal"
          title={entry.title}
          intro={entry.standfirst}
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: entry.title },
          ]}
        />

        <section aria-labelledby="byline-heading" className="border-b border-white/5 py-8">
          <div className="mx-auto max-w-3xl px-6 lg:px-12">
            <h2 id="byline-heading" className="sr-only">
              Who wrote this, and when
            </h2>
            <div className="flex flex-wrap items-center gap-3 font-body text-sm text-plug-light/50">
              <time dateTime={entry.published}>{publishedLabel(entry)}</time>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
              {author ? (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={`/about#${author.id}`}
                    className="text-plug-electric transition-colors duration-300 hover:text-plug-light"
                  >
                    {author.name}, {author.role}
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <article aria-labelledby="note-heading" className="py-16">
          <h2 id="note-heading" className="sr-only">
            {entry.title}
          </h2>
          <div className="mx-auto max-w-3xl space-y-6 px-6 lg:px-12">
            {entry.body.map((paragraph, index) => (
              <p key={index} className="font-body text-lg leading-relaxed text-plug-light/70">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <section aria-labelledby="tags-heading" className="pb-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-12">
            <h2
              id="tags-heading"
              className="font-body text-xs uppercase tracking-[0.2em] text-plug-light/40"
            >
              Filed under
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/10 px-4 py-2 font-body text-sm text-plug-light/60"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {more.length > 0 ? (
          <section
            aria-labelledby="more-heading"
            className="border-t border-white/5 bg-plug-dark/30 py-16"
          >
            <div className="mx-auto max-w-4xl px-6 lg:px-12">
              <h2
                id="more-heading"
                className="mb-8 font-display text-2xl font-bold text-plug-light"
              >
                More from the floor
              </h2>
              {more.map((other) => (
                <JournalCard key={other.slug} entry={other} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
