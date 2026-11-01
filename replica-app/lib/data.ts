// Fake data layer (in memory). Same function signatures the real backend will have, so screens do not change later.
import { balance, reserve, refund, type LedgerRow } from './credits';
import { costOf, getModel, validateRequest } from './models';
import { mockProvider } from './providers/mock';

export interface Generation { id: string; model: string; kind: string; prompt: string; ratio: string; duration?: number; status: 'running' | 'succeeded' | 'failed' | 'cancelled'; failure?: string; outputUrl?: string; taskId: string; cost: number; createdAt: number }
interface Store { ledger: LedgerRow[]; generations: Generation[] }
const g = globalThis as unknown as { __store?: Store };
const store: Store = (g.__store ??= { ledger: [{ id: 'seed', delta: 125, reason: 'plan_grant', createdAt: Date.now() }], generations: [] });
const provider = mockProvider;

export async function getBalance() { return balance(store.ledger); }
export async function listGenerations(): Promise<Generation[]> {
  await Promise.all(store.generations.filter((x) => x.status === 'running').map(sync));
  return [...store.generations].sort((a, b) => b.createdAt - a.createdAt);
}
export async function getGeneration(id: string) {
  const gen = store.generations.find((x) => x.id === id);
  if (gen && gen.status === 'running') await sync(gen);
  return gen ?? null;
}
async function sync(gen: Generation) {
  // A provider error must fail this one generation, never break every page that lists them.
  const s = await provider.poll(gen.taskId).catch(() => ({ status: 'failed' as const, failure: 'The provider could not finish this one.' }));
  if (s.status === 'succeeded') { gen.status = 'succeeded'; gen.outputUrl = s.outputUrl; }
  if (s.status === 'failed') { gen.status = 'failed'; gen.failure = s.failure; store.ledger = refund(store.ledger, gen.id); }
}
export async function createGeneration(input: { model: string; prompt: string; ratio: string; duration?: number }) {
  const model = getModel(input.model);
  if (!model) throw new Error('Unknown model.');
  const err = validateRequest(model, input);
  if (err) throw new Error(err);
  const id = crypto.randomUUID();
  const cost = costOf(model, input.duration);
  store.ledger = reserve(store.ledger, id, cost); // throws INSUFFICIENT_CREDITS
  const { taskId } = await provider.start(input);
  const gen: Generation = { id, model: model.id, kind: model.kind, prompt: input.prompt, ratio: input.ratio, duration: input.duration, status: 'running', taskId, cost, createdAt: Date.now() };
  store.generations.push(gen);
  return gen;
}
export async function cancelGeneration(id: string) {
  const gen = store.generations.find((x) => x.id === id);
  if (gen && gen.status === 'running') { gen.status = 'cancelled'; store.ledger = refund(store.ledger, id); }
  return gen ?? null;
}
export async function listLedger() { return [...store.ledger].sort((a, b) => b.createdAt - a.createdAt); }
