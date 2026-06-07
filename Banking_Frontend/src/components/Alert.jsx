import React from 'react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const alertClasses = {
    error: 'alert alert-danger alert-custom alert-error',
    success: 'alert alert-success alert-custom alert-success',
    info: 'alert alert-info alert-custom alert-info',
    warning: 'alert alert-warning alert-custom alert-warning',
  };

  return (
    <div className={alertClasses[type]} role="alert">
      <div className="d-flex justify-content-between align-items-center">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="btn-close"
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};
