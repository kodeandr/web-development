import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000' }),
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/categories',
    }),
    getProducts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams()
        if (params.category_id) searchParams.set('category_id', params.category_id.toString())
        if (params.min_price) searchParams.set('min_price', params.min_price.toString())
        if (params.max_price) searchParams.set('max_price', params.max_price.toString())
        return `/products?${searchParams.toString()}`
      },
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
    }),
  }),
})

export const { useGetCategoriesQuery, useGetProductsQuery, useGetProductByIdQuery } = productApi