import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authorization logic here
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
        token.id = user._id
      }
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin
      session.user.id = token.id
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
