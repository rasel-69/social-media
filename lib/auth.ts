import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        async sendResetPassword({ user, url }) {
            // For development: Log the reset link to the console
            // In production, use Resend, SendGrid, etc. to send an email
            console.log(`Password reset link for ${user.email}: ${url}`);
        },
    },
    user: {
        additionalFields: {
            username: {
                type: "string",

                required: false,
            },
            phoneNumber: {
                type: "string",
                required: false,
            },
            coverImage: {
                type: "string",
                required: false,
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});