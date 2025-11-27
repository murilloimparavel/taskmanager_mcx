'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    deadline: z.string().optional(), // ISO string from date input
    projectId: z.string(),
});

export async function createTask(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    const rawData = Object.fromEntries(formData);
    const result = TaskSchema.safeParse(rawData);

    if (!result.success) return { error: 'Invalid input' };

    try {
        await prisma.task.create({
            data: {
                title: result.data.title,
                description: result.data.description,
                priority: result.data.priority,
                deadline: result.data.deadline ? new Date(result.data.deadline) : null,
                projectId: result.data.projectId,
                createdById: session.user.id,
                status: 'TODO',
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create task' };
    }
}

export async function updateTaskStatus(taskId: string, status: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { status },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update task' };
    }
}

export async function archiveTask(taskId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { isArchived: true },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to archive task' };
    }
}

export async function getTasks(projectId?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const where: any = {
        isArchived: false,
        // Show tasks user created or is assigned to? Or all tasks in projects they have access to?
        // For MVP, let's show tasks in projects created by user.
        project: {
            createdById: session.user.id,
        },
    };

    if (projectId) {
        where.projectId = projectId;
    }

    return await prisma.task.findMany({
        where,
        include: {
            project: true,
            assignee: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}
