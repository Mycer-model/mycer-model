'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface T { id: number; text: string; undo?: () => void }
const Ctx = createContext<(text: string, undo?: () => void) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const n = useRef(0);
  const push = useCallback((text: string, undo?: () => void) => {
    const id = ++n.current;
    setItems((x) => [...x, { id, text, undo }]);
    setTimeout(() => setItems((x) => x.filter((y) => y.id !== id)), 8000); // undo window: 8 s
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-toast flex -translate-x-1/2 flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-md bg-text px-4 py-2 text-sm text-bg shadow-pop">
            <span>{t.text}</span>
            {t.undo && <button className="font-semibold underline" onClick={() => { t.undo!(); setItems((x) => x.filter((y) => y.id !== t.id)); }}>Undo</button>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
