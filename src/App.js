import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import EditTransaction from './pages/EditTransaction';

function App() {
    return (
        <AuthProvider>
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

                    <Route 
                         path="/transactions" 
                        element={
                         <PrivateRoute>
                             <Transactions />
                        </PrivateRoute>
                    } 
                />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;