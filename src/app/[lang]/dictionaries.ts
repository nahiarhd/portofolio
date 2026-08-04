import type { Locale } from "@/lib/locale";

/**
 * UI strings, loaded per locale. Project and profile *content* lives in
 * `src/content/` — this file is only for chrome: nav labels, error copy, and
 * anything else that is part of the interface rather than part of the work.
 *
 * Dictionaries are imported dynamically so a locale's strings are only in the
 * bundle for pages that render it. These load in Server Components, so the JSON
 * does not reach the browser at all.
 */
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  id: () => import("./dictionaries/id.json").then((module) => module.default),
};

// Indexing by `Locale` is itself the completeness check: adding a locale
// without a dictionary here is a type error. A `satisfies` clause would widen
// the return type to `unknown` and lose every key.
export const getDictionary = (locale: Locale) => dictionaries[locale]();
