'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function register(prevState: string | undefined, formData: FormData) {
    const result = RegisterSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return 'Invalid input.';
    }

    const { name, email, password } = result.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return 'Email already in use.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            },
        });

        // Attempt to sign in after registration
        // We can't easily sign in from server action with credentials without redirecting to login or using client side.
        // So we will just redirect to login or return success.
        return 'User created successfully. Please log in.';
    } catch (error) {
        console.error('Registration error:', error);
        return 'Failed to create user.';
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
