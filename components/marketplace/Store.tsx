"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Product, User } from "@/lib/types";
import { removePurchased } from "@/lib/cart";
type Line = { id: string; quantity: number };
type StoreValue = {
  cart: Line[];
  add: (p: Product, quantity?: number) => void;
  setQuantity: (id: string, n: number) => void;
  clear: () => void;
  completePurchase: (orderId: string, items: Line[]) => void;
  notify: (s: string) => void;
  user: User | null;
  refreshUser: () => Promise<void>;
};
const StoreContext = createContext<StoreValue | null>(null);
export async function api<T = Record<string, unknown>>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem("sailan-cart-v1") || "[]");
      if (Array.isArray(v))
        setCart(
          v.filter(
            (x) =>
              typeof x.id === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 20,
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("sailan-cart-v1", JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const refreshUser = useCallback(async () => {
    try {
      const x = await api<{ user: User | null }>("/api/me");
      setUser(x.user);
    } catch {
      setUser(null);
    }
  }, []);
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);
  const add = (p: Product, quantity = 1) => {
    if (p.quantity < 1) {
      setToast("This device is currently unavailable.");
      return;
    }
    setCart((current) => {
      const old = current.find((x) => x.id === p.id);
      return old
        ? current.map((x) =>
            x.id === p.id
              ? {
                  ...x,
                  quantity: Math.min(p.quantity, 20, x.quantity + quantity),
                }
              : x,
          )
        : [
            ...current,
            { id: p.id, quantity: Math.min(quantity, p.quantity, 20) },
          ];
    });
    setToast(`${p.title} added to your bag`);
  };
  const completePurchase = useCallback(
    (orderId: string, items: Line[]) => {
      if (!ready) return;
      let completed: string[] = [];
      try {
        completed = JSON.parse(
          localStorage.getItem("sailan-completed-orders") || "[]",
        );
      } catch {}
      if (!Array.isArray(completed)) completed = [];
      if (completed.includes(orderId)) return;
      setCart((current) => removePurchased(current, items));
      localStorage.setItem(
        "sailan-completed-orders",
        JSON.stringify([...completed, orderId].slice(-100)),
      );
    },
    [ready],
  );
  return (
    <StoreContext.Provider
      value={{
        cart,
        add,
        setQuantity: (id, n) =>
          setCart((c) =>
            n < 1
              ? c.filter((x) => x.id !== id)
              : c.map((x) =>
                  x.id === id ? { ...x, quantity: Math.min(20, n) } : x,
                ),
          ),
        clear: () => setCart([]),
        completePurchase,
        notify: setToast,
        user,
        refreshUser,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}
export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error("Store provider missing");
  return c;
};
