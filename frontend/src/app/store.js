import { configureStore } from '@reduxjs/toolkit'
import { productApi } from './api/productApi'
import { orderApi } from './api/orderApi'
import cartReducer from '../features/cart/cartSlice'
import { localStorageMiddleware } from './middleware/localStorageMiddleware'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(productApi.middleware)
      .concat(orderApi.middleware)
      .concat(localStorageMiddleware),
})