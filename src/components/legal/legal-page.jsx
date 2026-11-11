import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logos/blue-logo.png";

// Layout for /privacy, /terms and /data-deletion. `sections`: [{ id, title, paragraphs?, bullets? }].
// Text in [square brackets] is a detail the client still has to supply (shown highlighted).
const withPlaceholders = (text) =>
  String(text)
    .split(/(\[[^\]]+\])/g)
    .map((part, index) =>
      /^\[[^\]]+\]$/.test(part) ? (
        <mark key={index} className="rounded bg-amber-100 px-1 text-amber-900">
          {part}
        </mark>
      ) : (
        part
      )
    );

export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/data-deletion", label: "Data Deletion" },
];

export default function LegalPage({ title, intro, updated, sections, children }) {
  return (
    <main className="min-h-screen bg-light-gray px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-block mb-6" aria-label="PitchProX home">
          <Image src={logo} alt="PitchProX" className="h-auto w-[200px]" priority />
        </Link>
        <article className="rounded-3xl bg-white border border-light-gray p-6 sm:p-10 shadow-sm text-dark-black">
          <p role="note" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong>Draft:</strong> written by the PitchProX development team for review by PitchProX&apos;s legal advisor before launch. Highlighted items still need the company&apos;s details.
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-light-black">{updated}</p>
          {intro && <p className="mt-5 text-[15px] leading-7 text-medium-black">{withPlaceholders(intro)}</p>}

          <nav aria-label="On this page" className="mt-6 rounded-2xl bg-light-gray/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-light-black mb-2">On this page</p>
            <ol className="grid gap-1 sm:grid-cols-2 text-sm list-decimal list-inside">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-primary hover:underline">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="mt-8 scroll-mt-6">
              <h2 className="text-lg font-bold">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph, i) => (
                <p key={i} className="mt-3 text-[15px] leading-7 text-medium-black">
                  {withPlaceholders(paragraph)}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 space-y-1.5 list-disc pl-5 text-[15px] leading-7 text-medium-black">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{withPlaceholders(bullet)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {children}
        </article>
        <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-medium-black">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="hover:text-primary">
            PitchProX home
          </Link>
        </footer>
      </div>
    </main>
  );
}
