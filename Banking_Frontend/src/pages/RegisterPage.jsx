import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from '../components/Alert';
import { validateEmail, validatePassword } from '../utils/helpers';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: '#f5f5f5' }}>
      <div className="w-100" style={{ maxWidth: '450px', padding: '1rem' }}>
        <div className="card card-custom">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">
              <i className="bi bi-person-plus-fill me-2"></i>Create New Account
            </h2>
            <p className="text-center text-muted mb-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary">
                Sign in here
              </Link>
            </p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label form-label-custom">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control form-control-custom"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label form-label-custom">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-custom"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label form-label-custom">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-custom"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label form-label-custom">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control form-control-custom"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary-custom w-100 mb-3"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
