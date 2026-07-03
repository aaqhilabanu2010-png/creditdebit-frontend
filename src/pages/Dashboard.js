import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get token from URL if coming from Google OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Remove token from URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
            // Reload to fetch user with new token
            window.location.reload();
            return;
        }

        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/dashboard/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(response.data.summary);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching summary:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Dashboard</h1>
                <div style={styles.userInfo}>
                    <button onClick={() => navigate('/transactions')} style={styles.viewBtn}>
                        📋 View All
                    </button>
                    <button onClick={() => navigate('/add-transaction')} style={styles.addBtn}>
                        + Add Transaction
                    </button>
                    {user?.photoURL && (
                        <img src={user.photoURL} alt="profile" style={styles.avatar} />
                    )}
                    <span>{user?.name}</span>
                    <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>

            <div style={styles.summaryGrid}>
                <div style={{...styles.card, backgroundColor: '#e8f5e9'}}>
                    <h3>Total Credit</h3>
                    <p style={styles.amount}>₹{summary?.totalCredit?.toFixed(2) || '0.00'}</p>
                </div>
                <div style={{...styles.card, backgroundColor: '#ffebee'}}>
                    <h3>Total Debit</h3>
                    <p style={styles.amount}>₹{summary?.totalDebit?.toFixed(2) || '0.00'}</p>
                </div>
                <div style={{...styles.card, backgroundColor: summary?.netBalance >= 0 ? '#e8f5e9' : '#ffebee'}}>
                    <h3>Net Balance</h3>
                    <p style={styles.amount}>₹{summary?.netBalance?.toFixed(2) || '0.00'}</p>
                </div>
                <div style={styles.card}>
                    <h3>Transactions</h3>
                    <p style={styles.amount}>{summary?.totalTransactions || 0}</p>
                </div>
            </div>

            <div style={styles.pendingSection}>
                <h2>Pending Amounts</h2>
                <div style={styles.pendingGrid}>
                    <div>
                        <p>Pending Credit: <strong>₹{summary?.pendingCredit?.toFixed(2) || '0.00'}</strong></p>
                    </div>
                    <div>
                        <p>Pending Debit: <strong>₹{summary?.pendingDebit?.toFixed(2) || '0.00'}</strong></p>
                    </div>
                    <div>
                        <p>Pending Net: <strong>₹{summary?.pendingNet?.toFixed(2) || '0.00'}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #ddd'
    },
    userInfo: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
    },
    avatar: { 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%' 
    },
    viewBtn: {
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px'
    },
    addBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px'
    },
    logoutBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    card: {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    amount: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '10px 0'
    },
    pendingSection: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
    },
    pendingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginTop: '15px'
    }
};

export default Dashboard;