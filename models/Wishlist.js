import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
  },
  { timestamps: true }
)

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
