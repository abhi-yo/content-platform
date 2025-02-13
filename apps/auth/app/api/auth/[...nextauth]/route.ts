import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import clientPromise from "@/lib/mongodb";
import { compare, hash } from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user && !credentials.otp) {
          // First-time signup
          const hashedPassword = await hash(credentials.password, 12);
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          const newUser = await db.collection("users").insertOne({
            email: credentials.email,
            password: hashedPassword,
            role: credentials.role || "reader",
            emailVerified: null,
            createdAt: new Date(),
          });

          await db.collection("otps").insertOne({
            userId: newUser.insertedId,
            otp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          });

          console.log("OTP for", credentials.email, ":", otp);

          return {
            id: newUser.insertedId.toString(),
            email: credentials.email,
            role: credentials.role,
          };
        }

        if (user && credentials.otp) {
          // OTP verification
          const otpRecord = await db.collection("otps").findOne({
            userId: user._id,
            otp: credentials.otp,
            expiresAt: { $gt: new Date() },
          });

          if (!otpRecord) {
            throw new Error("Invalid or expired OTP");
          }

          await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { emailVerified: new Date() } }
          );

          await db.collection("otps").deleteOne({ _id: otpRecord._id });

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        }

        if (user && !credentials.otp) {
          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signup",
    signOut: "/auth/signup",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };