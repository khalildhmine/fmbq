const { MongoClient, ObjectId } = require('mongodb')

async function testComments() {
  const uri =
    'mongodb://localhost:27017/choiceshop?serverSelectionTimeoutMS=30000&socketTimeoutMS=60000&connectTimeoutMS=30000'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('choiceshop')
    const commentsCollection = db.collection('videocomments')

    // Get all comments
    const allComments = await commentsCollection.find({}).toArray()
    console.log('\nTotal comments:', allComments.length)

    // Get parent comments
    const parentComments = await commentsCollection.find({ parentId: null }).toArray()
    console.log('\nParent comments:', parentComments.length)

    // Get all replies
    const allReplies = await commentsCollection.find({ parentId: { $ne: null } }).toArray()
    console.log('\nAll replies:', allReplies.length)
    console.log('Sample reply:', JSON.stringify(allReplies[0], null, 2))

    // Check each parent comment for replies
    for (const parent of parentComments) {
      console.log('\nChecking parent comment:', parent._id.toString())
      console.log('Parent content:', parent.content)

      // Try different ways to find replies
      const repliesById = await commentsCollection
        .find({
          parentId: parent._id.toString(),
        })
        .toArray()

      const repliesByObjectId = await commentsCollection
        .find({
          parentId: new ObjectId(parent._id),
        })
        .toArray()

      console.log('Replies found by string ID:', repliesById.length)
      console.log('Replies found by ObjectId:', repliesByObjectId.length)

      if (repliesById.length > 0) {
        console.log('Sample reply by string ID:', JSON.stringify(repliesById[0], null, 2))
      }
      if (repliesByObjectId.length > 0) {
        console.log('Sample reply by ObjectId:', JSON.stringify(repliesByObjectId[0], null, 2))
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

testComments()
