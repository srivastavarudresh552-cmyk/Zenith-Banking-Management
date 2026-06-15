// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { accountAPI, transactionAPI } from '../services/api';
// import { formatCurrency, maskAccountId, generateIdempotencyKey } from '../utils/helpers';
// import { Alert, LoadingSpinner } from '../components/Alert';

// export const TransferPage = () => {
//   const [searchParams] = useSearchParams();
//   const [accounts, setAccounts] = useState([]);
//   const [balances, setBalances] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const [formData, setFormData] = useState({
//     fromAccount: searchParams.get('from') || '',
//     toAccount: '',
//     amount: '',
//   });

//   useEffect(() => {
//     fetchAccounts();
//   }, []);

//   const fetchAccounts = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await accountAPI.getUserAccounts();
//       const accountsList = response.data.accounts || [];

//       setAccounts(accountsList);

//       const balancesObj = {};

//       accountsList.forEach((account) => {
//         balancesObj[account._id] = account.balance || 0;
//       });

//       setBalances(balancesObj);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
//       setError('All fields are required');
//       return;
//     }

//     if (formData.fromAccount === formData.toAccount) {
//       setError('Source and destination accounts must be different');
//       return;
//     }

//     const amount = parseFloat(formData.amount);
//     if (isNaN(amount) || amount <= 0) {
//       setError('Amount must be a positive number');
//       return;
//     }

//     const fromBalance = balances[formData.fromAccount] || 0;
//     if (amount > fromBalance) {
//       setError('Insufficient balance');
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const idempotencyKey = generateIdempotencyKey();

//       await transactionAPI.createTransaction({
//         fromAccount: formData.fromAccount,
//         toAccount: formData.toAccount,
//         amount,
//         idempotencyKey,
//       });

//       setSuccess('Transfer completed successfully!');
//       setFormData({
//         fromAccount: formData.fromAccount,
//         toAccount: '',
//         amount: '',
//       });

//       setTimeout(() => {
//         fetchAccounts();
//       }, 1000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Transfer failed');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="py-5">
//         <div className="container-max">
//           <LoadingSpinner />
//         </div>
//       </div>
//     );
//   }

//   if (accounts.length < 2) {
//     return (
//       <div className="py-5">
//         <div className="container-max">
//           <div className="card card-custom text-center py-5">
//             <i className="bi bi-info-circle" style={{ fontSize: '3rem', color: '#0066cc', marginBottom: '1rem' }}></i>
//             <p className="text-muted mb-0 fs-5">You need at least 2 accounts to transfer money</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-5">
//       <div className="container-max">
//         <div style={{ maxWidth: '600px', margin: '0 auto' }}>
//           <div className="card card-custom">
//             <div className="card-header bg-white border-bottom">
//               <h2 className="mb-0 fw-bold">
//                 <i className="bi bi-arrow-left-right me-2"></i>Transfer Money
//               </h2>
//               <p className="text-muted small mb-0">Send funds between your accounts</p>
//             </div>

//             <div className="card-body">
//               {error && <Alert type="error" message={error} onClose={() => setError('')} />}
//               {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

//               <form onSubmit={handleSubmit}>
//                 {/* From Account */}
//                 <div className="mb-4">
//                   <label htmlFor="fromAccount" className="form-label form-label-custom">
//                     <i className="bi bi-cash-out me-2"></i>From Account
//                   </label>
//                   <select
//                     id="fromAccount"
//                     name="fromAccount"
//                     value={formData.fromAccount}
//                     onChange={handleChange}
//                     className="form-select form-control-custom"
//                     disabled={submitting}
//                   >
//                     <option value="">Select source account</option>
//                     {accounts.map((account) => (
//                       <option key={account._id} value={account._id}>
//                         {maskAccountId(account._id)} - Balance: {formatCurrency(balances[account._id] || 0)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* From Account Balance */}
//                 {formData.fromAccount && (
//                   <div className="balance-display mb-4">
//                     <div className="label">Available Balance</div>
//                     <div className="amount">
//                       {formatCurrency(balances[formData.fromAccount] || 0)}
//                     </div>
//                   </div>
//                 )}

//                 {/* To Account */}
//                 <div className="mb-4">
//                   <label htmlFor="toAccount" className="form-label form-label-custom">
//                     <i className="bi bi-cash-in me-2"></i>To Account
//                   </label>
//                   <select
//                     id="toAccount"
//                     name="toAccount"
//                     value={formData.toAccount}
//                     onChange={handleChange}
//                     className="form-select form-control-custom"
//                     disabled={submitting}
//                   >
//                     <option value="">Select destination account</option>
//                     {accounts
//                       .filter((acc) => acc._id !== formData.fromAccount)
//                       .map((account) => (
//                         <option key={account._id} value={account._id}>
//                           {maskAccountId(account._id)} - Balance: {formatCurrency(balances[account._id] || 0)}
//                         </option>
//                       ))}
//                   </select>
//                 </div>

//                 {/* Amount */}
//                 <div className="mb-4">
//                   <label htmlFor="amount" className="form-label form-label-custom">
//                     <i className="bi bi-calculator me-2"></i>Amount (USD)
//                   </label>
//                   <input
//                     id="amount"
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     placeholder="0.00"
//                     step="0.01"
//                     min="0.01"
//                     className="form-control form-control-custom"
//                     disabled={submitting}
//                   />
//                   <small className="text-muted d-block mt-2">
//                     <i className="bi bi-info-circle me-1"></i>Minimum: $0.01
//                   </small>
//                 </div>

//                 {/* Summary */}
//                 {formData.fromAccount && formData.toAccount && formData.amount && (
//                   <div className="summary-box mb-4">
//                     <div className="summary-row">
//                       <span>Amount to transfer:</span>
//                       <strong>{formatCurrency(parseFloat(formData.amount) || 0)}</strong>
//                     </div>
//                     <hr className="my-2" />
//                     <div className="summary-row">
//                       <span>From:</span>
//                       <code>{maskAccountId(formData.fromAccount)}</code>
//                     </div>
//                     <div className="summary-row">
//                       <span>To:</span>
//                       <code>{maskAccountId(formData.toAccount)}</code>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="btn btn-primary-custom w-100"
//                 >
//                   {submitting ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <i className="bi bi-check-circle me-2"></i>Complete Transfer
//                     </>
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { accountAPI, transactionAPI } from '../services/api';
import { formatCurrency, maskAccountId, generateIdempotencyKey } from '../utils/helpers';
import { Alert, LoadingSpinner } from '../components/Alert';

export const TransferPage = () => {
  const [searchParams] = useSearchParams();

  // My accounts (source)
  const [myAccounts, setMyAccounts] = useState([]);
  const [myBalances, setMyBalances] = useState({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Recipient search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null); // { accountId, ownerName }
  const searchDebounce = useRef(null);

  // Transfer form
  const [fromAccount, setFromAccount] = useState(searchParams.get('from') || '');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Load my accounts ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await accountAPI.getUserAccounts();
        const list = res.data.accounts || [];
        setMyAccounts(list);
        const map = {};
        list.forEach((a) => { map[a._id] = a.balance || 0; });
        setMyBalances(map);
      } catch {
        setError('Failed to load your accounts.');
      } finally {
        setLoadingAccounts(false);
      }
    })();
  }, []);

  // ── Recipient search (debounced, min 3 chars) ─────────────────────────────
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setSelectedRecipient(null);
    setSearchError('');

    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (q.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchDebounce.current = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchResults([]);
        const res = await accountAPI.searchAccounts(q.trim());
        setSearchResults(res.data.accounts || []);
        if ((res.data.accounts || []).length === 0) {
          setSearchError('No accounts found. Try a different name or email.');
        }
      } catch (err) {
        setSearchError(err.response?.data?.message || 'Search failed.');
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const selectRecipient = (account) => {
    setSelectedRecipient(account);
    setSearchQuery(account.ownerName || account.accountId);
    setSearchResults([]);
    setSearchError('');
  };

  // ── Submit transfer ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fromAccount) {
      setError('Please select a source account.');
      return;
    }
    if (!selectedRecipient) {
      setError('Please search for and select a recipient account.');
      return;
    }
    if (!amount) {
      setError('Please enter an amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (!Number.isInteger(parsedAmount * 100)) {
      setError('Amount can have at most 2 decimal places.');
      return;
    }

    const balance = myBalances[fromAccount] || 0;
    if (parsedAmount > balance) {
      setError(`Insufficient balance. Available: ${formatCurrency(balance)}`);
      return;
    }

    try {
      setSubmitting(true);
      await transactionAPI.createTransaction({
        fromAccount,
        toAccount: selectedRecipient.accountId,
        amount: parsedAmount,
        idempotencyKey: generateIdempotencyKey(),
      });

      setSuccess(
        `Successfully sent ${formatCurrency(parsedAmount)} to ${selectedRecipient.ownerName}!`
      );
      setAmount('');
      setSelectedRecipient(null);
      setSearchQuery('');

      // Refresh balances
      const res = await accountAPI.getUserAccounts();
      const list = res.data.accounts || [];
      setMyAccounts(list);
      const map = {};
      list.forEach((a) => { map[a._id] = a.balance || 0; });
      setMyBalances(map);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingAccounts) {
    return (
      <div className="py-5">
        <div className="container-max"><LoadingSpinner /></div>
      </div>
    );
  }

  if (myAccounts.length === 0) {
    return (
      <div className="py-5">
        <div className="container-max">
          <div className="card card-custom text-center py-5">
            <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', color: '#0066cc', marginBottom: '1rem' }}></i>
            <p className="text-muted fs-5">You need at least one account to make a transfer.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedFromBalance = fromAccount ? (myBalances[fromAccount] || 0) : null;

  return (
    <div className="py-5">
      <div className="container-max">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card card-custom">
            {/* Card header */}
            <div className="card-header bg-white border-bottom">
              <h2 className="mb-0 fw-bold">
                <i className="bi bi-arrow-left-right me-2"></i>Transfer Money
              </h2>
              <p className="text-muted small mb-0">Send funds to another user</p>
            </div>

            <div className="card-body">
              {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
              {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

              <form onSubmit={handleSubmit}>

                {/* ── From account ─────────────────────────────────────────── */}
                <div className="mb-4">
                  <label htmlFor="fromAccount" className="form-label form-label-custom">
                    <i className="bi bi-wallet2 me-2"></i>From Account
                  </label>
                  <select
                    id="fromAccount"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="form-select form-control-custom"
                    disabled={submitting}
                  >
                    <option value="">Select your account</option>
                    {myAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {maskAccountId(acc._id)} — {formatCurrency(myBalances[acc._id] || 0)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Available balance badge */}
                {selectedFromBalance !== null && (
                  <div className="balance-display mb-4">
                    <div className="label">Available Balance</div>
                    <div className="amount">{formatCurrency(selectedFromBalance)}</div>
                  </div>
                )}

                {/* ── Recipient search ──────────────────────────────────────── */}
                <div className="mb-1">
                  <label className="form-label form-label-custom">
                    <i className="bi bi-person-search me-2"></i>Recipient
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search by name (3+ chars) or exact email"
                      className="form-control form-control-custom"
                      disabled={submitting}
                      autoComplete="off"
                    />
                    {searching && (
                      <span
                        className="position-absolute top-50 translate-middle-y"
                        style={{ right: '12px' }}
                      >
                        <span className="spinner-border spinner-border-sm text-primary" role="status" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Dropdown results */}
                {searchResults.length > 0 && (
                  <ul
                    className="list-group mb-3"
                    style={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, position: 'relative' }}
                  >
                    {searchResults.map((result) => (
                      <li
                        key={result.accountId}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectRecipient(result)}
                      >
                        <span>
                          <i className="bi bi-person-circle me-2 text-primary"></i>
                          <strong>{result.ownerName}</strong>
                        </span>
                        <small className="text-muted font-monospace">{maskAccountId(result.accountId)}</small>
                      </li>
                    ))}
                  </ul>
                )}

                {searchError && !searching && (
                  <small className="text-danger d-block mb-3">
                    <i className="bi bi-exclamation-circle me-1"></i>{searchError}
                  </small>
                )}

                {/* Selected recipient confirmation chip */}
                {selectedRecipient && (
                  <div
                    className="d-flex align-items-center justify-content-between mb-4 px-3 py-2"
                    style={{ background: '#e8f4e8', borderRadius: '6px', border: '1px solid #00cc99' }}
                  >
                    <span>
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <strong>{selectedRecipient.ownerName}</strong>
                      <small className="text-muted ms-2 font-monospace">
                        {maskAccountId(selectedRecipient.accountId)}
                      </small>
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => { setSelectedRecipient(null); setSearchQuery(''); }}
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* ── Amount ───────────────────────────────────────────────── */}
                <div className="mb-4">
                  <label htmlFor="amount" className="form-label form-label-custom">
                    <i className="bi bi-currency-dollar me-2"></i>Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="form-control form-control-custom"
                    disabled={submitting}
                  />
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>Minimum ₹0.01 · up to 2 decimal places
                  </small>
                </div>

                {/* ── Transfer summary ─────────────────────────────────────── */}
                {fromAccount && selectedRecipient && amount && (
                  <div className="summary-box mb-4">
                    <div className="summary-row">
                      <span>Amount:</span>
                      <strong>{formatCurrency(parseFloat(amount) || 0)}</strong>
                    </div>
                    <hr className="my-2" />
                    <div className="summary-row">
                      <span>From:</span>
                      <code>{maskAccountId(fromAccount)}</code>
                    </div>
                    <div className="summary-row">
                      <span>To:</span>
                      <span>
                        <strong>{selectedRecipient.ownerName}</strong>
                        <code className="ms-2">{maskAccountId(selectedRecipient.accountId)}</code>
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Submit ───────────────────────────────────────────────── */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary-custom w-100"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>Send Money
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
