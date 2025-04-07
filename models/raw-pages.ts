import zod from "npm:zod";

const RawPagesSchema = zod.array(zod.tuple([zod.string(), zod.string()]));

export const parseRawPages = (rawPages: unknown): RawPages => {
  const result = RawPagesSchema.safeParse(rawPages);
  if (!result.success) {
    throw new Error(`Invalid raw pages: ${JSON.stringify(result.error)}`);
  }
  return result.data;
};

export type RawPages = zod.infer<typeof RawPagesSchema>;
