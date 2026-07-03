import React, { useEffect } from 'react';
import API_URL from '../config/api';

const Login = () => {
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== API_URL) return;
            
            const { token } = event.data;
            if (token) {
                localStorage.setItem('token', token);
                window.location.href = '/dashboard';
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleGoogleLogin = () => {
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            `${API_URL}/auth/google`,
            'googleLogin',
            `width=${width},height=${height},left=${left},top=${top}`
        );
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