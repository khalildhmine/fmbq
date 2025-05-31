import Link from 'next/link'
import { useUserInfo } from '@/hooks'
import Icons from '@/components/common/Icons'
import Logout from '@/components/Logout'
import BoxLink from '@/components/common/BoxLink'
import Orders from '@/components/order/Orders'
import Person from '@/components/svgs/person.svg'

export default function ProfileAside() {
  const { userInfo, isLoading } = useUserInfo()

  const profilePaths = [
    {
      name: '我的订单',
      Icon: Icons.Bag,
      path: '/profile/orders',
    },
    {
      name: '我的收藏',
      Icon: Icons.Heart,
      path: '/profile/lists',
    },
    {
      name: '我的评价',
      Icon: Icons.Comment,
      path: '/profile/reviews',
    },
    {
      name: '地址管理',
      Icon: Icons.Location,
      path: '/profile/addresses',
    },
    {
      name: '最近访问',
      Icon: Icons.Clock,
      path: '/profile/user-history',
    },
    {
      name: '账户信息',
      Icon: Icons.User,
      path: '/profile/personal-info',
    },
    {
      name: 'Support Chat',
      Icon: Icons.Message,
      path: '/profile/chat',
      badge: true,
    },
  ]

  return (
    <aside className="sticky mt-6 lg:border lg:border-gray-200 lg:rounded-md lg:pt-4 lg:top-6 xl:top-[136px]">
      <div className="flex items-center justify-between px-5 py-2">
        {/* Profile Header */}
        <Person className="w-12 h-12 mr-3" />
        <div className="flex flex-col ml-auto mr-3 gap-y-1">
          {isLoading ? (
            <>
              <div className="w-32 h-5 bg-red-200 rounded-md animate-pulse lg:w-28 lg:h-6" />
              <div className="w-24 h-5 bg-red-200 rounded-md animate-pulse lg:w-20 lg:h-6" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium lg:text-base">{userInfo?.name}</span>
              <span className="text-[11px] text-gray-400">{userInfo?.mobile}</span>
            </>
          )}
        </div>
        <Link href="/profile/personal-info">
          <div>
            <Icons.Edit className="w-6 h-6 text-blue-400" />
          </div>
        </Link>
      </div>

      {/* Orders Section - Mobile Only */}
      <div className="lg:hidden">
        <Orders />
      </div>

      {/* Navigation Links */}
      <div className="mt-7">
        <div className="hidden lg:block">
          <BoxLink name="看板" path="/profile">
            <Icons.Home className="text-black icon" />
          </BoxLink>
        </div>

        {profilePaths.map((item, index) => (
          <BoxLink key={index} path={item.path} name={item.name}>
            <item.Icon className="icon text-black" />
            {item.badge && userInfo?.unreadMessages > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {userInfo.unreadMessages}
              </span>
            )}
          </BoxLink>
        ))}

        <Logout />
      </div>
    </aside>
  )
}
