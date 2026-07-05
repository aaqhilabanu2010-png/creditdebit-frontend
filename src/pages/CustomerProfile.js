import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { exportCustomerToPDF } from '../utils/exportPDF';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCustomer, fetchCustomerDetail, createTransaction, loading } = useCustomer();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomerDetail(id);
  }, [id, fetchCustomerDetail]);

  const handleAddMoney = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    if (submitting) return;

    setSubmitting(true);

    const transactionData = {
      customerId: id,
      type: formType === 'received' ? 'credit' : 'debit',
      personName: selectedCustomer?.name || '',
      amount: Number(amount),
      description: description || ''
    };

    await createTransaction(transactionData);
    setShowForm(false);
    setAmount('');
    setDescription('');
    setSubmitting(false);
    fetchCustomerDetail(id);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading && !selectedCustomer) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!selectedCustomer) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Customer not found</div>;
  }

  const stats = {
    received: selectedCustomer.totalReceived || 0,
    sent: selectedCustomer.totalSent || 0,
    net: selectedCustomer.netBalance || 0
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: '140px' }}>
      {/* Header with back button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          padding: '20px',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}
              >
                ← Back
              </button>
              <h1 style={{ margin: 0, fontSize: '24px' }}>{selectedCustomer.name}</h1>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                {selectedCustomer.phone || 'No phone'}
              </p>
              {selectedCustomer.details && (
                <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
                  {selectedCustomer.details}
                </p>
              )}
            </div>
            <button 
              onClick={() => exportCustomerToPDF(selectedCustomer, `${selectedCustomer.name}_Statement_${new Date().toISOString().split('T')[0]}.pdf`)}
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
                gap: '6px',
                marginTop: '8px'
              }}
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937' }}>
          Transaction History
        </h2>
        
        {selectedCustomer.transactions?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}
          >
            <p>No transactions yet. Use the buttons below to add one.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedCustomer.transactions.map((t, index) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${t.type === 'credit' ? '#10b981' : '#ef4444'}`
                }}
              >
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1f2937' }}>
                    {t.type === 'credit' ? 'Money Received' : 'Money Sent'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {t.description || 'No description'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: t.type === 'credit' ? '#10b981' : '#ef4444'
                }}>
                  {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          padding: '12px 16px',
          zIndex: 100
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Stats Row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#ecfdf5', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Credit</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                {formatCurrency(stats.received)}
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Debit</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>
                {formatCurrency(stats.sent)}
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', background: stats.net >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>Due</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: stats.net >= 0 ? '#10b981' : '#ef4444' }}>
                {stats.net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(stats.net))}
              </p>
            </div>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddMoney('received')}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              + You Received
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddMoney('sent')}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              - You Paid/Gave
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showForm && (
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
              zIndex: 300
            }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
                {formType === 'received' ? 'Add Money You Received' : 'Add Money You Paid/Gave'}
              </h2>
              <input
                type="number"
                placeholder="Amount *"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginBottom: '12px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '18px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginBottom: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#e5e7eb',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: formType === 'received' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerProfile;