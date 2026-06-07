import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import '../components/Loading/Loading.css';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState({ active: false, text: "" });

  const showLoading = useCallback((text = "Loadiang...") => {
    setLoading({ active: true, text });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({ active: false, text: "" });
  }, []);

  useEffect(() => {
    if (loading.active) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [loading.active]);

  const contextValue = useMemo(() => ({
    showLoading,
    hideLoading
  }), [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {loading.active && createPortal(
        <div className="loading-overlay">
          <div className="spinner"></div>
          {loading.text && <p className="txt-color-ternary">{loading.text}</p>}
        </div>,
        document.body
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);