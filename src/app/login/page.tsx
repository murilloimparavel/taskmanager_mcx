'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth';

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Login
                </h1>
                <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label" htmlFor="email">Email</label>
                        <input className="input" id="email" type="email" name="email" required />
                    </div>
                    <div>
                        <label className="label" htmlFor="password">Password</label>
                        <input className="input" id="password" type="password" name="password" required />
                    </div>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                    <button className="btn btn-primary" type="submit" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    Don't have an account? <a href="/register" style={{ textDecoration: 'underline' }}>Register</a>
                </p>
            </div>
        </div>
    );
}
