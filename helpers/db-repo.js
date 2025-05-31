import Chat from '@/models/Chat'
import mongoose from 'mongoose'
import Feed from '@/models/Feed'
import User from '@/models/User'
import { connectToDatabase } from './db'
// Import the missing models (you'll need to create these if they don't exist)
import Category from '@/models/Category'
import Slider from '@/models/Slider'
import Banner from '@/models/Banner'
import bcrypt from 'bcryptjs' // Added for password comparison

export const findUserByEmail = async email => {
  try {
    await connectToDatabase()
    console.log('[UsersRepo] Looking up user by email:', email)

    const user = await User.findOne({ email })
    if (!user) {
      console.error('[UsersRepo] User not found:', email)
      return null
    }

    console.log('[UsersRepo] User found:', {
      id: user._id,
      email: user.email,
      password: user.password, // Log the hashed password for debugging
      hasPassword: !!user.password,
    })

    return user
  } catch (error) {
    console.error('[UsersRepo] Error looking up user:', error.message)
    throw new Error('Error looking up user')
  }
}

export const authenticate = async ({ email, password }) => {
  try {
    console.log('[UsersRepo] Authenticating user:', email)

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Debug log the password being compared
    console.log('[UsersRepo] Provided password:', password)
    console.log('[UsersRepo] Stored hashed password:', user.password)

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('[UsersRepo] Password validation result:', { isValid: isPasswordValid })

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    console.log('[UsersRepo] User authenticated successfully:', user._id)

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error('[UsersRepo] Authentication error:', error.message)
    throw error
  }
}

export const usersRepo = {
  getById: async id => {
    try {
      console.log('[UsersRepo] Getting user by ID:', id)

      // For demo purposes, if we don't have a proper database connection
      // just return a mock admin user

      // In a real implementation, you would fetch from the database:
      // const user = await User.findById(id).lean()
      // return user
    } catch (error) {
      console.error('[UsersRepo] Error getting user by ID:', error)
      return null
    }
  },
  authenticate, // Export the authenticate function through usersRepo as well
}

export const chatRepo = {
  getActive: async () => {
    try {
      console.log('[ChatRepo] Fetching all active chats')
      const chats = await Chat.find({}).sort({ lastActivity: -1 }).lean().exec()

      const formattedChats = chats.map(chat => {
        // Debug log all messages for this chat
        console.log(`[ChatRepo] Chat ${chat._id} messages:`, {
          total: chat.messages?.length,
          userMessages: chat.messages?.filter(m => m.sender?.role === 'user').length,
          adminMessages: chat.messages?.filter(m => m.sender?.role === 'admin').length,
        })

        return {
          _id: chat._id.toString(),
          chatId: chat.chatId,
          user: {
            name: chat.sender?.name || 'Unknown User',
            email: chat.sender?.id || '',
            avatar: chat.sender?.avatar,
          },
          lastMessage:
            chat.messages?.length > 0
              ? {
                  content: chat.messages[chat.messages.length - 1].content,
                  timestamp: chat.messages[chat.messages.length - 1].timestamp,
                  sender: chat.messages[chat.messages.length - 1].sender?.role,
                }
              : null,
          unreadCount:
            chat.messages?.filter(m => m.sender?.role === 'user' && !m.readAt).length || 0,
          messages: (chat.messages || []).map(msg => ({
            _id: msg._id?.toString(),
            type: msg.sender?.role || 'user',
            content: msg.content,
            timestamp: msg.timestamp,
            sender: {
              id: msg.sender?.id,
              name: msg.sender?.name,
              role: msg.sender?.role,
            },
            readAt: msg.readAt,
            deliveryStatus: msg.deliveryStatus,
          })),
        }
      })

      return formattedChats
    } catch (error) {
      console.error('[ChatRepo] Error:', error)
      throw error
    }
  },

  initializeTestData: async () => {
    try {
      const count = await Chat.countDocuments()
      if (count === 0) {
        console.log('[ChatRepo] Initializing test data')
        const testChat = new Chat({
          chatId: new mongoose.Types.ObjectId().toString(),
          status: 'active',
          participants: [
            {
              id: 'user1',
              name: 'John Doe',
              role: 'user',
            },
          ],
          messages: [
            {
              sender: {
                id: 'user1',
                name: 'John Doe',
                role: 'user',
              },
              content: 'Hello, I need help with my order.',
              type: 'text',
              timestamp: new Date(),
            },
          ],
        })
        await testChat.save()
        console.log('[ChatRepo] Test chat created:', testChat._id)
      }
    } catch (error) {
      console.error('[ChatRepo] Init error:', error)
    }
  },

  getById: async id => {
    try {
      console.log('[ChatRepo] Fetching chat by ID:', id)
      const chat = await Chat.findOne({ chatId: id }).exec()
      console.log('[ChatRepo] Chat details:', {
        found: !!chat,
        chatId: chat?.chatId,
        sender: chat?.sender?.name,
      })
      return chat
    } catch (error) {
      console.error('[ChatRepo] Error fetching chat:', error)
      throw new Error('Failed to fetch chat: ' + error.message)
    }
  },

  createChat: async chatData => {
    try {
      console.log('[ChatRepo] Creating new chat:', chatData)
      const newChat = new Chat({
        chatId: chatData.chatId || new mongoose.Types.ObjectId().toString(),
        sender: chatData.sender,
        content: chatData.content,
        type: chatData.type || 'text',
        timestamp: chatData.timestamp || new Date(),
      })
      await newChat.save()
      console.log('[ChatRepo] Chat created successfully:', newChat.chatId)
      return newChat
    } catch (error) {
      console.error('[ChatRepo] Error creating chat:', error)
      throw new Error('Failed to create chat: ' + error.message)
    }
  },

  addMessage: async (chatId, message) => {
    try {
      const chat = await Chat.findOne({
        $or: [{ _id: chatId }, { chatId: chatId }],
      })

      if (!chat) throw new Error('Chat not found')

      console.log('[ChatRepo] Adding message:', {
        chatId,
        sender: message.sender?.role,
        content: message.content?.substring(0, 50),
      })

      const newMessage = {
        _id: new mongoose.Types.ObjectId(),
        sender: {
          id: message.sender?.id,
          name: message.sender?.name,
          role: message.sender?.role || 'user',
        },
        content: message.content,
        timestamp: new Date(),
        type: message.type || 'text',
        deliveryStatus: 'sent',
      }

      chat.messages.push(newMessage)
      chat.lastActivity = new Date()
      chat.lastMessage = {
        content: message.content,
        timestamp: new Date(),
        sender: message.sender?.role,
      }

      await chat.save()
      return { chat, message: newMessage }
    } catch (error) {
      console.error('[ChatRepo] Error adding message:', error)
      throw error
    }
  },

  addAdminReply: async (chatId, replyData) => {
    try {
      console.log('[ChatRepo] Adding admin reply:', { chatId, content: replyData.content })

      const chat = await Chat.findById(chatId)
      if (!chat) {
        console.error('[ChatRepo] Chat not found:', chatId)
        throw new Error('Chat not found')
      }

      const newMessage = {
        _id: new mongoose.Types.ObjectId(),
        sender: {
          id: 'admin',
          name: 'Admin',
          role: 'admin',
        },
        content: replyData.content,
        type: 'text',
        timestamp: new Date(),
        deliveryStatus: 'sent',
      }

      // Push to messages array
      if (!chat.messages) {
        chat.messages = []
      }

      chat.messages.push(newMessage)
      chat.lastActivity = new Date()
      chat.lastMessage = {
        content: replyData.content,
        timestamp: new Date(),
        sender: 'admin',
      }

      const savedChat = await chat.save()
      console.log('[ChatRepo] Admin reply saved:', {
        messageId: newMessage._id,
        chatId: chat._id,
        messagesCount: savedChat.messages.length,
      })

      return {
        chat: savedChat,
        message: newMessage,
      }
    } catch (error) {
      console.error('[ChatRepo] Error saving admin reply:', error)
      throw error
    }
  },

  verifyMessages: async chatId => {
    try {
      const chat = await Chat.findById(chatId)
      console.log('[ChatRepo] Message verification:', {
        chatId,
        totalMessages: chat?.messages?.length || 0,
        adminMessages: chat?.messages?.filter(m => m.sender?.role === 'admin').length || 0,
        userMessages: chat?.messages?.filter(m => m.sender?.role === 'user').length || 0,
        lastMessage: chat?.lastMessage,
      })
      return chat
    } catch (error) {
      console.error('[ChatRepo] Verification error:', error)
      return null
    }
  },

  updateMessageStatus: async (chatId, messageId, status) => {
    try {
      const chat = await Chat.findOne({
        $or: [{ _id: chatId }, { chatId: chatId }],
      })

      if (!chat) return

      const message = chat.messages.id(messageId)
      if (message) {
        message.deliveryStatus = status
        await chat.save()
      }
    } catch (error) {
      console.error('[ChatRepo] Error updating message status:', error)
    }
  },
}

export const feedRepo = {
  getAll: async () => {
    try {
      console.log('[FeedRepo] Fetching all feed items')
      const feedItems = await Feed.find({}).sort({ createdAt: -1 }).lean().exec()

      console.log('[FeedRepo] Found feed items:', {
        total: feedItems.length,
      })

      return feedItems.map(item => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        image: item.image,
        createdAt: item.createdAt,
      }))
    } catch (error) {
      console.error('[FeedRepo] Error fetching feed items:', error.message)
      throw new Error('Failed to fetch feed items: ' + error.message)
    }
  },
}

// Add the missing repositories that your feed API needs
export const categoryRepo = {
  getAll: async (filter = {}, conditions = {}) => {
    try {
      console.log('[CategoryRepo] Fetching categories with conditions:', conditions)
      let query = Category.find(filter)

      // Apply conditions
      if (conditions.level !== undefined) {
        query = query.where('level').equals(conditions.level)
      }

      if (conditions.parent) {
        query = query.where('parent').equals(conditions.parent)
      }

      const categories = await query.lean().exec()
      console.log('[CategoryRepo] Found categories:', categories.length)
      return categories
    } catch (error) {
      console.error('[CategoryRepo] Error fetching categories:', error.message)
      throw new Error('Failed to fetch categories: ' + error.message)
    }
  },

  getOne: async (filter = {}) => {
    try {
      console.log('[CategoryRepo] Finding one category with filter:', filter)
      const category = await Category.findOne(filter).lean().exec()
      console.log('[CategoryRepo] Category found:', !!category)
      return category
    } catch (error) {
      console.error('[CategoryRepo] Error finding category:', error.message)
      throw new Error('Failed to find category: ' + error.message)
    }
  },

  create: async categoryData => {
    try {
      console.log('[CategoryRepo] Creating new category:', categoryData)
      const newCategory = new Category(categoryData)
      await newCategory.save()
      console.log('[CategoryRepo] Category created:', newCategory._id)
      return newCategory
    } catch (error) {
      console.error('[CategoryRepo] Error creating category:', error.message)
      throw new Error('Failed to create category: ' + error.message)
    }
  },

  update: async (id, categoryData) => {
    try {
      console.log('[CategoryRepo] Updating category:', id)
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { $set: categoryData },
        { new: true }
      )
        .lean()
        .exec()
      console.log('[CategoryRepo] Category updated:', !!updatedCategory)
      return updatedCategory
    } catch (error) {
      console.error('[CategoryRepo] Error updating category:', error.message)
      throw new Error('Failed to update category: ' + error.message)
    }
  },

  delete: async id => {
    try {
      console.log('[CategoryRepo] Deleting category:', id)
      const result = await Category.findByIdAndDelete(id)
      console.log('[CategoryRepo] Category deleted:', !!result)
      return result
    } catch (error) {
      console.error('[CategoryRepo] Error deleting category:', error.message)
      throw new Error('Failed to delete category: ' + error.message)
    }
  },
}

export const sliderRepo = {
  getAll: async (filter = {}, conditions = {}) => {
    try {
      console.log('[SliderRepo] Fetching sliders with conditions:', conditions)
      let query = Slider.find(filter)

      // Apply conditions
      if (conditions.category_id) {
        query = query.where('category_id').equals(conditions.category_id)
      }

      const sliders = await query.lean().exec()
      console.log('[SliderRepo] Found sliders:', sliders.length)
      return sliders
    } catch (error) {
      console.error('[SliderRepo] Error fetching sliders:', error.message)
      throw new Error('Failed to fetch sliders: ' + error.message)
    }
  },

  getOne: async (filter = {}) => {
    try {
      console.log('[SliderRepo] Finding one slider with filter:', filter)
      const slider = await Slider.findOne(filter).lean().exec()
      console.log('[SliderRepo] Slider found:', !!slider)
      return slider
    } catch (error) {
      console.error('[SliderRepo] Error finding slider:', error.message)
      throw new Error('Failed to find slider: ' + error.message)
    }
  },

  create: async sliderData => {
    try {
      console.log('[SliderRepo] Creating new slider:', sliderData)
      const newSlider = new Slider(sliderData)
      await newSlider.save()
      console.log('[SliderRepo] Slider created:', newSlider._id)
      return newSlider
    } catch (error) {
      console.error('[SliderRepo] Error creating slider:', error.message)
      throw new Error('Failed to create slider: ' + error.message)
    }
  },

  update: async (id, sliderData) => {
    try {
      console.log('[SliderRepo] Updating slider:', id)
      const updatedSlider = await Slider.findByIdAndUpdate(id, { $set: sliderData }, { new: true })
        .lean()
        .exec()
      console.log('[SliderRepo] Slider updated:', !!updatedSlider)
      return updatedSlider
    } catch (error) {
      console.error('[SliderRepo] Error updating slider:', error.message)
      throw new Error('Failed to update slider: ' + error.message)
    }
  },

  delete: async id => {
    try {
      console.log('[SliderRepo] Deleting slider:', id)
      const result = await Slider.findByIdAndDelete(id)
      console.log('[SliderRepo] Slider deleted:', !!result)
      return result
    } catch (error) {
      console.error('[SliderRepo] Error deleting slider:', error.message)
      throw new Error('Failed to delete slider: ' + error.message)
    }
  },
}

export const bannerRepo = {
  getAll: async (filter = {}, conditions = {}) => {
    try {
      console.log('[BannerRepo] Fetching banners with conditions:', conditions)
      let query = Banner.find(filter)

      // Apply conditions
      if (conditions.category_id) {
        query = query.where('category_id').equals(conditions.category_id)
      }

      if (conditions.type) {
        query = query.where('type').equals(conditions.type)
      }

      const banners = await query.lean().exec()
      console.log('[BannerRepo] Found banners:', banners.length)
      return banners
    } catch (error) {
      console.error('[BannerRepo] Error fetching banners:', error.message)
      throw new Error('Failed to fetch banners: ' + error.message)
    }
  },

  getOne: async (filter = {}) => {
    try {
      console.log('[BannerRepo] Finding one banner with filter:', filter)
      const banner = await Banner.findOne(filter).lean().exec()
      console.log('[BannerRepo] Banner found:', !!banner)
      return banner
    } catch (error) {
      console.error('[BannerRepo] Error finding banner:', error.message)
      throw new Error('Failed to find banner: ' + error.message)
    }
  },

  create: async bannerData => {
    try {
      console.log('[BannerRepo] Creating new banner:', bannerData)
      const newBanner = new Banner(bannerData)
      await newBanner.save()
      console.log('[BannerRepo] Banner created:', newBanner._id)
      return newBanner
    } catch (error) {
      console.error('[BannerRepo] Error creating banner:', error.message)
      throw new Error('Failed to create banner: ' + error.message)
    }
  },

  update: async (id, bannerData) => {
    try {
      console.log('[BannerRepo] Updating banner:', id)
      const updatedBanner = await Banner.findByIdAndUpdate(id, { $set: bannerData }, { new: true })
        .lean()
        .exec()
      console.log('[BannerRepo] Banner updated:', !!updatedBanner)
      return updatedBanner
    } catch (error) {
      console.error('[BannerRepo] Error updating banner:', error.message)
      throw new Error('Failed to update banner: ' + error.message)
    }
  },

  delete: async id => {
    try {
      console.log('[BannerRepo] Deleting banner:', id)
      const result = await Banner.findByIdAndDelete(id)
      console.log('[BannerRepo] Banner deleted:', !!result)
      return result
    } catch (error) {
      console.error('[BannerRepo] Error deleting banner:', error.message)
      throw new Error('Failed to delete banner: ' + error.message)
    }
  },
}
