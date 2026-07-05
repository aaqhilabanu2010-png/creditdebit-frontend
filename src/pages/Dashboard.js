import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCustomer } from '../context/CustomerContext';
import { exportAllCustomersToPDF } from '../utils/exportPDF';
import axios from 'axios';
import API_URL from '../config/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { customers, fetchCustomers, createCustomer, deleteCustomer, loading } = useCustomer();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchSummary();
  }, [fetchCustomers]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Summary error:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchCustomers(e.target.value);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || submitting) return;
    
    setSubmitting(true);
    const result = await createCustomer(newCustomer);
    setSubmitting(false);
    
    if (result) {
      setShowAddModal(false);
      setNewCustomer({ name: '', phone: '', details: '' });
      fetchCustomers();
      fetchSummary();
    }
  };

  const handleDeleteCustomer = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this customer? History will be preserved.')) {
      await deleteCustomer(id);
      fetchSummary();
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '80px' }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          padding: '20px',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>My Customers</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>{user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => exportAllCustomersToPDF(customers, summary, `All_Customers_${new Date().toISOString().split('T')[0]}.pdf`)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📥 Download PDF
            </button>
            <button 
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          padding: '16px',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <motion.div variants={itemVariants} style={summaryCardStyle('#10b981')}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Credit</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
            {formatCurrency(summary?.totalReceived || 0)}
          </h3>
        </motion.div>

        <motion.div variants={itemVariants} style={summaryCardStyle('#3b82f6')}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Debit</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
            {formatCurrency(summary?.totalSent || 0)}
          </h3>
        </motion.div>

        <motion.div variants={itemVariants} style={summaryCardStyle(summary?.netBalance >= 0 ? '#10b981' : '#ef4444')}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Due</p>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>
            {(summary?.netBalance || 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(summary?.netBalance || 0))}
          </h3>
        </motion.div>
      </motion.div>

      {/* Monthly Trends Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ padding: '0 16px', maxWidth: '800px', margin: '0 auto 16px auto' }}
      >
        <div
          onClick={() => navigate('/monthly-trends')}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Monthly Trends</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>View your monthly credit & debit analysis</p>
          </div>
          <span style={{ fontSize: '24px' }}>📊</span>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: '0 16px', maxWidth: '800px', margin: '0 auto' }}
      >
        <input
          type="text"
          placeholder="Search customers by name or phone..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </motion.div>

      {/* Customer List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}
          >
            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>No customers yet</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Tap the + button to add your first customer</p>
          </motion.div>
        ) : (
          customers.map((customer) => (
            <motion.div
              key={customer._id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate(`/customer/${customer._id}`);
              }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1, pointerEvents: 'none' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1f2937' }}>
                  {customer.name}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  {customer.phone || 'No phone'} • {customer.transactionCount} transactions
                </p>
              </div>
              <div style={{ textAlign: 'right', pointerEvents: 'none' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(customer.totalReceived)}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: customer.pendingAmount > 0 ? '#ef4444' : '#6b7280' }}>
                  {customer.pendingAmount > 0 ? `Pending: ${formatCurrency(customer.pendingAmount)}` : 'No pending'}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomer(customer._id, e);
                }}
                style={{
                  marginLeft: '12px',
                  background: '#fee2e2',
                  border: 'none',
                  color: '#ef4444',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add Customer Button (Floating) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(30, 64, 175, 0.4)',
          zIndex: 100
        }}
      >
        +
      </motion.button>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Add Customer</h2>
              <input
                type="text"
                placeholder="Customer Name *"
                value={newCustomer.name}
                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newCustomer.phone}
                onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                style={inputStyle}
              />
              <textarea
                placeholder="Details (optional)"
                value={newCustomer.details}
                onChange={e => setNewCustomer({...newCustomer, details: e.target.value})}
                style={{...inputStyle, height: '80px', resize: 'none'}}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  style={{...buttonStyle, background: '#e5e7eb', color: '#374151', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer'}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={submitting}
                  style={{...buttonStyle, background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer'}}
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const summaryCardStyle = (color) => ({
  background: 'white',
  borderRadius: '16px',
  padding: '16px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  borderTop: `4px solid ${color}`
});

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  borderRadius: '10px',
  border: '2px solid #e5e7eb',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box'
};

const buttonStyle = {
  flex: 1,
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Dashboard;