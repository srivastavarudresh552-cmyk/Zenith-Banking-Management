import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-center text-white py-5">
        <div className="container-max">
          <h1 className="display-4 fw-bold mb-4">
            <i className="bi bi-building me-3"></i>Zenith Banking
          </h1>
          <p className="lead mb-4 fs-5">
            Fast, secure, and simple money transfers between your accounts.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-light btn-lg">
                <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-light btn-lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container-max">
          <h2 className="text-center mb-5 fs-2 fw-bold">Key Features</h2>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon">
                  <i className="bi bi-shield-lock text-primary"></i>
                </div>
                <h5 className="card-title fw-bold mb-3">Secure</h5>
                <p className="card-text text-muted">
                  Your accounts are protected with industry-standard security and encryption.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon">
                  <i className="bi bi-lightning-charge text-warning"></i>
                </div>
                <h5 className="card-title fw-bold mb-3">Fast Transfers</h5>
                <p className="card-text text-muted">
                  Transfer money between accounts instantly and securely.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="feature-card">
                <div className="icon">
                  <i className="bi bi-bar-chart text-success"></i>
                </div>
                <h5 className="card-title fw-bold mb-3">Track Everything</h5>
                <p className="card-text text-muted">
                  Monitor your accounts and transactions in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-max text-center">
          <h2 className="mb-4 fs-3 fw-bold">Get Started Today</h2>
          <p className="text-muted mb-4">
            Join thousands of users managing their finances securely
          </p>

          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary-custom btn-lg">
              <i className="bi bi-rocket me-2"></i>Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
