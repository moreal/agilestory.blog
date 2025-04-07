import zod from "npm:zod";

const RawContentSchema = zod.object({
  title: zod.string(),
  body: zod.string(),
  createdAt: zod.string().nullable(),
});

export const parseRawContent = (rawContent: unknown): RawContent => {
  const result = RawContentSchema.safeParse(rawContent);
  if (!result.success) {
    throw new Error(`Invalid raw content: ${JSON.stringify(result.error)}`);
  }
  return result.data;
};

export type RawContent = zod.infer<typeof RawContentSchema>;
