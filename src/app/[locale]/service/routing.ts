// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "kr"],
  defaultLocale: "en",
});

// ─────────────────────────────────────────────
// i18n/request.ts
// ─────────────────────────────────────────────
// import { getRequestConfig } from "next-intl/server";
// import { routing } from "./routing";
//
// export default getRequestConfig(async ({ requestLocale }) => {
//   let locale = await requestLocale;
//   if (!locale || !routing.locales.includes(locale as "en" | "kr")) {
//     locale = routing.defaultLocale;
//   }
//   return {
//     locale,
//     messages: (await import(`../messages/${locale}.json`)).default,
//   };
// });

// ─────────────────────────────────────────────
// middleware.ts  (project root)
// ─────────────────────────────────────────────
// import createMiddleware from "next-intl/middleware";
// import { routing } from "./i18n/routing";
//
// export default createMiddleware(routing);
//
// export const config = {
//   matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
// };

// ─────────────────────────────────────────────
// next.config.ts
// ─────────────────────────────────────────────
// import createNextIntlPlugin from "next-intl/plugin";
// const withNextIntl = createNextIntlPlugin();
// export default withNextIntl({ /* your next config */ });
