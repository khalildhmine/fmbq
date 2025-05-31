import ArrowLink from '@/components/common/ArrowLink'
import ResponsiveImage from '@/components/common/ResponsiveImage'
import DashboardLayout from '@/components/Layouts/DashboardLayout'

export default function NotFound() {
  //? Render(s)
  return (
    <DashboardLayout>
      <main className="flex flex-col items-center justify-center py-8 gap-y-6 xl:mt-28">
        <p className="text-base font-semibold text-black">404 Not Found!</p>
        <ArrowLink path="/admin">返回管理后台</ArrowLink>
        <ResponsiveImage
          dimensions="w-full max-w-lg h-72"
          src="/icons/page-not-found.png"
          layout="fill"
          alt="404"
        />
      </main>
    </DashboardLayout>
  )
}
