'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CommentSchema = z.object({
    content: z.string().min(1),
    taskId: z.string(),
});

export async function createComment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    const result = CommentSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) return { error: 'Invalid input' };

    try {
        await prisma.comment.create({
            data: {
                content: result.data.content,
                taskId: result.data.taskId,
                userId: session.user.id,
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create comment' };
    }
}

export async function getComments(taskId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.comment.findMany({
        where: { taskId },
        include: {
            user: {
                select: { name: true, image: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}
