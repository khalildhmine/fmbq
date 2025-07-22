import { apiSlice } from '@/store/services/api'

export interface Address {
  _id?: string
  fullName: string
  phone: string
  streetAddress: string
  area?: string
  city: string
  province: string
  postalCode?: string
  isDefault?: boolean
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAddressInput {
  fullName: string
  phone: string
  streetAddress: string
  area?: string
  city: string
  province: string
  postalCode?: string
  isDefault?: boolean
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {
  isDefault?: boolean
}

export interface AddressResponse {
  success: boolean
  data: Address | Address[]
  message?: string
}

const addressApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAddresses: builder.query<AddressResponse, void>({
      query: () => ({
        url: '/api/user/addresses',
        method: 'GET',
      }),
      providesTags: ['Address'],
    }),

    getAddress: builder.query<AddressResponse, string>({
      query: id => ({
        url: `/api/user/addresses/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Address', id }],
    }),

    addAddress: builder.mutation<AddressResponse, CreateAddressInput>({
      query: address => ({
        url: '/api/user/addresses',
        method: 'POST',
        body: address,
      }),
      invalidatesTags: ['Address'],
    }),

    updateAddress: builder.mutation<AddressResponse, { id: string; address: UpdateAddressInput }>({
      query: ({ id, address }) => ({
        url: `/api/user/addresses/${id}`,
        method: 'PUT',
        body: address,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Address', id }, 'Address'],
    }),

    deleteAddress: builder.mutation<AddressResponse, string>({
      query: id => ({
        url: `/api/user/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    setDefaultAddress: builder.mutation<AddressResponse, string>({
      query: id => ({
        url: `/api/user/addresses/${id}`,
        method: 'PUT',
        body: { isDefault: true },
      }),
      invalidatesTags: ['Address'],
    }),
  }),
})

export const {
  useGetAddressesQuery,
  useGetAddressQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi
