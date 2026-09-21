import React, { useState, useEffect } from 'react';

export default function ThemeToggle({ style = {}, compact = false }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('qc-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('qc-theme', theme);
      window.dispatchEvent(new CustomEvent('qc-theme-change', { detail: theme }));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      style={{
        background: isDark ? '#211D29' : '#F1F5F9',
        border: isDark ? '1px solid #7656A8' : '1px solid #CBD5E1',
        borderRadius: '20px',
        padding: compact ? '6px' : '6px 12px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: isDark ? '#CBB8F2' : '#334155',
        fontWeight: 600,
        fontSize: '0.8rem',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {isDark ? (
        <>
          <i className="fa-solid fa-moon" style={{ color: '#CBB8F2' }}></i>
          {!compact && <span>Dark</span>}
        </>
      ) : (
        <>
          <i className="fa-solid fa-sun" style={{ color: '#F59E0B' }}></i>
          {!compact && <span>Light</span>}
        </>
      )}
    </button>
  );
}
