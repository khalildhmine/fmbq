import axios from '../lib/axios'

export const brandService = {
  // Get all brands
  getAllBrands: async () => {
    try {
      const response = await axios.get('/brands')
      return response.data
    } catch (error) {
      console.error('Error fetching brands:', error)
      throw error
    }
  },

  // Get single brand
  getBrand: async id => {
    try {
      const response = await axios.get(`/brands/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching brand ${id}:`, error)
      throw error
    }
  },

  // Create brand
  createBrand: async brandData => {
    try {
      const response = await axios.post('/brands', brandData)
      return response.data
    } catch (error) {
      console.error('Error creating brand:', error)
      throw error
    }
  },

  // Update brand
  updateBrand: async (id, brandData) => {
    try {
      const response = await axios.put(`/brands/${id}`, brandData)
      return response.data
    } catch (error) {
      console.error(`Error updating brand ${id}:`, error)
      throw error
    }
  },

  // Delete brand
  deleteBrand: async id => {
    try {
      const response = await axios.delete(`/brands/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting brand ${id}:`, error)
      throw error
    }
  },
}
