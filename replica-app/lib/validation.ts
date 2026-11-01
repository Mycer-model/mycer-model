import { z } from 'zod';
export const createGenerationSchema = z.object({
  model: z.string().min(1).max(64),
  prompt: z.string().min(1).max(4000),
  ratio: z.string().regex(/^\d{1,2}:\d{1,2}$/),
  duration: z.number().int().min(1).max(60).optional(),
}).strict();
export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
