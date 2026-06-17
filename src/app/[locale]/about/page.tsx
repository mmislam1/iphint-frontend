import Image from "next/image";
import { Link } from "@/i18n/routing";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";
import { getTranslations } from "next-intl/server";

type AboutSection = {
  title: string;
  paragraphs: string[];
  callout?: string;
};

type TeamMember = {
  role: string;
  name: string;
};

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");
  const eyebrow = t("eyebrow");
  const title = t("title");
  const subtitle = t("subtitle");
  const illustrationSrc = t("illustrationSrc");
  const illustrationAlt = t("illustrationAlt");
  const sections = t.raw("sections") as AboutSection[];
  const teamTitle = t("teamTitle");
  const teamMembers = t.raw("teamMembers") as TeamMember[];
  const backToMain = t("backToMain");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.18) 1.5px, transparent 1.5px), linear-gradient(180deg, rgba(248,250,252,0.85) 0%, rgba(255,255,255,1) 72%)",
            backgroundSize: "22px 22px, 100% 100%",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-6 sm:px-10 sm:pt-16 sm:pb-8 lg:px-12 lg:pt-24 lg:pb-10">
          <div className="max-w-3xl pl-7 text-left sm:pl-9">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {renderTextWithIpHintWordmark(title)}
            </h1>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-slate-700 sm:text-xl">
              {renderTextWithIpHintWordmark(subtitle)}
            </p>
          </div>

          <div className="relative mt-8 w-full overflow-hidden sm:mt-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(203,213,225,0.55) 1.4px, transparent 1.4px)",
                backgroundSize: "20px 20px",
              }}
              aria-hidden="true"
            />
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={illustrationSrc}
                alt={illustrationAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 72rem"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pb-14 sm:px-10 lg:px-12 lg:pb-20">
          <div className="grid gap-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="bg-white"
              >
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {renderTextWithIpHintWordmark(section.title)}
                </h2>

                <div className="mt-5 flex flex-col gap-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-slate-600 sm:text-lg">
                      {renderTextWithIpHintWordmark(paragraph)}
                    </p>
                  ))}
                </div>

                {section.callout ? (
                  <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-lg font-semibold leading-relaxed text-slate-900 sm:px-6 sm:py-5">
                    {renderTextWithIpHintWordmark(`"${section.callout}"`)}
                  </div>
                ) : null}
              </article>
            ))}

            <section className="bg-white border-t border-slate-200 pt-10 mt-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {teamTitle}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.role}
                    className=""
                  >
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                      {member.role}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">
                      {member.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-900"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {backToMain}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
