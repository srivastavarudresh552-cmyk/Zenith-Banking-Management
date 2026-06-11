import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { accountAPI } from '../services/api';
import { formatCurrency, maskAccountId } from '../utils/helpers';
import { Alert, LoadingSpinner } from '../components/Alert';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setCreatingAccount(true);
      setError('');
      await accountAPI.createAccount();
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container-max">
        {/* Header */}
        <div className="mb-5">
          <h1 className="display-5 fw-bold mb-2">
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </h1>
          <p className="text-muted fs-5">Welcome back, {user?.name}!</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Quick Actions */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <Link to="/accounts" className="text-decoration-none">
              <div className="action-card" style={{ borderColor: '#0066cc' }}>
                <div className="icon text-primary">
                  <i className="bi bi-credit-card-2-front"></i>
                </div>
                <h5 className="fw-bold">View Accounts</h5>
                <p>Manage your accounts</p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link to="/transfer" className="text-decoration-none">
              <div className="action-card" style={{ borderColor: '#00cc99' }}>
                <div className="icon text-success">
                  <i className="bi bi-arrow-left-right"></i>
                </div>
                <h5 className="fw-bold">Transfer Money</h5>
                <p>Send funds between accounts</p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <button
              onClick={handleCreateAccount}
              disabled={creatingAccount}
              className="text-decoration-none w-100 btn btn-link p-0"
            >
              <div className="action-card" style={{ borderColor: '#9933ff' }}>
                <div className="icon" style={{ color: '#9933ff' }}>
                  <i className="bi bi-plus-circle"></i>
                </div>
                <h5 className="fw-bold">Create Account</h5>
                <p>{creatingAccount ? 'Creating...' : 'Open new account'}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="card card-custom">
          <div className="card-header bg-white border-bottom">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-wallet2 me-2"></i>Your Accounts
            </h5>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : accounts.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-4 fs-5">No accounts yet. Create your first account to get started.</p>
                <button
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="btn btn-primary-custom"
                >
                  {creatingAccount ? 'Creating...' : 'Create First Account'}
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom">
                  <thead>
                    <tr>
                      <th><i className="bi bi-credit-card me-2"></i>Account ID</th>
                      <th><i className="bi bi-cash-coin me-2"></i>Balance</th>
                      <th><i className="bi bi-gear me-2"></i>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account._id}>
                        <td className="font-monospace">{maskAccountId(account._id)}</td>
                        <td>
                          <span className="fw-bold fs-5" style={{ color: '#00cc99' }}>
                            {formatCurrency(balances[account._id] || 0)}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/transfer?from=${account._id}`}
                            className="btn btn-sm btn-primary-custom"
                          >
                            <i className="bi bi-arrow-right me-1"></i>Transfer
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
