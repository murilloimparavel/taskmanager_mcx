'use client';

import { useState } from 'react';
import { createProject } from '@/app/actions/project';
import Modal from './ui/Modal';
import { useActionState } from 'react';

interface Project {
    id: string;
    name: string;
}

interface SidebarProps {
    projects: Project[];
    selectedProjectId?: string;
}

function CreateProjectForm({ onClose }: { onClose: () => void }) {
    const [state, dispatch, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const res = await createProject(formData);
        if (res.success) {
            onClose();
            return { success: true };
        }
        return res;
    }, undefined);

    return (
        <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label className="label" htmlFor="name">Project Name</label>
                <input className="input" id="name" name="name" required />
            </div>
            <div>
                <label className="label" htmlFor="description">Description</label>
                <input className="input" id="description" name="description" />
            </div>
            {(state as any)?.error && <p className="error">{(state as any).error}</p>}
            <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Project'}
            </button>
        </form>
    );
}

export default function Sidebar({ projects, selectedProjectId }: SidebarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <aside style={{ width: '250px', borderRight: '1px solid var(--border)', padding: '1.5rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Task Manager</h1>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsModalOpen(true)}>
                    + New Project
                </button>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Projects</h3>
                <ul style={{ listStyle: 'none' }}>
                    <li>
                        <a href="/" style={{ display: 'block', padding: '0.5rem', borderRadius: 'var(--radius)', backgroundColor: !selectedProjectId ? 'var(--secondary)' : 'transparent' }}>
                            All Tasks
                        </a>
                    </li>
                    {projects.map((project) => (
                        <li key={project.id}>
                            <a href={`/?projectId=${project.id}`} style={{ display: 'block', padding: '0.5rem', borderRadius: 'var(--radius)', backgroundColor: selectedProjectId === project.id ? 'var(--secondary)' : 'transparent' }}>
                                {project.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {/* User info could go here */}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Project">
                <CreateProjectForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </aside>
    );
}
