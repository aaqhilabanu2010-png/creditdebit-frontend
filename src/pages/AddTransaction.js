import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api';

const AddTransaction = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'credit',
        status: 'pending',
        personName: '',
        personPhone: '',
        amount: '',
        currency: 'INR',
        description: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/transactions`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setMessage('Transaction added successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            setMessage(error.response?.data?.message || 'Error adding transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Add Transaction</h2>
            {message && <div style={styles.message}>{message}</div>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label>Type:</label>
                    <select name="type" value={formData.type} onChange={handleChange} style={styles.input}>
                        <option value="credit">Credit (Someone owes me)</option>
                        <option value="debit">Debit (I owe someone)</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                        <option value="pending">Pending</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="settled">Settled (Completed)</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Person Name *</label>
                    <input 
                        type="text" 
                        name="personName" 
                        value={formData.personName} 
                        onChange={handleChange}
                        required
                        style={styles.input}
                        placeholder="Enter name"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Phone (optional)</label>
                    <input 
                        type="text" 
                        name="personPhone" 
                        value={formData.personPhone} 
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="+1234567890"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Amount *</label>
                    <input 
                        type="number" 
                        name="amount" 
                        value={formData.amount} 
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        style={styles.input}
                        placeholder="0.00"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange} style={styles.input}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>

                <div style={styles.formGroup}>
                    <label>Description</label>
                    <input 
                        type="text" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="What is this for?"
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Date</label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Due Date (optional)</label>
                    <input 
                        type="date" 
                        name="dueDate" 
                        value={formData.dueDate} 
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Category</label>
                    <input 
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., Food, Rent, Loan"
                    />
                </div>

                <div style={styles.buttonGroup}>
                    <button type="button" onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { 
        padding: '20px', 
        maxWidth: '600px', 
        margin: '0 auto' 
    },
    message: {
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        backgroundColor: '#d4edda',
        color: '#155724'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    cancelBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    submitBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default AddTransaction;