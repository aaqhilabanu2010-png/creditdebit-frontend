import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import API_URL from '../config/api';

const MonthlyTrends = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/by-month`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const formatted = response.data.byMonth?.map(item => ({
        month: item.month,
        credit: item.totalCredit || 0,
        debit: item.totalDebit || 0,
        net: item.netBalance || 0
      })) || [];
      
      setData(formatted.reverse());
    } catch (error) {
      console.error('Chart data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${value.toFixed(0)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <h1 style={{ margin: 0, fontSize: '24px' }}>Monthly Trends</h1>
        </div>
      </motion.div>

      {/* Chart Content */}
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>No data yet</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Add transactions to see monthly trends</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1f2937' }}>
              Credit vs Debit
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="credit" fill="#10b981" name="Credit (Received)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debit" fill="#ef4444" name="Debit (Sent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Summary Table */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937' }}>
                Monthly Summary
              </h3>
              {data.map((item, index) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: index % 2 === 0 ? '#f9fafb' : 'white',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.month}</span>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span style={{ color: '#10b981' }}>{formatCurrency(item.credit)}</span>
                    <span style={{ color: '#ef4444' }}>{formatCurrency(item.debit)}</span>
                    <span style={{ color: item.net >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {item.net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(item.net))}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTrends;