'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeAlert } from '@/store/slices/alertSlice'

export default function Alert() {
  const alert = useSelector(state => state.alert)
  const dispatch = useDispatch()

  useEffect(() => {
    if (alert.isShow) {
      const timeout = setTimeout(() => {
        dispatch(removeAlert())
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [alert.isShow, dispatch])

  if (!alert.isShow) return null

  return (
    <div className="fixed inset-0 z-40 transition-all duration-500">
      <div className="w-full h-full bg-gray-400/20" onClick={() => dispatch(removeAlert())} />
      <div className="max-w-md fixed top-40 left-0 right-0 mx-auto z-40">
        <div className="p-3 mx-2 text-center bg-white rounded-md shadow">
          <p className="mt-2">{alert.title}</p>
        </div>
      </div>
    </div>
  )
}
