import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Login.css'; // Reusing auth styles

function ActivateAccount() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [manualToken, setManualToken] = useState('');
    const navigate = useNavigate();
    const urlToken = searchParams.get('token');

    const handleActivation = async (tokenToUse: string) => {
        setStatus('loading');
        setMessage('Activating your account...');
        try {
            await authService.activateAccount(tokenToUse);
            setStatus('success');
            setMessage('Your account has been successfully activated!');
            setTimeout(() => navigate('/login'), 5000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Account activation failed. The code might be expired or invalid.');
        }
    };

    useEffect(() => {
        if (urlToken) {
            handleActivation(urlToken);
        }
    }, [urlToken]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualToken.trim()) {
            handleActivation(manualToken.trim());
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="status-icon">
                        {status === 'loading' && '⌛'}
                        {status === 'success' && '✅'}
                        {status === 'error' && '❌'}
                        {status === 'idle' && '📧'}
                    </div>
                    <h2>Account Activation</h2>
                    <p className={status === 'error' ? 'text-error' : ''}>
                        {status === 'idle' ? 'Enter the activation code sent to your email.' : message}
                    </p>
                </div>

                {status !== 'success' && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="token">Activation Code</label>
                            <input
                                type="text"
                                id="token"
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                placeholder="Paste your code here"
                                required
                                disabled={status === 'loading'}
                            />
                        </div>
                        <button type="submit" className="auth-submit" disabled={status === 'loading' || !manualToken.trim()}>
                            {status === 'loading' ? 'Activating...' : 'Activate Account'}
                        </button>
                    </form>
                )}

                {status === 'success' && (
                    <div className="auth-footer">
                        <p>You will be redirected to the login page shortly.</p>
                        <Link to="/login" className="auth-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                            Go to Login Now
                        </Link>
                    </div>
                )}

                {(status === 'error' || status === 'idle') && (
                    <div className="auth-footer">
                        <Link to="/register" className="back-home">Need a new account? Register</Link>
                        <Link to="/" className="back-home">Back to Home</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivateAccount;
