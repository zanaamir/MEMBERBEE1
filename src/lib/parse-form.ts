import type { z } from "zod";

/** Turn FormData into a plain object; keys in `arrays` collect every submitted value. */
export function formToObject(formData: FormData, arrays: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$")) continue; // React internal fields
    out[key] = arrays.includes(key) ? formData.getAll(key) : formData.get(key);
  }
  for (const key of arrays) out[key] ??= [];
  return out;
}

export function parseForm<T extends z.ZodType>(schema: T, formData: FormData, arrays: string[] = []) {
  return schema.safeParse(formToObject(formData, arrays)) as z.ZodSafeParseResult<z.infer<T>>;
}
