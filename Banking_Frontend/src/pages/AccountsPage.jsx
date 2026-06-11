import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountAPI } from '../services/api';
import { formatCurrency, maskAccountId, formatDate } from '../utils/helpers';
import { Alert, LoadingSpinner } from '../components/Alert';

export const AccountsPage = () => {
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
      const response = await accountAPI.getUserAccounts();
      const accountsList = response.data.accounts || [];

      setAccounts(accountsList);

      const balancesObj = {};

      accountsList.forEach((account) => {
        balancesObj[account._id] = account.balance || 0;
      });

      setBalances(balancesObj);
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
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
          <div>
            <h1 className="display-5 fw-bold">
              <i className="bi bi-credit-card-2-front me-2"></i>Your Accounts
            </h1>
            <p className="text-muted fs-5">Manage all your banking accounts</p>
          </div>
          <button
            onClick={handleCreateAccount}
            disabled={creatingAccount}
            className="btn btn-primary-custom"
          >
            <i className="bi bi-plus-lg me-2"></i>
            {creatingAccount ? 'Creating...' : 'New Account'}
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Accounts Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : accounts.length === 0 ? (
          <div className="card card-custom text-center py-5">
            <p className="text-muted mb-4 fs-5">No accounts yet</p>
            <button
              onClick={handleCreateAccount}
              disabled={creatingAccount}
              className="btn btn-primary-custom mx-auto"
            >
              Create Your First Account
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {accounts.map((account) => (
              <div key={account._id} className="col-md-6 col-lg-4">
                <div className="card card-custom border-start" style={{ borderStartWidth: '4px', borderStartColor: '#0066cc' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <small className="text-muted d-block font-monospace">{maskAccountId(account._id)}</small>
                        <small className="text-muted">Account ID</small>
                      </div>
                      <span className="badge bg-primary">Active</span>
                    </div>

                    <p className="text-muted mb-2">Balance</p>
                    <p className="display-6 fw-bold" style={{ color: '#00cc99', marginBottom: '1rem' }}>
                      {formatCurrency(balances[account._id] || 0)}
                    </p>

                    <small className="text-muted d-block mb-3">
                      Created: {formatDate(account.createdAt)}
                    </small>

                    <div className="d-grid gap-2">
                      <Link
                        to={`/transfer?from=${account._id}`}
                        className="btn btn-primary-custom btn-sm"
                      >
                        <i className="bi bi-arrow-right me-1"></i>Transfer
                      </Link>
                      <button className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-eye me-1"></i>Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
