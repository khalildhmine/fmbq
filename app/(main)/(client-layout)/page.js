// import { Metadata } from 'next'
import { bannerRepo, categoryRepo, sliderRepo } from '@/helpers'
import { enSiteTitle, siteTitle } from '@/utils'

// Import components directly from their source files
import Slider from '@/components/sliders/Slider.jsx'
import DiscountSlider from '@/components/sliders/DiscountSlider.jsx'
import BestSellsSlider from '@/components/sliders/BestSellsSlider.jsx'
import Categories from '@/components/Categories.jsx'
import BannerOne from '@/components/banners/BannerOne.jsx'
import BannerTwo from '@/components/banners/BannerTwo.jsx'
import MostFavouraiteProducts from '@/components/product/MostFavouraiteProducts.jsx'

export const metadata = {
  title: `${siteTitle} | ${enSiteTitle}`,
}

// export const revalidate = 20
export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }) {
  const currentCategory = await categoryRepo.getOne({
    parent: undefined,
  })
  const childCategories = await categoryRepo.getAll(
    {},
    {
      parent: currentCategory?._id,
    }
  )

  const sliders = await sliderRepo.getAll({}, { category_id: currentCategory?._id })

  const bannerOneType = await bannerRepo.getAll(
    {},
    {
      category_id: currentCategory?._id,
      type: 'one',
    }
  )
  const bannerTwoType = await bannerRepo.getAll(
    {},
    {
      category_id: currentCategory?._id,
      type: 'two',
    }
  )

  return (
    <main className="min-h-screen xl:mt-28 container space-y-24">
      <div className="py-4 mx-auto space-y-24 xl:mt-28">
        <Slider data={sliders} />
        <DiscountSlider currentCategory={currentCategory} />
        <Categories
          childCategories={{ categories: childCategories, title: '所有分类' }}
          color={currentCategory?.colors?.start}
          name={currentCategory?.name}
          homePage
        />
        <BannerOne data={bannerOneType} />
        <BestSellsSlider categorySlug={currentCategory?.slug} />
        <BannerTwo data={bannerTwoType} />
        <MostFavouraiteProducts categorySlug={currentCategory?.slug} />
      </div>
    </main>
  )
}
