import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
            return;
        }

        // Listen for message from popup
        const handleMessage = (event) => {
            // Accept messages from our backend
            if (event.origin !== API_URL && event.origin !== 'https://creditdebit-backend-production-abd7.up.railway.app') {
                return;
            }
            
            const { token } = event.data;
            if (token) {
                localStorage.setItem('token', token);
                window.location.href = '/creditdebit-frontend/dashboard';
            }
        };

        window.addEventListener('message', handleMessage);
        
        // Also check URL for token (direct redirect case)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            window.history.replaceState({}, document.title, '/creditdebit-frontend/dashboard');
            window.location.reload();
        }

        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

    const handleGoogleLogin = () => {
        // Open Google login in popup
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open(
            `${API_URL}/auth/google`,
            'googleLogin',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for popup closure
        const pollTimer = setInterval(() => {
            if (popup.closed) {
                clearInterval(pollTimer);
                // Check if we got the token
                const token = localStorage.getItem('token');
                if (token) {
                    window.location.href = '/creditdebit-frontend/dashboard';
                }
            }
        }, 500);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>CreditDebit Tracker</h1>
                <p style={styles.subtitle}>Manage your credits and debits easily</p>
                <button onClick={handleGoogleLogin} style={styles.button}>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px',
    },
    title: {
        color: '#1a73e8',
        marginBottom: '10px',
    },
    subtitle: {
        color: '#666',
        marginBottom: '30px',
    },
    button: {
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%',
    },
};

export default Login;