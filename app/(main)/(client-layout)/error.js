'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="lg:px-3 container xl:mt-32">
      <div className="py-20 mx-auto space-y-3 text-center w-fit">
        <h5 className="text-xl">{error.name}</h5>
        <p className="text-lg text-red-500">出现异常，请检查您的地址是否有误，或者联系管理员</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            console.log('发送异常警报通知到OA系统', error.message)
            reset()
          }}
        >
          通知我们
        </button>
      </div>
    </main>
  )
}
