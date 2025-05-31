import apiSlice from './api'

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: '/api/admin/dashboard',
        method: 'GET',
      }),
      transformResponse: response => {
        if (response.success && response.data) {
          return response.data
        }
        return {
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          totalRevenue: '0',
          recentOrders: [],
        }
      },
      transformErrorResponse: error => {
        console.error('Dashboard stats error:', error)
        return {
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          totalRevenue: '0',
          recentOrders: [],
        }
      },
      providesTags: ['Dashboard'],
    }),

    getOrderStats: builder.query({
      query: ({ timeframe = 'month' }) => ({
        url: `/api/admin/analytics/orders?timeframe=${timeframe}`,
        method: 'GET',
      }),
      providesTags: ['OrderStats'],
    }),

    getRevenueStats: builder.query({
      query: ({ timeframe = 'month' }) => ({
        url: `/api/admin/analytics/revenue?timeframe=${timeframe}`,
        method: 'GET',
      }),
      providesTags: ['RevenueStats'],
    }),
  }),
  overrideExisting: true,
})

export const { useGetDashboardStatsQuery, useGetOrderStatsQuery, useGetRevenueStatsQuery } =
  adminApiSlice
