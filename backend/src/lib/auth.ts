import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendPasswordResetEmail } from "./email.js";
import { openAPI } from "better-auth/plugins"
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
  ],
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, url });
    },
  },
  
});
