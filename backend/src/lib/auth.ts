import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, openAPI } from "better-auth/plugins";
import {
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
} from "./email.js";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
  trustedOrigins: (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  plugins: [
    openAPI(),
    emailOTP({
      otpLength: 6,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "email-verification") {
          await sendVerificationOtpEmail({ to: email, otp });
        }
      },
    }),
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, url });
    },
  },
});
