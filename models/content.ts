import zod from "npm:zod";

const ContentSchema = zod.object({
  title: zod.string(),
  body: zod.string(),
  createdAt: zod.string().nullable(),
});

export const parseContent = (data: unknown): Content => {
  const result = ContentSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid raw content: ${JSON.stringify(result.error)}`);
  }
  return result.data;
};

export const safeParseContent = ContentSchema.safeParse;

export type Content = zod.infer<typeof ContentSchema>;
