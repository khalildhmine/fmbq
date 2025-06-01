/** @type {import('next').NextConfig} */
const path = require('path') // Import the path module

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'your_default_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/choiceshop',
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'img01.ztat.net',
      'img.freepik.com',
      'kidbizkid.com',
      'static.nike.com',
      'd1jbmqjs327xbn.cloudfront.net',
      'www.creedfragrances.co.uk',
      'alimorluxury.nl',
      'mir-s3-cdn-cf.behance.net',
      'theimpression.com',
      'static.vecteezy.com',
      'th.bing.com',
      'es.louisvuitton.com',
      'www.louisvuitton.com',
      'i.pinimg.com',
      'img.giglio.com',
      'c-shopping-three.vercel.app',
      'res.cloudinary.com',
      'static.pxlecdn.com',
      'img.ws.mms.shopee.sg',
      'shopenglishfactory.com',
      'www.cashmerette.com',
      'img.ltwebstatic.com',
      'cdn-2.jjshouse.com',
      'cdn-1.jjshouse.com',
      'www.dhresource.com',
      'webdesignledger.com',
      'cdn.shopify.com',
      'www.bing.com',
      'media.tenor.com',
      'trendtvision.com',
      'media4.giphy.com',
      'media0.giphy.com',
      'i5.walmartimages.com',
      'ohtopten.com',
      'media.gq-magazine.co.uk',
      'tommy-europe.scene7.com',
      'www.3suisses.fr',
      'example.com',
      'myphoera.com',
      'images.puma.com',
      'images.hugoboss.com',
      'm.media-amazon.com',
      'assets.laboutiqueofficielle.com',
      'eu.louisvuitton.com',
      'images.squarespace-cdn.com',
      'c.tenor.com',
      'media2.giphy.com',
      'd2b8wt72ktn9a2.cloudfront.net',
      'images.unsplash.com',
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname), // Use the path module to resolve the alias
    }
    return config
  },
  async redirects() {
    return [] // Remove any redirects
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin/:path*',
          destination: '/admin/:path*',
        },
        {
          source: '/main/:category',
          has: [
            {
              type: 'query',
              key: 'category',
              value: '(?!admin).*',
            },
          ],
          destination: '/main/:category',
        },
      ],
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        buffer: require.resolve('buffer/'),
      }
    }
    return config
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig // Correct the variable name
