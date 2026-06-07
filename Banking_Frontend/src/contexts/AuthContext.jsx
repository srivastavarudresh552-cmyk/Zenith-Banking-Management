// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { authAPI } from '../services/api';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Check if user is already logged in
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     const storedToken = localStorage.getItem('token');

//     if (storedUser && storedToken) {
//       try {
//         setUser(JSON.parse(storedUser));
//         setToken(storedToken);
//       } catch (err) {
//         console.error('Error parsing stored user data:', err);
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//       }
//     }
//     setLoading(false);
//   }, []);

//   const register = async (email, password, name) => {
//     try {
//       setError(null);
//       const response = await authAPI.register({ email, password, name });
//       const { user, token } = response.data;

//       setUser(user);
//       setToken(token);
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.setItem('token', token);

//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || 'Registration failed';
//       setError(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       setError(null);
//       const response = await authAPI.login({ email, password });
//       const { user, token } = response.data;

//       setUser(user);
//       setToken(token);
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.setItem('token', token);

//       return { success: true, data: response.data };
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || 'Login failed';
//       setError(errorMessage);
//       return { success: false, error: errorMessage };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (err) {
//       console.error('Logout error:', err);
//     } finally {
//       setUser(null);
//       setToken(null);
//       setError(null);
//       localStorage.removeItem('user');
//       localStorage.removeItem('token');
//     }
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     error,
//     register,
//     login,
//     logout,
//     isAuthenticated: !!user && !!token,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email, password, name) => {
    try {
      setError(null);
      const response = await authAPI.register({ email, password, name });
      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout API errors — clear state regardless
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
