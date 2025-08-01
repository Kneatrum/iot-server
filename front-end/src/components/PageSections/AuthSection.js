import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import styles from '../styles/authSection.module.css';

const AuthSection = ({ activePlan, setActiveTab, authActiveTab, setAuthActiveTab }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [shortPasswordError, setShortPasswordError] = useState('');
  const [invalidPasswordError, setInvalidPasswordError] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    const shouldValidate = confirmPassword.length >= password.length;
    if (confirmPassword && shouldValidate && password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [password, confirmPassword]);

  const handleSignupSubmit = (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError('Invalid email address');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
      return;
    }

    const planId = activePlan.id;

    console.log('Signup:', { email, password, planId });
    
    alert('You have successfully created your account. Please proceed to login.'); // Use a toast or modal in production
    setAuthActiveTab('login');
    setActiveTab('login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError('Invalid email address');
      return;
    }

    if ( !password ) {
      setInvalidPasswordError('Password cannot be empty');
      return;
    }

    if (password.length < 6) {
      setShortPasswordError('Password must be at least 6 characters long');
      return;
    }

    const formData = {
      email,
      password,
    };

    try {
      const response = await api.post('/login', formData);
      
      if (response.status === 200) {
        const data = await response.data;
        console.log(data)
        // if(!data.plan || data.plan === 'unassigned') {
        //   navigate('/plans');
        // } else {
        //   navigate('/dashboard');
        // }
        navigate('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setLoginErrorMessage(error.response.data.error);
      } else {
        setLoginErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selected = activePlan;

  return (
    <div className={styles.section} id="auth">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.tabButtons}>
            <button
              type="button"
              className={`${styles.tabButton} ${authActiveTab === 'login' ? styles.tabButtonActive : ''}`}
              onClick={() => {
                setAuthActiveTab('login');
                setActiveTab('login');
              }}
              id="login"
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${authActiveTab === 'signup' ? styles.tabButtonActive : ''}`}
              onClick={() => {
                setAuthActiveTab('signup');
                setActiveTab('signup');
              }}
              id="signup"
            >
              Sign Up
            </button>
          </div>

          {loginErrorMessage && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{loginErrorMessage}</p>
          )}

          {authActiveTab === 'signup' ? (
            <form onSubmit={handleSignupSubmit}>
              <div className={styles.label}>Selected Plan</div>
              <div className={styles.planBox}>
                <div className={styles.planDetails}>
                  <div>
                    <span className={styles.planText}>{selected?.name}</span>
                    <span className={styles.planSubText}>
                      {selected?.price} {selected?.period}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.changeLink}
                    onClick={() =>
                      document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Change
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                />
                {emailError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{emailError}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordMatchError && (
                  <p style={{ color: 'red', marginTop: '0.5rem' }}>{passwordMatchError}</p>
                )}
              </div>

              <button type="submit" className={styles.submitButton}>
                Create Account
              </button>

              <div className={styles.divider}>
                <div className={styles.dividerLineContainer}>
                  <div className={styles.dividerLine}></div>
                  <div className={styles.dividerText}>Or sign up with</div>
                  <div className={styles.dividerLine}></div>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button type="button" className={styles.socialButton}>
                    <svg className={styles.googleIcon} viewBox="0 0 24 24">
                      <path
                        d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-8.268 10-10 0-0.665-0.053-1.309-0.164-1.934h-9.837z"
                        fill="#4285F4"
                      />
                    </svg>
                    Sign up with Google
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  className      ={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                    if (loginErrorMessage) setLoginErrorMessage('');
                  }}
                />
                {emailError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{emailError}</p>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (invalidPasswordError) setInvalidPasswordError('');
                    if (shortPasswordError) setShortPasswordError('');
                    if (loginErrorMessage) setLoginErrorMessage('');
                  }}
                />
                {invalidPasswordError && (
                  <p style={{ color: 'red', marginTop: '0.5rem' }}>{invalidPasswordError}</p>
                )}
                {shortPasswordError && (
                  <p style={{ color: 'red', marginTop: '0.5rem' }}>{shortPasswordError}</p>
                )}
              </div>

              <div>
                <div className={styles.forgotPassword}>
                  <button type="button" className={styles.forgotPassword}>
                    Forgot password?
                  </button>
                </div>
                <button type="submit" className={styles.submitButton}>
                  Login
                </button>
              </div>

              <div className={styles.divider}>
                <div className={styles.dividerLineContainer}>
                  <div className={styles.dividerLine}></div>
                  <div className={styles.dividerText}>Or login with</div>
                  <div className={styles.dividerLine}></div>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button type="button" className={styles.socialButton}>
                    <svg className={styles.googleIcon} viewBox="0 0 24 24">
                      <path
                        d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-8.268 10-10 0-0.665-0.053-1.309-0.164-1.934h-9.837z"
                        fill="#4285F4"
                      />
                    </svg>
                    Login with Google
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
