import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins"
import { db } from "@/db"; // your drizzle instance
import * as schema from '@/db/schema'
import { sendOtpEmail } from "./email";
 
export const auth = betterAuth({
    plugins: [
        emailOTP({ 
                async sendVerificationOTP({ email, otp, type}) { 
                  if(type === "email-verification") {
                    await sendOtpEmail({
                      to: email,
                      otp: otp
                    })
                  }
				}, 
        }) 
    ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }
  },
  emailAndPassword: {    
        enabled: true
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema
    })
})