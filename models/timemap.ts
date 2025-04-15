import zod from "npm:zod";

const TimestampSchema = zod.string();
const OriginalLinkSchema = zod.string().url();
const TimeMapEntrySchema = zod.object({
  timestamp: TimestampSchema,
  url: OriginalLinkSchema,
});
const TimeMapSchema = zod.array(TimeMapEntrySchema);

export const parseTimeMap = (data: unknown): TimeMap => {
  const result = TimeMapSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid raw pages: ${JSON.stringify(result.error)}`);
  }
  return result.data;
};

export type OriginalLink = zod.infer<typeof OriginalLinkSchema>;
export type TimeMapEntry = zod.infer<typeof TimeMapEntrySchema>;
export type TimeMap = zod.infer<typeof TimeMapSchema>;
