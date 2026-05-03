import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const current = updated[existingIndex];
            if (current.quantity < current.stock) {
              updated[existingIndex] = {
                ...current,
                quantity: current.quantity + 1,
              };
            }
            return { items: updated };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 200 ? 0 : 25;
      },

      getTax: () => {
        return get().getSubtotal() * 0.15;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost() + get().getTax();
      },
    }),
    {
      name: 'pharmaflow-cart',
    }
  )
);
