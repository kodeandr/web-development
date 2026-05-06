import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8001' }),
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
    }),
    getOrder: builder.query({
      query: (orderNumber) => `/orders/${orderNumber}`,
    }),
  }),
})

export const { useCreateOrderMutation, useGetOrderQuery } = orderApi