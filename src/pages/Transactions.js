import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const Transactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/transactions`;
            
            if (filter !== 'all') {
                url += `?type=${filter}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data.transactions);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Transactions</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                        ← Dashboard
                    </button>
                    <button onClick={() => navigate('/add-transaction')} style={styles.addBtn}>
                        + Add New
                    </button>
                </div>
            </div>

            <div style={styles.filterSection}>
                <button 
                    onClick={() => setFilter('all')} 
                    style={{...styles.filterBtn, backgroundColor: filter === 'all' ? '#1a73e8' : '#ddd'}}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('credit')} 
                    style={{...styles.filterBtn, backgroundColor: filter === 'credit' ? '#28a745' : '#ddd'}}
                >
                    Credit
                </button>
                <button 
                    onClick={() => setFilter('debit')} 
                    style={{...styles.filterBtn, backgroundColor: filter === 'debit' ? '#dc3545' : '#ddd'}}
                >
                    Debit
                </button>
            </div>

            {transactions.length === 0 ? (
                <div style={styles.empty}>No transactions found</div>
            ) : (
                <div style={styles.list}>
                    {transactions.map(t => (
                        <div 
                            key={t._id} 
                            style={styles.card}
                            onClick={() => navigate(`/transaction/${t._id}`)}
                        >
                            <div style={styles.cardHeader}>
                                <span style={{...styles.typeBadge, backgroundColor: t.type === 'credit' ? '#28a745' : '#dc3545'}}>
                                    {t.type.toUpperCase()}
                                </span>
                                <span style={{...styles.statusBadge, backgroundColor: getStatusColor(t.status)}}>
                                    {t.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                            
                            <h3>{t.personName}</h3>
                            <p style={styles.amount}>₹{t.amount.toFixed(2)}</p>
                            
                            {t.description && <p style={styles.description}>{t.description}</p>}
                            
                            <div style={styles.details}>
                                <span>📅 {new Date(t.date).toLocaleDateString()}</span>
                                {t.dueDate && <span>⏰ Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                                {t.category && <span>🏷️ {t.category}</span>}
                            </div>

                            <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-transaction/${t._id}`); }} style={styles.editBtn}>
                                    Edit
                                </button>
                                <button onClick={(e) => handleDelete(t._id, e)} style={styles.deleteBtn}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
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
        cursor: 'pointer',
        marginRight: '10px'
    },
    addBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    filterSection: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    filterBtn: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'white'
    },
    empty: {
        textAlign: 'center',
        padding: '40px',
        color: '#666'
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '15px'
    },
    card: {
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },
    typeBadge: {
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    statusBadge: {
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
    },
    amount: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1a73e8',
        margin: '10px 0'
    },
    description: {
        color: '#666',
        marginBottom: '10px'
    },
    details: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '15px',
        fontSize: '14px',
        color: '#666'
    },
    actions: {
        display: 'flex',
        gap: '10px'
    },
    editBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    deleteBtn: {
        flex: 1,
        padding: '8px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default Transactions;