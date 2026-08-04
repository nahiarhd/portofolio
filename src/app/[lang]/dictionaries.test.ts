import { describe, expect, it } from "vitest";

import { LOCALES } from "@/lib/locale";

import { getDictionary } from "./dictionaries";

/** Dotted paths of every leaf in an object, sorted — "nav.work", "error.retry". */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value)
    .flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("dictionaries", () => {
  it("has identical key sets across every locale", async () => {
    const [reference, ...rest] = await Promise.all(
      LOCALES.map(async (locale) => ({
        locale,
        paths: leafPaths(await getDictionary(locale)),
      })),
    );

    for (const entry of rest) {
      expect(entry.paths, `${entry.locale} vs ${reference.locale}`).toEqual(
        reference.paths,
      );
    }
  });

  it("has no empty string in any locale", async () => {
    for (const locale of LOCALES) {
      const dictionary = await getDictionary(locale);
      const empties = Object.entries(flatten(dictionary))
        .filter(([, text]) => !text.trim())
        .map(([path]) => path);
      expect(empties, locale).toEqual([]);
    }
  });

  it("actually translates — locales are not copies of each other", async () => {
    const [en, id] = await Promise.all([getDictionary("en"), getDictionary("id")]);
    const enFlat = flatten(en);
    const idFlat = flatten(id);

    const identical = Object.keys(enFlat).filter(
      (path) => enFlat[path] === idFlat[path],
    );

    // A few coincidences are legitimate (proper nouns, "OK"). Wholesale
    // equality means someone copied en.json to id.json and moved on.
    expect(identical.length).toBeLessThan(Object.keys(enFlat).length / 2);
  });
});

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  if (value === null || typeof value !== "object") return {};
  return Object.entries(value).reduce<Record<string, string>>(
    (acc, [key, child]) =>
      Object.assign(acc, flatten(child, prefix ? `${prefix}.${key}` : key)),
    {},
  );
}
