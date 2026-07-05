import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from './AuthContext';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const fetchCustomers = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const url = search 
        ? `${API_URL}/customers?search=${encodeURIComponent(search)}`
        : `${API_URL}/customers`;
      const response = await axios.get(url, { headers: getHeaders() });
      setCustomers(response.data.customers || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCustomerDetail = useCallback(async (customerId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customers/${customerId}`, {
        headers: getHeaders()
      });
      setSelectedCustomer(response.data.customer);
      setError(null);
      return response.data.customer;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createCustomer = async (customerData) => {
    try {
      const response = await axios.post(`${API_URL}/customers`, customerData, {
        headers: getHeaders()
      });
      setCustomers(prev => [response.data.customer, ...prev]);
      return response.data.customer;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
      return null;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      await axios.delete(`${API_URL}/customers/${customerId}`, {
        headers: getHeaders()
      });
      setCustomers(prev => prev.filter(c => c._id !== customerId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
      return false;
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const response = await axios.post(`${API_URL}/transactions`, transactionData, {
        headers: getHeaders()
      });
      // Refresh customer detail if viewing
      if (selectedCustomer && selectedCustomer._id === transactionData.customerId) {
        await fetchCustomerDetail(transactionData.customerId);
      }
      return response.data.transaction;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      return null;
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        selectedCustomer,
        loading,
        error,
        fetchCustomers,
        fetchCustomerDetail,
        createCustomer,
        deleteCustomer,
        createTransaction,
        setSelectedCustomer
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);