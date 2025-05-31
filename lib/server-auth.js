import { cookies } from 'next/headers'

/**
 * Sets authentication cookies
 * @param {string} token - The token to store
 * @param {Object} userData - User data to store
 */
export async function setAuthCookies(token, userData) {
  const cookieStore = cookies()
  await cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Store user role in a non-httpOnly cookie for client access
  if (userData.role) {
    await cookieStore.set('userRole', userData.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }
}

/**
 * Clears authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = cookies()
  await cookieStore.delete('token')
  await cookieStore.delete('userRole')
}

/**
 * Gets the authentication token from cookies
 * @returns {string|null} The token or null if not found
 */
export async function getAuthToken() {
  const cookieStore = cookies()
  const token = await cookieStore.get('token')
  return token?.value || null
}

/**
 * Gets the user role from cookies
 * @returns {string|null} The user role or null if not found
 */
export async function getUserRole() {
  const cookieStore = cookies()
  const role = await cookieStore.get('userRole')
  return role?.value || null
}
