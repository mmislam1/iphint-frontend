import { Locale } from "./i18n";

const dictionaries = {
  en: () => import("../messages/en.json").then((m) => m.default),
  kr: () => import("../messages/kr.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
