import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerProfile from './pages/CustomerProfile';
import MonthlyTrends from './pages/MonthlyTrends'; // ADD THIS
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import TransactionDetail from './pages/TransactionDetail';

function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/customer/:id" 
              element={
                <PrivateRoute>
                  <CustomerProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/monthly-trends" 
              element={
                <PrivateRoute>
                  <MonthlyTrends />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/add-transaction" 
              element={
                <PrivateRoute>
                  <AddTransaction />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/edit-transaction/:id" 
              element={
                <PrivateRoute>
                  <EditTransaction />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transaction/:id" 
              element={
                <PrivateRoute>
                  <TransactionDetail />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;