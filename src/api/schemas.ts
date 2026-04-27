import { z } from 'zod';

const HEX_COLOR = /^#?[0-9a-fA-F]{3,8}$/;

export const memeOptionsSchema = z
  .object({
    topText: z.string().max(500).optional(),
    bottomText: z.string().max(500).optional(),
    fontSize: z.coerce.number().int().min(8).max(400).optional(),
    fontFamily: z.string().max(100).optional(),
    textColor: z.string().regex(HEX_COLOR).optional(),
    strokeColor: z.string().regex(HEX_COLOR).optional(),
    strokeWidth: z.coerce.number().min(0).max(20).optional(),
    format: z.enum(['png', 'jpeg', 'jpg', 'webp', 'avif']).optional(),
    quality: z.coerce.number().int().min(1).max(100).optional()
  })
  .strict();

export type ValidatedMemeOptions = z.infer<typeof memeOptionsSchema>;

export const batchRequestSchema = z
  .object({
    memes: z
      .array(
        memeOptionsSchema.extend({
          template: z.string().min(1).max(100)
        })
      )
      .min(1)
      .max(50),
    outputFormat: z.enum(['json', 'zip']).optional()
  })
  .strict();

export type ValidatedBatchRequest = z.infer<typeof batchRequestSchema>;

export const templateNameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/, 'template name must be alphanumeric with - or _');

export const customTemplateSchema = z
  .object({
    name: templateNameSchema,
    description: z.string().max(500).optional(),
    tags: z.string().max(200).optional(),
    topBox: z.string().optional(),
    bottomBox: z.string().optional()
  })
  .strict();

export const textBoxSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  height: z.number().positive(),
  fontSize: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  textColor: z.string().regex(HEX_COLOR).optional(),
  strokeColor: z.string().regex(HEX_COLOR).optional(),
  strokeWidth: z.number().min(0).optional(),
  maxWidth: z.number().positive().optional()
});
