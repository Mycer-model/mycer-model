// One interface for every generation provider. The real provider replaces the mock without touching screens.
export interface ProviderRequest { model: string; prompt: string; ratio: string; duration?: number }
export interface ProviderStatus { status: 'running' | 'succeeded' | 'failed'; outputUrl?: string; failure?: string }
export interface Provider {
  name: string;
  start(req: ProviderRequest): Promise<{ taskId: string }>;
  poll(taskId: string): Promise<ProviderStatus>;
}
