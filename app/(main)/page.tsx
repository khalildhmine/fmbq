import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Globe,
  Star,
  Heart,
  ShoppingCart,
  Users,
  ChevronRight,
  Play,
  Check,
} from 'lucide-react'

const BrandOverviewPage = () => {
  return (
    // UPGRADED: Full-screen, glassy, editorial, with blurred gradients and brown/gold accents
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-[#18181b] to-[#232526] relative overflow-x-hidden font-sans">
      {/* Futuristic blurred brown/gold gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#a47551]/20 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-[#a47551]/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-gradient-to-r from-[#a47551]/20 via-transparent to-[#a47551]/20 blur-2xl"></div>
      </div>

      {/* Hero Section - Modern Nike-inspired */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3')]"></div>
        </div>

        {/* Dynamic elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-3xl -top-[400px] -right-[400px]"></div>
          <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl bottom-[10%] -left-[300px]"></div>
        </div>

        <div className="container mx-auto px-6 py-8 relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <div className="text-white font-bold text-3xl tracking-tighter">
                FORMEN & BOUTIQUEEN
              </div>
            </div>
            <div className="flex space-x-12">
              <a
                href="#collections"
                className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                Collections
              </a>
              <a
                href="#presence"
                className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                Présence Mondiale
              </a>
              <a
                href="#heritage"
                className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                Héritage
              </a>
              <a
                href="#contact"
                className="text-white/90 hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                Contact
              </a>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-6">
                <span className="bg-purple-400 rounded-full w-2 h-2 mr-2"></span>
                <span className="text-purple-100 text-sm">NOUVELLE COLLECTION</span>
              </div>

              <h1 className="text-7xl font-bold text-white mb-8 leading-none">
                L'ÉLÉGANCE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  REDÉFINIE
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-xl">
                Découvrez l'art de la mode sophistiquée avec notre collection exclusive qui
                transcende les saisons.
              </p>

              <div className="flex gap-8">
                <Link
                  href="/collections"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium flex items-center transition-all group text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-purple-500/20"
                >
                  Explorer la Collection
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 text-white border border-white/30 hover:bg-white/10 rounded-full font-medium transition-all text-sm uppercase tracking-wider"
                >
                  Notre Histoire
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute top-0 right-0 w-[500px] h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3"
                  alt="Fashion Model"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              </div>
              <div className="absolute -bottom-20 -left-20 w-[300px] h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3"
                  alt="Fashion Detail"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Fashion Nova Style */}
      {/* <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-purple-600 text-sm font-medium uppercase tracking-wider">
                Tendances
              </span>
              <h2 className="text-4xl font-bold mt-2">Produits Vedettes</h2>
            </div>
            <Link href="/products" className="text-purple-600 flex items-center group">
              Voir Tout
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section> */}

      {/* Brand Story - Sophisticated */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-purple-600 text-sm font-medium uppercase tracking-wider">
                Notre Histoire
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6">L'Héritage de Luxe</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Depuis notre création en 1995, Formen & Boutiqueen incarne l'élégance et le
                raffinement français. Chaque pièce de notre collection représente l'harmonie
                parfaite entre l'artisanat traditionnel et le design contemporain, créant un style
                distinctif qui nous est propre.
              </p>
              <div className="space-y-4">
                {brandValues.map((value, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 bg-purple-100 rounded-full p-1 mr-3">
                      <Check className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-1">{value.title}</h3>
                      <p className="text-gray-600 text-sm">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] relative rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3"
                  alt="Brand Heritage"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl max-w-xs">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold">Excellence Reconnue</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Plus de 25 ans d'innovation et d'excellence dans l'industrie de la mode de luxe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Showcase - Grok x Fashion Nova Fusion */}
      <section
        id="collections"
        className="relative py-32 bg-gradient-to-br from-black via-[#18181b] to-[#232526] text-white overflow-hidden"
      >
        {/* Futuristic blurred neon and gold/brown accents */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#A47551]/30 blur-3xl"></div>
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#a47551]/20 blur-2xl"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-r from-[#a47551]/30 via-[#a47551]/0 to-[#a47551]/30 blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-20">
            <div className="inline-flex items-center bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-[#a47551]/30 shadow-lg">
              <span className="bg-gradient-to-r from-[#a47551] to-[#f5e7da] rounded-full w-2 h-2 mr-2"></span>
              <span className="text-[#a47551] text-sm font-semibold tracking-widest">COLLECTIONS EXCLUSIVES</span>
            </div>
            <h2 className="text-6xl font-extrabold mt-2 mb-6 text-center tracking-tight drop-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a47551] via-white to-[#a47551]">
                EXPLOREZ NOS UNIVERS
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-center text-xl font-light">
              Des pièces intemporelles qui définissent l'élégance moderne et reflètent notre engagement envers l'excellence et le raffinement français.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {collections.map((collection, index) => (
              <div
                key={index}
                className="relative group rounded-3xl bg-white/5 border border-[#a47551]/20 shadow-xl overflow-hidden transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl hover:border-[#a47551]/40"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <div className="aspect-[16/9] relative">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-[#a47551]/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg tracking-widest">
                    {collection.pieces} PIÈCES
                  </div>
                </div>
                <div className="p-10 flex flex-col justify-end h-full">
                  <div>
                    <h3 className="text-3xl font-extrabold mb-2 text-white drop-shadow">
                      {collection.name}
                    </h3>
                    <p className="text-[#a47551] text-lg mb-6 font-medium">
                      {collection.description || "Une collection qui incarne l'essence du luxe contemporain, où chaque pièce raconte une histoire d'élégance et de savoir-faire."}
                    </p>
                    <Link
                      href={`/collections/${collection.slug || collection.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-[#a47551] to-[#f5e7da] text-black font-bold shadow hover:from-[#f5e7da] hover:to-[#a47551] transition-all uppercase tracking-wider"
                    >
                      Découvrir la Collection
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link
              href="/collections"
              className="inline-flex items-center px-10 py-4 rounded-full border-2 border-[#a47551] text-[#a47551] font-bold uppercase tracking-widest hover:bg-[#a47551]/10 transition-colors shadow"
            >
              Voir Toutes Nos Collections
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section - Modern */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3"
              alt="Fashion Video Cover"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white/20 backdrop-blur-sm p-5 rounded-full hover:bg-white/30 transition-colors group">
                <Play className="h-10 w-10 text-white fill-white" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 p-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Découvrez Notre Nouvelle Collection
              </h2>
              <p className="text-white/80 max-w-xl">
                Un aperçu exclusif de notre processus créatif et de l'artisanat derrière chaque
                pièce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence - Sophisticated */}
      <section id="presence" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-purple-600 text-sm font-medium uppercase tracking-wider">
              Présence Mondiale
            </span>
            <h2 className="text-4xl font-bold mt-2 mb-4">Nos Boutiques</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              De Paris à Tokyo, nos boutiques offrent une expérience immersive dans l'univers du
              luxe Formen & Boutiqueen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <div
                key={index}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <Image
                    src={location.image}
                    alt={location.city}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{location.city}</h3>
                  <p className="text-gray-600 mb-4">{location.address}</p>
                  <Link
                    href={`/stores/${location.slug}`}
                    className="text-purple-600 flex items-center text-sm group"
                  >
                    Voir les détails
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - Fashion Nova Style */}
      <section className="py-24 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Rejoignez Notre Communauté</h2>
            <p className="text-white/80 mb-8">
              Inscrivez-vous pour recevoir en avant-première nos nouvelles collections et offres
              exclusives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button className="px-8 py-4 bg-white text-purple-900 rounded-full font-medium hover:bg-gray-100 transition-colors">
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="font-bold text-2xl mb-6">FORMEN & BOUTIQUEEN</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                L'art de la mode sophistiquée depuis 1995.
              </p>
              <div className="flex space-x-4 mt-6">
                <a
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h3 className="font-bold mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2023 Formen & Boutiqueen. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Politique de Confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Conditions d'Utilisation
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Mentions Légales
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const brandStats = [
  { value: '150+', label: 'Boutiques Worldwide' },
  { value: '45', label: 'Countries' },
  { value: '4.8M', label: 'Loyal Customers' },
  { value: '28', label: 'Years of Excellence' },
]

const collections = [
  {
    name: 'Autumn Essentials 2023',
    pieces: 86,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3',
  },
  {
    name: 'Evening Elegance',
    pieces: 64,
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3',
  },
  {
    name: 'Urban Sophisticate',
    pieces: 92,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3',
  },
  {
    name: 'Heritage Collection',
    pieces: 45,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3',
  },
]

const featuredImages = [
  'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1604176424472-9d7e10f2f17d?ixlib=rb-4.0.3',
]

const locations = [
  {
    city: 'Paris',
    address: '8 Rue du Faubourg Saint-Honoré',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3',
  },
  {
    city: 'Milan',
    address: 'Via Monte Napoleone, 6',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3',
  },
  {
    city: 'New York',
    address: '5th Avenue',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3',
  },
]

const footerLinks = [
  {
    title: 'Collections',
    links: [
      { label: 'Nouveautés', href: '#' },
      { label: 'Bestsellers', href: '#' },
      { label: 'Collection Héritage', href: '#' },
      { label: 'Accessoires', href: '#' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'Notre Histoire', href: '#' },
      { label: 'Carrières', href: '#' },
      { label: 'Presse', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Confidentialité', href: '#' },
      { label: 'Conditions', href: '#' },
      { label: 'Livraison', href: '#' },
      { label: 'Retours', href: '#' },
    ],
  },
]

const featuredProducts = [
  {
    name: 'Veste Élégance Parisienne',
    price: '295',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3',
    isNew: true,
  },
  {
    name: 'Chemise Signature',
    price: '175',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?ixlib=rb-4.0.3',
    isNew: false,
  },
  {
    name: 'Robe Couture',
    price: '450',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3',
    isNew: true,
  },
  {
    name: 'Ensemble Moderne',
    price: '320',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3',
    isNew: false,
  },
]

const brandValues = [
  {
    title: 'Artisanat Exceptionnel',
    description:
      'Chaque pièce est confectionnée avec un souci du détail inégalé par nos artisans experts.',
  },
  {
    title: 'Matériaux Premium',
    description:
      'Nous sélectionnons uniquement les tissus et matériaux de la plus haute qualité pour nos créations.',
  },
  {
    title: 'Design Intemporel',
    description:
      'Nos designs allient élégance classique et touches contemporaines pour une allure sophistiquée.',
  },
]

export default BrandOverviewPage
