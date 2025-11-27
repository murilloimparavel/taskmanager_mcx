'use client';

import { useState } from 'react';
import { createTask, updateTaskStatus, archiveTask } from '@/app/actions/task';
import Modal from './ui/Modal';
import { useActionState } from 'react';

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    deadline: Date | null;
    projectId: string;
    assignee?: { name: string | null } | null;
}

interface TaskBoardProps {
    tasks: Task[];
    projectId?: string;
    projectName?: string;
}

function CreateTaskForm({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const [state, dispatch, isPending] = useActionState(async (prev: any, formData: FormData) => {
        formData.append('projectId', projectId);
        const res = await createTask(formData);
        if (res.success) {
            onClose();
            return { success: true };
        }
        return res;
    }, undefined);

    return (
        <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label className="label" htmlFor="title">Task Title</label>
                <input className="input" id="title" name="title" required />
            </div>
            <div>
                <label className="label" htmlFor="description">Description</label>
                <input className="input" id="description" name="description" />
            </div>
            <div>
                <label className="label" htmlFor="priority">Priority</label>
                <select className="input" id="priority" name="priority">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
            </div>
            <div>
                <label className="label" htmlFor="deadline">Deadline</label>
                <input className="input" id="deadline" name="deadline" type="datetime-local" />
            </div>
            {(state as any)?.error && <p className="error">{(state as any).error}</p>}
            <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Task'}
            </button>
        </form>
    );
}

import TaskDetails from './TaskDetails';

export default function TaskBoard({ tasks, projectId, projectName }: TaskBoardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTaskForComments, setSelectedTaskForComments] = useState<{ id: string; title: string } | null>(null);

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        await updateTaskStatus(taskId, newStatus);
    };

    const handleArchive = async (taskId: string) => {
        if (confirm('Are you sure you want to archive this task?')) {
            await archiveTask(taskId);
        }
    };

    return (
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{projectName || 'All Tasks'}</h1>
                {projectId && (
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        + New Task
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {tasks.length === 0 ? (
                    <p style={{ color: 'var(--muted)' }}>No tasks found.</p>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{task.title}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.125rem 0.375rem',
                                        borderRadius: '9999px',
                                        backgroundColor: task.priority === 'URGENT' ? '#fee2e2' : task.priority === 'HIGH' ? '#ffedd5' : '#f3f4f6',
                                        color: task.priority === 'URGENT' ? '#ef4444' : task.priority === 'HIGH' ? '#f97316' : '#374151',
                                        fontWeight: '500'
                                    }}>
                                        {task.priority}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--muted)', marginBottom: '0.5rem' }}>{task.description}</p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                                    {task.deadline && <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                                    {task.assignee && <span>Assignee: {task.assignee.name}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select
                                    className="input"
                                    style={{ width: 'auto', padding: '0.25rem' }}
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                >
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                    onClick={() => setSelectedTaskForComments({ id: task.id, title: task.title })}
                                >
                                    Comments
                                </button>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }}
                                    onClick={() => handleArchive(task.id)}
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {projectId && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Task">
                    <CreateTaskForm projectId={projectId} onClose={() => setIsModalOpen(false)} />
                </Modal>
            )}

            {selectedTaskForComments && (
                <Modal isOpen={!!selectedTaskForComments} onClose={() => setSelectedTaskForComments(null)} title="Task Details">
                    <TaskDetails taskId={selectedTaskForComments.id} taskTitle={selectedTaskForComments.title} />
                </Modal>
            )}
        </div>
    );
}
