'use client'

//* ─── COMMON COMPONENTS ───────────────────────────────
export { default as Icons } from './common/Icons'
export { default as TextField } from './common/TextField'
export { default as HandleResponse } from './common/HandleResponse'
export { default as Modal } from './common/Modal'
export { default as Skeleton } from './common/Skeleton'
export { default as BoxLink } from './common/BoxLink'
export { default as ArrowLink } from './common/ArrowLink'
export { default as ProductImage } from './common/ProductImage'
export { default as PageContainer } from './common/PageContainer'
export { default as ShowWrapper } from './common/ShowWrapper'
export { default as SelectBox } from './common/SelectBox'
export { default as TextArea } from './common/TextArea'
export { default as UploadImage } from './common/UploadImage'
export { default as WithAddressModal } from './common/WithAddressModal'
export { default as Combobox } from './common/Combobox'
export { default as ResponsiveImage } from './common/ResponsiveImage'
export { default as SubmitModalBtn } from './common/SubmitModalBtn'
export { default as DisplayError } from './common/DisplayError'
export { CustomCheckbox, ControlledCheckbox } from './common/Checkbox'
export {
  AddIconBtn,
  DeleteIconBtn,
  BackIconBtn,
  EditIconBtn,
  AddToListIconBtn,
  DeleteFromListIconBtn,
} from './common/IconBtns'
export { Button, buttonVariants } from './ui/button'
export { default as BigLoading } from './common/BigLoading'

//* ─── SVG COMPONENTS ─────────────────────────────────
export { default as Logo } from './svgs/logo.svg'
export { default as LogoH } from './svgs/logo-h.svg'
export { default as LogoChina } from './svgs/logoChina.svg'
export { default as FreeShippingSvg } from './svgs/free-shipping.svg'
export { default as OrderEmpty } from './svgs/order-empty.svg'
export { default as EmptySearch } from './svgs/empty-search.svg'
export { default as EmptyCart } from './svgs/empty-cart.svg'
export { default as Person } from './svgs/person.svg'
export { default as Address } from './svgs/address.svg'
export { default as FavoritesListEmpty } from './svgs/favorites-list-empty.svg'
export { default as ExpressDelivery } from './svgs/express-delivery.svg'
export { default as Support } from './svgs/support.svg'
export { default as CashOnDelivery } from './svgs/cash-on-delivery.svg'
export { default as Daysreturn } from './svgs/days-return.svg'
export { default as OriginalProducts } from './svgs/original-products.svg'

//* ─── PRODUCT COMPONENTS ──────────────────────────────
export { default as AddColors } from './product/AddColors'
export { default as AddSizes } from './product/AddSizes'
export { default as ProductPrice } from './product/ProductPrice'
export { default as DiscountProduct } from './product/DiscountProduct'
export { default as MostFavouraiteProducts } from './product/MostFavouraiteProducts'
export { default as ProductCard } from './product/ProductCard'
export { default as SpecialSell } from './product/SpecialSell'
export { default as Depot } from './product/Depot'
export { default as Breadcrumb } from './product/Breadcrumb'
export { default as ImageGallery } from './product/ImageGallery'
export { default as SelectColor } from './product/SelectColor'
export { default as SelectSize } from './product/SelectSize'
export { default as OutOfStock } from './product/OutOfStock'
export { default as Info } from './product/Info'
export { default as Description } from './product/Description'
export { default as Specification } from './product/Specification'
export { default as InitialStore } from './product/InitialStore'
export { default as SubCategories } from './product/SubCategories'
export { default as ProductsAside } from './product/ProductsAside'
export { default as SelectCategories } from './product/SelectCategories'
export { default as ImageList } from './product/ImageList'
export { default as SmilarProductsSlider } from './product/SmilarProductsSlider'

//* ─── FILTER COMPONENTS ───────────────────────────────
export { default as Filter } from './filter/Filter'
export { default as FilterOperation } from './filter/FilterOperation'

//* ─── CART COMPONENTS ─────────────────────────────────
export { default as Cart } from './cart/Cart'
export { default as AddToCart } from './cart/AddToCart'
export { default as AddToCartOperation } from './cart/AddToCartOperation'
export { default as CartButtons } from './cart/CartButtons'
export { default as CartItem } from './cart/CartItem'
export { default as CartInfo } from './cart/CartInfo'
export { default as DiscountCartItem } from './cart/DiscountCartItem'
export { default as CartDropdown } from './cart/CartDropdown'
export { default as CartBadge } from './cart/CartBadge'

//* ─── ADMIN COMPONENTS ────────────────────────────────
export { default as AdminNavbar } from './admin/Navbar'
export { default as AdminSidebar } from './admin/Sidebar'
export { default as AdminOrdersTable } from './admin/OrdersTable'
export { default as AdminProductsTable } from './admin/ProductsTable'
export { default as AdminNotificationSystem } from './admin/NotificationSystem'
export { default as DynamicOrdersTable } from './admin/DynamicOrdersTable'
export { default as DynamicUsersTable } from './admin/DynamicUsersTable'
export { default as OrderDetailsModal } from './admin/OrderDetailsModal'
export { default as OrderPrintManager } from './admin/OrderPrintManager'
export { default as CategoryManager } from './admin/CategoryManager'

//* ─── LAYOUT COMPONENTS ───────────────────────────────
export { default as ClientLayout } from './Layouts/ClientLayout'
export { default as ProfileLayout } from './Layouts/ProfileLayout'
export { default as DashboardLayout } from './Layouts/DashboardLayout'

//* ─── SKELETON COMPONENTS ─────────────────────────────
export { default as ReveiwSkeleton } from './skeleton/ReveiwSkeleton'
export { default as NavbarSkeleton } from './skeleton/NavbarSkeleton'
export { default as SidebarSkeleton } from './skeleton/SidebarSkeleton'
export { default as OrderSkeleton } from './skeleton/OrderSkeleton'
export { default as ProductSkeleton } from './skeleton/ProductSkeleton'
export { default as SubCategoriesSkeleton } from './skeleton/SubCategoriesSkeleton'
export { default as TableSkeleton } from './skeleton/TableSkeleton.jsx'

//* ─── FORMS ───────────────────────────────────────────
export { default as LoginForm } from './forms/LoginForm'
export { default as RegisterForm } from './forms/RegisterForm'
export { default as ProductsForm } from './forms/ProductsForm'
export { default as SliderForm } from './forms/SliderForm'

//* ─── EMPTY LIST COMPONENTS ───────────────────────────
export { default as EmptyCommentsList } from './emptyList/EmptyCommentsList'
export { default as EmptyOrdersList } from './emptyList/EmptyOrdersList.jsx'
export { default as EmptyUsersList } from './emptyList/EmptyUsersList'
export { default as EmptyComment } from './emptyList/EmptyComment'
export { default as EmptySearchList } from './emptyList/EmptySearchList'
export { default as EmptyCustomList } from './emptyList/EmptyCustomList'

//* ─── LOADING ─────────────────────────────────────────
export { default as Loading } from './loading/Loading'
export { default as PageLoading } from './loading/PageLoading'

//* ─── MODALS ──────────────────────────────────────────
export { default as RedirectToLogin } from './modals/RedirectToLogin'
export { default as ConfirmDeleteModal } from './modals/ConfirmDeleteModal'
export { default as ConfirmUpdateModal } from './modals/ConfirmUpdateModal'
export { default as ReviewModal } from './modals/ReviewModal'
export { default as AddressModal } from './modals/AddressModal'
export { default as UserMobileModal } from './modals/UserMobileModal'
export { default as UserNameModal } from './modals/UserNameModal'
export { default as SearchModal } from './modals/SearchModal'

//* ─── ORDER COMPONENTS ────────────────────────────────
export { default as Orders } from './order/Orders'
export { default as OrderCard } from './order/OrderCard'
export { default as OrdersTable } from './order/OrdersTable'

//* ─── REVIEW COMPONENTS ───────────────────────────────
export { default as ReviewsTable } from './review/ReviewsTable'
export { default as ReveiwCard } from './review/ReveiwCard'
export { default as Reviews } from './review/Reviews'
export { default as ReviewProductCard } from './review/ReviewProductCard'

//* ─── OTHER COMPONENTS ────────────────────────────────
export { default as Alert } from './Alert'
export { default as Search } from './Search'
export { default as Header } from './Header'
export { default as Signup } from './Signup'
export { default as UserDropdown } from './UserDropdown'
export { default as Logout } from './Logout'
export { default as ProfileAside } from './ProfileAside'
export { default as DashboardAside } from './DashboardAside'
export { default as UsersTable } from './UsersTable'
export { default as Pagination } from './Pagination'
export { default as DetailsList } from './DetailsList'
export { default as Footer } from './Footer'
export { default as Services } from './Services'
export { default as Navbar } from './Navbar'
export { default as Sidebar } from './Sidebar'
export { default as Sort } from './Sort'
export { default as FreeShipping } from './FreeShipping'
export { default as AddressBar } from './AddressBar'
