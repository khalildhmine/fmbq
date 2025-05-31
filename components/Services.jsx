import CashOnDelivery from '@/components/svgs/cash-on-delivery.svg'
import Daysreturn from '@/components/svgs/days-return.svg'
import ExpressDelivery from '@/components/svgs/express-delivery.svg'
import OriginalProducts from '@/components/svgs/original-products.svg'
import Support from '@/components/svgs/support.svg'

export default function Services() {
  const services = [
    {
      name: '快递的可能性',
      icon: <ExpressDelivery className="w-10 h-10" />,
    },
    { name: '每周 7 天、每天 24 小时', icon: <Support className="w-10 h-10" /> },
    {
      name: '可以当场付款',
      icon: <CashOnDelivery className="w-10 h-10" />,
    },
    {
      name: '七日退货保证',
      icon: <Daysreturn className="w-10 h-10" />,
    },
    {
      name: '保证产品的原创性',
      icon: <OriginalProducts className="w-10 h-10" />,
    },
  ]

  //? Render(s)
  return (
    <section className="hidden py-5 border-t border-b-2 border-gray-200 lg:flex justify-evenly">
      {services.map((item, i) => (
        <div key={i} className="flex items-center gap-x-1">
          {item.icon}
          <span className="text-xs">{item.name}</span>
        </div>
      ))}
    </section>
  )
}
