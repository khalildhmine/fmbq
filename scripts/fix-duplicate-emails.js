// Fix Duplicate Emails Script
// This script identifies any users with duplicate mobile-based emails
// and updates them to use unique emails instead

const { connectToDatabase } = require('../helpers/db')
const { v4: uuidv4 } = require('uuid')

// Generate a unique email for mobile users - uses the same pattern as the API
const generateUniqueEmail = mobile => {
  const cleanMobile = mobile ? mobile.replace(/[^0-9]/g, '') : 'unknown'
  const uuid = uuidv4().substring(0, 8)
  return `mobile_${cleanMobile}_${uuid}@mobileshop.com`
}

async function fixDuplicateEmails() {
  let dbConnection = null
  try {
    console.log('🔄 Connecting to database...')
    const { db } = await connectToDatabase()
    dbConnection = db

    console.log('🔍 Looking for duplicate mobile-based emails...')

    // Find all users with emails starting with "mobile_"
    const mobileUsers = await db
      .collection('users')
      .find({ email: { $regex: '^mobile_' } })
      .toArray()

    console.log(`✓ Found ${mobileUsers.length} users with mobile-based emails`)

    // Create a map to track duplicates
    const emailCounts = {}
    mobileUsers.forEach(user => {
      if (!emailCounts[user.email]) {
        emailCounts[user.email] = []
      }
      emailCounts[user.email].push(user)
    })

    // Find emails that have more than one user
    const duplicateEmails = Object.keys(emailCounts).filter(email => emailCounts[email].length > 1)

    console.log(`✓ Found ${duplicateEmails.length} duplicate emails`)

    // Fix each set of duplicates
    let updateCount = 0
    for (const email of duplicateEmails) {
      const users = emailCounts[email]
      console.log(`🔧 Processing email ${email} with ${users.length} duplicates`)

      // Skip the first user (keep original email)
      for (let i = 1; i < users.length; i++) {
        const user = users[i]

        // Generate new unique email using mobile field if available
        const newEmail = generateUniqueEmail(user.mobile)
        console.log(`🔄 Updating user ${user._id} from ${user.email} to ${newEmail}`)

        // Update user
        const result = await db
          .collection('users')
          .updateOne({ _id: user._id }, { $set: { email: newEmail, updatedAt: new Date() } })

        if (result.modifiedCount === 1) {
          updateCount++
          console.log(`✓ Successfully updated user ${user._id}`)
        } else {
          console.log(`❌ Failed to update user ${user._id}`)
        }
      }
    }

    console.log(`✅ Updated ${updateCount} users with unique emails`)
    console.log('✅ Script completed successfully')
  } catch (error) {
    console.error('❌ Error fixing duplicate emails:', error)
  } finally {
    console.log('🏁 Script execution completed, exiting...')
    process.exit(0)
  }
}

// Run the script
fixDuplicateEmails()
