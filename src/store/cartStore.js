import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  isCartOpen: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  addToCart: (product, color) => set((state) => {
    const existingItem = state.cart.find(
      item => item.id === product.id && item.color === color
    );
    
    if (existingItem) {
      return {
        cart: state.cart.map(item => 
          item.id === product.id && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        isCartOpen: true // Open cart when adding item
      };
    }
    
    return {
      cart: [...state.cart, { ...product, color, quantity: 1 }],
      isCartOpen: true
    };
  }),
  
  removeFromCart: (productId, color) => set((state) => ({
    cart: state.cart.filter(item => !(item.id === productId && item.color === color))
  })),
  
  updateQuantity: (productId, color, delta) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === productId && item.color === color) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    })
  })),
  
  clearCart: () => set({ cart: [] }),
  
  getCartTotal: (state) => {
    return state.cart.reduce((total, item) => {
      // Parse price assuming format like "$245.00 USD"
      const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (priceValue * item.quantity);
    }, 0);
  }
}));
