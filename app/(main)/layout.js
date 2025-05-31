'use client'

import PageLoading from '../../components/loading/PageLoading'
import Alert from '../../components/Alert'

export default function Layout({ children }) {
  return (
    <>
      <PageLoading />
      <Alert />
      {children}
    </>
  )
}
