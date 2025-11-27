'use client';

import { useState, useEffect } from 'react';
import { createComment, getComments } from '@/app/actions/comment';
import { useActionState } from 'react';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface TaskDetailsProps {
    taskId: string;
    taskTitle: string;
}

function CommentForm({ taskId, onCommentAdded }: { taskId: string; onCommentAdded: () => void }) {
    const [state, dispatch, isPending] = useActionState(async (prev: any, formData: FormData) => {
        formData.append('taskId', taskId);
        const res = await createComment(formData);
        if (res.success) {
            onCommentAdded();
            return { success: true };
        }
        return res;
    }, undefined);

    return (
        <form action={dispatch} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
                className="input"
                name="content"
                placeholder="Add a comment..."
                required
                style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit" disabled={isPending}>
                {isPending ? '...' : 'Post'}
            </button>
        </form>
    );
}

export default function TaskDetails({ taskId, taskTitle }: TaskDetailsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        const data = await getComments(taskId);
        setComments(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    return (
        <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Comments for: {taskTitle}</h3>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <p>Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} style={{ padding: '0.5rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{comment.user.name || 'Unknown'}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <p style={{ fontSize: '0.875rem' }}>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <CommentForm taskId={taskId} onCommentAdded={fetchComments} />
        </div>
    );
}
