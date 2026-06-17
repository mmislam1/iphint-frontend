import { useTranslations } from "next-intl";
import { renderTextWithIpHintWordmark } from "@/components/IpHintWordmark";

const blogPosts = [
  { id: 1, href: "https://luminous-beat-885.notion.site/Content-IP-theft-is-rarely-absent-it-is-simply-undiscovered-33af70a1e02e819ab00adba0ba23b2c8?pvs=25" },
  { id: 2, href: "https://luminous-beat-885.notion.site/Does-AI-Art-Have-No-Copyright-The-Moment-Your-Brand-Becomes-Public-Property-33af70a1e02e8133b548e92336357492?pvs=25" },
  { id: 3, href: "https://luminous-beat-885.notion.site/Used-One-Image-and-Got-a-Settlement-Demand-Surviving-the-Predatory-Lawsuit-Trap-33af70a1e02e81599b08dcaf2294c653?pvs=25" },
  { id: 4, href: "https://luminous-beat-885.notion.site/Your-Brand-as-a-Target-The-K-Content-Crisis-on-Ali-and-Temu-33af70a1e02e81cdb287d1f45627e275?pvs=25" },
];

export default function Section6() {
  const t = useTranslations("Landing.section6");

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{renderTextWithIpHintWordmark(t("title"))}</h2>
        <div className="border-t border-gray-100">
          {blogPosts.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-8 border-b border-gray-100 hover:bg-slate-50 transition-colors px-4"
            >
              <h3 className="text-lg font-semibold text-slate-900 pr-8 leading-snug">
                {renderTextWithIpHintWordmark(t(`posts.${post.id}.title`))}
              </h3>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>

            </a>
          ))}
        </div>
      </div>
    </section>
  );
}