import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const TransactionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransaction(response.data.transaction);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transaction:', error);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/transactions');
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'settled': return '#28a745';
            case 'partially_paid': return '#ffc107';
            default: return '#dc3545';
        }
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    if (!transaction) {
        return <div style={styles.container}>Transaction not found</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/transactions')} style={styles.backBtn}>
                    ← Back
                </button>
                <div>
                    <button onClick={() => navigate(`/edit-transaction/${id}`)} style={styles.editBtn}>
                        Edit
                    </button>
                    <button onClick={handleDelete} style={styles.deleteBtn}>
                        Delete
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <span style={{...styles.typeBadge, backgroundColor: transaction.type === 'credit' ? '#28a745' : '#dc3545'}}>
                        {transaction.type.toUpperCase()}
                    </span>
                    <span style={{...styles.statusBadge, backgroundColor: getStatusColor(transaction.status)}}>
                        {transaction.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <h1 style={styles.personName}>{transaction.personName}</h1>
                <p style={styles.amount}>₹{transaction.amount.toFixed(2)}</p>

                {transaction.personPhone && (
                    <p style={styles.info}>📞 {transaction.personPhone}</p>
                )}

                {transaction.description && (
                    <div style={styles.section}>
                        <h3>Description</h3>
                        <p>{transaction.description}</p>
                    </div>
                )}

                <div style={styles.grid}>
                    <div style={styles.infoBox}>
                        <h4>Date</h4>
                        <p>{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    
                    {transaction.dueDate && (
                        <div style={styles.infoBox}>
                            <h4>Due Date</h4>
                            <p>{new Date(transaction.dueDate).toLocaleDateString()}</p>
                        </div>
                    )}

                    <div style={styles.infoBox}>
                        <h4>Currency</h4>
                        <p>{transaction.currency}</p>
                    </div>

                    {transaction.category && (
                        <div style={styles.infoBox}>
                            <h4>Category</h4>
                            <p>{transaction.category}</p>
                        </div>
                    )}

                    <div style={styles.infoBox}>
                        <h4>Paid Amount</h4>
                        <p>₹{transaction.paidAmount.toFixed(2)}</p>
                    </div>

                    <div style={styles.infoBox}>
                        <h4>Remaining</h4>
                        <p>₹{(transaction.amount - transaction.paidAmount).toFixed(2)}</p>
                    </div>
                </div>

                <div style={styles.meta}>
                    <p>Created: {new Date(transaction.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(transaction.updatedAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
    },
    backBtn: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    editBtn: {
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '10px'
    },
    deleteBtn: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    card: {
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
    },
    typeBadge: {
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    statusBadge: {
        color: 'white',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '14px'
    },
    personName: {
        fontSize: '28px',
        marginBottom: '10px'
    },
    amount: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#1a73e8',
        marginBottom: '20px'
    },
    info: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '15px'
    },
    section: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    },
    infoBox: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    meta: {
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
        color: '#666',
        fontSize: '14px'
    }
};

export default TransactionDetail;