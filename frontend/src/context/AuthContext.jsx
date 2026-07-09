import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initial session recovery
  useEffect(() => {
    const token = localStorage.getItem('microintern_token');
    const sessionUser = localStorage.getItem('microintern_session');
    if (token && sessionUser) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError('');
    try {
      const res = await axios.post('/api/auth/login/', { email, password });
      const { token, user: loggedUser } = res.data;

      localStorage.setItem('microintern_token', token);
      localStorage.setItem('microintern_session', JSON.stringify(loggedUser));
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setUser(loggedUser);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid email or password';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (registerData) => {
    setError('');
    try {
      const res = await axios.post('/api/auth/register/', registerData);
      const { token, user: registeredUser } = res.data;

      localStorage.setItem('microintern_token', token);
      localStorage.setItem('microintern_session', JSON.stringify(registeredUser));
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      setUser(registeredUser);
      return { success: true };
    } catch (err) {
      const errMsg = Object.values(err.response?.data || {})[0] || 'Registration failed';
      const finalMsg = Array.isArray(errMsg) ? errMsg[0] : errMsg;
      setError(finalMsg);
      return { success: false, error: finalMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout/');
    } catch (err) {
      console.error('Logout request failed on server, clearing client session anyway', err);
    }
    localStorage.removeItem('microintern_token');
    localStorage.removeItem('microintern_session');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (updatedFields) => {
    try {
      const res = await axios.patch('/api/auth/profile/', updatedFields);
      const updatedUser = res.data;
      
      localStorage.setItem('microintern_session', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Profile update failed';
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
