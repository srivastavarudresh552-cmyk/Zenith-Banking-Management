import { useState } from 'react';

export const useForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setSuccess(result.message || 'Operation successful');
        setFormData(initialState);
      } else {
        setError(result.error || 'An error occurred');
      }
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData(initialState);
    setError(null);
    setSuccess(null);
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
    reset,
  };
};
