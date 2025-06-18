'use client'

const SimpleBarcode = ({ value }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black text-white px-4 py-2 text-center font-mono">{value}</div>
      <span className="text-sm mt-2">{value}</span>
    </div>
  )
}

export default SimpleBarcode
