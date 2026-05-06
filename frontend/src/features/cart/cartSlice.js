import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: JSON.parse(localStorage.getItem('cart')) || [],
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload
      const existing = state.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.push({ ...product, quantity })
      }
    },
    removeFromCart: (state, action) => {
      return state.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.find((i) => i.id === id)
      if (item) {
        if (quantity <= 0) {
          return state.filter((i) => i.id !== id)
        }
        item.quantity = quantity
      }
    },
    clearCart: () => {
      return []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer