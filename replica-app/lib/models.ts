// Model catalog. The request shape differs per model, so every field is looked up here, never carried across models.
export type Kind = 'video' | 'image' | 'audio';
export interface ModelSpec {
  id: string; label: string; kind: Kind; blurb: string;
  ratios: string[]; durations?: number[]; maxPrompt: number;
  creditsPerUnit: number; unit: 'generation' | 'second';
  minPlan: 'free' | 'standard' | 'pro' | 'max';
}
export const MODELS: ModelSpec[] = [
  { id: 'mock-video-fast', label: 'Draft video', kind: 'video', blurb: 'Quick, low-cost motion test.', ratios: ['16:9', '9:16'], durations: [2, 4, 6], maxPrompt: 800, creditsPerUnit: 6, unit: 'second', minPlan: 'free' },
  { id: 'mock-video-pro', label: 'Studio video', kind: 'video', blurb: 'Higher quality, longer clips.', ratios: ['16:9', '9:16', '1:1'], durations: [4, 6, 8, 10], maxPrompt: 1500, creditsPerUnit: 12, unit: 'second', minPlan: 'standard' },
  { id: 'mock-image', label: 'Still image', kind: 'image', blurb: 'One image from a prompt.', ratios: ['1:1', '16:9', '9:16', '4:5'], maxPrompt: 1000, creditsPerUnit: 4, unit: 'generation', minPlan: 'free' },
];
export const PLAN_ORDER = ['free', 'standard', 'pro', 'max'] as const;
export const getModel = (id: string) => MODELS.find((m) => m.id === id);
export function costOf(model: ModelSpec, duration?: number): number {
  return model.unit === 'second' ? model.creditsPerUnit * (duration ?? 0) : model.creditsPerUnit;
}
export function validateRequest(model: ModelSpec, req: { prompt: string; ratio: string; duration?: number }): string | null {
  if (!req.prompt.trim()) return 'Write a prompt first.';
  if (req.prompt.length > model.maxPrompt) return `Prompt is over ${model.maxPrompt} characters for this model.`;
  if (!model.ratios.includes(req.ratio)) return 'This model does not support that aspect ratio.';
  if (model.durations && !model.durations.includes(req.duration ?? -1)) return 'Pick a duration this model supports.';
  return null;
}
