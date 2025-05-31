// import { connectToDatabase } from '../db'

// // Helper function to create JSON responses
// export const setJson = (data, status = 200) => {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
// }

// export const errorHandler = err => {
//   console.error('[API Error Handler]:', err)
//   return setJson(
//     {
//       status: 'error',
//       message: err.message || 'Internal server error',
//     },
//     err.status || 500
//   )
// }

// // Helper function to extract query parameters from the request
// export const getQuery = req => {
//   const url = new URL(req.url)
//   const queryParams = {}

//   // Convert URLSearchParams to a plain object
//   for (const [key, value] of url.searchParams.entries()) {
//     queryParams[key] = value
//   }

//   return queryParams
// }

// // For Next.js App Router
// export const apiHandler = (handler, options = { isJwt: true }) => {
//   return async req => {
//     try {
//       // Connect to database if needed
//       if (options.connectDB !== false) {
//         await connectToDatabase()
//       }

//       // Call the handler function
//       return await handler(req)
//     } catch (error) {
//       console.error('[API Error Handler]:', error)
//       return setJson(
//         {
//           status: 'error',
//           message: error.message || 'Internal server error',
//         },
//         error.status || 500
//       )
//     }
//   }
// }

// // Legacy handler for Pages Router
// export default function apiHandlerLegacy(handler) {
//   return async (req, res) => {
//     try {
//       await handler(req, res) // Ensure `res` is passed correctly
//     } catch (error) {
//       console.error('[API Error Handler]:', error)
//       if (res && typeof res.status === 'function') {
//         res.status(500).json({ message: 'Internal Server Error' })
//       } else {
//         console.error('Response object is invalid or missing.')
//       }
//     }
//   }
// }

import { connectToDatabase } from '../db'

// Helper function to create JSON responses with custom headers
export const setJson = (data, status = 200, additionalHeaders = {}) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  })
}

export const errorHandler = err => {
  console.error('[API Error Handler]:', err)
  return setJson(
    {
      status: 'error',
      message: err.message || 'Internal server error',
    },
    err.status || 500
  )
}

// Helper function to extract query parameters from the request
export const getQuery = req => {
  const url = new URL(req.url)
  const queryParams = {}

  // Convert URLSearchParams to a plain object
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value
  }

  return queryParams
}

// For Next.js App Router
export const apiHandler = (handler, options = { isJwt: true }) => {
  return async req => {
    try {
      // Connect to database if needed
      if (options.connectDB !== false) {
        await connectToDatabase()
      }

      // Call the handler function
      return await handler(req)
    } catch (error) {
      console.error('[API Error Handler]:', error)
      return setJson(
        {
          status: 'error',
          message: error.message || 'Internal server error',
        },
        error.status || 500
      )
    }
  }
}

// Legacy handler for Pages Router
export default function apiHandlerLegacy(handler) {
  return async (req, res) => {
    try {
      await handler(req, res) // Ensure `res` is passed correctly
    } catch (error) {
      console.error('[API Error Handler]:', error)
      if (res && typeof res.status === 'function') {
        res.status(500).json({ message: 'Internal Server Error' })
      } else {
        console.error('Response object is invalid or missing.')
      }
    }
  }
}
