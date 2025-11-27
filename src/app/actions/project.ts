'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export async function createProject(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Not authenticated' };

    const result = ProjectSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) return { error: 'Invalid input' };

    try {
        await prisma.project.create({
            data: {
                name: result.data.name,
                description: result.data.description,
                createdById: session.user.id,
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create project' };
    }
}

export async function getProjects() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // For MVP, show all projects created by user or where user is assigned tasks? 
    // Or just all projects for now since "Team" is simplified.
    // Let's show projects created by user for now.
    return await prisma.project.findMany({
        where: {
            createdById: session.user.id,
        },
        orderBy: { createdAt: 'desc' },
    });
}
