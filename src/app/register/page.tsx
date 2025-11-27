'use client';

import { useActionState } from 'react';
import { register } from '@/app/actions/auth';

export default function RegisterPage() {
    const [state, dispatch, isPending] = useActionState(register, undefined);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Register
                </h1>
                <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label" htmlFor="name">Name</label>
                        <input className="input" id="name" type="text" name="name" required minLength={2} />
                    </div>
                    <div>
                        <label className="label" htmlFor="email">Email</label>
                        <input className="input" id="email" type="email" name="email" required />
                    </div>
                    <div>
                        <label className="label" htmlFor="password">Password</label>
                        <input className="input" id="password" type="password" name="password" required minLength={6} />
                    </div>
                    {state && <p className="error" style={{ color: state.includes('success') ? 'green' : undefined }}>{state}</p>}
                    <button className="btn btn-primary" type="submit" disabled={isPending}>
                        {isPending ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    Already have an account? <a href="/login" style={{ textDecoration: 'underline' }}>Login</a>
                </p>
            </div>
        </div>
    );
}
