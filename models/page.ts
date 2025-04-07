import zod from "npm:zod";

const PageSchema = zod.object({
  timestamp: zod.string(),
  url: zod.string().url(),
});

// TODO: Rename...
export type Page = zod.infer<typeof PageSchema>;

export const parsePage = (page: unknown): Page => {
  const result = PageSchema.safeParse(page);
  if (!result.success) {
    throw new Error(`Invalid page: ${JSON.stringify(result.error)}`);
  }
  return result.data;
};
