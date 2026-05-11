import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import './Login.css';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'Tiếng Việt' },
];

const GoogleIcon = () => (
  <svg className="google-icon" width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const Login = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLang, setSelectedLang] = useState(i18n.language.split('-')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('dayguide_language', lang);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(t('login.errors.googleFailed'));
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, selectedLang);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      const errorKeys = {
        'auth/user-not-found': 'login.errors.userNotFound',
        'auth/wrong-password': 'login.errors.wrongPassword',
        'auth/invalid-credential': 'login.errors.invalidCredential',
        'auth/email-already-in-use': 'login.errors.emailInUse',
        'auth/weak-password': 'login.errors.weakPassword',
        'auth/invalid-email': 'login.errors.invalidEmail',
      };
      setError(t(errorKeys[err.code] || 'login.errors.authFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🗺️ DayGuide</h1>
        <p className="login-subtitle">{t('login.tagline')}</p>

        <button onClick={handleGoogleSignIn} disabled={loading} className="btn-google">
          <GoogleIcon />
          {t('login.googleSignIn')}
        </button>

        <div className="divider"><span>{t('login.or')}</span></div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            {t('login.signIn')}
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            {t('login.createAccount')}
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {mode === 'signup' && (
            <div className="lang-select-wrapper">
              <label className="lang-select-label">{t('login.languageLabel')}</label>
              <div className="lang-options">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.value}
                    type="button"
                    className={`lang-option-btn ${selectedLang === lang.value ? 'selected' : ''}`}
                    onClick={() => handleLangChange(lang.value)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading || !email || !password} className="btn-auth-submit">
            {loading ? t('login.pleaseWait') : mode === 'login' ? t('login.signIn') : t('login.createAccount')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
