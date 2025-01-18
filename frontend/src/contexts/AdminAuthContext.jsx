import React, { createContext, useState, useEffect } from 'react';
import { loginAdmin, getAdminProfile } from '../config/adminApi';
import PropTypes from 'prop-types';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const profile = await getAdminProfile(token);
          setAdmin(profile);
        } catch (error) {
          console.error('Failed to fetch admin profile:', error);
          setToken(null);
          localStorage.removeItem('adminToken');
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginAdmin({ email, password });
    setToken(data.token);
    localStorage.setItem('adminToken', data.token);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

AdminAuthProvider.propTypes = {
    children: PropTypes.node.isRequired, // Validate the `children` prop
  };

export const useAdminAuth = () => React.useContext(AdminAuthContext);