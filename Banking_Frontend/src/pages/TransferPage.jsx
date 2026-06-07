import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { accountAPI, transactionAPI } from '../services/api';
import { formatCurrency, maskAccountId, generateIdempotencyKey } from '../utils/helpers';
import { Alert, LoadingSpinner } from '../components/Alert';

export const TransferPage = () => {
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fromAccount: searchParams.get('from') || '',
    toAccount: '',
    amount: '',
  });

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

      for (const account of accountsList) {
        try {
          const balanceResponse = await accountAPI.getAccountBalance(account._id);
          setBalances((prev) => ({
            ...prev,
            [account._id]: balanceResponse.data.balance,
          }));
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
      setError('All fields are required');
      return;
    }

    if (formData.fromAccount === formData.toAccount) {
      setError('Source and destination accounts must be different');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    const fromBalance = balances[formData.fromAccount] || 0;
    if (amount > fromBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = generateIdempotencyKey();

      await transactionAPI.createTransaction({
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        amount,
        idempotencyKey,
      });

      setSuccess('Transfer completed successfully!');
      setFormData({
        fromAccount: formData.fromAccount,
        toAccount: '',
        amount: '',
      });

      setTimeout(() => {
        fetchAccounts();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5">
        <div className="container-max">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (accounts.length < 2) {
    return (
      <div className="py-5">
        <div className="container-max">
          <div className="card card-custom text-center py-5">
            <i className="bi bi-info-circle" style={{ fontSize: '3rem', color: '#0066cc', marginBottom: '1rem' }}></i>
            <p className="text-muted mb-0 fs-5">You need at least 2 accounts to transfer money</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container-max">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card card-custom">
            <div className="card-header bg-white border-bottom">
              <h2 className="mb-0 fw-bold">
                <i className="bi bi-arrow-left-right me-2"></i>Transfer Money
              </h2>
              <p className="text-muted small mb-0">Send funds between your accounts</p>
            </div>

            <div className="card-body">
              {error && <Alert type="error" message={error} onClose={() => setError('')} />}
              {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

              <form onSubmit={handleSubmit}>
                {/* From Account */}
                <div className="mb-4">
                  <label htmlFor="fromAccount" className="form-label form-label-custom">
                    <i className="bi bi-cash-out me-2"></i>From Account
                  </label>
                  <select
                    id="fromAccount"
                    name="fromAccount"
                    value={formData.fromAccount}
                    onChange={handleChange}
                    className="form-select form-control-custom"
                    disabled={submitting}
                  >
                    <option value="">Select source account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {maskAccountId(account._id)} - Balance: {formatCurrency(balances[account._id] || 0)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Account Balance */}
                {formData.fromAccount && (
                  <div className="balance-display mb-4">
                    <div className="label">Available Balance</div>
                    <div className="amount">
                      {formatCurrency(balances[formData.fromAccount] || 0)}
                    </div>
                  </div>
                )}

                {/* To Account */}
                <div className="mb-4">
                  <label htmlFor="toAccount" className="form-label form-label-custom">
                    <i className="bi bi-cash-in me-2"></i>To Account
                  </label>
                  <select
                    id="toAccount"
                    name="toAccount"
                    value={formData.toAccount}
                    onChange={handleChange}
                    className="form-select form-control-custom"
                    disabled={submitting}
                  >
                    <option value="">Select destination account</option>
                    {accounts
                      .filter((acc) => acc._id !== formData.fromAccount)
                      .map((account) => (
                        <option key={account._id} value={account._id}>
                          {maskAccountId(account._id)} - Balance: {formatCurrency(balances[account._id] || 0)}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label htmlFor="amount" className="form-label form-label-custom">
                    <i className="bi bi-calculator me-2"></i>Amount (USD)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="form-control form-control-custom"
                    disabled={submitting}
                  />
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-info-circle me-1"></i>Minimum: $0.01
                  </small>
                </div>

                {/* Summary */}
                {formData.fromAccount && formData.toAccount && formData.amount && (
                  <div className="summary-box mb-4">
                    <div className="summary-row">
                      <span>Amount to transfer:</span>
                      <strong>{formatCurrency(parseFloat(formData.amount) || 0)}</strong>
                    </div>
                    <hr className="my-2" />
                    <div className="summary-row">
                      <span>From:</span>
                      <code>{maskAccountId(formData.fromAccount)}</code>
                    </div>
                    <div className="summary-row">
                      <span>To:</span>
                      <code>{maskAccountId(formData.toAccount)}</code>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary-custom w-100"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Complete Transfer
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
